import express from "express";
import upload from "../config/upload.js";
import {
  createReport,
  getAllReports,
  getReportById,
  updateReportStatus,
  deleteReport
} from "../controllers/reportController.js";

const router = express.Router();

router.post("/", upload.single("image"), createReport);

router.get("/", getAllReports);

router.get("/:id", getReportById);

// NEW
router.patch("/:id/status", updateReportStatus);

router.delete("/:id", deleteReport);

export default router;