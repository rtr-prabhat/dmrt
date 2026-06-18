const router = require('express').Router();
const controller = require('./products.controller');
const validate = require('../../middleware/validate');
const authorize = require('../../middleware/authorize');
const schema = require('./products.schema');

// Variation sub-router is mounted here (nested resource pattern)
const variationRouter = require('../variations/variations.router');
router.use('/:productId/variations', variationRouter);

router.get('/',     authorize('product', 'read'),   validate(schema.listQuery, 'query'), controller.list);
router.get('/:id',  authorize('product', 'read'),                                        controller.getOne);
router.post('/',    authorize('product', 'create'),  validate(schema.create),             controller.create);
router.patch('/:id', authorize('product', 'update'), validate(schema.update),             controller.update);
router.delete('/:id', authorize('product', 'delete'),                                     controller.remove);

module.exports = router;
