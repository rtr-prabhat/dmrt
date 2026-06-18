const db = require('../../config/db');

async function findAll({ limit, offset, isActive }) {
  const params = [];
  let where = 'WHERE deleted_at IS NULL';
  if (isActive !== undefined) { where += ' AND is_active = ?'; params.push(isActive); }

  const [[{ total }]] = await db.execute(
    `SELECT COUNT(*) AS total FROM warehouses ${where}`, params
  );
  const [rows] = await db.execute(
    `SELECT id, name, code, city, state, pincode, is_active, created_at
     FROM warehouses ${where} ORDER BY name LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  return { total, rows };
}

async function findById(id) {
  const [rows] = await db.execute(
    `SELECT id, name, code, address, city, state, pincode, is_active, created_at
     FROM warehouses WHERE id = ? AND deleted_at IS NULL`,
    [id]
  );
  return rows[0] ?? null;
}

async function findByCode(code) {
  const [rows] = await db.execute(
    `SELECT id FROM warehouses WHERE code = ? AND deleted_at IS NULL LIMIT 1`, [code]
  );
  return rows[0] ?? null;
}

async function findInventory(warehouseId) {
  const [rows] = await db.execute(
    `SELECT wi.variation_id, wi.quantity, wi.reorder_level,
            pv.sku_suffix, pv.attributes, p.name AS product_name, p.sku AS product_sku
     FROM warehouse_inventory wi
     JOIN product_variations pv ON pv.id = wi.variation_id
     JOIN products p             ON p.id  = pv.product_id
     WHERE wi.warehouse_id = ?
     ORDER BY p.name, pv.sku_suffix`,
    [warehouseId]
  );
  return rows;
}

async function create({ name, code, address, city, state, pincode, createdBy }) {
  const [result] = await db.execute(
    `INSERT INTO warehouses (name, code, address, city, state, pincode, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, code, address ?? null, city ?? null, state ?? null, pincode ?? null, createdBy]
  );
  return result.insertId;
}

async function update(id, fields) {
  const allowed = ['name', 'code', 'address', 'city', 'state', 'pincode', 'is_active'];
  const sets = Object.keys(fields).filter((k) => allowed.includes(k)).map((k) => `${k} = ?`);
  if (!sets.length) return;
  await db.execute(
    `UPDATE warehouses SET ${sets.join(', ')} WHERE id = ?`,
    [...Object.values(fields), id]
  );
}

async function upsertInventory(warehouseId, items) {
  if (!items.length) return;
  const placeholders = items.map(() => '(?, ?, ?, ?)').join(', ');
  const values = items.flatMap(({ variationId, quantity, reorderLevel }) => [
    warehouseId, variationId, quantity, reorderLevel,
  ]);
  await db.execute(
    `INSERT INTO warehouse_inventory (warehouse_id, variation_id, quantity, reorder_level)
     VALUES ${placeholders}
     ON DUPLICATE KEY UPDATE quantity = VALUES(quantity), reorder_level = VALUES(reorder_level)`,
    values
  );
}

async function softDelete(id) {
  await db.execute(`UPDATE warehouses SET deleted_at = NOW() WHERE id = ?`, [id]);
}

module.exports = { findAll, findById, findByCode, findInventory, create, update, upsertInventory, softDelete };
