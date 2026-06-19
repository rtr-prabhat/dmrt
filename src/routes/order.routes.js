const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const c = require('../controllers/order.controller');

router.post('/', authenticate, authorize('order', 'create'), c.create);
router.get('/', authenticate, c.list);
router.get('/:id', authenticate, c.getById);
router.patch('/:id/status', authenticate, authorize('order', 'update'), c.updateStatus);
router.post('/:id/cancel', authenticate, c.cancel);

module.exports = router;
