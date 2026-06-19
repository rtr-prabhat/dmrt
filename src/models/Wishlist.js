const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Wishlist = sequelize.define('Wishlist', {
  id:     { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, unique: true },
}, {
  tableName:  'wishlists',
  underscored: true,
  updatedAt:  false,
});

module.exports = Wishlist;
