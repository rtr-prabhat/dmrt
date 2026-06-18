const Joi = require('joi');

const create = Joi.object({
  name:     Joi.string().trim().min(2).max(128).required(),
  code:     Joi.string().trim().uppercase().max(32).required(),
  address:  Joi.string().trim().max(500).allow('', null),
  city:     Joi.string().trim().max(64).allow('', null),
  state:    Joi.string().trim().max(64).allow('', null),
  pincode:  Joi.string().trim().length(6).pattern(/^\d{6}$/).allow('', null)
    .messages({ 'string.pattern.base': 'Pincode must be a 6-digit number' }),
});

const update = Joi.object({
  name:     Joi.string().trim().min(2).max(128),
  code:     Joi.string().trim().uppercase().max(32),
  address:  Joi.string().trim().max(500).allow('', null),
  city:     Joi.string().trim().max(64).allow('', null),
  state:    Joi.string().trim().max(64).allow('', null),
  pincode:  Joi.string().trim().length(6).pattern(/^\d{6}$/).allow('', null),
  isActive: Joi.boolean(),
}).min(1);

const inventoryUpsert = Joi.object({
  items: Joi.array().items(
    Joi.object({
      variationId:  Joi.number().integer().positive().required(),
      quantity:     Joi.number().integer().min(0).required(),
      reorderLevel: Joi.number().integer().min(0).default(10),
    })
  ).min(1).required(),
});

const listQuery = Joi.object({
  page:     Joi.number().integer().min(1).default(1),
  limit:    Joi.number().integer().min(1).max(100).default(20),
  isActive: Joi.boolean(),
});

module.exports = { create, update, inventoryUpsert, listQuery };
