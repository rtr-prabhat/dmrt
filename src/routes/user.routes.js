import express from 'express';
const router = express.Router();

import authenticate from '../middleware/authenticate.js';
import { getMe, updateMe, changePassword } from '../controllers/user.controller.js';

router.get('/me',     authenticate, getMe);
router.patch('/me',   authenticate, updateMe);
router.patch('/password', authenticate, changePassword);

export default router;
