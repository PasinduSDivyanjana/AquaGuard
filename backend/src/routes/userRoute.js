import express from "express";
import {
  createUser,
  getAllUsers,
  getUserByID,
  updateUser,
  deleteUser,
  loginUser,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/", createUser);
router.post("/login", loginUser);

router.get("/", getAllUsers);

router.get("/:id", getUserByID);

router.put("/:id", updateUser);

router.delete("/:id", deleteUser);

export default router;
