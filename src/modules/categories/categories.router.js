const router = require('express').Router();
const controller = require('./categories.controller');
const validate = require('../../middleware/validate');
const authorize = require('../../middleware/authorize');
const schema = require('./categories.schema');

router.get('/tree',              authorize('category', 'read'),                                           controller.tree);
router.get('/',                  authorize('category', 'read'),   validate(schema.listQuery, 'query'),    controller.list);
router.get('/:id',               authorize('category', 'read'),                                           controller.getOne);
router.get('/:id/descendants',   authorize('category', 'read'),                                           controller.getDescendants);
router.post('/',                 authorize('category', 'create'), validate(schema.create),                controller.create);
router.patch('/:id',             authorize('category', 'update'), validate(schema.update),                controller.update);
router.delete('/:id',            authorize('category', 'delete'),                                         controller.remove);

module.exports = router;
