import express from 'express';
const router = express.Router();

import { register, login, refresh, logout, logoutAll } from '../controllers/auth.controller.js';

router.post('/register', register);
router.post('/login',    login);
router.post('/refresh',  refresh);
router.post('/logout',   logout);
router.post('/logout-all', logoutAll);

export default router;
