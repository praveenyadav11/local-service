const express = require('express');
const { getUsers, setUserActive,setProviderVerified,getAnalytics } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/users', getUsers);
router.patch('/users/:id/active', setUserActive);
router.patch('/providers/:id/verify', setProviderVerified);
router.get('/analytics', getAnalytics);

module.exports = router;