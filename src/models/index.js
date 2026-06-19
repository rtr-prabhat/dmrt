const sequelize = require('../config/database');

const User             = require('./User');
const Role             = require('./Role');
const Permission       = require('./Permission');
const UserRole         = require('./UserRole');
const RolePermission   = require('./RolePermission');
const RefreshToken     = require('./RefreshToken');
const Category         = require('./Category');
const Product          = require('./Product');
const ProductVariation = require('./ProductVariation');
const Warehouse        = require('./Warehouse');
const WarehouseInventory = require('./WarehouseInventory');
const Cart             = require('./Cart');
const CartItem         = require('./CartItem');
const Wishlist         = require('./Wishlist');
const WishlistItem     = require('./WishlistItem');
const Order            = require('./Order');
const OrderItem        = require('./OrderItem');
const Address          = require('./Address');

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

module.exports = {
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
