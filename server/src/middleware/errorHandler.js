import { config } from '../config/index.js';

/**
 * Centralized error handler returning consistent error envelope.
 */
export function errorHandler(err, req, res, next) {
  // If response headers already sent, delegate to default Express handler
  if (res.headersSent) {
    return next(err);
  }

  // Handle Mongoose Duplicate Key Error (e.g. unique email or eventId)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({
      success: false,
      error: {
        code: 'DUPLICATE_RESOURCE',
        message: `An entry with this ${field} already exists.`,
        details: [{ field, message: `${field} must be unique.` }]
      }
    });
  }

  // Handle Mongoose CastError / ValidationError
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors || {}).map((e) => ({
      field: e.path,
      message: e.message
    }));
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: err.message,
        details
      }
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_ID',
        message: `Invalid ID format for ${err.path}`
      }
    });
  }

  const statusCode = err.statusCode || 500;
  const isProd = config.NODE_ENV === 'production';

  if (!isProd && statusCode === 500) {
    console.error('🔥 Server Error:', err);
  }

  return res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || 'An unexpected error occurred on the server',
      ...(isProd ? {} : { stack: err.stack })
    }
  });
}
