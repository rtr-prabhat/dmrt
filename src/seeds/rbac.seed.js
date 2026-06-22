import 'dotenv/config';
import { sequelize, Role, Permission, RolePermission } from '../models/index.js';

const ROLE_PERMISSIONS = {
  admin: [
    { resource: 'product',           action: 'create' },
    { resource: 'product',           action: 'read'   },
    { resource: 'product',           action: 'update' },
    { resource: 'product',           action: 'delete' },
    { resource: 'warehouse',         action: 'create' },
    { resource: 'warehouse',         action: 'read'   },
    { resource: 'warehouse',         action: 'update' },
    { resource: 'warehouse',         action: 'delete' },
    { resource: 'product_variation', action: 'create' },
    { resource: 'product_variation', action: 'read'   },
    { resource: 'product_variation', action: 'update' },
    { resource: 'product_variation', action: 'delete' },
    { resource: 'category',          action: 'create' },
    { resource: 'category',          action: 'read'   },
    { resource: 'category',          action: 'update' },
    { resource: 'category',          action: 'delete' },
    { resource: 'user',              action: 'create' },
    { resource: 'user',              action: 'read'   },
    { resource: 'user',              action: 'update' },
    { resource: 'user',              action: 'delete' },
    { resource: 'dashboard',         action: 'read'   },
    { resource: 'order',             action: 'read'   },
    { resource: 'order',             action: 'update' },
    { resource: 'cart',              action: 'create' },
    { resource: 'cart',              action: 'read'   },
    { resource: 'cart',              action: 'update' },
    { resource: 'cart',              action: 'delete' },
    { resource: 'wishlist',          action: 'create' },
    { resource: 'wishlist',          action: 'read'   },
    { resource: 'wishlist',          action: 'update' },
    { resource: 'wishlist',          action: 'delete' },
    { resource: 'address',           action: 'create' },
    { resource: 'address',           action: 'read'   },
    { resource: 'address',           action: 'update' },
    { resource: 'address',           action: 'delete' },
  ],
  sub_admin: [
    { resource: 'product',           action: 'create' },
    { resource: 'product',           action: 'read'   },
    { resource: 'product',           action: 'update' },
    { resource: 'product',           action: 'delete' },
    { resource: 'warehouse',         action: 'create' },
    { resource: 'warehouse',         action: 'read'   },
    { resource: 'warehouse',         action: 'update' },
    { resource: 'warehouse',         action: 'delete' },
    { resource: 'product_variation', action: 'create' },
    { resource: 'product_variation', action: 'read'   },
    { resource: 'product_variation', action: 'update' },
    { resource: 'product_variation', action: 'delete' },
    { resource: 'category',          action: 'create' },
    { resource: 'category',          action: 'read'   },
    { resource: 'category',          action: 'update' },
    { resource: 'category',          action: 'delete' },
    { resource: 'dashboard',         action: 'read'   },
    { resource: 'order',             action: 'read'   },
    { resource: 'order',             action: 'update' },
  ],
  user: [
    { resource: 'product',   action: 'read'   },
    { resource: 'category',  action: 'read'   },
    { resource: 'cart',      action: 'create' },
    { resource: 'cart',      action: 'read'   },
    { resource: 'cart',      action: 'update' },
    { resource: 'cart',      action: 'delete' },
    { resource: 'order',     action: 'create' },
    { resource: 'order',     action: 'read'   },
    { resource: 'address',   action: 'create' },
    { resource: 'address',   action: 'read'   },
    { resource: 'address',   action: 'update' },
    { resource: 'address',   action: 'delete' },
    { resource: 'wishlist',  action: 'create' },
    { resource: 'wishlist',  action: 'read'   },
    { resource: 'wishlist',  action: 'update' },
    { resource: 'wishlist',  action: 'delete' },
  ],
};

async function seed() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connection established.\n');

    // 1. Upsert roles
    console.log('Seeding roles...');
    const roleMap = {};
    for (const roleName of Object.keys(ROLE_PERMISSIONS)) {
      const [role] = await Role.findOrCreate({
        where: { name: roleName },
        defaults: { name: roleName },
      });
      roleMap[roleName] = role;
      console.log(`  ✓ role: ${roleName}`);
    }

    // 2. Collect all unique permissions across all roles
    const allPerms = [];
    for (const perms of Object.values(ROLE_PERMISSIONS)) {
      for (const p of perms) {
        if (!allPerms.some(x => x.resource === p.resource && x.action === p.action)) {
          allPerms.push(p);
        }
      }
    }

    // 3. Upsert permissions
    console.log('\nSeeding permissions...');
    const permMap = {};
    for (const p of allPerms) {
      const [perm] = await Permission.findOrCreate({
        where: { resource: p.resource, action: p.action },
        defaults: p,
      });
      permMap[`${p.resource}:${p.action}`] = perm;
      console.log(`  ✓ permission: ${p.resource}:${p.action}`);
    }

    // 4. Assign permissions to roles
    console.log('\nAssigning permissions to roles...');
    for (const [roleName, perms] of Object.entries(ROLE_PERMISSIONS)) {
      const role = roleMap[roleName];
      for (const p of perms) {
        const perm = permMap[`${p.resource}:${p.action}`];
        await RolePermission.findOrCreate({
          where:    { roleId: role.id, permissionId: perm.id },
          defaults: { roleId: role.id, permissionId: perm.id },
        });
      }
      console.log(`  ✓ ${roleName}: ${perms.length} permissions assigned`);
    }

    console.log('\nSeed completed successfully.');
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

seed();
