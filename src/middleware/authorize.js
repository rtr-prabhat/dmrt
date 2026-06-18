const { AppError } = require('../utils/AppError');

/**
 * RBAC authorization middleware factory.
 *
 * Usage:
 *   router.delete('/:id', authenticate, authorize('product', 'delete'), controller.remove)
 */
function authorize(resource, action) {
  return function (req, _res, next) {
    const permissions = req.user?.permissions ?? [];
    const allowed = permissions.some(
      (p) => p.resource === resource && p.action === action
    );

    if (!allowed) {
      return next(
        new AppError(
          `Forbidden: requires '${action}' permission on '${resource}'`,
          403
        )
      );
    }
    next();
  };
}

module.exports = authorize;
