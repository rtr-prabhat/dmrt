const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const env = require('../../config/env');
const redis = require('../../config/redis');
const { AppError } = require('../../utils/AppError');
const AuthRepository = require('./auth.repository');
const UserRepository = require('../users/users.repository');

const ARGON2_OPTIONS = { type: argon2.argon2id, timeCost: 3, memoryCost: 65536, parallelism: 4 };

function issueAccessToken(user) {
  return jwt.sign(
    { sub: String(user.id), roles: user.roles, jti: crypto.randomUUID() },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES }
  );
}

function issueRefreshToken(userId) {
  return jwt.sign(
    { sub: String(userId), jti: crypto.randomUUID() },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES }
  );
}

async function register({ fullName, email, password }) {
  const existing = await AuthRepository.findUserByEmail(email);
  if (existing) throw new AppError('Email already registered', 409);

  const passwordHash = await argon2.hash(password, ARGON2_OPTIONS);

  const conn = await require('../../config/db').getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.execute(
      `INSERT INTO users (email, password_hash, full_name) VALUES (?, ?, ?)`,
      [email, passwordHash, fullName]
    );
    const userId = result.insertId;

    // Assign default 'user' role
    await conn.execute(
      `INSERT INTO user_roles (user_id, role_id)
       SELECT ?, id FROM roles WHERE name = 'user'`,
      [userId]
    );

    await conn.commit();
    return { id: userId, email, fullName };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function login({ email, password, userAgent, ipAddress }) {
  const user = await AuthRepository.findUserByEmail(email);
  if (!user) throw new AppError('Invalid email or password', 401);
  if (!user.is_active) throw new AppError('Account is deactivated', 403);

  const valid = await argon2.verify(user.password_hash, password);
  if (!valid) throw new AppError('Invalid email or password', 401);

  const userData = await UserRepository.findWithPermissions(user.id);

  const accessToken  = issueAccessToken(userData);
  const rawRefresh   = issueRefreshToken(user.id);
  const expiresAt    = new Date(Date.now() + env.JWT_REFRESH_EXPIRES * 1000);

  await AuthRepository.createRefreshToken({
    userId: user.id, rawToken: rawRefresh,
    expiresAt, userAgent, ipAddress,
  });

  return {
    accessToken,
    refreshToken: rawRefresh,
    expiresIn: env.JWT_ACCESS_EXPIRES,
    user: { id: user.id, email: user.email, fullName: user.full_name, roles: userData.roles },
  };
}

async function refresh({ rawRefreshToken }) {
  let payload;
  try {
    payload = jwt.verify(rawRefreshToken, env.JWT_REFRESH_SECRET);
  } catch {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  const stored = await AuthRepository.findRefreshToken(rawRefreshToken);
  if (!stored || stored.revoked_at || new Date(stored.expires_at) < new Date()) {
    throw new AppError('Refresh token is invalid or has been revoked', 401);
  }

  // Rotate: revoke old, issue new pair
  await AuthRepository.revokeRefreshToken(rawRefreshToken);

  const userData    = await UserRepository.findWithPermissions(payload.sub);
  const accessToken = issueAccessToken(userData);
  const newRawRefresh = issueRefreshToken(payload.sub);
  const expiresAt = new Date(Date.now() + env.JWT_REFRESH_EXPIRES * 1000);

  await AuthRepository.createRefreshToken({
    userId: payload.sub, rawToken: newRawRefresh, expiresAt,
  });

  // Invalidate Redis user-permissions cache so updated roles apply immediately
  await redis.del(`user_perms:${payload.sub}`);

  return {
    accessToken,
    refreshToken: newRawRefresh,
    expiresIn: env.JWT_ACCESS_EXPIRES,
  };
}

async function logout({ accessToken, rawRefreshToken, userId }) {
  // Blacklist the access token until its natural expiry
  let ttl = env.JWT_ACCESS_EXPIRES;
  try {
    const decoded = jwt.decode(accessToken);
    if (decoded?.exp) ttl = Math.max(1, decoded.exp - Math.floor(Date.now() / 1000));
  } catch { /* use default */ }

  await redis.setex(`bl:${accessToken}`, ttl, '1');
  await redis.del(`user_perms:${userId}`);

  if (rawRefreshToken) await AuthRepository.revokeRefreshToken(rawRefreshToken);
}

async function logoutAll({ accessToken, userId }) {
  let ttl = env.JWT_ACCESS_EXPIRES;
  try {
    const decoded = jwt.decode(accessToken);
    if (decoded?.exp) ttl = Math.max(1, decoded.exp - Math.floor(Date.now() / 1000));
  } catch { /* use default */ }

  await redis.setex(`bl:${accessToken}`, ttl, '1');
  await redis.del(`user_perms:${userId}`);
  await AuthRepository.revokeAllUserTokens(userId);
}

module.exports = { register, login, refresh, logout, logoutAll };
