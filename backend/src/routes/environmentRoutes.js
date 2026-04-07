import express from "express";
import { getWeather, getAllWells } from "../controllers/environmentController.js";

const router = express.Router();

router.get("/wells", getAllWells);
router.get("/weather/:wellId", getWeather);

export default router;