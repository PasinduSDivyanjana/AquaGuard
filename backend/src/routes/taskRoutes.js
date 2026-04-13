import express from "express";
import {
  getTasks,
  createTask,
  getTaskDetails,
  updateTask,
  deleteTask
} from "../controllers/taskController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All task routes require authentication
router.use(protect);

router.get("/", getTasks);
router.post("/", createTask);
router.get("/:id", getTaskDetails);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;