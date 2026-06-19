const express    = require('express');
const router     = express.Router();
const authenticate    = require('../middleware/authenticate');
const authorize       = require('../middleware/authorize');
const c               = require('../controllers/admin.controller');
const warehouseCtrl   = require('../controllers/warehouse.controller');
const dashboardCtrl   = require('../controllers/dashboard.controller');

// ── User management ───────────────────────────────────────────────────
router.get('/users',         authenticate, authorize('user', 'read'),   c.listUsers);
router.get('/users/:id',     authenticate, authorize('user', 'read'),   c.getUserById);
router.post('/users',        authenticate, authorize('user', 'create'), c.createUser);
router.patch('/users/:id',   authenticate, authorize('user', 'update'), c.updateUser);
router.delete('/users/:id',  authenticate, authorize('user', 'delete'), c.deleteUser);
router.put('/users/:id/roles', authenticate, authorize('user', 'update'), c.setRoles);

// ── Order management ──────────────────────────────────────────────────
router.get('/orders',            authenticate, authorize('order', 'read'),   c.listOrders);
router.get('/orders/:id',        authenticate, authorize('order', 'read'),   c.getOrderById);
router.patch('/orders/:id/status', authenticate, authorize('order', 'update'), c.updateOrderStatus);

// ── Warehouse management ──────────────────────────────────────────────
router.get('/warehouses',                  authenticate, authorize('warehouse', 'read'),   warehouseCtrl.list);
router.post('/warehouses',                 authenticate, authorize('warehouse', 'create'), warehouseCtrl.create);
router.patch('/warehouses/:id',            authenticate, authorize('warehouse', 'update'), warehouseCtrl.update);
router.get('/warehouses/:id/inventory',    authenticate, authorize('warehouse', 'read'),   warehouseCtrl.getInventory);
router.put('/warehouses/:id/inventory',    authenticate, authorize('warehouse', 'update'), warehouseCtrl.upsertInventory);

// ── Dashboard ─────────────────────────────────────────────────────────
router.get('/dashboard/summary',         authenticate, authorize('dashboard', 'read'), dashboardCtrl.getSummary);
router.get('/dashboard/orders-by-status', authenticate, authorize('dashboard', 'read'), dashboardCtrl.getOrdersByStatus);
router.get('/dashboard/top-products',    authenticate, authorize('dashboard', 'read'), dashboardCtrl.getTopProducts);
router.get('/dashboard/low-stock',       authenticate, authorize('dashboard', 'read'), dashboardCtrl.getLowStock);
router.get('/dashboard/revenue',         authenticate, authorize('dashboard', 'read'), dashboardCtrl.getRevenue);

module.exports = router;
