const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const c = require('../controllers/category.controller');

router.get('/', c.list);
router.get('/tree', c.tree);
router.get('/:id', c.getById);
router.get('/:id/descendants', c.getDescendants);

router.post('/', authenticate, authorize('category', 'create'), c.create);
router.patch('/:id', authenticate, authorize('category', 'update'), c.update);
router.delete('/:id', authenticate, authorize('category', 'delete'), c.remove);

module.exports = router;
