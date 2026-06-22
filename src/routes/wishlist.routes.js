import express from 'express';
const router = express.Router();

import authenticate from '../middleware/authenticate.js';
import { get, addItem, removeItem, clear, moveToCart } from '../controllers/wishlist.controller.js';

router.get('/',              authenticate, get);
router.post('/items',        authenticate, addItem);
router.delete('/items/:productId', authenticate, removeItem);
router.delete('/',           authenticate, clear);
router.post('/items/:productId/move-to-cart', authenticate, moveToCart);

export default router;
