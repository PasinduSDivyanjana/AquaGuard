import express from "express";
import {
  createUser,
  getAllUsers,
  getUserByID,
  updateUser,
  deleteUser,
  loginUser,
  verifyOTP,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/register", createUser);
router.post("/login", loginUser);
router.post("/verify-otp", verifyOTP);

router.get("/", getAllUsers);

router.get("/:id", getUserByID);

router.put("/:id", updateUser);

router.delete("/:id", deleteUser);

export default router;
