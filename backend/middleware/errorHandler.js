// backend/middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error(err.stack); // Log the error stack for debugging

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // In production, avoid sending detailed error messages to the client
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    return res.status(statusCode).json({ error: 'An unexpected error occurred.' });
  }

  res.status(statusCode).json({
    error: message,
    details: err.errors || undefined // Include validation errors if present
  });
};

module.exports = errorHandler;