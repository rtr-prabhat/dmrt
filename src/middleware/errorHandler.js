import logger from '../utils/logger.js';
import env from '../config/env.js';

// Must be registered with 4 parameters so Express treats it as error middleware
// eslint-disable-next-line no-unused-vars
export default function errorHandler(err, req, res, _next) {
  const statusCode    = err.statusCode ?? 500;
  const isOperational = err.isOperational ?? false;

  // For non-operational errors (e.g. database, network), log the full details
  // but still return a readable message to the client.
  if (!isOperational) {
    logger.error(
      { err, req: { method: req.method, url: req.originalUrl, ip: req.ip } },
      'Unhandled error'
    );
  }

  // Build a clean, readable error response
  const errorResponse = {
    success: false,
    error: {
      code:    err.code ?? 'INTERNAL_SERVER_ERROR',
      message: isOperational ? err.message : 'An unexpected error occurred',
      statusCode,
    },
  };

  // In development, include the actual error message and a concise stack trace so
  // the developer can understand what went wrong without scrolling through raw logs.
  if (env.NODE_ENV === 'development') {
    if (!isOperational) {
      errorResponse.error.message = err.message;
    }
    // Include the stack trace (skip first line since it repeats the message)
    if (err.stack) {
      const lines = err.stack.split('\n');
      errorResponse.error.stack = lines.slice(1, 6).join('\n');
    }
  }

  res.status(statusCode).json(errorResponse);
}
