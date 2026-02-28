/**
 * Upload middleware - report images & well photos
 * Uses Cloudinary if configured, else local disk
 */

import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Allow only image files (jpeg, jpg, png, gif, webp)
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) return cb(null, true);
  cb(new Error('Only image files are allowed'), false);
};

const multerOpts = {
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter,
};

let storage;

// Report images: Cloudinary or local disk
if (isCloudinaryConfigured()) {
  storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'aquaguard/reports',
      allowed_formats: ['jpeg', 'jpg', 'png', 'gif', 'webp'],
      public_id: (req, file) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        return unique;
      },
    },
  });
} else {
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '../../uploads'));
    },
    filename: (req, file, cb) => {
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, unique + (path.extname(file.originalname) || '.jpg'));
    },
  });
}

// Single image for reports
export const uploadImage = multer({
  storage,
  ...multerOpts,
}).single('image');

// Well photos: up to 5 images
const wellPhotosStorage = isCloudinaryConfigured()
  ? new CloudinaryStorage({
      cloudinary,
      params: {
        folder: 'aquaguard/wells',
        allowed_formats: ['jpeg', 'jpg', 'png', 'gif', 'webp'],
        public_id: () => Date.now() + '-' + Math.round(Math.random() * 1e9),
      },
    })
  : multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../uploads'));
      },
      filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + (path.extname(file.originalname) || '.jpg'));
      },
    });

// Array of up to 5 photos for wells
export const uploadWellPhotos = multer({
  storage: wellPhotosStorage,
  ...multerOpts,
}).array('photos', 5);
