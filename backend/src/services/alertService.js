
import Alert from "../models/Alert.js";
import AutoTask from "../models/AutoTask.js";
import { Well } from "../models/Well.js";

// Helper: Check if weather/risk condition triggers an alert (example: high temp or rainfall)
import { fetchWeather } from "./weatherService.js";

// Example: threshold values (customize as needed)
const TEMP_THRESHOLD = 310; // Kelvin (about 37°C)
const RAINFALL_THRESHOLD = 20; // mm

// Create alert only (auto task creation handled in autoTaskController)
export const createAlert = async (alertData) => {
  return await Alert.create(alertData);
};

// Periodically check weather and create alert if needed (to be called by a scheduler/cron)
export const checkWeatherAndCreateAlert = async (wellId) => {
  const well = await Well.findById(wellId);
  if (!well) return null;
  const weather = await fetchWeather(well.location.lat, well.location.lng, well._id);
  if (weather.temperature > TEMP_THRESHOLD || weather.rainfall > RAINFALL_THRESHOLD) {
    // Create alert
    return await createAlert({
      well: well._id,
      type: "Weather",
      message: `Extreme weather detected: Temp ${weather.temperature}K, Rainfall ${weather.rainfall}mm`,
      severity: weather.temperature > TEMP_THRESHOLD ? "high" : "medium",
    });
  }
  return null;
};

// Export helper to check if alert should trigger auto task
export const shouldTriggerAutoTask = (alert) => {
  return alert.severity === "high" || alert.severity === "critical";
};