const Joi = require('joi');
const cartService = require('../services/cart.service');
const { AppError } = require('../utils/AppError');
const asyncWrap = require('../utils/asyncWrap');

const addItemSchema = Joi.object({
  variationId: Joi.number().integer().positive().required(),
  quantity: Joi.number().integer().min(1).max(99).required(),
});

const updateItemSchema = Joi.object({
  quantity: Joi.number().integer().min(1).max(99).required(),
});

const getCart = asyncWrap(async (req, res) => {
  const data = await cartService.getCart(req.user.id);
  res.json({ success: true, data });
});

const addItem = asyncWrap(async (req, res) => {
  const { error, value } = addItemSchema.validate(req.body);
  if (error) throw new AppError(error.details[0].message, 422, 'VALIDATION_ERROR');
  const data = await cartService.addItem(req.user.id, value);
  res.status(200).json({ success: true, data });
});

const updateItem = asyncWrap(async (req, res) => {
  const { error, value } = updateItemSchema.validate(req.body);
  if (error) throw new AppError(error.details[0].message, 422, 'VALIDATION_ERROR');
  const data = await cartService.updateItem(req.user.id, req.params.itemId, value);
  res.json({ success: true, data });
});

const removeItem = asyncWrap(async (req, res) => {
  const data = await cartService.removeItem(req.user.id, req.params.itemId);
  res.json({ success: true, data });
});

const clearCart = asyncWrap(async (req, res) => {
  await cartService.clearCart(req.user.id);
  res.json({ success: true, data: { message: 'Cart cleared' } });
});

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };
