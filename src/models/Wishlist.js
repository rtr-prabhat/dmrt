import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Wishlist = sequelize.define('Wishlist', {
  id:     { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, unique: true },
}, {
  tableName:  'wishlists',
  underscored: true,
  updatedAt:  false,
});

export default Wishlist;
