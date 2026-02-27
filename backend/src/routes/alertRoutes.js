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

import { authenticate } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", authenticate, getAllAlerts);
router.get("/:id", authenticate, getAlertDetails);
router.put("/:id/read", authenticate, markRead);

// Only officer or admin can create alerts
router.post(
  "/well/:wellId",
  authenticate,
  allowRoles("officer", "admin"),
  createAlertAndMaybeAutoTask
);

// Only admin can accept/reject
router.post(
  "/:id/accept",
  authenticate,
  allowRoles("admin"),
  acceptAlertAndCreateTask
);

router.post(
  "/:id/reject",
  authenticate,
  allowRoles("admin"),
  rejectAlertAndAutoTask
);

export default router;

