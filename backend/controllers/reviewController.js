const mongoose = require('mongoose');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const ProviderProfile = require('../models/ProviderProfile');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middleware/asyncHandler');
const { notifyUser } = require('../services/notificationService');

const recalculateRating = async (providerId) => {
  const stats = await Review.aggregate([
    { $match: { provider: new mongoose.Types.ObjectId(providerId) } },
    { $group: { _id: '$provider', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  const ratingAverage = stats.length ? Math.round(stats[0].avg * 10) / 10 : 0;
  const ratingCount = stats.length ? stats[0].count : 0;

  await ProviderProfile.findByIdAndUpdate(providerId, { ratingAverage, ratingCount });
};

// @desc    Create a review for a completed booking
// @route   POST /api/reviews
// @access  Customer
const createReview = asyncHandler(async (req, res) => {
  const { bookingId, rating, comment } = req.body;

  if (typeof bookingId !== 'string' || !mongoose.Types.ObjectId.isValid(bookingId)) {
    throw new AppError('Valid bookingId is required', 400);
  }
  if (typeof rating !== 'number') {
    throw new AppError('rating must be a number from 1 to 5', 400);
  }
  if (comment !== undefined && typeof comment !== 'string') {
    throw new AppError('Invalid comment', 400);
  }

  const booking = await Booking.findById(bookingId);
  if (!booking || !booking.customer.equals(req.user._id)) {
    throw new AppError('Booking not found', 404);
  }
  if (booking.status !== 'completed') {
    throw new AppError('You can only review a completed booking', 400);
  }

  let review;
  try {
    review = await Review.create({
      booking: booking._id,
      customer: req.user._id,
      provider: booking.provider,
      rating,
      comment,
    });
  } catch (err) {
    if (err.code === 11000) {
      throw new AppError('You have already reviewed this booking', 409);
    }
    throw err;
  }

  await recalculateRating(booking.provider);
    const providerProfile = await ProviderProfile.findById(booking.provider).select('user');
  if (providerProfile) {
    await notifyUser({
      userId: providerProfile.user,
      type: 'review_received',
      message: `You received a ${rating}-star review`,
      bookingId: booking._id,
    });
  }

  res.status(201).json({ success: true, review });
});

// @desc    List reviews of a provider
// @route   GET /api/reviews/provider/:providerId
// @access  Public
const getProviderReviews = asyncHandler(async (req, res) => {
  const { providerId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(providerId)) {
    throw new AppError('Invalid provider id', 400);
  }

  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);

  const total = await Review.countDocuments({ provider: providerId });
  const reviews = await Review.find({ provider: providerId })
    .populate('customer', 'name')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: reviews.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    reviews,
  });
});

module.exports = { createReview, getProviderReviews };