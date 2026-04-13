
import Alert from "../models/Alert.js";
import AutoTask from "../models/AutoTask.js";
import { getWeatherForWell } from "./weatherService.js";

// Threshold values
const TEMP_THRESHOLD = 37; // °C
const RAINFALL_THRESHOLD = 20; // mm

// Create alert only (auto task creation handled in autoTaskController)
export const createAlert = async (alertData) => {
  return await Alert.create(alertData);
};

// Periodically check weather and create alert if needed (to be called by a scheduler/cron)
export const checkWeatherAndCreateAlert = async (wellId) => {
  const weatherData = await getWeatherForWell(wellId);
  if (!weatherData) return null;

  const temp = weatherData.summary.temperature;
  const rainfall = weatherData.summary.rainfallMm;

  if (temp > TEMP_THRESHOLD || rainfall > RAINFALL_THRESHOLD) {
    return await createAlert({
      well: weatherData.wellId,
      type: "Weather",
      message: `Extreme weather detected: Temp ${temp}°C, Rainfall ${rainfall}mm`,
      severity: temp > TEMP_THRESHOLD ? "high" : "medium",
    });
  }
  return null;
};

// Export helper to check if alert should trigger auto task
export const shouldTriggerAutoTask = (alert) => {
  // Always create an auto task when an alert is generated
  return !!alert;
};