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
  const { error, value } = listQuerySchema.validate(req.query, { abortEarly: false, convert: true });
  if (error) throw new AppError(error.details[0].message, 422, 'VALIDATION_ERROR');

  const result = await categoryService.list(value);
  res.json({ success: true, ...result });
});

const tree = asyncWrap(async (_req, res) => {
  const data = await categoryService.tree();
  res.json({ success: true, data });
});

const getById = asyncWrap(async (req, res) => {
  const data = await categoryService.getById(req.params.id);
  res.json({ success: true, data });
});

const getDescendants = asyncWrap(async (req, res) => {
  const data = await categoryService.getDescendants(req.params.id);
  res.json({ success: true, data });
});

const create = asyncWrap(async (req, res) => {
  const { error, value } = createSchema.validate(req.body, { abortEarly: false });
  if (error) throw new AppError(error.details[0].message, 422, 'VALIDATION_ERROR');

  const data = await categoryService.create(value);
  res.status(201).json({ success: true, data });
});

const update = asyncWrap(async (req, res) => {
  const { error, value } = updateSchema.validate(req.body, { abortEarly: false });
  if (error) throw new AppError(error.details[0].message, 422, 'VALIDATION_ERROR');

  const data = await categoryService.update(req.params.id, value);
  res.json({ success: true, data });
});

const remove = asyncWrap(async (req, res) => {
  await categoryService.remove(req.params.id);
  res.json({ success: true, data: null });
});

module.exports = { list, tree, getById, getDescendants, create, update, remove };
