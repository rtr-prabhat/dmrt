import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Permission = sequelize.define('Permission', {
  id:       { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  resource: { type: DataTypes.STRING(50), allowNull: false },
  action:   { type: DataTypes.STRING(50), allowNull: false },
}, {
  tableName:  'permissions',
  underscored: true,
  updatedAt:  false,
});

export default Permission;
