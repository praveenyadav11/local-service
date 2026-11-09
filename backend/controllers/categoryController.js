const mongoose = require('mongoose');
const Category = require('../models/Category');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middleware/asyncHandler');

const validateId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid category id', 400);
  }
};

// @desc    List active categories
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ name: 1 });

  res.status(200).json({
    success: true,
    count: categories.length,
    categories,
  });
});

// @desc    Create a category
// @route   POST /api/categories
// @access  Admin
const createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name || typeof name !== 'string') {
    throw new AppError('Category name is required', 400);
  }

  const category = await Category.create({ name, description });

  res.status(201).json({ success: true, category });
});

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Admin
const updateCategory = asyncHandler(async (req, res) => {
  validateId(req.params.id);

  const { name, description, isActive } = req.body;
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description;
  if (isActive !== undefined) updates.isActive = isActive;

  const category = await Category.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  res.status(200).json({ success: true, category });
});

// @desc    Deactivate a category (soft delete)
// @route   DELETE /api/categories/:id
// @access  Admin
const deleteCategory = asyncHandler(async (req, res) => {
  validateId(req.params.id);

  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  res.status(200).json({ success: true, message: 'Category deactivated' });
});

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };