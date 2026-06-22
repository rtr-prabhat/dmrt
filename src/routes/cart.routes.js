import express from 'express';
const router = express.Router();

import authenticate from '../middleware/authenticate.js';
import { getCart, addItem, updateItem, removeItem, clearCart } from '../controllers/cart.controller.js';

router.get('/',           authenticate, getCart);
router.post('/items',     authenticate, addItem);
router.patch('/items/:itemId', authenticate, updateItem);
router.delete('/items/:itemId', authenticate, removeItem);
router.delete('/',        authenticate, clearCart);

export default router;
