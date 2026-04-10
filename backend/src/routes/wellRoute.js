/**
 * Well routes - /api/wells
 * All routes require authentication (protect). Delete requires admin.
 */

import { Router } from "express";
import {
  createWell,
  getAllWells,
  getAllWellsAdmin,
  getWellById,
  updateWell,
  deleteWell,
  getWellWeather,
} from "../controllers/wellController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { restrictTo } from "../middlewares/role.js";
import { uploadWellPhotos } from "../middlewares/upload.js";
import {
  createWellValidator,
  updateWellValidator,
  wellIdValidator,
} from "../middlewares/wellValidator.js";

const router = Router();

/**
 * @section Auth Protection
 * All routes below this point require a valid JWT
 */
router.use(protect);

/**
 * @section Global Well Operations
 * Routes for creating and listing wells
 */
router.post("/", uploadWellPhotos, createWellValidator, createWell);
router.get("/", getAllWells);

/**
 * @section Admin — All Wells
 * Returns every well in the system regardless of owner (admin only)
 */
router.get("/admin/all", restrictTo("admin", "Admin"), getAllWellsAdmin);

/**
 * @section Single Well Operations
 * Routes that act on a specific well ID
 */
router.get("/:id", wellIdValidator, getWellById);
router.put("/:id", updateWellValidator, updateWell);
router.delete("/:id", wellIdValidator, restrictTo("admin"), deleteWell);

/**
 * @section Additional Well Data
 */
router.get("/:id/weather", wellIdValidator, getWellWeather);

export default router;
