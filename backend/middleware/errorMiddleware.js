const AppError = require('../utils/AppError');

const notFound = (req, res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.isOperational ? err.message : 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };