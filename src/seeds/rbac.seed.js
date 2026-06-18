require('../config/env'); // validate env before anything
const db = require('../config/db');

const ROLE_PERMISSIONS = {
  admin: [
    ['product', 'create'], ['product', 'read'], ['product', 'update'], ['product', 'delete'],
    ['warehouse', 'create'], ['warehouse', 'read'], ['warehouse', 'update'], ['warehouse', 'delete'],
    ['product_variation', 'create'], ['product_variation', 'read'],
    ['product_variation', 'update'], ['product_variation', 'delete'],
    ['category', 'create'], ['category', 'read'], ['category', 'update'], ['category', 'delete'],
    ['user', 'create'], ['user', 'read'], ['user', 'update'], ['user', 'delete'],
    ['dashboard', 'read'],
  ],
  sub_admin: [
    ['product', 'create'], ['product', 'read'], ['product', 'update'], ['product', 'delete'],
    ['warehouse', 'create'], ['warehouse', 'read'], ['warehouse', 'update'], ['warehouse', 'delete'],
    ['product_variation', 'create'], ['product_variation', 'read'],
    ['product_variation', 'update'], ['product_variation', 'delete'],
    ['category', 'create'], ['category', 'read'], ['category', 'update'], ['category', 'delete'],
    ['dashboard', 'read'],
  ],
  user: [
    ['product', 'read'],
    ['warehouse', 'read'],
    ['product_variation', 'read'],
    ['category', 'read'],
    ['dashboard', 'read'],
  ],
};

async function seed() {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Clear existing role_permissions
    await conn.execute('DELETE FROM role_permissions');

    for (const [roleName, permissions] of Object.entries(ROLE_PERMISSIONS)) {
      const [[role]] = await conn.execute(
        'SELECT id FROM roles WHERE name = ?', [roleName]
      );
      if (!role) throw new Error(`Role '${roleName}' not found — run schema DDL first`);

      for (const [resource, action] of permissions) {
        const [[perm]] = await conn.execute(
          'SELECT id FROM permissions WHERE resource = ? AND action = ?', [resource, action]
        );
        if (!perm) throw new Error(`Permission '${resource}:${action}' not found`);

        await conn.execute(
          'INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)',
          [role.id, perm.id]
        );
      }
      console.log(`  ✓ Seeded permissions for role: ${roleName}`);
    }

    await conn.commit();
    console.log('RBAC seed completed successfully.');
  } catch (err) {
    await conn.rollback();
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  } finally {
    conn.release();
    await db.end();
  }
}

seed();
