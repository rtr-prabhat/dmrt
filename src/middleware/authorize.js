import { AppError } from '../utils/AppError.js';

/**
 * RBAC authorization middleware factory.
 *
 * Usage:
 *   router.delete('/:id', authenticate, authorize('product', 'delete'), controller.remove)
 */
export default function authorize(resource, action) {
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
