import Joi from 'joi';
import * as userService from '../services/user.service.js';
import asyncWrap from '../utils/asyncWrap.js';
import { AppError } from '../utils/AppError.js';

const updateMeSchema = Joi.object({
  fullName: Joi.string().min(2).max(100),
  phone: Joi.string().pattern(/^\+?[0-9]{10,15}$/).allow(null, ''),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).pattern(/^(?=.*[A-Z])(?=.*\d)/).required()
    .messages({ 'string.pattern.base': 'New password must have at least 1 uppercase letter and 1 digit' }),
});

const createSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  roles: Joi.array().items(Joi.string().valid('admin', 'sub_admin', 'user')).min(1).required(),
});

const updateSchema = Joi.object({
  fullName: Joi.string().min(2).max(100),
  isActive: Joi.boolean(),
});

const setRolesSchema = Joi.object({
  roles: Joi.array().items(Joi.string().valid('admin', 'sub_admin', 'user')).min(1).required(),
});

const listQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().allow('').default(''),
});

const getMe = asyncWrap(async (req, res) => {
  try {
    const user = await userService.getMe(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
});

const updateMe = asyncWrap(async (req, res) => {
  try {
    const { error, value } = updateMeSchema.validate(req.body, { abortEarly: true });
    if (error) throw new AppError(error.details[0].message, 422, 'VALIDATION_ERROR');

    const user = await userService.updateMe(req.user.id, value);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
});

const changePassword = asyncWrap(async (req, res) => {
  try {
    const { error, value } = changePasswordSchema.validate(req.body, { abortEarly: true });
    if (error) throw new AppError(error.details[0].message, 422, 'VALIDATION_ERROR');

    await userService.changePassword(req.user.id, value);
    res.status(200).json({ success: true, data: { message: 'Password changed successfully' } });
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
});

const list = asyncWrap(async (req, res) => {
  try {
    const { error, value } = listQuerySchema.validate(req.query, { abortEarly: true });
    if (error) throw new AppError(error.details[0].message, 422, 'VALIDATION_ERROR');

    const result = await userService.list(value);
    res.status(200).json({ success: true, data: result.users, meta: result.meta });
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
});

const getById = asyncWrap(async (req, res) => {
  try {
    const user = await userService.getById(Number(req.params.id));
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
});

const create = asyncWrap(async (req, res) => {
  try {
    const { error, value } = createSchema.validate(req.body, { abortEarly: true });
    if (error) throw new AppError(error.details[0].message, 422, 'VALIDATION_ERROR');

    const user = await userService.create(value, req.user.id);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
});

const update = asyncWrap(async (req, res) => {
  try {
    const { error, value } = updateSchema.validate(req.body, { abortEarly: true });
    if (error) throw new AppError(error.details[0].message, 422, 'VALIDATION_ERROR');

    const user = await userService.update(Number(req.params.id), value);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
});

const remove = asyncWrap(async (req, res) => {
  try {
    await userService.remove(Number(req.params.id), req.user.id);
    res.status(200).json({ success: true, data: { message: 'User deleted successfully' } });
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
});

const setRoles = asyncWrap(async (req, res) => {
  try {
    const { error, value } = setRolesSchema.validate(req.body, { abortEarly: true });
    if (error) throw new AppError(error.details[0].message, 422, 'VALIDATION_ERROR');

    const user = await userService.setRoles(Number(req.params.id), value.roles, req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
});

export { getMe, updateMe, changePassword, list, getById, create, update, remove, setRoles };
