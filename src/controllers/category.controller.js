const Joi = require('joi');
const asyncWrap = require('../utils/asyncWrap');
const { AppError } = require('../utils/AppError');
const categoryService = require('../services/category.service');

const listQuerySchema = Joi.object({
  page:     Joi.number().integer().min(1).default(1),
  limit:    Joi.number().integer().min(1).max(100).default(20),
  isActive: Joi.boolean(),
});

const createSchema = Joi.object({
  name:      Joi.string().min(2).max(100).required(),
  parentId:  Joi.number().integer().positive().allow(null).default(null),
  sortOrder: Joi.number().integer().min(0).default(0),
});

const updateSchema = Joi.object({
  name:      Joi.string().min(2).max(100),
  parentId:  Joi.number().integer().positive().allow(null),
  sortOrder: Joi.number().integer().min(0),
  isActive:  Joi.boolean(),
});

const list = asyncWrap(async (req, res) => {
  try {
    const { error, value } = listQuerySchema.validate(req.query, { abortEarly: false, convert: true });
    if (error) throw new AppError(error.details[0].message, 422, 'VALIDATION_ERROR');

    const result = await categoryService.list(value);
    res.json({ success: true, ...result });
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
});

const tree = asyncWrap(async (_req, res) => {
  try {
    const data = await categoryService.tree();
    res.json({ success: true, data });
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
});

const getById = asyncWrap(async (req, res) => {
  try {
    const data = await categoryService.getById(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
});

const getDescendants = asyncWrap(async (req, res) => {
  try {
    const data = await categoryService.getDescendants(req.params.id);
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

    const data = await categoryService.create(value);
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

    const data = await categoryService.update(req.params.id, value);
    res.json({ success: true, data });
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
});

const remove = asyncWrap(async (req, res) => {
  try {
    await categoryService.remove(req.params.id);
    res.json({ success: true, data: null });
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
});

module.exports = { list, tree, getById, getDescendants, create, update, remove };
