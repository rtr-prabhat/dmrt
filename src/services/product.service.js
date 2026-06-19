const { Op } = require('sequelize');
const { Product, ProductVariation, Category } = require('../models');
const { AppError } = require('../utils/AppError');
const { paginate, paginateMeta } = require('../utils/paginate');
const slugify = require('../utils/slugify');

const list = async ({ page, limit, categoryId, productType, status, search, minPrice, maxPrice } = {}) => {
  const { offset } = paginate({ page, limit });
  const where = {};

  if (categoryId) where.categoryId = categoryId;
  if (productType) where.productType = productType;
  if (status) where.status = status;
  if (minPrice || maxPrice) {
    where.basePrice = {};
    if (minPrice) where.basePrice[Op.gte] = minPrice;
    if (maxPrice) where.basePrice[Op.lte] = maxPrice;
  }
  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { sku: { [Op.like]: `%${search}%` } },
    ];
  }

  const { count, rows } = await Product.findAndCountAll({
    where,
    include: [
      { model: Category, as: 'category', attributes: ['id', 'name'] },
      { model: ProductVariation, as: 'variations', attributes: ['id'], required: false },
    ],
    order: [['createdAt', 'DESC']],
    limit,
    offset,
    distinct: true,
  });

  return { data: rows, meta: paginateMeta(page, limit, count) };
};

const getById = async (id) => {
  const product = await Product.findByPk(id, {
    include: [
      { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
      { model: ProductVariation, as: 'variations', where: { isActive: true }, required: false },
    ],
  });
  if (!product) throw new AppError('Product not found', 404, 'NOT_FOUND');
  return product;
};

const _uniqueSlug = async (base, excludeId = null) => {
  let slug = base;
  let counter = 2;
  while (true) {
    const where = { slug };
    if (excludeId) where.id = { [Op.ne]: excludeId };
    const exists = await Product.findOne({ where, paranoid: false });
    if (!exists) return slug;
    slug = `${base}-${counter++}`;
  }
};

const create = async ({ categoryId, name, sku, description, basePrice, taxRate, status, productType, meta }) => {
  const category = await Category.findByPk(categoryId);
  if (!category) throw new AppError('Category not found', 404, 'NOT_FOUND');

  const skuExists = await Product.findOne({ where: { sku }, paranoid: false });
  if (skuExists) throw new AppError('SKU already exists', 409, 'CONFLICT');

  const slug = await _uniqueSlug(slugify(name));

  return Product.create({ categoryId, name, slug, sku, description, basePrice, taxRate, status, productType, meta });
};

const update = async (id, data) => {
  const product = await Product.findByPk(id);
  if (!product) throw new AppError('Product not found', 404, 'NOT_FOUND');

  const updates = { ...data };

  if (data.name && data.name !== product.name) {
    updates.slug = await _uniqueSlug(slugify(data.name), id);
  }

  if (data.sku && data.sku !== product.sku) {
    const skuExists = await Product.findOne({ where: { sku: data.sku, id: { [Op.ne]: id } }, paranoid: false });
    if (skuExists) throw new AppError('SKU already exists', 409, 'CONFLICT');
  }

  await product.update(updates);
  return product;
};

const remove = async (id) => {
  const product = await Product.findByPk(id);
  if (!product) throw new AppError('Product not found', 404, 'NOT_FOUND');
  await product.destroy();
};

module.exports = { list, getById, create, update, remove };
