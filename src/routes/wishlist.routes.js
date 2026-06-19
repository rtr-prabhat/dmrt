const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const c = require('../controllers/wishlist.controller');

router.get('/', authenticate, c.get);
router.post('/items', authenticate, c.addItem);
router.delete('/items/:productId', authenticate, c.removeItem);
router.delete('/', authenticate, c.clear);
router.post('/items/:productId/move-to-cart', authenticate, c.moveToCart);

module.exports = router;
