-- ============================================================
-- E-Commerce Platform Migration
-- Run once against the existing inventory database
-- ============================================================

-- 1. Alter existing tables
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS phone VARCHAR(20) DEFAULT NULL AFTER password_hash;

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS product_type ENUM('electronics','food','clothing','washing','medicine','chemical','other')
    NOT NULL DEFAULT 'other' AFTER status,
  ADD COLUMN IF NOT EXISTS meta JSON DEFAULT NULL AFTER product_type;

-- 2. New: addresses
CREATE TABLE IF NOT EXISTS addresses (
  id         INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  user_id    INT UNSIGNED  NOT NULL,
  label      VARCHAR(50)   NOT NULL DEFAULT 'Home',
  line1      VARCHAR(255)  NOT NULL,
  line2      VARCHAR(255)  DEFAULT NULL,
  city       VARCHAR(100)  NOT NULL,
  state      VARCHAR(100)  NOT NULL,
  pincode    VARCHAR(6)    NOT NULL,
  phone      VARCHAR(20)   NOT NULL,
  is_default TINYINT(1)    NOT NULL DEFAULT 0,
  created_at DATETIME      NOT NULL,
  updated_at DATETIME      NOT NULL,
  deleted_at DATETIME      DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_addresses_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. New: carts
CREATE TABLE IF NOT EXISTS carts (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    INT UNSIGNED NOT NULL,
  created_at DATETIME     NOT NULL,
  updated_at DATETIME     NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_carts_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. New: cart_items
CREATE TABLE IF NOT EXISTS cart_items (
  id           INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  cart_id      INT UNSIGNED   NOT NULL,
  variation_id INT UNSIGNED   NOT NULL,
  quantity     INT            NOT NULL,
  price_at_add DECIMAL(12,2)  NOT NULL,
  created_at   DATETIME       NOT NULL,
  updated_at   DATETIME       NOT NULL,
  PRIMARY KEY (id),
  KEY idx_cart_items_cart_id (cart_id),
  KEY idx_cart_items_variation_id (variation_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. New: wishlists
CREATE TABLE IF NOT EXISTS wishlists (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    INT UNSIGNED NOT NULL,
  created_at DATETIME     NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_wishlists_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. New: wishlist_items
CREATE TABLE IF NOT EXISTS wishlist_items (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  wishlist_id INT UNSIGNED NOT NULL,
  product_id  INT UNSIGNED NOT NULL,
  created_at  DATETIME     NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_wishlist_items (wishlist_id, product_id),
  KEY idx_wishlist_items_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. New: orders
CREATE TABLE IF NOT EXISTS orders (
  id         INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  user_id    INT UNSIGNED  NOT NULL,
  address_id INT UNSIGNED  NOT NULL,
  status     ENUM('pending','confirmed','processing','shipped','delivered','cancelled')
               NOT NULL DEFAULT 'pending',
  subtotal   DECIMAL(12,2) NOT NULL,
  tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  total      DECIMAL(12,2) NOT NULL,
  notes      TEXT          DEFAULT NULL,
  created_at DATETIME      NOT NULL,
  updated_at DATETIME      NOT NULL,
  deleted_at DATETIME      DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_orders_user_id (user_id),
  KEY idx_orders_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. New: order_items
CREATE TABLE IF NOT EXISTS order_items (
  id           INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  order_id     INT UNSIGNED  NOT NULL,
  variation_id INT UNSIGNED  DEFAULT NULL,
  product_name VARCHAR(255)  NOT NULL,
  sku          VARCHAR(150)  NOT NULL,
  quantity     INT           NOT NULL,
  unit_price   DECIMAL(12,2) NOT NULL,
  tax_rate     DECIMAL(5,2)  NOT NULL DEFAULT 0.00,
  PRIMARY KEY (id),
  KEY idx_order_items_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
