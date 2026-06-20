const Joi = require('joi');
const addressService = require('../services/address.service');
const asyncWrap = require('../utils/asyncWrap');
const { AppError } = require('../utils/AppError');

const createSchema = Joi.object({
  label: Joi.string().max(50).default('Home'),
  line1: Joi.string().max(255).required(),
  line2: Joi.string().max(255).allow(null, ''),
  city: Joi.string().max(100).required(),
  state: Joi.string().max(100).required(),
  pincode: Joi.string().pattern(/^\d{6}$/).required()
    .messages({ 'string.pattern.base': 'Pincode must be 6 digits' }),
  phone: Joi.string().pattern(/^\+?[0-9]{10,15}$/).required()
    .messages({ 'string.pattern.base': 'Invalid phone number' }),
  isDefault: Joi.boolean().default(false),
});

const updateSchema = Joi.object({
  label: Joi.string().max(50),
  line1: Joi.string().max(255),
  line2: Joi.string().max(255).allow(null, ''),
  city: Joi.string().max(100),
  state: Joi.string().max(100),
  pincode: Joi.string().pattern(/^\d{6}$/)
    .messages({ 'string.pattern.base': 'Pincode must be 6 digits' }),
  phone: Joi.string().pattern(/^\+?[0-9]{10,15}$/)
    .messages({ 'string.pattern.base': 'Invalid phone number' }),
  isDefault: Joi.boolean(),
});

const list = asyncWrap(async (req, res) => {
  try {
    const addresses = await addressService.list(req.user.id);
    res.status(200).json({ success: true, data: addresses });
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
});

const create = asyncWrap(async (req, res) => {
  try {
    const { error, value } = createSchema.validate(req.body, { abortEarly: true });
    if (error) throw new AppError(error.details[0].message, 422, 'VALIDATION_ERROR');

    const address = await addressService.create(req.user.id, value);
    res.status(201).json({ success: true, data: address });
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
});

const update = asyncWrap(async (req, res) => {
  try {
    const { error, value } = updateSchema.validate(req.body, { abortEarly: true });
    if (error) throw new AppError(error.details[0].message, 422, 'VALIDATION_ERROR');

    const address = await addressService.update(req.user.id, Number(req.params.id), value);
    res.status(200).json({ success: true, data: address });
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
});

const remove = asyncWrap(async (req, res) => {
  try {
    await addressService.remove(req.user.id, Number(req.params.id));
    res.status(200).json({ success: true, data: { message: 'Address deleted successfully' } });
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
});

const setDefault = asyncWrap(async (req, res) => {
  try {
    const address = await addressService.setDefault(req.user.id, Number(req.params.id));
    res.status(200).json({ success: true, data: address });
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
});

module.exports = { list, create, update, remove, setDefault };
