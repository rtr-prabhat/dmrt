const Joi = require('joi');
const asyncWrap = require('../utils/asyncWrap');
const { AppError } = require('../utils/AppError');
const userService = require('../services/user.service');
const orderService = require('../services/order.service');

const listUsers = asyncWrap(async (req, res) => {
  const schema = Joi.object({
    page:   Joi.number().integer().min(1).default(1),
    limit:  Joi.number().integer().min(1).max(100).default(20),
    search: Joi.string().allow('').optional(),
  });
  const { error, value } = schema.validate(req.query);
  if (error) throw new AppError(error.details[0].message, 422, 'VALIDATION_ERROR');
  const result = await userService.list(value);
  res.json({ success: true, ...result });
});

const getUserById = asyncWrap(async (req, res) => {
  const user = await userService.getById(parseInt(req.params.id));
  res.json({ success: true, data: user });
});

const createUser = asyncWrap(async (req, res) => {
  const schema = Joi.object({
    fullName: Joi.string().min(2).max(100).required(),
    email:    Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    roles:    Joi.array().items(Joi.string().valid('admin', 'sub_admin', 'user')).min(1).required(),
  });
  const { error, value } = schema.validate(req.body);
  if (error) throw new AppError(error.details[0].message, 422, 'VALIDATION_ERROR');
  const user = await userService.create(value, req.user.id);
  res.status(201).json({ success: true, data: user });
});

const updateUser = asyncWrap(async (req, res) => {
  const schema = Joi.object({
    fullName: Joi.string().min(2).max(100),
    isActive: Joi.boolean(),
  });
  const { error, value } = schema.validate(req.body);
  if (error) throw new AppError(error.details[0].message, 422, 'VALIDATION_ERROR');
  const user = await userService.update(parseInt(req.params.id), value);
  res.json({ success: true, data: user });
});

const deleteUser = asyncWrap(async (req, res) => {
  await userService.remove(parseInt(req.params.id), req.user.id);
  res.status(204).send();
});

const setRoles = asyncWrap(async (req, res) => {
  const schema = Joi.object({
    roles: Joi.array().items(Joi.string().valid('admin', 'sub_admin', 'user')).min(1).required(),
  });
  const { error, value } = schema.validate(req.body);
  if (error) throw new AppError(error.details[0].message, 422, 'VALIDATION_ERROR');
  const user = await userService.setRoles(parseInt(req.params.id), value.roles, req.user.id);
  res.json({ success: true, data: user });
});

const listOrders = asyncWrap(async (req, res) => {
  const schema = Joi.object({
    page:   Joi.number().integer().min(1).default(1),
    limit:  Joi.number().integer().min(1).max(100).default(20),
    status: Joi.string().valid('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'),
  });
  const { error, value } = schema.validate(req.query);
  if (error) throw new AppError(error.details[0].message, 422, 'VALIDATION_ERROR');
  const result = await orderService.list(null, true, value);
  res.json({ success: true, ...result });
});

const getOrderById = asyncWrap(async (req, res) => {
  const order = await orderService.getById(null, parseInt(req.params.id), false);
  res.json({ success: true, data: order });
});

const updateOrderStatus = asyncWrap(async (req, res) => {
  const schema = Joi.object({
    status: Joi.string()
      .valid('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')
      .required(),
  });
  const { error, value } = schema.validate(req.body);
  if (error) throw new AppError(error.details[0].message, 422, 'VALIDATION_ERROR');
  const order = await orderService.updateStatus(parseInt(req.params.id), value.status);
  res.json({ success: true, data: order });
});

module.exports = {
  listUsers, getUserById, createUser, updateUser, deleteUser, setRoles,
  listOrders, getOrderById, updateOrderStatus,
};
