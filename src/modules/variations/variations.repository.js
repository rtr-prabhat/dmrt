const db = require('../../config/db');

async function findByProduct(productId) {
  const [rows] = await db.execute(
    `SELECT id, sku_suffix, attributes, price_delta, is_active, created_at
     FROM product_variations
     WHERE product_id = ? AND deleted_at IS NULL
     ORDER BY created_at`,
    [productId]
  );
  return rows;
}

async function findById(id, productId) {
  const [rows] = await db.execute(
    `SELECT id, product_id, sku_suffix, attributes, price_delta, is_active, created_at
     FROM product_variations
     WHERE id = ? AND product_id = ? AND deleted_at IS NULL`,
    [id, productId]
  );
  return rows[0] ?? null;
}

async function findBySuffix(productId, skuSuffix) {
  const [rows] = await db.execute(
    `SELECT id FROM product_variations
     WHERE product_id = ? AND sku_suffix = ? AND deleted_at IS NULL LIMIT 1`,
    [productId, skuSuffix]
  );
  return rows[0] ?? null;
}

async function create({ productId, skuSuffix, attributes, priceDelta, isActive }) {
  const [result] = await db.execute(
    `INSERT INTO product_variations (product_id, sku_suffix, attributes, price_delta, is_active)
     VALUES (?, ?, ?, ?, ?)`,
    [productId, skuSuffix, JSON.stringify(attributes), priceDelta, isActive]
  );
  return result.insertId;
}

async function update(id, fields) {
  const allowed = ['sku_suffix', 'attributes', 'price_delta', 'is_active'];
  const sets = Object.keys(fields).filter((k) => allowed.includes(k)).map((k) => `${k} = ?`);
  if (!sets.length) return;
  await db.execute(
    `UPDATE product_variations SET ${sets.join(', ')} WHERE id = ?`,
    [...Object.values(fields), id]
  );
}

async function softDelete(id) {
  await db.execute(
    `UPDATE product_variations SET deleted_at = NOW() WHERE id = ?`, [id]
  );
}

module.exports = { findByProduct, findById, findBySuffix, create, update, softDelete };
