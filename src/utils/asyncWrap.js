/**
 * Wraps an async Express handler so unhandled rejections
 * are forwarded to next() instead of crashing the process.
 */
const asyncWrap = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncWrap;
