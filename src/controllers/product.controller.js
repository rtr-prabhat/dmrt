import Joi from 'joi';
import asyncWrap from '../utils/asyncWrap.js';
import { AppError } from '../utils/AppError.js';
import * as productService from '../services/product.service.js';

const PRODUCT_TYPES = ['electronics', 'food', 'clothing', 'washing', 'medicine', 'chemical', 'other'];
const STATUSES = ['draft', 'active', 'discontinued'];

const listQuerySchema = Joi.object({
  page:        Joi.number().integer().min(1).default(1),
  limit:       Joi.number().integer().min(1).max(100).default(20),
  categoryId:  Joi.number().integer().positive(),
  productType: Joi.string().valid(...PRODUCT_TYPES),
  status:      Joi.string().valid(...STATUSES),
  search:      Joi.string().allow('').max(200),
  minPrice:    Joi.number().positive(),
  maxPrice:    Joi.number().positive(),
});

const createSchema = Joi.object({
  categoryId:  Joi.number().integer().positive().required(),
  name:        Joi.string().min(2).max(255).required(),
  sku:         Joi.string().max(100).required(),
  description: Joi.string().allow(null, ''),
  basePrice:   Joi.number().positive().required(),
  taxRate:     Joi.number().min(0).max(100).default(18),
  status:      Joi.string().valid(...STATUSES).default('draft'),
  productType: Joi.string().valid(...PRODUCT_TYPES).default('other'),
  meta:        Joi.object().allow(null),
});

const updateSchema = Joi.object({
  categoryId:  Joi.number().integer().positive(),
  name:        Joi.string().min(2).max(255),
  sku:         Joi.string().max(100),
  description: Joi.string().allow(null, ''),
  basePrice:   Joi.number().positive(),
  taxRate:     Joi.number().min(0).max(100),
  status:      Joi.string().valid(...STATUSES),
  productType: Joi.string().valid(...PRODUCT_TYPES),
  meta:        Joi.object().allow(null),
});

const list = asyncWrap(async (req, res) => {
  try {
    const { error, value } = listQuerySchema.validate(req.query, { abortEarly: false, convert: true });
    if (error) throw new AppError(error.details[0].message, 422, 'VALIDATION_ERROR');

    const result = await productService.list(value);
    res.json({ success: true, ...result });
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
});

const getById = asyncWrap(async (req, res) => {
  try {
    const data = await productService.getById(req.params.id);
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

    const data = await productService.create(value);
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

    const data = await productService.update(req.params.id, value);
    res.json({ success: true, data });
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
});

const remove = asyncWrap(async (req, res) => {
  try {
    await productService.remove(req.params.id);
    res.json({ success: true, data: null });
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
});

export { list, getById, create, update, remove };
