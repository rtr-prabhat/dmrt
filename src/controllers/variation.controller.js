const Joi = require('joi');
const asyncWrap = require('../utils/asyncWrap');
const { AppError } = require('../utils/AppError');
const variationService = require('../services/variation.service');

const createSchema = Joi.object({
  skuSuffix:  Joi.string().max(50).required(),
  attributes: Joi.object().min(1).required(),
  priceDelta: Joi.number().default(0),
  isActive:   Joi.boolean().default(true),
});

const updateSchema = Joi.object({
  skuSuffix:  Joi.string().max(50),
  attributes: Joi.object().min(1),
  priceDelta: Joi.number(),
  isActive:   Joi.boolean(),
});

const list = asyncWrap(async (req, res) => {
  const data = await variationService.list(req.params.productId);
  res.json({ success: true, data });
});

const getById = asyncWrap(async (req, res) => {
  const data = await variationService.getById(req.params.productId, req.params.id);
  res.json({ success: true, data });
});

const create = asyncWrap(async (req, res) => {
  const { error, value } = createSchema.validate(req.body, { abortEarly: false });
  if (error) throw new AppError(error.details[0].message, 422, 'VALIDATION_ERROR');

  const data = await variationService.create(req.params.productId, value);
  res.status(201).json({ success: true, data });
});

const update = asyncWrap(async (req, res) => {
  const { error, value } = updateSchema.validate(req.body, { abortEarly: false });
  if (error) throw new AppError(error.details[0].message, 422, 'VALIDATION_ERROR');

  const data = await variationService.update(req.params.productId, req.params.id, value);
  res.json({ success: true, data });
});

const remove = asyncWrap(async (req, res) => {
  await variationService.remove(req.params.productId, req.params.id);
  res.json({ success: true, data: null });
});

module.exports = { list, getById, create, update, remove };
