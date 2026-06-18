const Joi = require('joi');

const STATUS = ['draft', 'active', 'discontinued'];

const create = Joi.object({
  categoryId:  Joi.number().integer().positive().required(),
  name:        Joi.string().trim().min(1).max(255).required(),
  sku:         Joi.string().trim().uppercase().max(64).required(),
  description: Joi.string().trim().max(5000).allow('', null),
  basePrice:   Joi.number().precision(2).positive().required(),
  taxRate:     Joi.number().precision(2).min(0).max(100).default(18),
  status:      Joi.string().valid(...STATUS).default('draft'),
});

const update = Joi.object({
  categoryId:  Joi.number().integer().positive(),
  name:        Joi.string().trim().min(1).max(255),
  sku:         Joi.string().trim().uppercase().max(64),
  description: Joi.string().trim().max(5000).allow('', null),
  basePrice:   Joi.number().precision(2).positive(),
  taxRate:     Joi.number().precision(2).min(0).max(100),
  status:      Joi.string().valid(...STATUS),
}).min(1);

const listQuery = Joi.object({
  page:           Joi.number().integer().min(1).default(1),
  limit:          Joi.number().integer().min(1).max(100).default(20),
  categoryId:     Joi.number().integer().positive(),
  status:         Joi.string().valid(...STATUS),
  search:         Joi.string().trim().max(100).allow(''),
  includeDeleted: Joi.boolean().default(false),
});

module.exports = { create, update, listQuery };
