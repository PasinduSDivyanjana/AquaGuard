import express from "express";
import {
  getAllAlerts,
  getAlertDetails,
  markRead,
  createAlertAndMaybeAutoTask,
  acceptAlertAndCreateTask,
  rejectAlertAndAutoTask,
} from "../controllers/alertController.js";

const router = express.Router();


router.get("/",getAllAlerts);
router.get("/:id", getAlertDetails);
router.put("/:id/read", markRead);
router.post("/well/:wellId", createAlertAndMaybeAutoTask);
router.post("/:id/accept", acceptAlertAndCreateTask);
router.post("/:id/reject", rejectAlertAndAutoTask);

export default router;