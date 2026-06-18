const router = require('express').Router();
const controller = require('./auth.controller');
const validate = require('../../middleware/validate');
const authenticate = require('../../middleware/authenticate');
const schema = require('./auth.schema');

router.post('/register',    validate(schema.register),  controller.register);
router.post('/login',       validate(schema.login),      controller.login);
router.post('/refresh',     validate(schema.refresh),    controller.refresh);
router.post('/logout',      authenticate,                controller.logout);
router.post('/logout-all',  authenticate,                controller.logoutAll);

module.exports = router;
