const Joi = require('joi');

const register = Joi.object({
  fullName: Joi.string().trim().min(2).max(128).required(),
  email:    Joi.string().email().lowercase().max(254).required(),
  password: Joi.string().min(8).max(128).required()
    .pattern(/[A-Z]/, 'uppercase letter')
    .pattern(/[0-9]/, 'digit')
    .messages({
      'string.pattern.name': '{{#label}} must contain at least one {{#name}}',
    }),
});

const login = Joi.object({
  email:    Joi.string().email().lowercase().required(),
  password: Joi.string().required(),
});

const refresh = Joi.object({
  refreshToken: Joi.string().required(),
});

module.exports = { register, login, refresh };
