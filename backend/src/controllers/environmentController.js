import Well from "../models/Well.js";
import { getWeatherForWell } from "../services/weatherService.js";

// Get all wells
export const getAllWells = async (req, res) => {
  try {
    const wells = await Well.find();
    return res.json(wells);
  } catch (error) {
    console.error("Error fetching wells:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get weather for a specific well
export const getWeather = async (req, res) => {
  try {
    const { wellId } = req.params;

    // getWeatherForWell handles well lookup, coordinate extraction, and API call
    const weatherData = await getWeatherForWell(wellId);

    return res.json(weatherData);
  } catch (error) {
    console.error("Error fetching weather:", error);
    const status = error.statusCode || 500;
    return res.status(status).json({ message: error.message || "Server error" });
  }
};