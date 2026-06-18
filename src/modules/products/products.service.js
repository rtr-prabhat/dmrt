const { AppError } = require('../../utils/AppError');
const slugify = require('../../utils/slugify');
const ProductRepository = require('./products.repository');
const CategoryRepository = require('../categories/categories.repository');
const VariationRepository = require('../variations/variations.repository');

async function list(query) {
  const { page, limit, offset } = require('../../utils/paginate').paginate(query);
  return ProductRepository.findAll({ limit, offset, ...query });
}

async function getById(id) {
  const product = await ProductRepository.findById(id);
  if (!product) throw new AppError('Product not found', 404);
  const variations = await VariationRepository.findByProduct(id);
  return { ...product, variations };
}

async function create({ categoryId, name, sku, description, basePrice, taxRate, status }, createdBy) {
  const category = await CategoryRepository.findById(categoryId);
  if (!category) throw new AppError('Category not found', 404);

  const duplicate = await ProductRepository.findBySku(sku);
  if (duplicate) throw new AppError(`SKU '${sku}' is already in use`, 409);

  const slug = slugify(name);
  const productId = await ProductRepository.create({
    categoryId, name, slug, sku, description, basePrice, taxRate, status, createdBy,
  });
  return ProductRepository.findById(productId);
}

async function update(id, payload) {
  const product = await ProductRepository.findById(id);
  if (!product) throw new AppError('Product not found', 404);

  if (payload.sku && payload.sku !== product.sku) {
    const duplicate = await ProductRepository.findBySku(payload.sku);
    if (duplicate) throw new AppError(`SKU '${payload.sku}' is already in use`, 409);
  }

  const fields = {};
  if (payload.categoryId  !== undefined) fields.category_id = payload.categoryId;
  if (payload.name        !== undefined) { fields.name = payload.name; fields.slug = slugify(payload.name); }
  if (payload.sku         !== undefined) fields.sku = payload.sku;
  if (payload.description !== undefined) fields.description = payload.description;
  if (payload.basePrice   !== undefined) fields.base_price = payload.basePrice;
  if (payload.taxRate     !== undefined) fields.tax_rate = payload.taxRate;
  if (payload.status      !== undefined) fields.status = payload.status;

  await ProductRepository.update(id, fields);
  return ProductRepository.findById(id);
}

async function remove(id) {
  const product = await ProductRepository.findById(id);
  if (!product) throw new AppError('Product not found', 404);
  await ProductRepository.softDelete(id);
}

module.exports = { list, getById, create, update, remove };
