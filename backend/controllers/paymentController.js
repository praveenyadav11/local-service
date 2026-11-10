const crypto = require('crypto');
const mongoose = require('mongoose');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const ProviderProfile = require('../models/ProviderProfile');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middleware/asyncHandler');
const { notifyUser } = require('../services/notificationService');

const VALID_METHODS = ['card', 'upi', 'netbanking', 'cash'];

// @desc    Pay for a confirmed booking (simulated)
// @route   POST /api/payments
// @access  Customer
const createPayment = asyncHandler(async (req, res) => {
  const { bookingId, method } = req.body;

  if (typeof bookingId !== 'string' || !mongoose.Types.ObjectId.isValid(bookingId)) {
    throw new AppError('Valid bookingId is required', 400);
  }
  if (typeof method !== 'string' || !VALID_METHODS.includes(method)) {
    throw new AppError(`method must be one of: ${VALID_METHODS.join(', ')}`, 400);
  }

  const booking = await Booking.findById(bookingId);
  if (!booking || !booking.customer.equals(req.user._id)) {
    throw new AppError('Booking not found', 404);
  }
  if (booking.status !== 'confirmed') {
    throw new AppError('Only a confirmed booking can be paid', 400);
  }

  const provider = await ProviderProfile.findById(booking.provider);
  if (!provider) {
    throw new AppError('Provider not found', 404);
  }

  // Slots are one hour, so amount equals the hourly rate. Calculated on the server only.
  const amount = provider.hourlyRate;
  const transactionId = `TXN_${crypto.randomBytes(8).toString('hex').toUpperCase()}`;

  let payment;
  try {
    payment = await Payment.create({
      booking: booking._id,
      customer: req.user._id,
      provider: booking.provider,
      amount,
      method,
      transactionId,
    });
  } catch (err) {
    if (err.code === 11000) {
      throw new AppError('This booking is already paid', 409);
    }
    throw err;
  }

  await notifyUser({
    userId: provider.user,
    type: 'booking_status',
    message: `Payment of ${amount} received for booking on ${booking.date} at ${booking.startTime}`,
    bookingId: booking._id,
  });

  res.status(201).json({ success: true, payment });
});

// @desc    List my payments
// @route   GET /api/payments/my
// @access  Customer
const getMyPayments = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);

  const filter = { customer: req.user._id };
  const total = await Payment.countDocuments(filter);
  const payments = await Payment.find(filter)
    .populate('booking', 'date startTime endTime status')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: payments.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    payments,
  });
});

module.exports = { createPayment, getMyPayments };