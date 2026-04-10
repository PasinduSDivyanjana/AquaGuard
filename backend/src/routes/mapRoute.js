import express from "express";
import Well from "../models/Well.js";

const router = express.Router();

// GET all wells
router.get("/", async (req, res) => {
  try {
    const wells = await Well.find().select("name location status");
    res.status(200).json({ success: true, data: wells });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;