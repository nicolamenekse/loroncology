// Custom error class for API errors
export class APIError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'APIError';
  }
}

// Central error handler middleware
export const errorHandler = (err, req, res, next) => {
  console.error(err);

  // If it's our custom API error, use its status code and message
  if (err instanceof APIError) {
    return res.status(err.statusCode).json({
      ok: false,
      message: err.message
    });
  }

  // Handle mongoose validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      ok: false,
      message: Object.values(err.errors).map(e => e.message).join(', ')
    });
  }

  // Handle mongoose duplicate key errors
  if (err.code === 11000) {
    return res.status(400).json({
      ok: false,
      message: 'A record with this value already exists'
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      ok: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      ok: false,
      message: 'Token expired'
    });
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'An unexpected error occurred'
    : err.message || 'Internal server error';

  res.status(statusCode).json({
    ok: false,
    message
  });
};
