import { createAppError } from '../errors/AppError.js';

export const authorizeRoles =
  (...allowedRoles) =>
  (req, res, next) => {
    const userRoles = req.user?.roles;
    const normalizedRoles = Array.isArray(userRoles) ? userRoles : userRoles ? [userRoles] : [];

    const isAuthorized = allowedRoles.some((role) => normalizedRoles.includes(role));

    if (!isAuthorized) {
      throw createAppError('ROLE_FORBIDDEN');
    }

    next();
  };

export default authorizeRoles;
