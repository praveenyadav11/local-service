const mongoose = require('mongoose');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middleware/asyncHandler');
const ProviderProfile = require('../models/ProviderProfile');
const {
  getOverview,
  getTopProviders,
  getBookingsPerDay,
} = require('../services/analyticsService');

const VALID_ROLES = ['customer', 'provider', 'admin'];

// @desc    List users (filter by role, paginated)
// @route   GET /api/admin/users?role=&page=&limit=
// @access  Admin
const getUsers = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);

  const filter = {};
  if (req.query.role !== undefined) {
    if (typeof req.query.role !== 'string' || !VALID_ROLES.includes(req.query.role)) {
      throw new AppError('Invalid role filter', 400);
    }
    filter.role = req.query.role;
  }

  const total = await User.countDocuments(filter);
  const users = await User.find(filter)
    .select('name email role isActive createdAt')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    users,
  });
});

// @desc    Activate or deactivate a user
// @route   PATCH /api/admin/users/:id/active
// @access  Admin
const setUserActive = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid user id', 400);
  }
  if (typeof isActive !== 'boolean') {
    throw new AppError('isActive must be true or false', 400);
  }
  if (req.user._id.equals(id)) {
    throw new AppError('You cannot change your own active status', 400);
  }

  const user = await User.findByIdAndUpdate(id, { isActive }, { new: true }).select(
    'name email role isActive'
  );
  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({ success: true, user });
});


// @desc    Verify or unverify a provider profile
// @route   PATCH /api/admin/providers/:id/verify
// @access  Admin
const setProviderVerified = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isVerified } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid provider id', 400);
  }
  if (typeof isVerified !== 'boolean') {
    throw new AppError('isVerified must be true or false', 400);
  }

  const profile = await ProviderProfile.findByIdAndUpdate(
    id,
    { isVerified },
    { new: true }
  ).populate('user', 'name');

  if (!profile) {
    throw new AppError('Provider not found', 404);
  }

  res.status(200).json({ success: true, profile });
});
// @desc    Platform analytics
// @route   GET /api/admin/analytics?days=14&topLimit=5
// @access  Admin
const getAnalytics = asyncHandler(async (req, res) => {
  const days = Math.min(Math.max(parseInt(req.query.days, 10) || 14, 1), 90);
  const topLimit = Math.min(Math.max(parseInt(req.query.topLimit, 10) || 5, 1), 20);

  const [overview, topProviders, bookingsPerDay] = await Promise.all([
    getOverview(),
    getTopProviders(topLimit),
    getBookingsPerDay(days),
  ]);

  res.status(200).json({
    success: true,
    overview,
    topProviders,
    bookingsPerDay,
  });
});
module.exports = { getUsers, setUserActive, setProviderVerified, getAnalytics };