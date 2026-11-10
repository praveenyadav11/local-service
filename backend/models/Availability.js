const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema(
  {
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProviderProfile',
      required: true,
      unique: true,
    },
    workingDays: {
      type: [Number],
      required: [true, 'Working days are required'],
      validate: {
        validator: (days) =>
          days.length > 0 &&
          days.length <= 7 &&
          new Set(days).size === days.length &&
          days.every((d) => Number.isInteger(d) && d >= 0 && d <= 6),
        message: 'Working days must be unique numbers from 0 (Sunday) to 6 (Saturday)',
      },
    },
    startHour: {
      type: Number,
      required: [true, 'Start hour is required'],
      min: [0, 'Start hour must be between 0 and 23'],
      max: [23, 'Start hour must be between 0 and 23'],
    },
    endHour: {
      type: Number,
      required: [true, 'End hour is required'],
      min: [1, 'End hour must be between 1 and 24'],
      max: [24, 'End hour must be between 1 and 24'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Availability', availabilitySchema);