const { Wishlist, WishlistItem, Product } = require('../models');
const { AppError } = require('../utils/AppError');
const cartService = require('./cart.service');

const getOrCreate = async (userId) => {
  try {
    const [wishlist] = await Wishlist.findOrCreate({ where: { userId }, defaults: { userId } });
    return wishlist;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to get or create wishlist', 500);
  }
};

const get = async (userId) => {
  try {
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
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to fetch wishlist', 500);
  }
};

const addItem = async (userId, productId) => {
  try {
    const product = await Product.findByPk(productId);
    if (!product) throw new AppError('Product not found', 404, 'NOT_FOUND');
    const wishlist = await getOrCreate(userId);
    const [, created] = await WishlistItem.findOrCreate({ where: { wishlistId: wishlist.id, productId } });
    if (!created) throw new AppError('Product already in wishlist', 409, 'CONFLICT');
    return get(userId);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to add item to wishlist', 500);
  }
};

const removeItem = async (userId, productId) => {
  try {
    const wishlist = await getOrCreate(userId);
    const item = await WishlistItem.findOne({ where: { wishlistId: wishlist.id, productId } });
    if (!item) throw new AppError('Item not found in wishlist', 404, 'NOT_FOUND');
    await item.destroy();
    return get(userId);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to remove wishlist item', 500);
  }
};

const clear = async (userId) => {
  try {
    const wishlist = await getOrCreate(userId);
    await WishlistItem.destroy({ where: { wishlistId: wishlist.id } });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to clear wishlist', 500);
  }
};

const moveToCart = async (userId, productId, { variationId, quantity }) => {
  try {
    const { sequelize } = require('../models');
    await sequelize.transaction(async (t) => {
      const wishlist = await Wishlist.findOne({ where: { userId } });
      if (wishlist) {
        await WishlistItem.destroy({ where: { wishlistId: wishlist.id, productId }, transaction: t });
      }
    });
    return cartService.addItem(userId, { variationId, quantity });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to move wishlist item to cart', 500);
  }
};

module.exports = { get, addItem, removeItem, clear, moveToCart };
