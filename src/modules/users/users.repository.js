const db = require('../../config/db');

async function findWithPermissions(userId) {
  // Single query: user + roles + permissions
  const [rows] = await db.execute(
    `SELECT
       u.id, u.email, u.full_name, u.is_active,
       r.name  AS role_name,
       p.resource, p.action
     FROM users u
     JOIN user_roles ur        ON ur.user_id  = u.id
     JOIN roles r              ON r.id        = ur.role_id
     JOIN role_permissions rp  ON rp.role_id  = r.id
     JOIN permissions p        ON p.id        = rp.permission_id
     WHERE u.id = ? AND u.deleted_at IS NULL`,
    [userId]
  );

  if (!rows.length) return null;

  const { id, email, full_name, is_active } = rows[0];
  const roles = [...new Set(rows.map((r) => r.role_name))];
  const permissions = rows.map((r) => ({ resource: r.resource, action: r.action }));

  return { id, email, fullName: full_name, is_active, roles, permissions };
}

async function findAll({ limit, offset, search }) {
  const params = [];
  let where = 'WHERE u.deleted_at IS NULL';
  if (search) {
    where += ' AND (u.full_name LIKE ? OR u.email LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  const [[{ total }]] = await db.execute(
    `SELECT COUNT(DISTINCT u.id) AS total FROM users u ${where}`,
    params
  );

  const [rows] = await db.execute(
    `SELECT u.id, u.email, u.full_name, u.is_active, u.created_at,
            GROUP_CONCAT(r.name) AS roles
     FROM users u
     LEFT JOIN user_roles ur ON ur.user_id = u.id
     LEFT JOIN roles r       ON r.id       = ur.role_id
     ${where}
     GROUP BY u.id
     ORDER BY u.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return { total, rows };
}

async function findById(id) {
  const [rows] = await db.execute(
    `SELECT u.id, u.email, u.full_name, u.is_active, u.created_at,
            GROUP_CONCAT(r.name) AS roles
     FROM users u
     LEFT JOIN user_roles ur ON ur.user_id = u.id
     LEFT JOIN roles r       ON r.id       = ur.role_id
     WHERE u.id = ? AND u.deleted_at IS NULL
     GROUP BY u.id`,
    [id]
  );
  return rows[0] ?? null;
}

async function create({ email, passwordHash, fullName }) {
  const [result] = await db.execute(
    `INSERT INTO users (email, password_hash, full_name) VALUES (?, ?, ?)`,
    [email, passwordHash, fullName]
  );
  return result.insertId;
}

async function update(id, fields) {
  const allowed = ['full_name', 'is_active'];
  const sets = Object.keys(fields)
    .filter((k) => allowed.includes(k))
    .map((k) => `${k} = ?`);
  if (!sets.length) return;
  await db.execute(
    `UPDATE users SET ${sets.join(', ')} WHERE id = ?`,
    [...Object.values(fields), id]
  );
}

async function softDelete(id) {
  await db.execute(
    `UPDATE users SET deleted_at = NOW() WHERE id = ?`,
    [id]
  );
}

async function setRoles(userId, roleNames, grantedBy) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.execute(`DELETE FROM user_roles WHERE user_id = ?`, [userId]);

    if (roleNames.length) {
      const placeholders = roleNames.map(() => '?').join(',');
      const [roleRows] = await conn.execute(
        `SELECT id FROM roles WHERE name IN (${placeholders})`,
        roleNames
      );
      for (const role of roleRows) {
        await conn.execute(
          `INSERT INTO user_roles (user_id, role_id, granted_by) VALUES (?, ?, ?)`,
          [userId, role.id, grantedBy]
        );
      }
    }
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = { findWithPermissions, findAll, findById, create, update, softDelete, setRoles };
