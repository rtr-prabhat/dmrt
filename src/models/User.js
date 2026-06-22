import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const User = sequelize.define('User', {
  id:           { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  fullName:     { type: DataTypes.STRING(100), allowNull: false },
  email:        { type: DataTypes.STRING(255), allowNull: false, unique: true },
  passwordHash: { type: DataTypes.STRING(255), allowNull: false },
  phone:        { type: DataTypes.STRING(20), allowNull: true },
  isActive:     { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'users',
  paranoid:  true,
  underscored: true,
});

export default User;
