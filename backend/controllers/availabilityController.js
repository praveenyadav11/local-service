const Availability = require('../models/Availability');
const ProviderProfile = require('../models/ProviderProfile');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middleware/asyncHandler');
const mongoose = require('mongoose');
const { isValidDateString, generateSlots, getNowInBusinessTimezone } = require('../services/slotService');
const Booking = require('../models/Booking');
const getOwnProfile = async (userId) => {
  const profile = await ProviderProfile.findOne({ user: userId });
  if (!profile) {
    throw new AppError('Create your provider profile first', 404);
  }
  return profile;
};

// @desc    Create or update own availability
// @route   PUT /api/availability
// @access  Provider
const setAvailability = asyncHandler(async (req, res) => {
  const { workingDays, startHour, endHour } = req.body;

  if (!Array.isArray(workingDays) || typeof startHour !== 'number' || typeof endHour !== 'number') {
    throw new AppError('workingDays (array), startHour and endHour (numbers) are required', 400);
  }

  if (!Number.isInteger(startHour) || !Number.isInteger(endHour) || startHour >= endHour) {
    throw new AppError('startHour and endHour must be whole numbers, with startHour before endHour', 400);
  }

  const profile = await getOwnProfile(req.user._id);

  const availability = await Availability.findOneAndUpdate(
    { provider: profile._id },
    { workingDays, startHour, endHour },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  res.status(200).json({ success: true, availability });
});

// @desc    Get own availability
// @route   GET /api/availability/me
// @access  Provider
const getMyAvailability = asyncHandler(async (req, res) => {
  const profile = await getOwnProfile(req.user._id);
  const availability = await Availability.findOne({ provider: profile._id });

  if (!availability) {
    throw new AppError('Availability not set yet', 404);
  }

  res.status(200).json({ success: true, availability });
});


// @desc    Get available slots for a provider on a date
// @route   GET /api/providers/:id/slots?date=YYYY-MM-DD
// @access  Public
const getProviderSlots = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { date } = req.query;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid provider id', 400);
  }

  if (!isValidDateString(date)) {
    throw new AppError('date is required in YYYY-MM-DD format', 400);
  }

  if (date < getNowInBusinessTimezone().date) {
    throw new AppError('Cannot view slots for a past date', 400);
  }

  const availability = await Availability.findOne({ provider: id });
  if (!availability) {
    throw new AppError('This provider has not set availability yet', 404);
  }

  const bookedStartTimes = await Booking.find({
  provider: id,
  date,
  status: { $in: ['pending', 'confirmed'] },
}).distinct('startTime');

const slots = generateSlots(availability, date, bookedStartTimes);

  res.status(200).json({ success: true, date, count: slots.length, slots });
});
module.exports = { setAvailability, getMyAvailability, getProviderSlots };