const { AppError } = require('../../utils/AppError');
const slugify = require('../../utils/slugify');
const CategoryRepository = require('./categories.repository');

async function list({ page, limit, offset, isActive }) {
  return CategoryRepository.findAll({ limit, offset, isActive });
}

async function tree() {
  return CategoryRepository.findTree();
}

async function getById(id) {
  const category = await CategoryRepository.findById(id);
  if (!category) throw new AppError('Category not found', 404);
  const breadcrumb = await CategoryRepository.findBreadcrumb(id);
  return { ...category, breadcrumb };
}

async function descendants(id) {
  const category = await CategoryRepository.findById(id);
  if (!category) throw new AppError('Category not found', 404);
  return CategoryRepository.findDescendants(id);
}

async function create({ name, parentId, sortOrder }) {
  let depth = 0;
  if (parentId) {
    const parent = await CategoryRepository.findById(parentId);
    if (!parent) throw new AppError('Parent category not found', 404);
    depth = parent.depth + 1;
  }

  const baseSlug = parentId
    ? `${(await CategoryRepository.findById(parentId)).slug}-${slugify(name)}`
    : slugify(name);

  const newId = await CategoryRepository.create({ name, slug: baseSlug, parentId, sortOrder, depth });
  return CategoryRepository.findById(newId);
}

async function update(id, { name, parentId, sortOrder, isActive }) {
  const category = await CategoryRepository.findById(id);
  if (!category) throw new AppError('Category not found', 404);

  const fields = {};
  if (name      !== undefined) { fields.name = name; fields.slug = slugify(name); }
  if (sortOrder !== undefined) fields.sort_order = sortOrder;
  if (isActive  !== undefined) fields.is_active = isActive;

  await CategoryRepository.update(id, fields);
  return CategoryRepository.findById(id);
}

async function remove(id) {
  const category = await CategoryRepository.findById(id);
  if (!category) throw new AppError('Category not found', 404);

  const childExists = await CategoryRepository.hasChildren(id);
  if (childExists) throw new AppError('Cannot delete a category that has subcategories', 409);

  await CategoryRepository.softDelete(id);
}

module.exports = { list, tree, getById, descendants, create, update, remove };
