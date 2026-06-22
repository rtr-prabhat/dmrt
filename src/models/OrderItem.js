import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const OrderItem = sequelize.define('OrderItem', {
  id:          { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  orderId:     { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  variationId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
  productName: { type: DataTypes.STRING(255), allowNull: false },
  sku:         { type: DataTypes.STRING(150), allowNull: false },
  quantity:    { type: DataTypes.INTEGER, allowNull: false },
  unitPrice:   { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  taxRate:     { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
}, {
  tableName:  'order_items',
  underscored: true,
  timestamps: false,
});

export default OrderItem;
