const Joi = require('joi');

const create = Joi.object({
  name:      Joi.string().trim().min(1).max(128).required(),
  parentId:  Joi.number().integer().positive().allow(null).default(null),
  sortOrder: Joi.number().integer().min(0).default(0),
});

const update = Joi.object({
  name:      Joi.string().trim().min(1).max(128),
  parentId:  Joi.number().integer().positive().allow(null),
  sortOrder: Joi.number().integer().min(0),
  isActive:  Joi.boolean(),
}).min(1);

const listQuery = Joi.object({
  page:           Joi.number().integer().min(1).default(1),
  limit:          Joi.number().integer().min(1).max(100).default(20),
  isActive:       Joi.boolean(),
  includeDeleted: Joi.boolean().default(false),
});

module.exports = { create, update, listQuery };
