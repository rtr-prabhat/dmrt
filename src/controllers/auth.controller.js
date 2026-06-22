import Joi from 'joi';
import * as authService from '../services/auth.service.js';
import asyncWrap from '../utils/asyncWrap.js';
import { AppError } from '../utils/AppError.js';

const registerSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(/^(?=.*[A-Z])(?=.*\d)/).required()
    .messages({ 'string.pattern.base': 'Password must have at least 1 uppercase letter and 1 digit' }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

const register = asyncWrap(async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body, { abortEarly: true });
    if (error) throw new AppError(error.details[0].message, 422, 'VALIDATION_ERROR');

    const result = await authService.register(value);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
});

const login = asyncWrap(async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body, { abortEarly: true });
    if (error) throw new AppError(error.details[0].message, 422, 'VALIDATION_ERROR');

    const result = await authService.login({
      ...value,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
});

const refresh = asyncWrap(async (req, res) => {
  try {
    const { error, value } = refreshSchema.validate(req.body, { abortEarly: true });
    if (error) throw new AppError(error.details[0].message, 422, 'VALIDATION_ERROR');

    const result = await authService.refresh({ rawRefreshToken: value.refreshToken });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
});

const logout = asyncWrap(async (req, res) => {
  try {
    const rawRefreshToken = req.body?.refreshToken || null;
    
    await authService.logout({ accessToken: req.token, rawRefreshToken, userId: req.user.id });
    res.status(200).json({ success: true, data: { message: 'Logged out successfully' } });
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
});

const logoutAll = asyncWrap(async (req, res) => {
  try {
    await authService.logoutAll({ accessToken: req.token, userId: req.user.id });
    res.status(200).json({ success: true, data: { message: 'Logged out from all devices' } });
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
});

export { register, login, refresh, logout, logoutAll };
