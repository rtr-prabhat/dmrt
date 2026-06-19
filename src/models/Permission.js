const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Permission = sequelize.define('Permission', {
  id:       { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  resource: { type: DataTypes.STRING(50), allowNull: false },
  action:   { type: DataTypes.STRING(50), allowNull: false },
}, {
  tableName:  'permissions',
  underscored: true,
  updatedAt:  false,
});

module.exports = Permission;
