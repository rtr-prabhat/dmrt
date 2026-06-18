const db = require('../../config/db');

async function findAll({ limit, offset, categoryId, status, search }) {
  const params = [];
  let where = 'WHERE p.deleted_at IS NULL';
  if (categoryId) { where += ' AND p.category_id = ?'; params.push(categoryId); }
  if (status)     { where += ' AND p.status = ?';      params.push(status); }
  if (search) {
    where += ' AND (p.name LIKE ? OR p.sku LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  const [[{ total }]] = await db.execute(
    `SELECT COUNT(*) AS total FROM products p ${where}`, params
  );
  const [rows] = await db.execute(
    `SELECT p.id, p.name, p.sku, p.slug, p.base_price, p.tax_rate,
            p.status, p.created_at, c.name AS category_name
     FROM products p
     JOIN categories c ON c.id = p.category_id
     ${where} ORDER BY p.created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  return { total, rows };
}

async function findById(id) {
  const [rows] = await db.execute(
    `SELECT p.*, c.name AS category_name
     FROM products p JOIN categories c ON c.id = p.category_id
     WHERE p.id = ? AND p.deleted_at IS NULL`,
    [id]
  );
  return rows[0] ?? null;
}

async function findBySku(sku) {
  const [rows] = await db.execute(
    `SELECT id FROM products WHERE sku = ? AND deleted_at IS NULL LIMIT 1`, [sku]
  );
  return rows[0] ?? null;
}

async function create({ categoryId, name, slug, sku, description, basePrice, taxRate, status, createdBy }) {
  const [result] = await db.execute(
    `INSERT INTO products (category_id, name, slug, sku, description, base_price, tax_rate, status, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [categoryId, name, slug, sku, description ?? null, basePrice, taxRate, status, createdBy]
  );
  return result.insertId;
}

async function update(id, fields) {
  const allowed = ['category_id', 'name', 'slug', 'sku', 'description', 'base_price', 'tax_rate', 'status'];
  const sets = Object.keys(fields).filter((k) => allowed.includes(k)).map((k) => `${k} = ?`);
  if (!sets.length) return;
  await db.execute(
    `UPDATE products SET ${sets.join(', ')} WHERE id = ?`,
    [...Object.values(fields), id]
  );
}

async function softDelete(id) {
  await db.execute(`UPDATE products SET deleted_at = NOW() WHERE id = ?`, [id]);
}

module.exports = { findAll, findById, findBySku, create, update, softDelete };
