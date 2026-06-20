const Joi = require('joi');
const asyncWrap = require('../utils/asyncWrap');
const { AppError } = require('../utils/AppError');
const warehouseService = require('../services/warehouse.service');

const listSchema = Joi.object({
  page:     Joi.number().integer().min(1).default(1),
  limit:    Joi.number().integer().min(1).max(100).default(20),
  isActive: Joi.boolean(),
});

const createSchema = Joi.object({
  name:    Joi.string().max(100).required(),
  code:    Joi.string().max(20).uppercase().required(),
  address: Joi.string().allow(null, '').optional(),
  city:    Joi.string().max(100).required(),
  state:   Joi.string().max(100).required(),
  pincode: Joi.string().pattern(/^\d{6}$/).required(),
});

const updateSchema = Joi.object({
  name:     Joi.string().max(100),
  address:  Joi.string().allow(null, ''),
  city:     Joi.string().max(100),
  state:    Joi.string().max(100),
  pincode:  Joi.string().pattern(/^\d{6}$/),
  isActive: Joi.boolean(),
});

const inventorySchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      variationId:  Joi.number().integer().positive().required(),
      quantity:     Joi.number().integer().min(0).required(),
      reorderLevel: Joi.number().integer().min(0).default(0),
    })
  ).min(1).required(),
});

const list = asyncWrap(async (req, res) => {
  try {
    const { error, value } = listSchema.validate(req.query);
    if (error) throw new AppError(error.details[0].message, 422, 'VALIDATION_ERROR');
    const result = await warehouseService.list(value);
    res.json({ success: true, ...result });
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
});

const getById = asyncWrap(async (req, res) => {
  try {
    const wh = await warehouseService.getById(parseInt(req.params.id));
    res.json({ success: true, data: wh });
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
});

const create = asyncWrap(async (req, res) => {
  try {
    const { error, value } = createSchema.validate(req.body);
    if (error) throw new AppError(error.details[0].message, 422, 'VALIDATION_ERROR');
    const wh = await warehouseService.create(value);
    res.status(201).json({ success: true, data: wh });
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
});

const update = asyncWrap(async (req, res) => {
  try {
    const { error, value } = updateSchema.validate(req.body);
    if (error) throw new AppError(error.details[0].message, 422, 'VALIDATION_ERROR');
    const wh = await warehouseService.update(parseInt(req.params.id), value);
    res.json({ success: true, data: wh });
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
});

const remove = asyncWrap(async (req, res) => {
  try {
    await warehouseService.remove(parseInt(req.params.id));
    res.status(204).send();
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
});

const getInventory = asyncWrap(async (req, res) => {
  try {
    const inventory = await warehouseService.getInventory(parseInt(req.params.id));
    res.json({ success: true, data: inventory });
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
});

const upsertInventory = asyncWrap(async (req, res) => {
  try {
    const { error, value } = inventorySchema.validate(req.body);
    if (error) throw new AppError(error.details[0].message, 422, 'VALIDATION_ERROR');
    const inventory = await warehouseService.upsertInventory(parseInt(req.params.id), value.items);
    res.json({ success: true, data: inventory });
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
});

module.exports = { list, getById, create, update, remove, getInventory, upsertInventory };
