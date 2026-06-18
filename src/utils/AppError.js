const HTTP_CODES = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  422: 'UNPROCESSABLE_ENTITY',
};

class AppError extends Error {
  constructor(message, statusCode = 500, code) {
    super(message);
    this.statusCode    = statusCode;
    this.isOperational = true;
    this.code          = code ?? HTTP_CODES[statusCode] ?? 'INTERNAL_SERVER_ERROR';
  }
}

module.exports = { AppError };
