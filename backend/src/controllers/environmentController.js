// import { fetchWeather } from "../services/weatherService.js";

// export const getWeather = async (req, res) => {
//   const { wellId } = req.params;
  

//   const data = await fetchWeather(lat, lon, wellId);
//   res.json(data);
// };

import { Well } from "../models/Well.js";
import { fetchWeather } from "../services/weatherService.js";

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

    // Fetch the well from DB
    const well = await Well.findById(wellId);

    if (!well) {
      return res.status(404).json({ message: "Well not found" });
    }

    // Extract lat and lon from the well document
    const { lat, lng } = well.location;

    const lon = lng; // OpenWeatherMap uses 'lon' instead of 'lng'

    // Call your weather service
    const weatherData = await fetchWeather(lat, lon, wellId);

    return res.json(weatherData);
  } catch (error) {
    console.error("Error fetching weather:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};