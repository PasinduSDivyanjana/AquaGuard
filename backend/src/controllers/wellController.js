/**
 * Well Controller - CRUD + Weather + User ownership
 */

import WellModel from "../models/Well.js";
import ReportModel from "../models/Report.js";
import { getWeatherForWell } from "../services/weatherService.js";
import { cloudinary, isCloudinaryConfigured } from "../config/cloudinary.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, "../../uploads");

/**
 * Delete photo helper
 */
function extractCloudinaryPublicId(url) {
  const match = String(url).match(/\/v\d+\/(.+)\.\w+$/);
  return match ? match[1] : null;
}

async function deletePhoto(photoUrl) {
  if (!photoUrl) return;

  if (photoUrl.startsWith("http") && photoUrl.includes("cloudinary.com")) {
    const publicId = extractCloudinaryPublicId(photoUrl);
    if (publicId && isCloudinaryConfigured()) {
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.error("Cloudinary delete failed:", err.message);
      }
    }
  } else {
    const filename = photoUrl.replace(/^\/uploads\/?/, "");
    const filePath = path.join(UPLOADS_DIR, filename);
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (err) {
      console.error("Local file delete failed:", err.message);
    }
  }
}

/**
 * CREATE WELL
 */
export const createWell = async (req, res, next) => {
  try {
    const { name, lat, lng, status } = req.body;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: "Latitude and Longitude are required",
      });
    }

    const userId = req.user._id || req.user.id;

    const data = {
      name,
      location: {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      },
      status: status || "Good",
      user: userId,
    };

    if (req.files?.length) {
      data.photos = req.files.map((f) =>
        isCloudinaryConfigured()
          ? f.path
          : "/" + path.join("uploads", f.filename).replace(/\\/g, "/")
      );

      if (data.photos.length > 5) {
        data.photos = data.photos.slice(0, 5);
      }
    }

    const well = await WellModel.create(data);

    res.status(201).json({
      success: true,
      data: well,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET ALL WELLS (user-based)
 */
export const getAllWells = async (req, res, next) => {
  try {
    const { status, search, page, limit } = req.query;

    const userId = req.user._id || req.user.id;

    const query = {
      user: userId,
    };

    if (status) query.status = status;
    if (search) query.name = { $regex: search, $options: "i" };

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [wells, total] = await Promise.all([
      WellModel.find(query)
        .populate("user", "firstName email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
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

/**
 * GET ALL WELLS — ADMIN (no user filter, all wells in system)
 */
export const getAllWellsAdmin = async (req, res, next) => {
  try {
    const { status, search, page, limit } = req.query;

    const query = {};
    if (status) query.status = status;
    if (search) query.name = { $regex: search, $options: "i" };

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [wells, total] = await Promise.all([
      WellModel.find(query)
        .populate("user", "firstName lastName email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
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

/**
 * GET WELL BY ID
 */
export const getWellById = async (req, res, next) => {
  try {
    const well = await WellModel.findById(req.params.id).populate(
      "user",
      "firstName email"
    );

    if (!well) {
      return res.status(404).json({
        success: false,
        message: "Well not found",
      });
    }

    const userId = req.user._id || req.user.id;
    if (String(well.user._id || well.user) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this well",
      });
    }

    res.status(200).json({
      success: true,
      data: well,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * UPDATE WELL
 */
export const updateWell = async (req, res, next) => {
  try {
    const existing = await WellModel.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Well not found",
      });
    }

    const userId = req.user._id || req.user.id;
    if (String(existing.user) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this well",
      });
    }

    // Whitelist only safe fields — never allow overwriting 'user' or '_id'
    const { name, location, status, lastInspected } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (location !== undefined) updates.location = location;
    if (status !== undefined) updates.status = status;
    if (lastInspected !== undefined) updates.lastInspected = lastInspected;

    const well = await WellModel.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: well,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE WELL
 */
export const deleteWell = async (req, res, next) => {
  try {
    const well = await WellModel.findById(req.params.id);

    if (!well) {
      return res.status(404).json({
        success: false,
        message: "Well not found",
      });
    }

    const userId = req.user._id || req.user.id;
    if (String(well.user) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this well",
      });
    }

    const hasReports = await ReportModel.exists({ wellId: req.params.id });

    if (hasReports) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete well with reports",
      });
    }

    if (well.photos?.length) {
      await Promise.all(well.photos.map(deletePhoto));
    }

    await WellModel.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Well deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET WELL WEATHER
 */
export const getWellWeather = async (req, res, next) => {
  try {
    const payload = await getWeatherForWell(req.params.id);

    res.status(200).json({
      success: true,
      data: payload,
    });
  } catch (err) {
    next(err);
  }
};
