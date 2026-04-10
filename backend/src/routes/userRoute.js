import express from "express";
import User from "../models/User.js";

const router = express.Router();

// GET all users (basic info for selector)
router.get("/", async (req, res) => {
  try {
    const users = await User.find({ isVerified: true })
      .select("firstName lastName email role")
      .sort({ firstName: 1 });
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
