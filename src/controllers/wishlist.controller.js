import Joi from 'joi';
import * as wishlistService from '../services/wishlist.service.js';
import { AppError } from '../utils/AppError.js';
import asyncWrap from '../utils/asyncWrap.js';

const addItemSchema = Joi.object({
  productId: Joi.number().integer().positive().required(),
});

const moveToCartSchema = Joi.object({
  variationId: Joi.number().integer().positive().required(),
  quantity: Joi.number().integer().min(1).max(99).required(),
});

const get = asyncWrap(async (req, res) => {
  try {
    const data = await wishlistService.get(req.user.id);
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
    const data = await wishlistService.addItem(req.user.id, value.productId);
    res.status(201).json({ success: true, data });
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
});

const removeItem = asyncWrap(async (req, res) => {
  try {
    const data = await wishlistService.removeItem(req.user.id, req.params.productId);
    res.json({ success: true, data });
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
});

const clear = asyncWrap(async (req, res) => {
  try {
    await wishlistService.clear(req.user.id);
    res.json({ success: true, data: { message: 'Wishlist cleared' } });
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
});

const moveToCart = asyncWrap(async (req, res) => {
  try {
    const { error, value } = moveToCartSchema.validate(req.body);
    if (error) throw new AppError(error.details[0].message, 422, 'VALIDATION_ERROR');
    const data = await wishlistService.moveToCart(req.user.id, req.params.productId, value);
    res.json({ success: true, data });
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
});

export { get, addItem, removeItem, clear, moveToCart };
