const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
  id:        { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  name:      { type: DataTypes.STRING(100), allowNull: false },
  slug:      { type: DataTypes.STRING(120), allowNull: false, unique: true },
  parentId:  { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
  sortOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
  depth:     { type: DataTypes.INTEGER, defaultValue: 0 },
  isActive:  { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName:  'categories',
  paranoid:   true,
  underscored: true,
});

module.exports = Category;
