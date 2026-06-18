const router = require('express').Router();
const controller = require('./users.controller');
const validate = require('../../middleware/validate');
const authorize = require('../../middleware/authorize');
const schema = require('./users.schema');

router.get('/',     authorize('user', 'read'),   validate(schema.listQuery, 'query'), controller.list);
router.get('/:id',  authorize('user', 'read'),   controller.getOne);
router.post('/',    authorize('user', 'create'),  validate(schema.create),             controller.create);
router.patch('/:id', authorize('user', 'update'), validate(schema.update),             controller.update);
router.delete('/:id', authorize('user', 'delete'),                                     controller.remove);
router.put('/:id/roles', authorize('user', 'update'), validate(schema.setRoles),       controller.setRoles);

module.exports = router;
