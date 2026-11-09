const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

router.get('/', (req, res) => {
  const dbState = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    database: dbState,
    uptime: Math.round(process.uptime()),
  });
});

module.exports = router;