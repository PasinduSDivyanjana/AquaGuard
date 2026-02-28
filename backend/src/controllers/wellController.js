/**
 * Well Controller - CRUD and weather for wells
 */

import WellModel from '../models/Well.js';
import ReportModel from '../models/Report.js';
import { getWeatherForWell } from '../services/weatherService.js';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, '../../uploads');

function extractCloudinaryPublicId(url) {
  const match = String(url).match(/\/v\d+\/(.+)\.\w+$/);
  return match ? match[1] : null;
}

async function deletePhoto(photoUrl) {
  if (!photoUrl) return;
  if (photoUrl.startsWith('http') && photoUrl.includes('cloudinary.com')) {
    const publicId = extractCloudinaryPublicId(photoUrl);
    if (publicId && isCloudinaryConfigured()) {
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.error('Cloudinary delete failed:', err.message);
      }
    }
  } else {
    const filename = photoUrl.replace(/^\/uploads\/?/, '');
    if (filename) {
      const filePath = path.join(UPLOADS_DIR, filename);
      try {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (err) {
        console.error('Local file delete failed:', err.message);
      }
    }
  }
}

// Create well (with optional photos, up to 5)
export const createWell = async (req, res, next) => {
  try {
    const { name, lat, lng, status } = req.body;
    const data = {
      name,
      location: { lat: parseFloat(lat), lng: parseFloat(lng) },
      status: status || 'Good',
    };
    if (req.files?.length) {
      data.photos = req.files.map((f) =>
        isCloudinaryConfigured() ? f.path : '/' + path.join('uploads', f.filename).replace(/\\/g, '/')
      );
      if (data.photos.length > 5) data.photos = data.photos.slice(0, 5);
    }
    const well = await WellModel.create(data);
    res.status(201).json({ success: true, data: well });
  } catch (err) {
    next(err);
  }
};

// Get wells with pagination, status filter, and search by name
export const getAllWells = async (req, res, next) => {
  try {
    const { status, search, page, limit } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) query.name = { $regex: search, $options: 'i' };
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 10));
    const skip = (pageNum - 1) * limitNum;
    const [wells, total] = await Promise.all([
      WellModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      WellModel.countDocuments(query),
    ]);
    res.status(200).json({
      success: true,
      data: {
        wells,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
};

// Get single well by ID
export const getWellById = async (req, res, next) => {
  try {
    const well = await WellModel.findById(req.params.id);
    if (!well) {
      const error = new Error('Well not found');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ success: true, data: well });
  } catch (err) {
    next(err);
  }
};

// Update well details
export const updateWell = async (req, res, next) => {
  try {
    const well = await WellModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!well) {
      const error = new Error('Well not found');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ success: true, data: well });
  } catch (err) {
    next(err);
  }
};

// Delete well (only if no condition reports exist)
export const deleteWell = async (req, res, next) => {
  try {
    const well = await WellModel.findById(req.params.id);
    if (!well) {
      const error = new Error('Well not found');
      error.statusCode = 404;
      throw error;
    }
    const hasReports = await ReportModel.exists({ wellId: req.params.id });
    if (hasReports) {
      const error = new Error('Cannot delete well that has reports. Remove reports first.');
      error.statusCode = 400;
      throw error;
    }
    // Delete uploaded photos (Cloudinary or local)
    if (well.photos?.length) {
      await Promise.all(well.photos.map((p) => deletePhoto(p)));
    }
    await WellModel.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Well deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// Get OpenWeather data for well location
export const getWellWeather = async (req, res, next) => {
  try {
    const payload = await getWeatherForWell(req.params.id);
    res.status(200).json({ success: true, data: payload });
  } catch (err) {
    next(err);
  }
};
