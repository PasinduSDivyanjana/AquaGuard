import express from "express";
import {
  createUser,
  getAllUsers,
  getUserByID,
  updateUser,
  deleteUser,
  verifyRegistrationOTP,
  getProfile,
  adminCreateUser,
} from "../controllers/userController.js";
import {
  loginUser,
  verifyLoginOtp,
  forgotPassword,
  resetPassword,
  updatePassword,
} from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", createUser); //Registration route
router.post("/login", loginUser); //Login route
router.post("/verify-registration-otp", verifyRegistrationOTP); //Registartion OTP verification route
router.post("/verify-login-otp", verifyLoginOtp); //Login OTP verification route
router.post("/forgot-password", forgotPassword); // Forgot password — send OTP & link
router.post("/reset-password", resetPassword); // Reset password — using OTP or token

router.get("/", getAllUsers); // Get all users (Admin only)
router.post("/admin/create", protect, adminCreateUser); // Admin-create pre-verified user
router.get("/profile", protect, getProfile); // Get logged-in user's profile
router.get("/:id", protect, getUserByID); // Get user by ID (Admin or self)

router.put("/change-password", protect, updatePassword); //Update password by User
router.put("/:id", updateUser); // Update user by ID (Admin or self)

router.delete("/:id", deleteUser); // Delete user by ID (Admin or self)

export default router;
