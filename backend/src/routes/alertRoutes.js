import express from "express";
import {
  getAllAlerts,
  getAlertDetails,
  markRead,
} from "../controllers/alertController.js";

const router = express.Router();

router.get("/", getAllAlerts);
router.get("/:id", getAlertDetails);
router.put("/:id/read", markRead);

export default router;