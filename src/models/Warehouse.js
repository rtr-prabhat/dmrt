import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Warehouse = sequelize.define('Warehouse', {
  id:       { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  name:     { type: DataTypes.STRING(100), allowNull: false },
  code:     { type: DataTypes.STRING(20), allowNull: false, unique: true },
  address:  { type: DataTypes.TEXT, allowNull: true },
  city:     { type: DataTypes.STRING(100), allowNull: false },
  state:    { type: DataTypes.STRING(100), allowNull: false },
  pincode:  { type: DataTypes.STRING(6), allowNull: false },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName:  'warehouses',
  paranoid:   true,
  underscored: true,
});

export default Warehouse;
