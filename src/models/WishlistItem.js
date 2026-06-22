import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const WishlistItem = sequelize.define('WishlistItem', {
  id:         { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  wishlistId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  productId:  { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
}, {
  tableName:  'wishlist_items',
  underscored: true,
  updatedAt:  false,
  indexes: [{ unique: true, fields: ['wishlist_id', 'product_id'] }],
});

export default WishlistItem;
