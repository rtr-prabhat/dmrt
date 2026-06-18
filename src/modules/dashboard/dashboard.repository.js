const db = require('../../config/db');

async function getSummary() {
  const [[stats]] = await db.execute(`
    SELECT
      (SELECT COUNT(*) FROM products WHERE deleted_at IS NULL)                          AS total_products,
      (SELECT COUNT(*) FROM products WHERE status = 'active'  AND deleted_at IS NULL)  AS active_products,
      (SELECT COUNT(*) FROM products WHERE status = 'draft'   AND deleted_at IS NULL)  AS draft_products,
      (SELECT COUNT(*) FROM products WHERE status = 'discontinued' AND deleted_at IS NULL) AS discontinued_products,

      (SELECT COUNT(*) FROM categories WHERE deleted_at IS NULL)                        AS total_categories,
      (SELECT COUNT(*) FROM categories WHERE parent_id IS NULL AND deleted_at IS NULL)  AS root_categories,

      (SELECT COUNT(*) FROM warehouses WHERE deleted_at IS NULL)                        AS total_warehouses,
      (SELECT COUNT(*) FROM warehouses WHERE is_active = 1 AND deleted_at IS NULL)      AS active_warehouses,
      (SELECT COALESCE(SUM(quantity), 0) FROM warehouse_inventory)                     AS total_stock,

      (SELECT COUNT(*) FROM product_variations WHERE deleted_at IS NULL)               AS total_variations,
      (SELECT COUNT(*) FROM warehouse_inventory
       WHERE quantity > 0 AND quantity <= reorder_level)                               AS low_stock_count,
      (SELECT COUNT(*) FROM warehouse_inventory WHERE quantity = 0)                    AS out_of_stock_count,

      (SELECT COUNT(*) FROM users WHERE deleted_at IS NULL)                            AS total_users,
      (SELECT COUNT(*) FROM users WHERE is_active = 1 AND deleted_at IS NULL)          AS active_users
  `);

  const [roleStats] = await db.execute(`
    SELECT r.name AS role_name, COUNT(DISTINCT ur.user_id) AS cnt
    FROM roles r
    LEFT JOIN user_roles ur ON ur.role_id = r.id
    LEFT JOIN users u       ON u.id = ur.user_id AND u.deleted_at IS NULL
    GROUP BY r.id, r.name
  `);

  return { stats, roleStats };
}

module.exports = { getSummary };
