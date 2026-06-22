import Joi from 'joi';
import * as cartService from '../services/cart.service.js';
import { AppError } from '../utils/AppError.js';
import asyncWrap from '../utils/asyncWrap.js';

const addItemSchema = Joi.object({
  variationId: Joi.number().integer().positive().required(),
  quantity: Joi.number().integer().min(1).max(99).required(),
});

const updateItemSchema = Joi.object({
  quantity: Joi.number().integer().min(1).max(99).required(),
});

const getCart = asyncWrap(async (req, res) => {
  try {
    const data = await cartService.getCart(req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
});

const addItem = asyncWrap(async (req, res) => {
  try {
    const { error, value } = addItemSchema.validate(req.body);
    if (error) throw new AppError(error.details[0].message, 422, 'VALIDATION_ERROR');
    const data = await cartService.addItem(req.user.id, value);
    res.status(200).json({ success: true, data });
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
});

const updateItem = asyncWrap(async (req, res) => {
  try {
    const { error, value } = updateItemSchema.validate(req.body);
    if (error) throw new AppError(error.details[0].message, 422, 'VALIDATION_ERROR');
    const data = await cartService.updateItem(req.user.id, req.params.itemId, value);
    res.json({ success: true, data });
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
});

const removeItem = asyncWrap(async (req, res) => {
  try {
    const data = await cartService.removeItem(req.user.id, req.params.itemId);
    res.json({ success: true, data });
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
});

const clearCart = asyncWrap(async (req, res) => {
  try {
    await cartService.clearCart(req.user.id);
    res.json({ success: true, data: { message: 'Cart cleared' } });
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
});

export { getCart, addItem, updateItem, removeItem, clearCart };
