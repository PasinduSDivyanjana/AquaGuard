// import express from "express";
// import {
//   getAllAlerts,
//   getAlertDetails,
//   markRead,
//   createAlertAndMaybeAutoTask,
//   acceptAlertAndCreateTask,
//   rejectAlertAndAutoTask,
// } from "../controllers/alertController.js";

// const router = express.Router();

// router.get("/",getAllAlerts);
// router.get("/:id", getAlertDetails);
// router.put("/:id/read", markRead);
// router.post("/well/:wellId", createAlertAndMaybeAutoTask);
// router.post("/:id/accept", acceptAlertAndCreateTask);
// router.post("/:id/reject", rejectAlertAndAutoTask);

// export default router;

import express from "express";
import {
  getAllAlerts,
  getAlertDetails,
  markRead,
  createAlertAndMaybeAutoTask,
  acceptAlertAndCreateTask,
  rejectAlertAndAutoTask,
} from "../controllers/alertController.js";

import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getAllAlerts);
router.get("/:id", protect, getAlertDetails);
router.put("/:id/read", protect, markRead);

// Only officer or admin can create alerts
router.post("/well/:wellId", protect, createAlertAndMaybeAutoTask);

// Only admin can accept/reject
router.post("/:id/accept", protect, acceptAlertAndCreateTask);

router.post("/:id/reject", protect, rejectAlertAndAutoTask);

export default router;
