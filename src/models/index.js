import sequelize from '../config/database.js';

import User from './User.js';
import Role from './Role.js';
import Permission from './Permission.js';
import UserRole from './UserRole.js';
import RolePermission from './RolePermission.js';
import RefreshToken from './RefreshToken.js';
import Category from './Category.js';
import Product from './Product.js';
import ProductVariation from './ProductVariation.js';
import Warehouse from './Warehouse.js';
import WarehouseInventory from './WarehouseInventory.js';
import Cart from './Cart.js';
import CartItem from './CartItem.js';
import Wishlist from './Wishlist.js';
import WishlistItem from './WishlistItem.js';
import Order from './Order.js';
import OrderItem from './OrderItem.js';
import Address from './Address.js';

// ── RBAC ──────────────────────────────────────────────────────────────
User.belongsToMany(Role, { through: UserRole, foreignKey: 'userId', otherKey: 'roleId', as: 'roles' });
Role.belongsToMany(User, { through: UserRole, foreignKey: 'roleId', otherKey: 'userId' });
UserRole.belongsTo(User, { foreignKey: 'userId' });
UserRole.belongsTo(Role, { foreignKey: 'roleId' });

Role.belongsToMany(Permission, { through: RolePermission, foreignKey: 'roleId', otherKey: 'permissionId', as: 'permissions' });
Permission.belongsToMany(Role, { through: RolePermission, foreignKey: 'permissionId', otherKey: 'roleId' });

User.hasMany(RefreshToken, { foreignKey: 'userId' });
RefreshToken.belongsTo(User, { foreignKey: 'userId' });

// ── Categories ────────────────────────────────────────────────────────
Category.hasMany(Category, { as: 'children', foreignKey: 'parentId' });
Category.belongsTo(Category, { as: 'parent', foreignKey: 'parentId' });
Category.hasMany(Product, { foreignKey: 'categoryId' });

// ── Products ──────────────────────────────────────────────────────────
Product.belongsTo(Category, { as: 'category', foreignKey: 'categoryId' });
Product.hasMany(ProductVariation, { as: 'variations', foreignKey: 'productId' });
ProductVariation.belongsTo(Product, { as: 'product', foreignKey: 'productId' });

// ── Inventory ─────────────────────────────────────────────────────────
Warehouse.hasMany(WarehouseInventory, { as: 'inventory', foreignKey: 'warehouseId' });
WarehouseInventory.belongsTo(Warehouse, { foreignKey: 'warehouseId' });
ProductVariation.hasMany(WarehouseInventory, { as: 'stocks', foreignKey: 'variationId' });
WarehouseInventory.belongsTo(ProductVariation, { as: 'variation', foreignKey: 'variationId' });

// ── Cart ──────────────────────────────────────────────────────────────
User.hasOne(Cart, { foreignKey: 'userId' });
Cart.belongsTo(User, { foreignKey: 'userId' });
Cart.hasMany(CartItem, { as: 'items', foreignKey: 'cartId' });
CartItem.belongsTo(Cart, { foreignKey: 'cartId' });
CartItem.belongsTo(ProductVariation, { as: 'variation', foreignKey: 'variationId' });
ProductVariation.hasMany(CartItem, { foreignKey: 'variationId' });

// ── Wishlist ──────────────────────────────────────────────────────────
User.hasOne(Wishlist, { foreignKey: 'userId' });
Wishlist.belongsTo(User, { foreignKey: 'userId' });
Wishlist.hasMany(WishlistItem, { as: 'items', foreignKey: 'wishlistId' });
WishlistItem.belongsTo(Wishlist, { foreignKey: 'wishlistId' });
WishlistItem.belongsTo(Product, { as: 'product', foreignKey: 'productId' });
Product.hasMany(WishlistItem, { foreignKey: 'productId' });

// ── Orders ────────────────────────────────────────────────────────────
User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });
Order.belongsTo(Address, { as: 'deliveryAddress', foreignKey: 'addressId' });
Order.hasMany(OrderItem, { as: 'items', foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });
OrderItem.belongsTo(ProductVariation, { as: 'variation', foreignKey: 'variationId' });

// ── Addresses ─────────────────────────────────────────────────────────
User.hasMany(Address, { as: 'addresses', foreignKey: 'userId' });
Address.belongsTo(User, { foreignKey: 'userId' });
Address.hasMany(Order, { foreignKey: 'addressId' });

export {
  sequelize,
  User,
  Role,
  Permission,
  UserRole,
  RolePermission,
  RefreshToken,
  Category,
  Product,
  ProductVariation,
  Warehouse,
  WarehouseInventory,
  Cart,
  CartItem,
  Wishlist,
  WishlistItem,
  Order,
  OrderItem,
  Address,
};
