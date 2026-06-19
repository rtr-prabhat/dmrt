const { Cart, CartItem, ProductVariation, Product, WarehouseInventory } = require('../models');
const { AppError } = require('../utils/AppError');

const fetchCart = async (userId) => {
  const cart = await Cart.findOne({
    where: { userId },
    include: [{
      model: CartItem,
      as: 'items',
      include: [{
        model: ProductVariation,
        as: 'variation',
        include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'sku', 'taxRate', 'meta', 'status', 'productType'] }],
      }],
    }],
  });

  if (!cart) return { cartId: null, items: [], subtotal: 0, taxAmount: 0, total: 0, itemCount: 0 };

  let subtotal = 0;
  let taxAmount = 0;

  const items = cart.items.map(item => {
    const lineTotal = parseFloat(item.priceAtAdd) * item.quantity;
    const taxRate = item.variation.product ? parseFloat(item.variation.product.taxRate) : 0;
    subtotal += lineTotal;
    taxAmount += lineTotal * (taxRate / 100);
    return {
      itemId: item.id,
      variationId: item.variationId,
      productName: item.variation.product?.name,
      sku: `${item.variation.product?.sku}-${item.variation.skuSuffix}`,
      attributes: item.variation.attributes,
      quantity: item.quantity,
      unitPrice: parseFloat(item.priceAtAdd),
      lineTotal: parseFloat(lineTotal.toFixed(2)),
    };
  });

  return {
    cartId: cart.id,
    items,
    subtotal: parseFloat(subtotal.toFixed(2)),
    taxAmount: parseFloat(taxAmount.toFixed(2)),
    total: parseFloat((subtotal + taxAmount).toFixed(2)),
    itemCount: items.length,
  };
};

const getCart = async (userId) => fetchCart(userId);

const addItem = async (userId, { variationId, quantity }) => {
  const variation = await ProductVariation.findOne({
    where: { id: variationId, isActive: true },
    include: [{ model: Product, as: 'product' }],
  });
  if (!variation || !variation.product) throw new AppError('Product variation not found', 404, 'NOT_FOUND');
  if (variation.product.status !== 'active') throw new AppError('Product is not available', 400, 'BAD_REQUEST');

  const meta = variation.product.meta || {};
  if (meta.max_qty_per_order && quantity > meta.max_qty_per_order) {
    throw new AppError(`Maximum ${meta.max_qty_per_order} units allowed per order for this product`, 400, 'BAD_REQUEST');
  }

  const stock = await WarehouseInventory.sum('quantity', { where: { variationId } });
  if (!stock || stock < quantity) throw new AppError('Insufficient stock', 400, 'OUT_OF_STOCK');

  const [cart] = await Cart.findOrCreate({ where: { userId }, defaults: { userId } });

  const existing = await CartItem.findOne({ where: { cartId: cart.id, variationId } });
  const newQty = existing ? existing.quantity + quantity : quantity;

  if (meta.max_qty_per_order && newQty > meta.max_qty_per_order) {
    throw new AppError(`Maximum ${meta.max_qty_per_order} units allowed per order for this product`, 400, 'BAD_REQUEST');
  }

  const price = parseFloat(variation.product.basePrice) + parseFloat(variation.priceDelta);

  if (existing) {
    await existing.update({ quantity: newQty, priceAtAdd: price });
  } else {
    await CartItem.create({ cartId: cart.id, variationId, quantity, priceAtAdd: price });
  }

  return fetchCart(userId);
};

const updateItem = async (userId, itemId, { quantity }) => {
  const cart = await Cart.findOne({ where: { userId } });
  if (!cart) throw new AppError('Cart not found', 404, 'NOT_FOUND');

  const item = await CartItem.findOne({
    where: { id: itemId, cartId: cart.id },
    include: [{ model: ProductVariation, as: 'variation', include: [{ model: Product, as: 'product' }] }],
  });
  if (!item) throw new AppError('Cart item not found', 404, 'NOT_FOUND');

  const meta = item.variation.product?.meta || {};
  if (meta.max_qty_per_order && quantity > meta.max_qty_per_order) {
    throw new AppError(`Maximum ${meta.max_qty_per_order} units allowed`, 400, 'BAD_REQUEST');
  }

  const stock = await WarehouseInventory.sum('quantity', { where: { variationId: item.variationId } });
  if (!stock || stock < quantity) throw new AppError('Insufficient stock', 400, 'OUT_OF_STOCK');

  await item.update({ quantity });
  return fetchCart(userId);
};

const removeItem = async (userId, itemId) => {
  const cart = await Cart.findOne({ where: { userId } });
  if (!cart) throw new AppError('Cart not found', 404, 'NOT_FOUND');
  const item = await CartItem.findOne({ where: { id: itemId, cartId: cart.id } });
  if (!item) throw new AppError('Cart item not found', 404, 'NOT_FOUND');
  await item.destroy();
  return fetchCart(userId);
};

const clearCart = async (userId) => {
  const cart = await Cart.findOne({ where: { userId } });
  if (cart) await CartItem.destroy({ where: { cartId: cart.id } });
};

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };
