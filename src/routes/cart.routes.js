const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const c = require('../controllers/cart.controller');

router.get('/', authenticate, c.getCart);
router.post('/items', authenticate, c.addItem);
router.put('/items/:itemId', authenticate, c.updateItem);
router.delete('/items/:itemId', authenticate, c.removeItem);
router.delete('/', authenticate, c.clearCart);

module.exports = router;
