const mongoose = require('mongoose');
const ProviderProfile = require('../models/ProviderProfile');
const Category = require('../models/Category');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middleware/asyncHandler');

const checkCategory = async (categoryId) => {
  if (typeof categoryId !== 'string' || !mongoose.Types.ObjectId.isValid(categoryId)) {
    throw new AppError('Invalid category id', 400);
  }
  const category = await Category.findOne({ _id: categoryId, isActive: true });
  if (!category) {
    throw new AppError('Category not found or inactive', 404);
  }
};

const parseLocation = (lat, lng) => {
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    throw new AppError('latitude and longitude must be numbers', 400);
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    throw new AppError('latitude or longitude out of range', 400);
  }
  return { type: 'Point', coordinates: [lng, lat] };
};

// @desc    Create own provider profile
// @route   POST /api/providers/profile
// @access  Provider
const createProfile = asyncHandler(async (req, res) => {
  const existing = await ProviderProfile.findOne({ user: req.user._id });
  if (existing) {
    throw new AppError('Profile already exists', 409);
  }

    const { category, bio, experienceYears, hourlyRate, city, latitude, longitude } = req.body;

  await checkCategory(category);

  const data = {
    user: req.user._id,
    category,
    bio,
    experienceYears,
    hourlyRate,
    city,
  };

  if (latitude !== undefined || longitude !== undefined) {
    data.location = parseLocation(latitude, longitude);
  }

  const profile = await ProviderProfile.create(data);

  res.status(201).json({ success: true, profile });
});

// @desc    Update own provider profile
// @route   PUT /api/providers/profile
// @access  Provider
const updateProfile = asyncHandler(async (req, res) => {
  const { category, bio, experienceYears, hourlyRate, city, latitude, longitude } = req.body;
  const updates = {};
  if (category !== undefined) {
    await checkCategory(category);
    updates.category = category;
  }
  if (bio !== undefined) updates.bio = bio;
  if (experienceYears !== undefined) updates.experienceYears = experienceYears;
  if (hourlyRate !== undefined) updates.hourlyRate = hourlyRate;
  if (city !== undefined) updates.city = city;

    if (latitude !== undefined || longitude !== undefined) {
    updates.location = parseLocation(latitude, longitude);
  }
  const profile = await ProviderProfile.findOneAndUpdate(
    { user: req.user._id },
    updates,
    { new: true, runValidators: true }
  );

  if (!profile) {
    throw new AppError('Profile not found. Create one first', 404);
  }

  res.status(200).json({ success: true, profile });
});

// @desc    Get own provider profile
// @route   GET /api/providers/profile/me
// @access  Provider
const getMyProfile = asyncHandler(async (req, res) => {
  const profile = await ProviderProfile.findOne({ user: req.user._id }).populate(
    'category',
    'name description'
  );

  if (!profile) {
    throw new AppError('Profile not found. Create one first', 404);
  }

  res.status(200).json({ success: true, profile });
});

// @desc    List providers (filter by category and city)
// @route   GET /api/providers
// @access  Public
const getProviders = asyncHandler(async (req, res) => {
  const { category, city } = req.query;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);

  const filter = {};

  if (category !== undefined) {
    if (typeof category !== 'string' || !mongoose.Types.ObjectId.isValid(category)) {
      throw new AppError('Invalid category id', 400);
    }
    filter.category = category;
  }

  if (city !== undefined) {
    if (typeof city !== 'string') {
      throw new AppError('Invalid city', 400);
    }
    const escaped = city.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.city = new RegExp(`^${escaped}$`, 'i');
  }

  const total = await ProviderProfile.countDocuments(filter);
  const providers = await ProviderProfile.find(filter)
    .populate('user', 'name')
    .populate('category', 'name')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: providers.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    providers,
  });
});
// @desc    Find providers near a point
// @route   GET /api/providers/nearby?lat=&lng=&radiusKm=&category=
// @access  Public
const getNearbyProviders = asyncHandler(async (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const radiusKm = Math.min(Math.max(Number(req.query.radiusKm) || 10, 1), 100);
  const { category } = req.query;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);

  if (
    req.query.lat === undefined ||
    req.query.lng === undefined ||
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 || lat > 90 ||
    lng < -180 || lng > 180
  ) {
    throw new AppError('Valid lat and lng query parameters are required', 400);
  }

  const filter = {};
  if (category !== undefined) {
    if (typeof category !== 'string' || !mongoose.Types.ObjectId.isValid(category)) {
      throw new AppError('Invalid category id', 400);
    }
    filter.category = new mongoose.Types.ObjectId(category);
  }

  const results = await ProviderProfile.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [lng, lat] },
        distanceField: 'distanceMeters',
        maxDistance: radiusKm * 1000,
        spherical: true,
        query: filter,
      },
    },
    { $skip: (page - 1) * limit },
    { $limit: limit },
    { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' } },
    { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'category' } },
    { $unwind: '$user' },
    { $unwind: '$category' },
    {
      $project: {
        'user.name': 1,
        'category.name': 1,
        bio: 1,
        experienceYears: 1,
        hourlyRate: 1,
        city: 1,
        isVerified: 1,
        distanceKm: { $round: [{ $divide: ['$distanceMeters', 1000] }, 2] },
      },
    },
  ]);

  res.status(200).json({ success: true, count: results.length, page, providers: results });
});

// @desc    Get one provider
// @route   GET /api/providers/:id
// @access  Public
const getProviderById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new AppError('Invalid provider id', 400);
  }

  const provider = await ProviderProfile.findById(req.params.id)
    .populate('user', 'name')
    .populate('category', 'name description');

  if (!provider) {
    throw new AppError('Provider not found', 404);
  }

  res.status(200).json({ success: true, provider });
});
module.exports = {
  createProfile,
  updateProfile,
  getMyProfile,
  getProviders,
  getNearbyProviders,
  getProviderById,
};