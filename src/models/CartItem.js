const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CartItem = sequelize.define('CartItem', {
  id:          { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  cartId:      { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  variationId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  quantity:    { type: DataTypes.INTEGER, allowNull: false },
  priceAtAdd:  { type: DataTypes.DECIMAL(12, 2), allowNull: false },
}, {
  tableName:  'cart_items',
  underscored: true,
});

module.exports = CartItem;
