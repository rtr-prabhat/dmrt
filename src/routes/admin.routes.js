import express from 'express';
const router = express.Router();

import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';
import { listUsers, getUserById, createUser, updateUser, deleteUser, setRoles, listOrders, getOrderById, updateOrderStatus } from '../controllers/admin.controller.js';

router.get('/users',                authenticate, authorize('user', 'read'), listUsers);
router.get('/users/:id',            authenticate, authorize('user', 'read'), getUserById);
router.post('/users',               authenticate, authorize('user', 'create'), createUser);
router.patch('/users/:id',          authenticate, authorize('user', 'update'), updateUser);
router.delete('/users/:id',         authenticate, authorize('user', 'delete'), deleteUser);
router.post('/users/:id/roles',     authenticate, authorize('user', 'update'), setRoles);

router.get('/orders',               authenticate, authorize('order', 'read'), listOrders);
router.get('/orders/:id',           authenticate, authorize('order', 'read'), getOrderById);
router.patch('/orders/:id/status',  authenticate, authorize('order', 'update'), updateOrderStatus);

export default router;
