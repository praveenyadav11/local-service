const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProviderProfile',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Amount cannot be negative'],
    },
    currency: {
      type: String,
      default: 'INR',
    },
    method: {
      type: String,
      enum: ['upi', 'card', 'netbanking', 'wallet', 'cash'],
      default: 'upi',
    },
    status: {
      type: String,
      enum: ['created', 'paid', 'refunded'],
      default: 'created',
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    razorpayOrderId: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true }
);

paymentSchema.index({ customer: 1, createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);