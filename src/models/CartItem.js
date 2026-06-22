import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

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

export default CartItem;
