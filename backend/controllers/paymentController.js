const crypto = require('crypto');
const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const ProviderProfile = require('../models/ProviderProfile');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middleware/asyncHandler');
const { notifyUser } = require('../services/notificationService');

const getRazorpay = () =>
  new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

const loadOwnConfirmedBooking = async (bookingId, userId) => {
  if (typeof bookingId !== 'string' || !mongoose.Types.ObjectId.isValid(bookingId)) {
    throw new AppError('Valid bookingId is required', 400);
  }
  const booking = await Booking.findById(bookingId);
  if (!booking || !booking.customer.equals(userId)) {
    throw new AppError('Booking not found', 404);
  }
  if (booking.status !== 'confirmed') {
    throw new AppError('Only a confirmed booking can be paid', 400);
  }
  return booking;
};

// @desc    Create a Razorpay order for a confirmed booking
// @route   POST /api/payments/order
// @access  Customer
const createOrder = asyncHandler(async (req, res) => {
  const booking = await loadOwnConfirmedBooking(req.body.bookingId, req.user._id);

  let payment = await Payment.findOne({ booking: booking._id });
  if (payment && payment.status === 'paid') {
    throw new AppError('This booking is already paid', 409);
  }

  const provider = await ProviderProfile.findById(booking.provider);
  if (!provider) throw new AppError('Provider not found', 404);

  const amount = provider.hourlyRate;

  const order = await getRazorpay().orders.create({
    amount: Math.round(amount * 100),
    currency: 'INR',
    receipt: `bk_${booking._id}`.slice(0, 40),
  });

  if (payment) {
    payment.razorpayOrderId = order.id;
    payment.amount = amount;
    await payment.save();
  } else {
    payment = await Payment.create({
      booking: booking._id,
      customer: req.user._id,
      provider: booking.provider,
      amount,
      method: 'upi',
      status: 'created',
      razorpayOrderId: order.id,
    });
  }

  res.status(201).json({
    success: true,
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
  });
});

// @desc    Verify payment signature and mark as paid
// @route   POST /api/payments/verify
// @access  Customer
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (
    typeof razorpay_order_id !== 'string' ||
    typeof razorpay_payment_id !== 'string' ||
    typeof razorpay_signature !== 'string'
  ) {
    throw new AppError('Invalid payment data', 400);
  }

  const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
  if (!payment || !payment.customer.equals(req.user._id)) {
    throw new AppError('Payment not found', 404);
  }
  if (payment.status === 'paid') {
    return res.status(200).json({ success: true, payment });
  }

  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  const valid =
    expected.length === razorpay_signature.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(razorpay_signature));

  if (!valid) {
    throw new AppError('Payment verification failed', 400);
  }

  payment.status = 'paid';
  payment.transactionId = razorpay_payment_id;
  await payment.save();

  const provider = await ProviderProfile.findById(payment.provider);
  if (provider) {
    await notifyUser({
      userId: provider.user,
      type: 'booking_status',
      message: `Payment of ${payment.amount} received`,
      bookingId: payment.booking,
    });
  }

  res.status(200).json({ success: true, payment });
});

// @desc    List my paid payments
// @route   GET /api/payments/my
// @access  Customer
const getMyPayments = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);

  const filter = { customer: req.user._id, status: 'paid' };
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


// @desc    Choose to pay cash after the service
// @route   POST /api/payments/cash
// @access  Customer
const chooseCash = asyncHandler(async (req, res) => {
  const booking = await loadOwnConfirmedBooking(req.body.bookingId, req.user._id);

  const existing = await Payment.findOne({ booking: booking._id });
  if (existing && existing.status === 'paid') {
    throw new AppError('This booking is already paid', 409);
  }

  const provider = await ProviderProfile.findById(booking.provider);
  if (!provider) throw new AppError('Provider not found', 404);

  const payment =
    existing ||
    new Payment({
      booking: booking._id,
      customer: req.user._id,
      provider: booking.provider,
      amount: provider.hourlyRate,
    });

  payment.method = 'cash';
  payment.status = 'created';
  await payment.save();

  await notifyUser({
    userId: provider.user,
    type: 'booking_status',
    message: `Customer will pay ₹${payment.amount} in cash for ${booking.date} at ${booking.startTime}`,
    bookingId: booking._id,
  });

  res.status(200).json({ success: true, payment });
});

// @desc    Provider confirms cash received
// @route   PATCH /api/payments/cash/:bookingId/received
// @access  Provider
const confirmCashReceived = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    throw new AppError('Invalid booking id', 400);
  }

  const profile = await ProviderProfile.findOne({ user: req.user._id });
  if (!profile) throw new AppError('Provider profile not found', 404);

  const payment = await Payment.findOne({
    booking: bookingId,
    provider: profile._id,
    method: 'cash',
  });
  if (!payment) throw new AppError('Cash payment not found', 404);
  if (payment.status === 'paid') throw new AppError('Already marked as paid', 409);

  payment.status = 'paid';
  payment.transactionId = `CASH_${payment._id}`;
  await payment.save();

  await notifyUser({
    userId: payment.customer,
    type: 'booking_status',
    message: `Cash payment of ₹${payment.amount} confirmed by provider`,
    bookingId: payment.booking,
  });

  res.status(200).json({ success: true, payment });
});
module.exports = { createOrder, verifyPayment, getMyPayments, chooseCash, confirmCashReceived };