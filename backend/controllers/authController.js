const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middleware/asyncHandler');
const generateToken = require('../utils/generateToken');
const normalizePhone = require('../utils/phone');
const ALLOWED_SIGNUP_ROLES = ['customer', 'provider'];

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone } = req.body;

  if (!name || !email || !password) {
    throw new AppError('Name, email and password are required', 400);
  }

  if (typeof email !== 'string' || typeof password !== 'string') {
    throw new AppError('Invalid input', 400);
  }

  if (role && !ALLOWED_SIGNUP_ROLES.includes(role)) {
    throw new AppError('Role must be customer or provider', 400);
  }

  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    throw new AppError('Email already registered', 409);
  }

  const user = await User.create({ name, email, password, role, phone: normalizePhone(phone) });

  const token = generateToken(user._id, user.role);

  res.status(201).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone:user.phone,
    },
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  if (typeof email !== 'string' || typeof password !== 'string') {
    throw new AppError('Invalid input', 400);
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    throw new AppError('Invalid credentials', 401);
  }
    if (user.isActive === false) {
    throw new AppError('Your account has been deactivated', 403);
  }

  const token = generateToken(user._id, user.role);

  res.status(200).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone:user.phone,
    },
  });
});
// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      phone:req.user.phone,
    },
  });
});

// @desc    Change own password
// @route   PUT /api/auth/password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
    throw new AppError('currentPassword and newPassword are required', 400);
  }
  if (newPassword.length < 6) {
    throw new AppError('New password must be at least 6 characters', 400);
  }

  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.matchPassword(currentPassword))) {
    throw new AppError('Current password is incorrect', 401);
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({ success: true, message: 'Password updated' });
});


// @desc    Update own name and phone
// @route   PUT /api/auth/me
// @access  Private
const updateMe = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  const user = await User.findById(req.user._id);

  if (name !== undefined) {
    if (typeof name !== 'string' || !name.trim()) {
      throw new AppError('Name cannot be empty', 400);
    }
    user.name = name.trim();
  }
  if (phone !== undefined) user.phone = normalizePhone(phone);

  await user.save();

  res.status(200).json({
    success: true,
    user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone },
  });
});

module.exports = { register, login, getMe, changePassword, updateMe };