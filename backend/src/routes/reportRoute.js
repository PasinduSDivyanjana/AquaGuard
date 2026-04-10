import express from "express";
import {
  createReport,
  getAllReports,
  getReportById,
  updateReportStatus,
  deleteReport
} from "../controllers/reportController.js";

const router = express.Router();

router.post("/", createReport);

router.get("/", getAllReports);

router.get("/:id", getReportById);

// NEW
router.patch("/:id/status", updateReportStatus);

router.delete("/:id", deleteReport);

export default router;