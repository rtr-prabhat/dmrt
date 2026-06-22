import express from 'express';
const router = express.Router();

import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';
import { list as productList, getById as productGetById, create as productCreate, update as productUpdate, remove as productRemove } from '../controllers/product.controller.js';
import { list as variationList, getById as variationGetById, create as variationCreate, update as variationUpdate, remove as variationRemove } from '../controllers/variation.controller.js';

router.get('/',           productList);
router.get('/:id',        productGetById);
router.post('/',          authenticate, authorize('product', 'create'), productCreate);
router.patch('/:id',      authenticate, authorize('product', 'update'), productUpdate);
router.delete('/:id',     authenticate, authorize('product', 'delete'), productRemove);

// ── Variations ───────────────────────────────────────────────
router.get('/:productId/variations',             variationList);
router.get('/:productId/variations/:id',         variationGetById);
router.post('/:productId/variations',            authenticate, authorize('product_variation', 'create'), variationCreate);
router.patch('/:productId/variations/:id',       authenticate, authorize('product_variation', 'update'), variationUpdate);
router.delete('/:productId/variations/:id',      authenticate, authorize('product_variation', 'delete'), variationRemove);

export default router;
