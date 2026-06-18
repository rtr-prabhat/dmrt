/**
 * Returns SQL LIMIT/OFFSET clause and meta object for response.
 */
function paginate(query) {
  const page  = Math.max(1, parseInt(query.page,  10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

function paginateMeta(page, limit, total) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) };
}

module.exports = { paginate, paginateMeta };
