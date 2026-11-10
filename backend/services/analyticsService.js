const User = require('../models/User');
const ProviderProfile = require('../models/ProviderProfile');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');

const getOverview = async () => {
  const [totalUsers, usersByRole, totalProviders, verifiedProviders] = await Promise.all([
    User.countDocuments(),
    User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
    ProviderProfile.countDocuments(),
    ProviderProfile.countDocuments({ isVerified: true }),
  ]);

  const [totalBookings, bookingsByStatus, revenueAgg] = await Promise.all([
    Booking.countDocuments(),
    Booking.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Payment.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
  ]);

  const toMap = (rows) => rows.reduce((acc, r) => ({ ...acc, [r._id]: r.count }), {});

  return {
    users: { total: totalUsers, byRole: toMap(usersByRole) },
    providers: { total: totalProviders, verified: verifiedProviders },
    bookings: { total: totalBookings, byStatus: toMap(bookingsByStatus) },
    revenue: {
      total: revenueAgg.length ? revenueAgg[0].total : 0,
      payments: revenueAgg.length ? revenueAgg[0].count : 0,
    },
  };
};

const getTopProviders = async (limit = 5) => {
  return Booking.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: '$provider', completedBookings: { $sum: 1 } } },
    { $sort: { completedBookings: -1 } },
    { $limit: limit },
    { $lookup: { from: 'providerprofiles', localField: '_id', foreignField: '_id', as: 'profile' } },
    { $unwind: '$profile' },
    { $lookup: { from: 'users', localField: 'profile.user', foreignField: '_id', as: 'user' } },
    { $unwind: '$user' },
    {
      $project: {
        _id: 1,
        name: '$user.name',
        city: '$profile.city',
        ratingAverage: '$profile.ratingAverage',
        ratingCount: '$profile.ratingCount',
        completedBookings: 1,
      },
    },
  ]);
};

const getBookingsPerDay = async (days = 14) => {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - days);

  return Booking.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Asia/Kolkata' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, date: '$_id', count: 1 } },
  ]);
};

module.exports = { getOverview, getTopProviders, getBookingsPerDay };