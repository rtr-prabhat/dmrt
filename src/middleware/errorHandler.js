const logger = require('../utils/logger');
const env = require('../config/env');

// Must be registered with 4 parameters so Express treats it as error middleware
// eslint-disable-next-line no-unused-vars
module.exports = function errorHandler(err, req, res, _next) {
  const statusCode    = err.statusCode ?? 500;
  const isOperational = err.isOperational ?? false;

  if (!isOperational) {
    logger.error(
      { err, req: { method: req.method, url: req.originalUrl, ip: req.ip } },
      'Unhandled error'
    );
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code:    err.code ?? 'INTERNAL_SERVER_ERROR',
      message: isOperational ? err.message : 'An unexpected error occurred',
      ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};
