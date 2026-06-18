const { AppError } = require('../../utils/AppError');
const VariationRepository = require('./variations.repository');
const ProductRepository = require('../products/products.repository');

async function list(productId) {
  await assertProductExists(productId);
  return VariationRepository.findByProduct(productId);
}

async function getById(productId, id) {
  await assertProductExists(productId);
  const variation = await VariationRepository.findById(id, productId);
  if (!variation) throw new AppError('Variation not found', 404);
  return variation;
}

async function create(productId, { skuSuffix, attributes, priceDelta, isActive }) {
  await assertProductExists(productId);

  const duplicate = await VariationRepository.findBySuffix(productId, skuSuffix);
  if (duplicate) throw new AppError(`SKU suffix '${skuSuffix}' already exists for this product`, 409);

  const id = await VariationRepository.create({ productId, skuSuffix, attributes, priceDelta, isActive });
  return VariationRepository.findById(id, productId);
}

async function update(productId, id, payload) {
  await assertProductExists(productId);
  const variation = await VariationRepository.findById(id, productId);
  if (!variation) throw new AppError('Variation not found', 404);

  if (payload.skuSuffix && payload.skuSuffix !== variation.sku_suffix) {
    const duplicate = await VariationRepository.findBySuffix(productId, payload.skuSuffix);
    if (duplicate) throw new AppError(`SKU suffix '${payload.skuSuffix}' already exists`, 409);
  }

  const fields = {};
  if (payload.skuSuffix  !== undefined) fields.sku_suffix   = payload.skuSuffix;
  if (payload.attributes !== undefined) fields.attributes   = JSON.stringify(payload.attributes);
  if (payload.priceDelta !== undefined) fields.price_delta  = payload.priceDelta;
  if (payload.isActive   !== undefined) fields.is_active    = payload.isActive;

  await VariationRepository.update(id, fields);
  return VariationRepository.findById(id, productId);
}

async function remove(productId, id) {
  await assertProductExists(productId);
  const variation = await VariationRepository.findById(id, productId);
  if (!variation) throw new AppError('Variation not found', 404);
  await VariationRepository.softDelete(id);
}

async function assertProductExists(productId) {
  const product = await ProductRepository.findById(productId);
  if (!product) throw new AppError('Product not found', 404);
}

module.exports = { list, getById, create, update, remove };
