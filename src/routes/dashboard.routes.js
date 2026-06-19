const express    = require('express');
const router     = express.Router();
const authenticate = require('../middleware/authenticate');
const authorize    = require('../middleware/authorize');
const c            = require('../controllers/dashboard.controller');

router.get('/summary',          authenticate, authorize('dashboard', 'read'), c.getSummary);
router.get('/orders-by-status', authenticate, authorize('dashboard', 'read'), c.getOrdersByStatus);
router.get('/top-products',     authenticate, authorize('dashboard', 'read'), c.getTopProducts);
router.get('/low-stock',        authenticate, authorize('dashboard', 'read'), c.getLowStock);
router.get('/revenue',          authenticate, authorize('dashboard', 'read'), c.getRevenue);

module.exports = router;
