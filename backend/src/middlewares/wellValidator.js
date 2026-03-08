/**
 * Well validation middleware
 */

import { body, param } from 'express-validator';
import { validate } from './validation.js';

export const createWellValidator = [
  body('name').trim().notEmpty().withMessage('Well name is required'),
  body('lat').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required (-90 to 90)'),
  body('lng').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required (-180 to 180)'),
  body('status').optional().isIn(['Good', 'Needs Repair', 'Contaminated', 'Dry']).withMessage('Invalid status'),
  validate,
];

export const updateWellValidator = [
  param('id').isMongoId().withMessage('Invalid well ID'),
  body('name').optional().trim().notEmpty().withMessage('Well name cannot be empty'),
  body('location.lat').optional().isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
  body('location.lng').optional().isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
  body('status').optional().isIn(['Good', 'Needs Repair', 'Contaminated', 'Dry']).withMessage('Invalid status'),
  body('lastInspected').optional().isISO8601().withMessage('Valid date required'),
  validate,
];

export const wellIdValidator = [
  param('id').isMongoId().withMessage('Invalid well ID'),
  validate,
];
