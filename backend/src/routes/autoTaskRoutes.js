import express from "express";
import {
  getAutoTasks,
  approve,
  reject,
  deleteAutoTask,
} from "../controllers/autoTaskController.js";

const router = express.Router();

router.get("/", getAutoTasks);
router.post("/:id/approve", approve);
router.post("/:id/reject", reject);
router.delete("/:id", deleteAutoTask);

export default router;