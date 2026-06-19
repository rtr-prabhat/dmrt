const express    = require('express');
const router     = express.Router();
const authenticate = require('../middleware/authenticate');
const authorize    = require('../middleware/authorize');
const c            = require('../controllers/warehouse.controller');

router.get('/',                 authenticate, authorize('warehouse', 'read'),   c.list);
router.get('/:id',              authenticate, authorize('warehouse', 'read'),   c.getById);
router.post('/',                authenticate, authorize('warehouse', 'create'), c.create);
router.patch('/:id',            authenticate, authorize('warehouse', 'update'), c.update);
router.delete('/:id',           authenticate, authorize('warehouse', 'delete'), c.remove);
router.get('/:id/inventory',    authenticate, authorize('warehouse', 'read'),   c.getInventory);
router.put('/:id/inventory',    authenticate, authorize('warehouse', 'update'), c.upsertInventory);

module.exports = router;
