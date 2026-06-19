const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id:        { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  userId:    { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  addressId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  status:    {
    type: DataTypes.ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'),
    defaultValue: 'pending',
  },
  subtotal:  { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  taxAmount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  total:     { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  notes:     { type: DataTypes.TEXT, allowNull: true },
}, {
  tableName:  'orders',
  paranoid:   true,
  underscored: true,
});

module.exports = Order;
