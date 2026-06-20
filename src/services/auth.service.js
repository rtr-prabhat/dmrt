const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Role, UserRole, RefreshToken } = require('../models');
// const redis = require('../config/redis');
const env = require('../config/env');
const { AppError } = require('../utils/AppError');

const SALT_ROUNDS = 10;

function issueTokens(user) {
  // console.log(user,'rrrrrrrrrrrrrrrrrrrrr')
  const accessToken = jwt.sign({ ...user }, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES });
  const refreshToken = jwt.sign({ ...user }, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES });

  // console.log(accessToken,'accessTokenaccessToken',refreshToken,'refreshToken')
  return { accessToken, refreshToken };
}

function hashToken(raw) {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

const register = async ({ fullName, email, password }) => {
  try {
    const existing = await User.findOne({ where: { email } });
    if (existing) throw new AppError('Email already registered', 409, 'CONFLICT');

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ fullName, email, passwordHash });

    const role = await Role.findOne({ where: { name: 'user' } });
    if (role) await UserRole.create({ userId: user.id, roleId: role.id, grantedBy: null });
    let tempuse = { fullName, email ,sub:user.id}
    const { accessToken, refreshToken } = issueTokens(tempuse);
    await RefreshToken.create({
      userId: user.id,
      name: user.name,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + env.JWT_REFRESH_EXPIRES * 10000),
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: env.JWT_ACCESS_EXPIRES,
      user: { id: user.id, fullName: user.fullName, email: user.email },
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Registration failed', 500);
  }
};

const login = async ({ email, password, userAgent, ipAddress }) => {
  try {
    const user = await User.findOne({ where: { email },raw:true });
    if (!user || !user.isActive) throw new AppError('Invalid credentials', 401, 'UNAUTHORIZED');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new AppError('Invalid credentials', 401, 'UNAUTHORIZED');

    let tempuser= { fullName :user.fullName, email:user.email ,sub:user.id}
    const { accessToken, refreshToken } = issueTokens(tempuser);
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
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Login failed', 500);
  }
};

const refresh = async ({ rawRefreshToken }) => {
  try {
    let payload;
    try {
      payload = jwt.verify(rawRefreshToken, env.JWT_REFRESH_SECRET);
    } catch {
      throw new AppError('Invalid or expired refresh token', 401, 'UNAUTHORIZED');
    }

    const tokenHash = hashToken(rawRefreshToken);
    const stored = await RefreshToken.findOne({ where: { tokenHash } ,raw:true});
    if (!stored) throw new AppError('Refresh token not found', 401, 'UNAUTHORIZED');

    await RefreshToken.update({ revokedAt: new Date() },{where:{id:stored.id}} );

    const user = await User.findOne({ where: { id:stored.userId },raw:true });
    if (!user || !user.isActive) throw new AppError('Invalid credentials', 401, 'UNAUTHORIZED');

    let tempUser= { fullName :user.fullName, email:user.email ,sub:user.id}
    const { accessToken, refreshToken: newRefresh } = issueTokens(tempUser);
    await RefreshToken.create({
      userId: stored.userId,
      tokenHash: hashToken(newRefresh),
      expiresAt: new Date(Date.now() + env.JWT_REFRESH_EXPIRES * 1000),
    });

    return { accessToken, refreshToken: newRefresh, expiresIn: env.JWT_ACCESS_EXPIRES };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Token refresh failed', 500);
  }
};

const logout = async ({ accessToken, rawRefreshToken, userId }) => {
  try {
    if (rawRefreshToken) {
      const tokenHash = hashToken(rawRefreshToken);
      await RefreshToken.update({ revokedAt: new Date() }, { where: { tokenHash, userId, revokedAt: null } });
    }
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Logout failed', 500);
  }
};

const logoutAll = async ({ accessToken, userId }) => {
  try {
     let ttl = env.JWT_ACCESS_EXPIRES;
    const p = jwt.decode(accessToken);
    if (p && p.exp) ttl = Math.max(1, p.exp - Math.floor(Date.now() / 1000));
    await RefreshToken.update({ revokedAt: new Date() }, { where: { userId, revokedAt: null } });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Logout all failed', 500);
  }
};

module.exports = { register, login, refresh, logout, logoutAll };
