import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Category = sequelize.define('Category', {
  id:        { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  name:      { type: DataTypes.STRING(100), allowNull: false },
  slug:      { type: DataTypes.STRING(120), allowNull: false },
  parentId:  { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
  sortOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
  depth:     { type: DataTypes.INTEGER, defaultValue: 0 },
  image:     { type: DataTypes.STRING(500), allowNull: true },
  isActive:  { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName:  'categories',
  paranoid:   true,
  underscored: true,
});

export default Category;
