const express = require('express');
const { createOrder, verifyPayment, getMyPayments,chooseCash,confirmCashReceived } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/order', protect, authorize('customer'), createOrder);
router.post('/verify', protect, authorize('customer'), verifyPayment);
router.get('/my', protect, authorize('customer'), getMyPayments);
router.post('/cash', protect, authorize('customer'), chooseCash);
router.patch('/cash/:bookingId/received', protect, authorize('provider'), confirmCashReceived);


module.exports = router;