const { Wishlist, WishlistItem, Product } = require('../models');
const { AppError } = require('../utils/AppError');
const cartService = require('./cart.service');

const getOrCreate = async (userId) => {
  const [wishlist] = await Wishlist.findOrCreate({ where: { userId }, defaults: { userId } });
  return wishlist;
};

const get = async (userId) => {
  const wishlist = await getOrCreate(userId);
  return Wishlist.findByPk(wishlist.id, {
    include: [{
      model: WishlistItem,
      as: 'items',
      include: [{
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'slug', 'basePrice', 'taxRate', 'status', 'productType', 'meta'],
      }],
    }],
  });
};

const addItem = async (userId, productId) => {
  const product = await Product.findByPk(productId);
  if (!product) throw new AppError('Product not found', 404, 'NOT_FOUND');
  const wishlist = await getOrCreate(userId);
  const [, created] = await WishlistItem.findOrCreate({ where: { wishlistId: wishlist.id, productId } });
  if (!created) throw new AppError('Product already in wishlist', 409, 'CONFLICT');
  return get(userId);
};

const removeItem = async (userId, productId) => {
  const wishlist = await getOrCreate(userId);
  const item = await WishlistItem.findOne({ where: { wishlistId: wishlist.id, productId } });
  if (!item) throw new AppError('Item not found in wishlist', 404, 'NOT_FOUND');
  await item.destroy();
  return get(userId);
};

const clear = async (userId) => {
  const wishlist = await getOrCreate(userId);
  await WishlistItem.destroy({ where: { wishlistId: wishlist.id } });
};

const moveToCart = async (userId, productId, { variationId, quantity }) => {
  const { sequelize } = require('../models');
  await sequelize.transaction(async (t) => {
    const wishlist = await Wishlist.findOne({ where: { userId } });
    if (wishlist) {
      await WishlistItem.destroy({ where: { wishlistId: wishlist.id, productId }, transaction: t });
    }
  });
  return cartService.addItem(userId, { variationId, quantity });
};

module.exports = { get, addItem, removeItem, clear, moveToCart };
