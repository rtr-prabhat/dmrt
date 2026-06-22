import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Product = sequelize.define('Product', {
  id:          { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  categoryId:  { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  name:        { type: DataTypes.STRING(255), allowNull: false },
  slug:        { type: DataTypes.STRING(300), allowNull: false, unique: true },
  sku:         { type: DataTypes.STRING(100), allowNull: false, unique: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  basePrice:   { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  taxRate:     { type: DataTypes.DECIMAL(5, 2), defaultValue: 18 },
  status:      { type: DataTypes.ENUM('draft', 'active', 'discontinued'), defaultValue: 'draft' },
  productType: {
    type: DataTypes.ENUM('electronics', 'food', 'clothing', 'washing', 'medicine', 'chemical', 'other'),
    defaultValue: 'other',
  },
  meta: { type: DataTypes.JSON, allowNull: true },
}, {
  tableName:  'products',
  paranoid:   true,
  underscored: true,
});

export default Product;
