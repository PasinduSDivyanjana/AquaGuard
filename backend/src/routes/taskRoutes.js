import express from "express";
import {
  getTasks,
  createTask,
  getTaskDetails,
  updateTask,
  deleteTask
} from "../controllers/taskController.js";

const router = express.Router();

router.get("/", getTasks);
router.post("/", createTask);
router.get("/:id", getTaskDetails);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;