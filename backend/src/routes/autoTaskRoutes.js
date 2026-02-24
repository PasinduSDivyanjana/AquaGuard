import express from "express";
import {
  getAutoTasks,
  approve,
  reject,
} from "../controllers/autoTaskController.js";

const router = express.Router();

router.get("/", getAutoTasks);
router.post("/:id/approve", approve);
router.post("/:id/reject", reject);

//update delete funtion

export default router;