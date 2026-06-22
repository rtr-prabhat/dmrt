import express from 'express';
const router = express.Router();

import authenticate from '../middleware/authenticate.js';
import { create, list, getById, updateStatus, cancel } from '../controllers/order.controller.js';

router.post('/',      authenticate, create);
router.get('/',       authenticate, list);
router.get('/:id',    authenticate, getById);
router.patch('/:id/cancel', authenticate, cancel);
router.patch('/:id/status', authenticate, updateStatus);

export default router;
