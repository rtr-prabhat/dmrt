import express from 'express';
const router = express.Router();

import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';
import { getSummary, getOrdersByStatus, getTopProducts, getLowStock, getRevenue } from '../controllers/dashboard.controller.js';

router.get('/summary',          authenticate, authorize('dashboard', 'read'), getSummary);
router.get('/orders-by-status', authenticate, authorize('dashboard', 'read'), getOrdersByStatus);
router.get('/top-products',     authenticate, authorize('dashboard', 'read'), getTopProducts);
router.get('/low-stock',        authenticate, authorize('dashboard', 'read'), getLowStock);
router.get('/revenue',          authenticate, authorize('dashboard', 'read'), getRevenue);

export default router;
