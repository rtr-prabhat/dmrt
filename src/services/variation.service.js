const { ProductVariation, Product } = require('../models');
const { AppError } = require('../utils/AppError');

const list = async (productId) => {
  return ProductVariation.findAll({
    where: { productId },
    include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'sku'] }],
    order: [['createdAt', 'ASC']],
  });
};

const getById = async (productId, id) => {
  const variation = await ProductVariation.findOne({
    where: { id, productId },
    include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'sku'] }],
  });
  if (!variation) throw new AppError('Variation not found', 404, 'NOT_FOUND');
  return variation;
};

const create = async (productId, { skuSuffix, attributes, priceDelta = 0, isActive = true }) => {
  const product = await Product.findByPk(productId);
  if (!product) throw new AppError('Product not found', 404, 'NOT_FOUND');

  const existing = await ProductVariation.findOne({ where: { productId, skuSuffix }, paranoid: false });
  if (existing) throw new AppError('SKU suffix already used for this product', 409, 'CONFLICT');

  return ProductVariation.create({ productId, skuSuffix, attributes, priceDelta, isActive });
};

const update = async (productId, id, data) => {
  const variation = await ProductVariation.findOne({ where: { id, productId } });
  if (!variation) throw new AppError('Variation not found', 404, 'NOT_FOUND');

  if (data.attributes && typeof data.attributes === 'string') {
    data.attributes = JSON.parse(data.attributes);
  }

  await variation.update(data);
  return variation;
};

const remove = async (productId, id) => {
  const variation = await ProductVariation.findOne({ where: { id, productId } });
  if (!variation) throw new AppError('Variation not found', 404, 'NOT_FOUND');
  await variation.destroy();
};

module.exports = { list, getById, create, update, remove };
