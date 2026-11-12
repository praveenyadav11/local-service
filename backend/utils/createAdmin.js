require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const run = async () => {
  const [name, email, password] = process.argv.slice(2);

  if (!name || !email || !password) {
    console.error('Usage: node utils/createAdmin.js "Name" email@example.com password');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);

  const existing = await User.findOne({ email: email.toLowerCase() });
   if (existing) {
    existing.role = 'admin';
    existing.password = password;
    await existing.save();
    console.log(`Existing user promoted and password reset: ${email}`);
  } else {
    await User.create({ name, email, password, role: 'admin' });
    console.log(`Admin created: ${email}`);
  }

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});