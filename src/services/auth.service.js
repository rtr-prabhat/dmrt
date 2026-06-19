const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Role, UserRole, RefreshToken } = require('../models');
// const redis = require('../config/redis');
const env = require('../config/env');
const { AppError } = require('../utils/AppError');

const SALT_ROUNDS = 10;

function issueTokens(userId) {
  const accessToken = jwt.sign({ sub: userId }, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES });
  const refreshToken = jwt.sign({ sub: userId }, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES });
  return { accessToken, refreshToken };
}

function hashToken(raw) {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

const register = async ({ fullName, email, password }) => {
  const existing = await User.findOne({ where: { email } });
  if (existing) throw new AppError('Email already registered', 409, 'CONFLICT');

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ fullName, email, passwordHash });

  const role = await Role.findOne({ where: { name: 'user' } });
  if (role) await UserRole.create({ userId: user.id, roleId: role.id, grantedBy: null });

  const { accessToken, refreshToken } = issueTokens(user.id);
  await RefreshToken.create({
    userId: user.id,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + env.JWT_REFRESH_EXPIRES * 1000),
  });

  return {
    accessToken,
    refreshToken,
    expiresIn: env.JWT_ACCESS_EXPIRES,
    user: { id: user.id, fullName: user.fullName, email: user.email },
  };
};

const login = async ({ email, password, userAgent, ipAddress }) => {
  const user = await User.findOne({ where: { email } });
  if (!user || !user.isActive) throw new AppError('Invalid credentials', 401, 'UNAUTHORIZED');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new AppError('Invalid credentials', 401, 'UNAUTHORIZED');

  const { accessToken, refreshToken } = issueTokens(user.id);
  await RefreshToken.create({
    userId: user.id,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + env.JWT_REFRESH_EXPIRES * 1000),
    userAgent: userAgent || null,
    ipAddress: ipAddress || null,
  });

  return {
    accessToken,
    refreshToken,
    expiresIn: env.JWT_ACCESS_EXPIRES,
    user: { id: user.id, fullName: user.fullName, email: user.email },
  };
};

const refresh = async ({ rawRefreshToken }) => {
  let payload;
  try {
    payload = jwt.verify(rawRefreshToken, env.JWT_REFRESH_SECRET);
  } catch {
    throw new AppError('Invalid or expired refresh token', 401, 'UNAUTHORIZED');
  }

  const tokenHash = hashToken(rawRefreshToken);
  const stored = await RefreshToken.findOne({ where: { tokenHash, revokedAt: null } });
  if (!stored || stored.userId !== payload.sub) throw new AppError('Refresh token not found', 401, 'UNAUTHORIZED');

  await stored.update({ revokedAt: new Date() });
  const { accessToken, refreshToken: newRefresh } = issueTokens(payload.sub);
  await RefreshToken.create({
    userId: payload.sub,
    tokenHash: hashToken(newRefresh),
    expiresAt: new Date(Date.now() + env.JWT_REFRESH_EXPIRES * 1000),
  });

  return { accessToken, refreshToken: newRefresh, expiresIn: env.JWT_ACCESS_EXPIRES };
};

const logout = async ({ accessToken, rawRefreshToken, userId }) => {
  let ttl = env.JWT_ACCESS_EXPIRES;
  try {
    const p = jwt.decode(accessToken);
    if (p && p.exp) ttl = Math.max(1, p.exp - Math.floor(Date.now() / 1000));
  } catch {}
  // await redis.setex(`bl:${accessToken}`, ttl, '1');
  // await redis.del(`user_perms:${userId}`);

  if (rawRefreshToken) {
    const tokenHash = hashToken(rawRefreshToken);
    await RefreshToken.update({ revokedAt: new Date() }, { where: { tokenHash, userId, revokedAt: null } });
  }
};

const logoutAll = async ({ accessToken, userId }) => {
  let ttl = env.JWT_ACCESS_EXPIRES;
  try {
    const p = jwt.decode(accessToken);
    if (p && p.exp) ttl = Math.max(1, p.exp - Math.floor(Date.now() / 1000));
  } catch {}
  // await redis.setex(`bl:${accessToken}`, ttl, '1');
  // await redis.del(`user_perms:${userId}`);
  await RefreshToken.update({ revokedAt: new Date() }, { where: { userId, revokedAt: null } });
};

module.exports = { register, login, refresh, logout, logoutAll };
