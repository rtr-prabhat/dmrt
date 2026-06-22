import jwt      from 'jsonwebtoken';
// import redis    from '../config/redis.js';
import env      from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import asyncWrap    from '../utils/asyncWrap.js';
import { User, Role, Permission } from '../models/index.js';

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

export default asyncWrap(async function authenticate(req, _res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError('Missing or malformed Authorization header', 401));
  }

  const token = header.slice(7);

  let payload;
  try {
    payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
  } catch (err) {
    const msg = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
    return next(new AppError(msg, 401));
  }

  const cacheKey = `user_perms:${payload.sub}`;
  let userData = {};

  userData = await fetchUserWithPermissions(payload.sub);

  req.user  = userData;
  req.token = token;
  next();
});
