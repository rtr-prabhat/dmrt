const express = require('express');
const router  = express.Router();

const authRouter      = require('./auth.routes');
const userRouter      = require('./user.routes');
const addressRouter   = require('./address.routes');
const categoryRouter  = require('./category.routes');
const productRouter   = require('./product.routes');
const cartRouter      = require('./cart.routes');
const wishlistRouter  = require('./wishlist.routes');
const orderRouter     = require('./order.routes');
const warehouseRouter = require('./warehouse.routes');
const adminRouter     = require('./admin.routes');

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

module.exports = router;
