const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const c = require('../controllers/address.controller');

router.get('/', authenticate, c.list);
router.post('/', authenticate, c.create);
router.patch('/:id', authenticate, c.update);
router.delete('/:id', authenticate, c.remove);
router.put('/:id/default', authenticate, c.setDefault);

module.exports = router;
