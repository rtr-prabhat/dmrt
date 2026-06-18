const router = require('express').Router();
const controller = require('./dashboard.controller');
const authorize = require('../../middleware/authorize');

router.get('/summary', authorize('dashboard', 'read'), controller.summary);

module.exports = router;
