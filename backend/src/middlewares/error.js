/**
 * Global error handling middleware
 */

export const notFound = (req, res, next) => {
  res.status(404).json({ success: false, message: `Not found: ${req.originalUrl}` });
};

export const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  res.status(status).json({ success: false, message });
};
