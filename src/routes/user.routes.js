const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const c = require('../controllers/user.controller');

router.get('/me', authenticate, c.getMe);
router.patch('/me', authenticate, c.updateMe);
router.patch('/me/password', authenticate, c.changePassword);

router.get('/', authenticate, authorize('user', 'read'), c.list);
router.get('/:id', authenticate, authorize('user', 'read'), c.getById);
router.post('/', authenticate, authorize('user', 'create'), c.create);
router.patch('/:id', authenticate, authorize('user', 'update'), c.update);
router.delete('/:id', authenticate, authorize('user', 'delete'), c.remove);
router.put('/:id/roles', authenticate, authorize('user', 'update'), c.setRoles);

module.exports = router;
