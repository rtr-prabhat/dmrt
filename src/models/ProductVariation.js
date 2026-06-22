import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ProductVariation = sequelize.define('ProductVariation', {
  id:         { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  productId:  { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  skuSuffix:  { type: DataTypes.STRING(50), allowNull: false },
  attributes: { type: DataTypes.JSON, allowNull: false },
  priceDelta: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  isActive:   { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName:  'product_variations',
  paranoid:   true,
  underscored: true,
});

export default ProductVariation;
