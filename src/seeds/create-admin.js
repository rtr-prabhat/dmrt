require('dotenv').config();
const bcrypt = require('bcrypt');
const { sequelize, User, Role, UserRole } = require('../models');

const SALT_ROUNDS = 10;

async function createAdmin() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connection established.\n');

    const email = 'admin@example.com';
    const password = 'Admin1234';
    const fullName = 'Admin User';

    // Check if user already exists
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      console.log(`User ${email} already exists (ID: ${existing.id}). Assigning admin role...`);
      const adminRole = await Role.findOne({ where: { name: 'admin' } });
      if (!adminRole) {
        console.error('Admin role not found. Did you run the seed script?');
        process.exit(1);
      }
      const alreadyAssigned = await UserRole.findOne({ where: { userId: existing.id, roleId: adminRole.id } });
      if (!alreadyAssigned) {
        await UserRole.create({ userId: existing.id, roleId: adminRole.id, grantedBy: null });
        console.log(`Admin role assigned to ${email}`);
      } else {
        console.log(`${email} already has the admin role.`);
      }
    } else {
      console.log('Creating admin user...');
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
      const user = await User.create({ fullName, email, passwordHash });

      const adminRole = await Role.findOne({ where: { name: 'admin' } });
      if (!adminRole) {
        console.error('Admin role not found. Did you run the seed script?');
        process.exit(1);
      }

      await UserRole.create({ userId: user.id, roleId: adminRole.id, grantedBy: null });
      console.log(`Admin user created successfully:`);
      console.log(`  Email:    ${email}`);
      console.log(`  Password: ${password}`);
      console.log(`  Role:     admin`);
    }

    console.log('\nDone! You can now log in via POST /api/v1/auth/login');
    console.log('and use the admin API endpoints under /api/v1/admin');
  } catch (err) {
    console.error('Failed:', err.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

createAdmin();
