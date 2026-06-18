const Joi = require('joi');

const ROLES = ['admin', 'sub_admin', 'user'];

const create = Joi.object({
  fullName: Joi.string().trim().min(2).max(128).required(),
  email:    Joi.string().email().lowercase().max(254).required(),
  password: Joi.string().min(8).max(128).required()
    .pattern(/[A-Z]/, 'uppercase letter')
    .pattern(/[0-9]/, 'digit'),
  roles:    Joi.array().items(Joi.string().valid(...ROLES)).min(1).required(),
});

const update = Joi.object({
  fullName: Joi.string().trim().min(2).max(128),
  isActive: Joi.boolean(),
}).min(1);

const setRoles = Joi.object({
  roles: Joi.array().items(Joi.string().valid(...ROLES)).min(1).required(),
});

const listQuery = Joi.object({
  page:   Joi.number().integer().min(1).default(1),
  limit:  Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().trim().max(100).allow(''),
});

module.exports = { create, update, setRoles, listQuery };
