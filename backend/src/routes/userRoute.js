import express from "express";
import {
  createUser,
  getAllUsers,
  getUserByID,
  updateUser,
  deleteUser,
  loginUser,
  verifyRegistrationOTP,
  verifyLoginOtp,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/register", createUser);
router.post("/login", loginUser);
router.post("/verify-registration-otp", verifyRegistrationOTP); //Registartion OTP verification route
router.post("/verify-login-otp", verifyLoginOtp); //Login OTP verification route

router.get("/", getAllUsers);
router.get("/:id", getUserByID);

router.put("/:id", updateUser);

router.delete("/:id", deleteUser);

export default router;
