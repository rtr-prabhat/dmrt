import express from 'express';
const router  = express.Router();

import authRouter      from './auth.routes.js';
import userRouter      from './user.routes.js';
import addressRouter   from './address.routes.js';
import categoryRouter  from './category.routes.js';
import productRouter   from './product.routes.js';
import cartRouter      from './cart.routes.js';
import wishlistRouter  from './wishlist.routes.js';
import orderRouter     from './order.routes.js';
import warehouseRouter from './warehouse.routes.js';
import adminRouter     from './admin.routes.js';

router.use('/auth',       authRouter);
router.use('/users',      userRouter);
router.use('/addresses',  addressRouter);
router.use('/categories', categoryRouter);
router.use('/products',   productRouter);
router.use('/cart',       cartRouter);
router.use('/wishlist',   wishlistRouter);
router.use('/orders',     orderRouter);
router.use('/warehouses', warehouseRouter);

router.use('/admin',      adminRouter);

export default router;
