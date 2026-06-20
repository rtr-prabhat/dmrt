const Joi = require('joi');
const asyncWrap = require('../utils/asyncWrap');
const { AppError } = require('../utils/AppError');
const dashboardService = require('../services/dashboard.service');

const getSummary = asyncWrap(async (_req, res) => {
  try {
    const data = await dashboardService.getSummary();
    res.json({ success: true, data });
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
});

const getOrdersByStatus = asyncWrap(async (_req, res) => {
  try {
    const data = await dashboardService.getOrdersByStatus();
    res.json({ success: true, data });
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
});

const getTopProducts = asyncWrap(async (req, res) => {
  try {
    const schema = Joi.object({
      period: Joi.string().valid('7d', '30d', '90d').default('30d'),
    });
    const { error, value } = schema.validate(req.query);
    if (error) throw new AppError(error.details[0].message, 422, 'VALIDATION_ERROR');
    const data = await dashboardService.getTopProducts(value.period);
    res.json({ success: true, data });
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
});

const getLowStock = asyncWrap(async (_req, res) => {
  try {
    const data = await dashboardService.getLowStock();
    res.json({ success: true, data });
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
});

const getRevenue = asyncWrap(async (_req, res) => {
  try {
    const data = await dashboardService.getRevenue();
    res.json({ success: true, data });
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
});

module.exports = { getSummary, getOrdersByStatus, getTopProducts, getLowStock, getRevenue };
