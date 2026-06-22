import { Op } from 'sequelize';
import { Category, sequelize } from '../models/index.js';
import { AppError } from '../utils/AppError.js';
import { paginate, paginateMeta } from '../utils/paginate.js';
import slugify from '../utils/slugify.js';

const list = async ({ page, limit, isActive } = {}) => {
  try {
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
  } catch (error) {
    console.log('Error in category.list:', error.message || error);
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to list categories', 500);
  }
};

const tree = async () => {
  try {
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
  } catch (error) {
    console.log('Error in category.tree:', error.message || error);
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to build category tree', 500);
  }
};

const getById = async (id) => {
  try {
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
  } catch (error) {
    console.log('Error in category.getById:', error.message || error);
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to fetch category', 500);
  }
};

const getDescendants = async (id) => {
  try {
    const category = await Category.findByPk(id);
    if (!category) throw new AppError('Category not found', 404, 'NOT_FOUND');

    return sequelize.query(
      `SELECT c.* FROM categories c
       JOIN category_closure cc ON c.id = cc.descendant_id
       WHERE cc.ancestor_id = ? AND cc.depth > 0 AND c.deleted_at IS NULL
       ORDER BY cc.depth, c.sort_order`,
      { replacements: [id], type: sequelize.QueryTypes.SELECT },
    );
  } catch (error) {
    console.log('Error in category.getDescendants:', error.message || error);
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to fetch category descendants', 500);
  }
};

const create = async ({ name, slug: customSlug, parentId = null, sortOrder = 0, image = null }) => {
  let depth = 0;
  if (parentId) {
    const parent = await Category.findByPk(parentId);
    if (!parent) throw new AppError('Parent category not found', 404, 'NOT_FOUND');
    depth = parent.depth + 1;
  }

  const slug = customSlug || slugify(name);
  
  const t = await sequelize.transaction();
  try {
    const category = await Category.create({ name, slug, parentId, sortOrder, depth, image }, { transaction: t });

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
    console.log('Error in category.create:',  err);
    if (err instanceof AppError) throw err;
    throw new AppError('Failed to create category', 500);
  }
};

const update = async (id, { name, sortOrder, isActive, image }) => {
  try {
    const category = await Category.findByPk(id);
    if (!category) throw new AppError('Category not found', 404, 'NOT_FOUND');

    const updates = {};
    if (name !== undefined) {
      updates.name = name;
      updates.slug = slugify(name);
    }
    if (sortOrder !== undefined) updates.sortOrder = sortOrder;
    if (isActive !== undefined) updates.isActive = isActive;
    if (image !== undefined) updates.image = image || null;

    await category.update(updates);
    return category;
  } catch (error) {
    console.log('Error in category.update:', error.message || error);
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to update category', 500);
  }
};

const remove = async (id) => {
  try {
    const category = await Category.findByPk(id);
    if (!category) throw new AppError('Category not found', 404, 'NOT_FOUND');

    const [children] = await sequelize.query(
      `SELECT COUNT(*) AS cnt FROM categories WHERE parent_id = ? AND deleted_at IS NULL`,
      { replacements: [id], type: sequelize.QueryTypes.SELECT },
    );
    if (children.cnt > 0) throw new AppError('Cannot delete category with active children', 400, 'HAS_CHILDREN');

    await category.destroy();
  } catch (error) {
    console.log('Error in category.remove:', error.message || error);
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to delete category', 500);
  }
};

export { list, tree, getById, getDescendants, create, update, remove };
