const mongoose = require('mongoose');

const providerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: '',
    },
    experienceYears: {
      type: Number,
      min: [0, 'Experience cannot be negative'],
      max: [60, 'Experience seems too high'],
      default: 0,
    },
    hourlyRate: {
      type: Number,
      required: [true, 'Hourly rate is required'],
      min: [0, 'Hourly rate cannot be negative'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      maxlength: [60, 'City cannot exceed 60 characters'],
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
        default: undefined,
        validate: {
          validator: (c) =>
            c === undefined ||
            (c.length === 2 &&
              c[0] >= -180 && c[0] <= 180 &&
              c[1] >= -90 && c[1] <= 90),
          message: 'coordinates must be [longitude, latitude]',
        },
      },
    },
        ratingAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

providerProfileSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('ProviderProfile', providerProfileSchema);