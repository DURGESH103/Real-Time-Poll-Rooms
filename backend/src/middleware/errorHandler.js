import logger from '../utils/logger.js';

/**
 * Global error handler middleware
 * Catches all errors and returns consistent error response
 */
export const errorHandler = (err, req, res, next) => {
  // Log error details
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Default error response
  let statusCode = err.statusCode || 500;
  let errorResponse = {
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred'
    }
  };

  // Handle specific error types
  
  // MongoDB duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    errorResponse.error = {
      code: 'DUPLICATE_ENTRY',
      message: 'This action has already been performed'
    };
  }

  // MongoDB validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorResponse.error = {
      code: 'VALIDATION_ERROR',
      message: 'Invalid data provided',
      details: Object.values(err.errors).map(e => e.message)
    };
  }

  // MongoDB cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    errorResponse.error = {
      code: 'INVALID_ID',
      message: 'Invalid ID format'
    };
  }

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    errorResponse.error.message = 'An unexpected error occurred';
    delete errorResponse.error.details;
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * 404 handler for undefined routes
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.originalUrl} not found`
    }
  });
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
