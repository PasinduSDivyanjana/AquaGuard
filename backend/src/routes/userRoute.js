import express from "express";
import {
  createUser,
  getAllUsers,
  getUserByID,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";

const router = express.Router();

// ✅ Create User
router.post("/", createUser);

// ✅ Get All Users
router.get("/", getAllUsers);

// ✅ Get User By ID
router.get("/:id", getUserByID);

// ✅ Update User
router.put("/:id", updateUser);

// ✅ Delete User
router.delete("/:id", deleteUser);

export default router;
