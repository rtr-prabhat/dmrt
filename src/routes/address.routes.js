import express from 'express';
const router = express.Router();

import authenticate from '../middleware/authenticate.js';
import { list, create, update, remove, setDefault } from '../controllers/address.controller.js';

router.get('/',           authenticate, list);
router.post('/',          authenticate, create);
router.patch('/:id',      authenticate, update);
router.delete('/:id',     authenticate, remove);
router.patch('/:id/default', authenticate, setDefault);

export default router;
