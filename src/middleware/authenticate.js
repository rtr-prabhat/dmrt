const jwt = require('jsonwebtoken');
const redis = require('../config/redis');
const env = require('../config/env');
const { AppError } = require('../utils/AppError');
const asyncWrap = require('../utils/asyncWrap');
const UserRepository = require('../modules/users/users.repository');

const USER_CACHE_TTL = 300; // 5 minutes

module.exports = asyncWrap(async function authenticate(req, _res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError('Missing or malformed Authorization header', 401));
  }

  const token = header.slice(7);

  // O(1) blacklist check before expensive verify
  const isBlacklisted = await redis.get(`bl:${token}`);
  if (isBlacklisted) return next(new AppError('Token has been revoked', 401));

  let payload;
  try {
    payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
  } catch (err) {
    const msg = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
    return next(new AppError(msg, 401));
  }

  // Hydrate permissions from Redis cache, fall back to DB
  const cacheKey = `user_perms:${payload.sub}`;
  let userData = await redis.get(cacheKey);

  if (userData) {
    userData = JSON.parse(userData);
  } else {
    userData = await UserRepository.findWithPermissions(payload.sub);
    if (!userData || !userData.is_active) {
      return next(new AppError('Account not found or deactivated', 401));
    }
    await redis.setex(cacheKey, USER_CACHE_TTL, JSON.stringify(userData));
  }

  req.user  = userData;
  req.token = token;
  next();
});
