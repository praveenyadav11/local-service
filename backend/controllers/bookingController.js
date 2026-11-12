const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const ProviderProfile = require('../models/ProviderProfile');
const Availability = require('../models/Availability');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');
const { emitToUser } = require('../sockets');
const { isValidDateString, generateSlots } = require('../services/slotService');
const { notifyUser } = require('../services/notificationService');
const Payment = require('../models/Payment');


// @desc    Create a booking
// @route   POST /api/bookings
// @access  Customer
const createBooking = asyncHandler(async (req, res) => {
  const { providerId, date, startTime, address, notes } = req.body;

  if (typeof providerId !== 'string' || !mongoose.Types.ObjectId.isValid(providerId)) {
    throw new AppError('Valid providerId is required', 400);
  }
  if (!isValidDateString(date)) {
    throw new AppError('date is required in YYYY-MM-DD format', 400);
  }
  if (typeof startTime !== 'string') {
    throw new AppError('startTime is required (e.g. "10:00")', 400);
  }
  if (typeof address !== 'string' || !address.trim()) {
    throw new AppError('address is required', 400);
  }
  if (notes !== undefined && typeof notes !== 'string') {
    throw new AppError('Invalid notes', 400);
  }

  const provider = await ProviderProfile.findById(providerId);
  if (!provider) {
    throw new AppError('Provider not found', 404);
  }

  const availability = await Availability.findOne({ provider: provider._id });
  if (!availability) {
    throw new AppError('This provider has not set availability yet', 404);
  }

  const validSlots = generateSlots(availability, date);
  const slot = validSlots.find((s) => s.startTime === startTime);
  if (!slot) {
    throw new AppError('That time is not an available slot for this provider', 400);
  }

  try {
    const booking = await Booking.create({
      customer: req.user._id,
      provider: provider._id,
      date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      address,
      notes,
    });

    emitToUser(provider.user, 'booking:created', {
      bookingId: booking._id,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
    });
        await notifyUser({
      userId: provider.user,
      type: 'booking_created',
      message: `New booking request for ${booking.date} at ${booking.startTime}`,
      bookingId: booking._id,
    });

    res.status(201).json({ success: true, booking });
    } catch (err) {
    if (err.code === 11000) {
      throw new AppError('Sorry, that slot was just booked. Please pick another', 409);
    }
    throw err;
  }
});

const VALID_STATUSES = ['pending', 'confirmed', 'rejected', 'cancelled', 'completed'];

const buildListOptions = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 50);

  const filter = {};
  if (query.status !== undefined) {
    if (typeof query.status !== 'string' || !VALID_STATUSES.includes(query.status)) {
      throw new AppError('Invalid status filter', 400);
    }
    filter.status = query.status;
  }
  return { page, limit, filter };
};

const sendList = async (res, filter, page, limit) => {
  const total = await Booking.countDocuments(filter);
  const bookings = await Booking.find(filter)
    .populate('customer', 'name')
    .populate({
      path: 'provider',
      select: 'city hourlyRate category user',
      populate: [
        { path: 'user', select: 'name' },
        { path: 'category', select: 'name' },
      ],
    })
    .sort({ date: -1, startTime: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: bookings.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    bookings,
  });
};

// @desc    My bookings (customer)
// @route   GET /api/bookings/my
// @access  Customer
const getMyBookings = asyncHandler(async (req, res) => {
  const { page, limit, filter } = buildListOptions(req.query);
  filter.customer = req.user._id;
  await sendList(res, filter, page, limit);
});

// @desc    Bookings for my provider profile
// @route   GET /api/bookings/provider
// @access  Provider
const getProviderBookings = asyncHandler(async (req, res) => {
  const { page, limit, filter } = buildListOptions(req.query);

  const profile = await ProviderProfile.findOne({ user: req.user._id });
  if (!profile) {
    throw new AppError('Create your provider profile first', 404);
  }

  filter.provider = profile._id;
  const total = await Booking.countDocuments(filter);
  const bookings = await Booking.find(filter)
    .populate('customer', 'name')
    .sort({ date: -1, startTime: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const payments = await Payment.find({ booking: { $in: bookings.map((b) => b._id) } })
    .select('booking method status');
  const byBooking = new Map(payments.map((p) => [p.booking.toString(), p]));

  const withPayment = bookings.map((b) => {
    const p = byBooking.get(b._id.toString());
    return { ...b, payment: p ? { method: p.method, status: p.status } : null };
  });

  res.status(200).json({
    success: true,
    count: withPayment.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    bookings: withPayment,
  });});

// @desc    Get one booking
// @route   GET /api/bookings/:id
// @access  Customer or provider involved, or admin
const getBookingById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new AppError('Invalid booking id', 400);
  }

  const booking = await Booking.findById(req.params.id)
    .populate('customer', 'name')
    .populate({
      path: 'provider',
      select: 'city hourlyRate category user',
      populate: [
        { path: 'user', select: 'name' },
        { path: 'category', select: 'name' },
      ],
    });

  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  const isCustomer = booking.customer._id.equals(req.user._id);
  const isProvider = booking.provider.user._id.equals(req.user._id);
  const isAdmin = req.user.role === 'admin';

  if (!isCustomer && !isProvider && !isAdmin) {
    throw new AppError('Booking not found', 404);
  }

  res.status(200).json({ success: true, booking });
});

const TRANSITIONS = {
  pending: { confirmed: ['provider'], rejected: ['provider'], cancelled: ['customer', 'provider'] },
  confirmed: { cancelled: ['customer', 'provider'], completed: ['provider'] },
};

// @desc    Update booking status
// @route   PATCH /api/bookings/:id/status
// @access  Customer or provider involved
const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new AppError('Invalid booking id', 400);
  }
  if (typeof status !== 'string' || !VALID_STATUSES.includes(status)) {
    throw new AppError('A valid status is required', 400);
  }

  const booking = await Booking.findById(req.params.id).populate('provider', 'user');
  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  let actor = null;
  if (booking.customer.equals(req.user._id)) actor = 'customer';
  else if (booking.provider.user.equals(req.user._id)) actor = 'provider';

  if (!actor) {
    throw new AppError('Booking not found', 404);
  }

  const allowedActors = TRANSITIONS[booking.status]?.[status];
  if (!allowedActors) {
    throw new AppError(`Cannot change status from ${booking.status} to ${status}`, 400);
  }
  if (!allowedActors.includes(actor)) {
    throw new AppError(`A ${actor} cannot set this booking to ${status}`, 403);
  }

  booking.status = status;
  await booking.save();

  const payload = {
    bookingId: booking._id,
    status: booking.status,
    date: booking.date,
    startTime: booking.startTime,
  };

  emitToUser(booking.customer, 'booking:status', payload);
  emitToUser(booking.provider.user, 'booking:status', payload);

    const notifyTarget = actor === 'provider' ? booking.customer : booking.provider.user;
  await notifyUser({
    userId: notifyTarget,
    type: 'booking_status',
    message: `Booking on ${booking.date} at ${booking.startTime} is now ${booking.status}`,
    bookingId: booking._id,
  });
  res.status(200).json({ success: true, booking });});

module.exports = {
  createBooking,
  getMyBookings,
  getProviderBookings,
  getBookingById,
  updateBookingStatus,
};