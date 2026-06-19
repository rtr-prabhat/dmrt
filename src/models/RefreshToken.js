const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RefreshToken = sequelize.define('RefreshToken', {
  id:        { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  userId:    { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  tokenHash: { type: DataTypes.STRING(64), allowNull: false, unique: true },
  expiresAt: { type: DataTypes.DATE, allowNull: false },
  userAgent: { type: DataTypes.STRING(500), allowNull: true },
  ipAddress: { type: DataTypes.STRING(45), allowNull: true },
  revokedAt: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName:  'refresh_tokens',
  underscored: true,
  updatedAt:  false,
});

module.exports = RefreshToken;
