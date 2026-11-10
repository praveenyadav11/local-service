const express = require('express');
const { setAvailability, getMyAvailability } = require('../controllers/availabilityController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.put('/', protect, authorize('provider'), setAvailability);
router.get('/me', protect, authorize('provider'), getMyAvailability);

module.exports = router;