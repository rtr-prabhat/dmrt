import express from 'express';
const router = express.Router();

import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';
import { list, getById, create, update, remove, getInventory, upsertInventory } from '../controllers/warehouse.controller.js';

router.get('/',                        list);
router.get('/:id',                     getById);
router.post('/',                       authenticate, authorize('warehouse', 'create'), create);
router.patch('/:id',                    authenticate, authorize('warehouse', 'update'), update);
router.delete('/:id',                   authenticate, authorize('warehouse', 'delete'), remove);

router.get('/:id/inventory',           getInventory);
router.put('/:id/inventory',           authenticate, authorize('warehouse', 'update'), upsertInventory);

export default router;
