require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const run = async () => {
  const [email, newPassword] = process.argv.slice(2);

  if (!email || !newPassword || newPassword.length < 6) {
    console.error('Usage: node utils/resetPassword.js email@example.com newPassword (min 6 chars)');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    console.error('User not found');
    process.exit(1);
  }

  user.password = newPassword;
  await user.save();
  console.log(`Password updated for ${email}`);

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});