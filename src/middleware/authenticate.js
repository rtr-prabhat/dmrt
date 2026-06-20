const jwt      = require('jsonwebtoken');
// const redis    = require('../config/redis');
const env      = require('../config/env');
const { AppError } = require('../utils/AppError');
const asyncWrap    = require('../utils/asyncWrap');
const { User, Role, Permission } = require('../models');

const USER_CACHE_TTL = 300; // 5 minutes

async function fetchUserWithPermissions(userId) {
  const user = await User.findByPk(userId, {
    attributes: ['id', 'fullName', 'email', 'isActive'],
    include: [{
      model: Role,
      as: 'roles',
      attributes: ['name'],
      through: { attributes: [] },
      include: [{
        model: Permission,
        as: 'permissions',
        attributes: ['resource', 'action'],
        through: { attributes: [] },
      }],
    }],
  });

  if (!user) return null;

  const permSet = new Set();
  const permissions = [];
  const roles = [];
console.log(user,'userrrrrrrrrrrrrrrrrr permission')
  for (const role of user.roles) {
    roles.push(role.name);
    for (const perm of role.permissions) {
      const key = `${perm.resource}:${perm.action}`;
      if (!permSet.has(key)) {
        permSet.add(key);
        permissions.push({ resource: perm.resource, action: perm.action });
      }
    }
  }

  return {
    id:       user.id,
    fullName: user.fullName,
    email:    user.email,
    isActive: user.isActive,
    roles,
    permissions,
  };
}

  module.exports = asyncWrap(async function authenticate(req, _res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError('Missing or malformed Authorization header', 401));
  }

  const token = header.slice(7);

  // O(1) blacklist check before expensive verify
  // const isBlacklisted = await redis.get(`bl:${token}`);
  // if (isBlacklisted) return next(new AppError('Token has been revoked', 401));

  let payload;
  try {
    payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
  } catch (err) {
    const msg = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
    return next(new AppError(msg, 401));
  }
console.log(payload,'payloaddddddddddd')
  const cacheKey = `user_perms:${payload.sub}`;
  let userData = {}// await redis.get(cacheKey);

  // if (userData) {
  //   userData = JSON.parse(userData);
  // } else {
    userData = await fetchUserWithPermissions(payload.sub);
  //   if (!userData || !userData.isActive) {
  //     return next(new AppError('Account not found or deactivated', 401));
  //   }
  //   await redis.setex(cacheKey, USER_CACHE_TTL, JSON.stringify(userData));
  // }

  req.user  = userData;
  req.token = token;
  next();
});
