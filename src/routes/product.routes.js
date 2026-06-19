const express = require('express');
const router = express.Router({ mergeParams: true });
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const productCtrl = require('../controllers/product.controller');
const variationCtrl = require('../controllers/variation.controller');

// Products
router.get('/', productCtrl.list);
router.get('/:id([0-9]+)', productCtrl.getById);
router.post('/', authenticate, authorize('product', 'create'), productCtrl.create);
router.patch('/:id([0-9]+)', authenticate, authorize('product', 'update'), productCtrl.update);
router.delete('/:id([0-9]+)', authenticate, authorize('product', 'delete'), productCtrl.remove);

// Variations nested under product
router.get('/:productId/variations', variationCtrl.list);
router.get('/:productId/variations/:id', variationCtrl.getById);
router.post('/:productId/variations', authenticate, authorize('product_variation', 'create'), variationCtrl.create);
router.patch('/:productId/variations/:id', authenticate, authorize('product_variation', 'update'), variationCtrl.update);
router.delete('/:productId/variations/:id', authenticate, authorize('product_variation', 'delete'), variationCtrl.remove);

module.exports = router;
