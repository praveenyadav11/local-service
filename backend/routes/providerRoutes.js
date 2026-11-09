const express = require('express');
const {
  createProfile,
  updateProfile,
  getMyProfile,
  getProviders,
  getProviderById,
} = require('../controllers/providerController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/profile', protect, authorize('provider'), createProfile);
router.put('/profile', protect, authorize('provider'), updateProfile);
router.get('/profile/me', protect, authorize('provider'), getMyProfile);
router.get('/', getProviders);
router.get('/:id', getProviderById);

module.exports = router;