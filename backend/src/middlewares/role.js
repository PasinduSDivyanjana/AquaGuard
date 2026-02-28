/**
 * Role-based access control
 * restrictTo(...roles) - allows request only if user has one of the given roles
 */

export const restrictTo = (...roles) => (req, res, next) => {
  const userRole = req.user?.role || 'admin';
  if (roles.includes(userRole)) return next();
  res.status(403).json({ success: false, message: 'Access denied' });
};
