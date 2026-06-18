const Joi = require('joi');

const create = Joi.object({
  skuSuffix:   Joi.string().trim().uppercase().max(32).required(),
  attributes:  Joi.object().min(1).required()
    .pattern(Joi.string(), Joi.alternatives().try(Joi.string(), Joi.number())),
  priceDelta:  Joi.number().precision(2).default(0),
  isActive:    Joi.boolean().default(true),
});

const update = Joi.object({
  skuSuffix:   Joi.string().trim().uppercase().max(32),
  attributes:  Joi.object().min(1)
    .pattern(Joi.string(), Joi.alternatives().try(Joi.string(), Joi.number())),
  priceDelta:  Joi.number().precision(2),
  isActive:    Joi.boolean(),
}).min(1);

module.exports = { create, update };
