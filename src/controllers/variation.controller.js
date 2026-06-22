import Joi from 'joi';
import asyncWrap from '../utils/asyncWrap.js';
import { AppError } from '../utils/AppError.js';
import * as variationService from '../services/variation.service.js';

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
  try {
    const data = await variationService.list(req.params.productId);
    res.json({ success: true, data });
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
});

const getById = asyncWrap(async (req, res) => {
  try {
    const data = await variationService.getById(req.params.productId, req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
});

const create = asyncWrap(async (req, res) => {
  try {
    const { error, value } = createSchema.validate(req.body, { abortEarly: false });
    if (error) throw new AppError(error.details[0].message, 422, 'VALIDATION_ERROR');

    const data = await variationService.create(req.params.productId, value);
    res.status(201).json({ success: true, data });
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
});

const update = asyncWrap(async (req, res) => {
  try {
    const { error, value } = updateSchema.validate(req.body, { abortEarly: false });
    if (error) throw new AppError(error.details[0].message, 422, 'VALIDATION_ERROR');

    const data = await variationService.update(req.params.productId, req.params.id, value);
    res.json({ success: true, data });
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
});

const remove = asyncWrap(async (req, res) => {
  try {
    await variationService.remove(req.params.productId, req.params.id);
    res.json({ success: true, data: null });
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
});

export { list, getById, create, update, remove };
