/**
 * Well routes - /api/wells
 * All routes require authentication (protect). Delete requires admin.
 */

import { Router } from 'express';
import { body, param } from 'express-validator';
import * as wellController from '../controllers/wellController.js';
import protect from '../middlewares/auth.js';
import { restrictTo } from '../middlewares/role.js';
import { validate } from '../middlewares/validation.js';
import { uploadWellPhotos } from '../middlewares/upload.js';

const createWellValidation = [
  body('name').trim().notEmpty().withMessage('Well name is required'),
  body('lat').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required (-90 to 90)'),
  body('lng').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required (-180 to 180)'),
  body('status').optional().isIn(['Good', 'Needs Repair', 'Contaminated', 'Dry']).withMessage('Invalid status'),
];

const updateWellValidation = [
  param('id').isMongoId().withMessage('Invalid well ID'),
  body('name').optional().trim().notEmpty().withMessage('Well name cannot be empty'),
  body('location.lat').optional().isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
  body('location.lng').optional().isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
  body('status').optional().isIn(['Good', 'Needs Repair', 'Contaminated', 'Dry']).withMessage('Invalid status'),
  body('lastInspected').optional().isISO8601().withMessage('Valid date required'),
];

const wellIdValidation = [param('id').isMongoId().withMessage('Invalid well ID')];

const router = Router();

// All well routes require logged-in user
router.use(protect);

router
  .route('/')
  .post(uploadWellPhotos, createWellValidation, validate, wellController.createWell)
  .get(wellController.getAllWells);

router
  .route('/:id')
  .get(wellIdValidation, validate, wellController.getWellById)
  .put(updateWellValidation, validate, wellController.updateWell)
  .delete(wellIdValidation, validate, restrictTo('admin'), wellController.deleteWell);

// Weather for specific well
router.get('/:id/weather', wellIdValidation, validate, wellController.getWellWeather);

export default router;
