import express from 'express';
const router = express.Router();

import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';
import upload from '../middleware/upload.js';
import { list, tree, getById, getDescendants, create, update, remove } from '../controllers/category.controller.js';

router.get('/', list);
router.get('/tree', tree);
router.get('/:id', getById);
router.get('/:id/descendants', getDescendants);

router.post('/',    authenticate, authorize('category', 'create'), upload.single('image'), create);
router.patch('/:id', authenticate, authorize('category', 'update'), upload.single('image'), update);
router.delete('/:id', authenticate, authorize('category', 'delete'), remove);

export default router;
