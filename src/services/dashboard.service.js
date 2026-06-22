import { sequelize } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

const getSummary = async () => {
  try {
    const [productStats] = await sequelize.query(
      `SELECT COUNT(*) AS total,
              SUM(status = 'active') AS active,
              SUM(status = 'draft') AS draft,
              SUM(status = 'discontinued') AS discontinued
       FROM products WHERE deleted_at IS NULL`,
      { type: sequelize.QueryTypes.SELECT }
    );

    const [categoryStats] = await sequelize.query(
      `SELECT COUNT(*) AS total, SUM(parent_id IS NULL) AS root
       FROM categories WHERE deleted_at IS NULL`,
      { type: sequelize.QueryTypes.SELECT }
    );

    const [userStats] = await sequelize.query(
      `SELECT COUNT(*) AS total, SUM(is_active = 1) AS active
       FROM users WHERE deleted_at IS NULL`,
      { type: sequelize.QueryTypes.SELECT }
    );

    const [orderStats] = await sequelize.query(
      `SELECT COUNT(*) AS total,
              SUM(status = 'pending') AS pending,
              SUM(status = 'confirmed') AS confirmed,
              SUM(status = 'processing') AS processing,
              SUM(status = 'shipped') AS shipped,
              SUM(status = 'delivered') AS delivered,
              SUM(status = 'cancelled') AS cancelled
       FROM orders WHERE deleted_at IS NULL`,
      { type: sequelize.QueryTypes.SELECT }
    );

    const [revenueStats] = await sequelize.query(
      `SELECT COALESCE(SUM(total), 0) AS total,
              COALESCE(SUM(CASE WHEN MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW()) THEN total END), 0) AS this_month
       FROM orders WHERE status = 'delivered' AND deleted_at IS NULL`,
      { type: sequelize.QueryTypes.SELECT }
    );

    return {
      products: {
        total:        parseInt(productStats.total)        || 0,
        active:       parseInt(productStats.active)       || 0,
        draft:        parseInt(productStats.draft)        || 0,
        discontinued: parseInt(productStats.discontinued) || 0,
      },
      categories: {
        total: parseInt(categoryStats.total) || 0,
        root:  parseInt(categoryStats.root)  || 0,
      },
      users: {
        total:  parseInt(userStats.total)  || 0,
        active: parseInt(userStats.active) || 0,
      },
      orders: {
        total:      parseInt(orderStats.total)      || 0,
        pending:    parseInt(orderStats.pending)    || 0,
        confirmed:  parseInt(orderStats.confirmed)  || 0,
        processing: parseInt(orderStats.processing) || 0,
        shipped:    parseInt(orderStats.shipped)    || 0,
        delivered:  parseInt(orderStats.delivered)  || 0,
        cancelled:  parseInt(orderStats.cancelled)  || 0,
      },
      revenue: {
        total:     parseFloat(revenueStats.total)     || 0,
        thisMonth: parseFloat(revenueStats.this_month) || 0,
      },
    };
  } catch (error) {
    console.log('Error in dashboard.getSummary:', error.message || error);
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to fetch dashboard summary', 500);
  }
};

const getOrdersByStatus = async () => {
  try {
    return sequelize.query(
      `SELECT status, COUNT(*) AS count FROM orders WHERE deleted_at IS NULL GROUP BY status`,
      { type: sequelize.QueryTypes.SELECT }
    );
  } catch (error) {
    console.log('Error in dashboard.getOrdersByStatus:', error.message || error);
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to fetch orders by status', 500);
  }
};

const getTopProducts = async (period) => {
  try {
    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
    return sequelize.query(
      `SELECT oi.product_name, oi.sku,
              SUM(oi.quantity) AS total_sold,
              SUM(oi.quantity * oi.unit_price) AS revenue
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       WHERE o.status != 'cancelled' AND o.deleted_at IS NULL
         AND o.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY oi.product_name, oi.sku
       ORDER BY total_sold DESC
       LIMIT 10`,
      { replacements: [days], type: sequelize.QueryTypes.SELECT }
    );
  } catch (error) {
    console.log('Error in dashboard.getTopProducts:', error.message || error);
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to fetch top products', 500);
  }
};

const getLowStock = async () => {
  try {
    return sequelize.query(
      `SELECT wi.variation_id, wi.quantity, wi.reorder_level,
              pv.sku_suffix, pv.attributes,
              p.name AS product_name, p.sku AS product_sku,
              w.name AS warehouse_name
       FROM warehouse_inventory wi
       JOIN product_variations pv ON pv.id = wi.variation_id AND pv.deleted_at IS NULL
       JOIN products p             ON p.id  = pv.product_id  AND p.deleted_at  IS NULL
       JOIN warehouses w           ON w.id  = wi.warehouse_id
       WHERE wi.quantity <= wi.reorder_level
       ORDER BY wi.quantity ASC`,
      { type: sequelize.QueryTypes.SELECT }
    );
  } catch (error) {
    console.log('Error in dashboard.getLowStock:', error.message || error);
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to fetch low stock items', 500);
  }
};

const getRevenue = async () => {
  try {
    return sequelize.query(
      `SELECT DATE(created_at) AS date,
              COUNT(*) AS orders,
              SUM(total) AS revenue
       FROM orders
       WHERE status = 'delivered' AND deleted_at IS NULL
         AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      { type: sequelize.QueryTypes.SELECT }
    );
  } catch (error) {
    console.log('Error in dashboard.getRevenue:', error.message || error);
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to fetch revenue data', 500);
  }
};

export { getSummary, getOrdersByStatus, getTopProducts, getLowStock, getRevenue };
