const { Op } = require('sequelize');
const { Category, sequelize } = require('../models');
const { AppError } = require('../utils/AppError');
const { paginate, paginateMeta } = require('../utils/paginate');
const slugify = require('../utils/slugify');

const list = async ({ page, limit, isActive } = {}) => {
  const { offset } = paginate({ page, limit });
  const where = {};
  if (isActive !== undefined) where.isActive = isActive;

  const { count, rows } = await Category.findAndCountAll({
    where,
    include: [{ model: Category, as: 'parent', attributes: ['id', 'name'], required: false }],
    order: [['sortOrder', 'ASC'], ['name', 'ASC']],
    limit,
    offset,
  });

  return { data: rows, meta: paginateMeta(page, limit, count) };
};

const tree = async () => {
  const categories = await Category.findAll({
    where: { isActive: true },
    order: [['sortOrder', 'ASC'], ['name', 'ASC']],
    raw: true,
  });

  const map = {};
  categories.forEach((c) => { map[c.id] = { ...c, children: [] }; });

  const roots = [];
  categories.forEach((c) => {
    if (c.parent_id && map[c.parent_id]) {
      map[c.parent_id].children.push(map[c.id]);
    } else {
      roots.push(map[c.id]);
    }
  });

  return roots;
};

const getById = async (id) => {
  const category = await Category.findByPk(id, {
    include: [{ model: Category, as: 'parent', attributes: ['id', 'name'], required: false }],
  });
  if (!category) throw new AppError('Category not found', 404, 'NOT_FOUND');

  const breadcrumb = await sequelize.query(
    `SELECT c.id, c.name, c.slug, cc.depth
     FROM categories c
     JOIN category_closure cc ON c.id = cc.ancestor_id
     WHERE cc.descendant_id = ? AND c.deleted_at IS NULL
     ORDER BY cc.depth DESC`,
    { replacements: [id], type: sequelize.QueryTypes.SELECT },
  );

  return { ...category.toJSON(), breadcrumb };
};

const getDescendants = async (id) => {
  const category = await Category.findByPk(id);
  if (!category) throw new AppError('Category not found', 404, 'NOT_FOUND');

  return sequelize.query(
    `SELECT c.* FROM categories c
     JOIN category_closure cc ON c.id = cc.descendant_id
     WHERE cc.ancestor_id = ? AND cc.depth > 0 AND c.deleted_at IS NULL
     ORDER BY cc.depth, c.sort_order`,
    { replacements: [id], type: sequelize.QueryTypes.SELECT },
  );
};

const create = async ({ name, parentId = null, sortOrder = 0 }) => {
  let depth = 0;
  if (parentId) {
    const parent = await Category.findByPk(parentId);
    if (!parent) throw new AppError('Parent category not found', 404, 'NOT_FOUND');
    depth = parent.depth + 1;
  }

  const slug = slugify(name);

  const t = await sequelize.transaction();
  try {
    const category = await Category.create({ name, slug, parentId, sortOrder, depth }, { transaction: t });

    if (parentId) {
      await sequelize.query(
        `INSERT INTO category_closure (ancestor_id, descendant_id, depth)
         SELECT ancestor_id, ?, depth + 1 FROM category_closure WHERE descendant_id = ?
         UNION ALL SELECT ?, ?, 0`,
        { replacements: [category.id, parentId, category.id, category.id], transaction: t },
      );
    } else {
      await sequelize.query(
        `INSERT INTO category_closure (ancestor_id, descendant_id, depth) VALUES (?, ?, 0)`,
        { replacements: [category.id, category.id], transaction: t },
      );
    }

    await t.commit();
    return category;
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

const update = async (id, { name, sortOrder, isActive }) => {
  const category = await Category.findByPk(id);
  if (!category) throw new AppError('Category not found', 404, 'NOT_FOUND');

  const updates = {};
  if (name !== undefined) {
    updates.name = name;
    updates.slug = slugify(name);
  }
  if (sortOrder !== undefined) updates.sortOrder = sortOrder;
  if (isActive !== undefined) updates.isActive = isActive;

  await category.update(updates);
  return category;
};

const remove = async (id) => {
  const category = await Category.findByPk(id);
  if (!category) throw new AppError('Category not found', 404, 'NOT_FOUND');

  const [children] = await sequelize.query(
    `SELECT COUNT(*) AS cnt FROM categories WHERE parent_id = ? AND deleted_at IS NULL`,
    { replacements: [id], type: sequelize.QueryTypes.SELECT },
  );
  if (children.cnt > 0) throw new AppError('Cannot delete category with active children', 400, 'HAS_CHILDREN');

  await category.destroy();
};

module.exports = { list, tree, getById, getDescendants, create, update, remove };
