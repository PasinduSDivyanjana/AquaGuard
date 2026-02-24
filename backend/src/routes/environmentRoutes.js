import express from "express";
import { getWeather } from "../controllers/environmentController.js";

const router = express.Router();

router.get("/weather/:wellId", getWeather);

export default router;