const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const { register, login, refresh, logout, logoutAll } = require('../controllers/auth.controller');

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', authenticate, logout);
router.post('/logout-all', authenticate, logoutAll);

module.exports = router;
