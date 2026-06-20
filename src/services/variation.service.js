const { ProductVariation, Product } = require('../models');
const { AppError } = require('../utils/AppError');

const list = async (productId) => {
  try {
    return ProductVariation.findAll({
      where: { productId },
      include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'sku'] }],
      order: [['createdAt', 'ASC']],
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to list variations', 500);
  }
};

const getById = async (productId, id) => {
  try {
    const variation = await ProductVariation.findOne({
      where: { id, productId },
      include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'sku'] }],
    });
    if (!variation) throw new AppError('Variation not found', 404, 'NOT_FOUND');
    return variation;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to fetch variation', 500);
  }
};

const create = async (productId, { skuSuffix, attributes, priceDelta = 0, isActive = true }) => {
  try {
    const product = await Product.findByPk(productId);
    if (!product) throw new AppError('Product not found', 404, 'NOT_FOUND');

    const existing = await ProductVariation.findOne({ where: { productId, skuSuffix }, paranoid: false });
    if (existing) throw new AppError('SKU suffix already used for this product', 409, 'CONFLICT');

    return ProductVariation.create({ productId, skuSuffix, attributes, priceDelta, isActive });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to create variation', 500);
  }
};

const update = async (productId, id, data) => {
  try {
    const variation = await ProductVariation.findOne({ where: { id, productId } });
    if (!variation) throw new AppError('Variation not found', 404, 'NOT_FOUND');

    if (data.attributes && typeof data.attributes === 'string') {
      data.attributes = JSON.parse(data.attributes);
    }

    await variation.update(data);
    return variation;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to update variation', 500);
  }
};

const remove = async (productId, id) => {
  try {
    const variation = await ProductVariation.findOne({ where: { id, productId } });
    if (!variation) throw new AppError('Variation not found', 404, 'NOT_FOUND');
    await variation.destroy();
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to delete variation', 500);
  }
};

module.exports = { list, getById, create, update, remove };
