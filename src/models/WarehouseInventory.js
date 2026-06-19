const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WarehouseInventory = sequelize.define('WarehouseInventory', {
  id:           { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  warehouseId:  { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  variationId:  { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  quantity:     { type: DataTypes.INTEGER, defaultValue: 0 },
  reorderLevel: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  tableName:  'warehouse_inventory',
  underscored: true,
});

module.exports = WarehouseInventory;
