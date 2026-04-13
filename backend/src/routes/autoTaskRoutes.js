import express from "express";
import {
  getAutoTasks,
  approve,
  reject,
  deleteAutoTask,
  runAnalysis,
} from "../controllers/autoTaskController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All auto-task routes require authentication
router.use(protect);

router.get("/", getAutoTasks);
router.post("/run-analysis", runAnalysis);   // Trigger AI analysis on all wells
router.post("/:id/approve", approve);
router.post("/:id/reject", reject);
router.delete("/:id", deleteAutoTask);

export default router;