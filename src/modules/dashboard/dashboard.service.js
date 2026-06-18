const DashboardRepository = require('./dashboard.repository');

async function getSummary(userRoles) {
  const { stats, roleStats } = await DashboardRepository.getSummary();

  const byRole = roleStats.reduce((acc, r) => {
    acc[r.role_name] = Number(r.cnt);
    return acc;
  }, {});

  const summary = {
    products: {
      total:         Number(stats.total_products),
      active:        Number(stats.active_products),
      draft:         Number(stats.draft_products),
      discontinued:  Number(stats.discontinued_products),
    },
    categories: {
      total:     Number(stats.total_categories),
      rootCount: Number(stats.root_categories),
    },
    warehouses: {
      total:      Number(stats.total_warehouses),
      active:     Number(stats.active_warehouses),
      totalStock: Number(stats.total_stock),
    },
    variations: {
      total:        Number(stats.total_variations),
      lowStock:     Number(stats.low_stock_count),
      outOfStock:   Number(stats.out_of_stock_count),
    },
    generatedAt: new Date().toISOString(),
  };

  // User stats visible only to admin/sub_admin
  const canSeeUsers = userRoles.some((r) => ['admin', 'sub_admin'].includes(r));
  if (canSeeUsers) {
    summary.users = {
      total:  Number(stats.total_users),
      active: Number(stats.active_users),
      byRole,
    };
  }

  return summary;
}

module.exports = { getSummary };
