const Joi = require('joi');
const orderService = require('../services/order.service');
const { AppError } = require('../utils/AppError');
const asyncWrap = require('../utils/asyncWrap');

const createSchema = Joi.object({
  addressId: Joi.number().integer().positive().required(),
  notes: Joi.string().max(500).allow(null, '').optional(),
});

const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')
    .required(),
});

const listQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  status: Joi.string()
    .valid('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')
    .optional(),
});

const isAdminUser = (user) =>
  user.roles?.some(r => ['admin', 'sub_admin'].includes(r)) ||
  user.permissions?.some(p => p.resource === 'order' && p.action === 'update');

const create = asyncWrap(async (req, res) => {
  const { error, value } = createSchema.validate(req.body);
  if (error) throw new AppError(error.details[0].message, 422, 'VALIDATION_ERROR');
  const data = await orderService.create(req.user.id, value);
  res.status(201).json({ success: true, data });
});

const list = asyncWrap(async (req, res) => {
  const { error, value } = listQuerySchema.validate(req.query);
  if (error) throw new AppError(error.details[0].message, 422, 'VALIDATION_ERROR');
  const data = await orderService.list(req.user.id, isAdminUser(req.user), value);
  res.json({ success: true, ...data });
});

const getById = asyncWrap(async (req, res) => {
  const checkOwnership = !isAdminUser(req.user);
  const data = await orderService.getById(req.user.id, req.params.id, checkOwnership);
  res.json({ success: true, data });
});

const updateStatus = asyncWrap(async (req, res) => {
  const { error, value } = updateStatusSchema.validate(req.body);
  if (error) throw new AppError(error.details[0].message, 422, 'VALIDATION_ERROR');
  const data = await orderService.updateStatus(req.params.id, value);
  res.json({ success: true, data });
});

const cancel = asyncWrap(async (req, res) => {
  const data = await orderService.cancel(req.user.id, req.params.id);
  res.json({ success: true, data });
});

module.exports = { create, list, getById, updateStatus, cancel };
