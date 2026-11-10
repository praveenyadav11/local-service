const express = require('express');
const { createPayment, getMyPayments } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, authorize('customer'), createPayment);
router.get('/my', protect, authorize('customer'), getMyPayments);

module.exports = router;