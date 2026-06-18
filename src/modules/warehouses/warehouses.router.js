const router = require('express').Router();
const controller = require('./warehouses.controller');
const validate = require('../../middleware/validate');
const authorize = require('../../middleware/authorize');
const schema = require('./warehouses.schema');

router.get('/',     authorize('warehouse', 'read'),   validate(schema.listQuery, 'query'),   controller.list);
router.get('/:id',  authorize('warehouse', 'read'),                                           controller.getOne);
router.post('/',    authorize('warehouse', 'create'),  validate(schema.create),               controller.create);
router.patch('/:id', authorize('warehouse', 'update'), validate(schema.update),               controller.update);
router.delete('/:id', authorize('warehouse', 'delete'),                                       controller.remove);

router.get('/:id/inventory',
  authorize('warehouse', 'read'),
  controller.getInventory
);
router.put('/:id/inventory',
  authorize('warehouse', 'update'),
  validate(schema.inventoryUpsert),
  controller.upsertInventory
);

module.exports = router;
