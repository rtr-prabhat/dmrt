const { Op } = require('sequelize');
const {
  Order, OrderItem, Cart, CartItem, ProductVariation, Product,
  Address, WarehouseInventory, sequelize,
} = require('../models');
const { AppError } = require('../utils/AppError');
const { paginate, paginateMeta } = require('../utils/paginate');

const getById = async (userId, id, checkOwnership = true) => {
  const where = { id };
  if (checkOwnership) where.userId = userId;

  const order = await Order.findOne({
    where,
    include: [
      { model: Address, as: 'deliveryAddress' },
      { model: OrderItem, as: 'items' },
    ],
  });

  if (!order) throw new AppError('Order not found', 404, 'NOT_FOUND');
  return order;
};

const create = async (userId, { addressId, notes }) => {
  const address = await Address.findOne({ where: { id: addressId, userId } });
  if (!address) throw new AppError('Address not found', 404, 'NOT_FOUND');

  const cart = await Cart.findOne({
    where: { userId },
    include: [{
      model: CartItem,
      as: 'items',
      include: [{
        model: ProductVariation,
        as: 'variation',
        include: [{ model: Product, as: 'product' }],
      }],
    }],
  });

  if (!cart || !cart.items.length) throw new AppError('Cart is empty', 400, 'BAD_REQUEST');

  // Validate + compute totals before opening transaction
  let subtotal = 0;
  let taxAmount = 0;
  const orderItemsData = [];

  for (const item of cart.items) {
    const { variation } = item;
    const product = variation?.product;
    if (!product || product.status !== 'active') {
      throw new AppError(`Product "${product?.name}" is no longer available`, 400, 'BAD_REQUEST');
    }

    const stock = await WarehouseInventory.sum('quantity', { where: { variationId: item.variationId } });
    if (!stock || stock < item.quantity) {
      throw new AppError(`Insufficient stock for "${product.name}"`, 400, 'OUT_OF_STOCK');
    }

    const unitPrice = parseFloat(item.priceAtAdd);
    const taxRate   = parseFloat(product.taxRate);
    const lineSubtotal = unitPrice * item.quantity;
    subtotal  += lineSubtotal;
    taxAmount += lineSubtotal * (taxRate / 100);

    orderItemsData.push({
      variationId: item.variationId,
      productName: product.name,
      sku:         `${product.sku}-${variation.skuSuffix}`,
      quantity:    item.quantity,
      unitPrice,
      taxRate,
    });
  }

  const total = subtotal + taxAmount;

  // Run DB writes in a transaction; capture the new order id
  const newOrderId = await sequelize.transaction(async (t) => {
    const order = await Order.create({
      userId,
      addressId,
      status:    'pending',
      subtotal:  parseFloat(subtotal.toFixed(2)),
      taxAmount: parseFloat(taxAmount.toFixed(2)),
      total:     parseFloat(total.toFixed(2)),
      notes:     notes || null,
    }, { transaction: t });

    await OrderItem.bulkCreate(
      orderItemsData.map(d => ({ ...d, orderId: order.id })),
      { transaction: t }
    );

    // Deduct from warehouse with lowest stock first
    for (const item of cart.items) {
      const inv = await WarehouseInventory.findOne({
        where: { variationId: item.variationId, quantity: { [Op.gte]: item.quantity } },
        order: [['quantity', 'ASC']],
        transaction: t,
      });
      if (inv) {
        await inv.update({ quantity: inv.quantity - item.quantity }, { transaction: t });
      }
    }

    await CartItem.destroy({ where: { cartId: cart.id }, transaction: t });

    return order.id;
  });

  // Fetch the committed order after transaction completes
  return getById(userId, newOrderId, false);
};

const list = async (userId, isAdmin, { page, limit, status }) => {
  const { offset } = paginate({ page, limit });
  const where = {};
  if (!isAdmin) where.userId = userId;
  if (status) where.status = status;

  const { rows, count } = await Order.findAndCountAll({
    where,
    include: [
      { model: Address, as: 'deliveryAddress' },
      { model: OrderItem, as: 'items' },
    ],
    order: [['createdAt', 'DESC']],
    limit,
    offset,
    distinct: true,
  });

  return { orders: rows, meta: paginateMeta(page, limit, count) };
};

const VALID_TRANSITIONS = {
  pending:    ['confirmed', 'cancelled'],
  confirmed:  ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped:    ['delivered'],
  delivered:  [],
  cancelled:  [],
};

const updateStatus = async (id, { status }) => {
  const order = await Order.findByPk(id);
  if (!order) throw new AppError('Order not found', 404, 'NOT_FOUND');

  const allowed = VALID_TRANSITIONS[order.status] || [];
  if (!allowed.includes(status)) {
    throw new AppError(`Cannot transition from "${order.status}" to "${status}"`, 400, 'BAD_REQUEST');
  }

  await order.update({ status });
  return getById(null, id, false);
};

const cancel = async (userId, id) => {
  const order = await Order.findOne({ where: { id, userId } });
  if (!order) throw new AppError('Order not found', 404, 'NOT_FOUND');
  if (!['pending', 'confirmed'].includes(order.status)) {
    throw new AppError('Order can only be cancelled when pending or confirmed', 400, 'BAD_REQUEST');
  }
  await order.update({ status: 'cancelled' });
  return getById(userId, id);
};

module.exports = { create, list, getById, updateStatus, cancel };
