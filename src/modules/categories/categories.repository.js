const db = require('../../config/db');

async function findAll({ limit, offset, isActive }) {
  const params = [];
  let where = 'WHERE deleted_at IS NULL';
  if (isActive !== undefined) { where += ' AND is_active = ?'; params.push(isActive); }

  const [[{ total }]] = await db.execute(
    `SELECT COUNT(*) AS total FROM categories ${where}`, params
  );
  const [rows] = await db.execute(
    `SELECT id, parent_id, name, slug, depth, sort_order, is_active, created_at
     FROM categories ${where}
     ORDER BY depth, sort_order, name
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  return { total, rows };
}

async function findTree() {
  const [rows] = await db.execute(
    `SELECT id, parent_id, name, slug, depth, sort_order, is_active
     FROM categories WHERE deleted_at IS NULL ORDER BY depth, sort_order, name`
  );
  return buildTree(rows);
}

function buildTree(rows, parentId = null) {
  return rows
    .filter((r) => r.parent_id == parentId)
    .map((r) => ({ ...r, children: buildTree(rows, r.id) }));
}

async function findById(id) {
  const [rows] = await db.execute(
    `SELECT id, parent_id, name, slug, depth, sort_order, is_active
     FROM categories WHERE id = ? AND deleted_at IS NULL`,
    [id]
  );
  return rows[0] ?? null;
}

async function findBreadcrumb(id) {
  const [rows] = await db.execute(
    `SELECT c.id, c.name, c.slug, cc.depth
     FROM category_closure cc
     JOIN categories c ON c.id = cc.ancestor_id
     WHERE cc.descendant_id = ? AND c.deleted_at IS NULL
     ORDER BY cc.depth DESC`,
    [id]
  );
  return rows;
}

async function findDescendants(id) {
  const [rows] = await db.execute(
    `SELECT c.id, c.name, c.slug, c.depth, cc.depth AS relative_depth
     FROM category_closure cc
     JOIN categories c ON c.id = cc.descendant_id
     WHERE cc.ancestor_id = ? AND cc.depth > 0 AND c.deleted_at IS NULL
     ORDER BY c.depth, c.sort_order`,
    [id]
  );
  return rows;
}

async function hasChildren(id) {
  const [[{ cnt }]] = await db.execute(
    `SELECT COUNT(*) AS cnt FROM categories WHERE parent_id = ? AND deleted_at IS NULL`,
    [id]
  );
  return cnt > 0;
}

async function create({ name, slug, parentId, sortOrder, depth }) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.execute(
      `INSERT INTO categories (parent_id, name, slug, depth, sort_order)
       VALUES (?, ?, ?, ?, ?)`,
      [parentId, name, slug, depth, sortOrder]
    );
    const newId = result.insertId;

    // Populate closure table
    if (parentId) {
      await conn.execute(
        `INSERT INTO category_closure (ancestor_id, descendant_id, depth)
         SELECT ancestor_id, ?, depth + 1
         FROM category_closure WHERE descendant_id = ?`,
        [newId, parentId]
      );
    }
    // Self-reference (depth=0)
    await conn.execute(
      `INSERT INTO category_closure (ancestor_id, descendant_id, depth) VALUES (?, ?, 0)`,
      [newId, newId]
    );

    await conn.commit();
    return newId;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function update(id, fields) {
  const allowed = ['name', 'slug', 'sort_order', 'is_active'];
  const sets = Object.keys(fields).filter((k) => allowed.includes(k)).map((k) => `${k} = ?`);
  if (!sets.length) return;
  await db.execute(
    `UPDATE categories SET ${sets.join(', ')} WHERE id = ?`,
    [...Object.values(fields), id]
  );
}

async function softDelete(id) {
  await db.execute(
    `UPDATE categories SET deleted_at = NOW() WHERE id = ?`, [id]
  );
}

module.exports = {
  findAll, findTree, findById, findBreadcrumb,
  findDescendants, hasChildren, create, update, softDelete,
};
