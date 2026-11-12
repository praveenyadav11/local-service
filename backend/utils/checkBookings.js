require('dotenv').config();
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const ProviderProfile = require('../models/ProviderProfile');
const User = require('../models/User');

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Database:', mongoose.connection.name);

  const bookings = await Booking.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('customer', 'name email')
    .populate({ path: 'provider', populate: { path: 'user', select: 'name email' } });

  if (bookings.length === 0) console.log('No bookings found in this database.');

  bookings.forEach((b) => {
    console.log('---');
    console.log('Booking :', b._id.toString(), '|', b.date, b.startTime, '|', b.status);
    console.log('Customer:', b.customer?.name, b.customer?.email);
    console.log('Provider:', b.provider?.user?.name, b.provider?.user?.email, '(profile', b.provider?._id?.toString() + ')');
  });

  console.log('\nProvider profiles and their login emails:');
  const profiles = await ProviderProfile.find().populate('user', 'name email');
  profiles.forEach((p) => console.log('-', p._id.toString(), '|', p.user?.name, p.user?.email));

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});