/**
 * Validation middleware - checks express-validator results
 */

import { validationResult } from 'express-validator';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  const msg = errors.array().map((e) => e.msg).join('; ');
  res.status(400).json({ success: false, message: msg });
};
