const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserRole = sequelize.define('UserRole', {
  id:        { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  userId:    { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  roleId:    { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  grantedBy: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
}, {
  tableName:  'user_roles',
  underscored: true,
  updatedAt:  false,
});

module.exports = UserRole;
