/**
 * Auth middleware - protects routes (requires valid JWT)
 * Dev stub: passes through if no token, allowing unauthenticated access for testing.
 * Replace with real JWT verification when ready.
 */

const protect = (req, res, next) => {
  // Stub: allow all requests for development
  req.user = req.user || { _id: 'dev-user', role: 'admin' };
  next();
};

export default protect;
