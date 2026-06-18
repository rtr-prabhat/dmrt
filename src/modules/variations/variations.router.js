// Mounted at /api/v1/products/:productId/variations
// mergeParams: true exposes :productId from the parent router
const router = require('express').Router({ mergeParams: true });
const controller = require('./variations.controller');
const validate = require('../../middleware/validate');
const authorize = require('../../middleware/authorize');
const schema = require('./variations.schema');

router.get('/',      authorize('product_variation', 'read'),                                 controller.list);
router.get('/:id',   authorize('product_variation', 'read'),                                 controller.getOne);
router.post('/',     authorize('product_variation', 'create'), validate(schema.create),      controller.create);
router.patch('/:id', authorize('product_variation', 'update'), validate(schema.update),      controller.update);
router.delete('/:id', authorize('product_variation', 'delete'),                              controller.remove);

module.exports = router;
