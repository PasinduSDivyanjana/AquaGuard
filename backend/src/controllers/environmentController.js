import { fetchWeather } from "../services/weatherService.js";

export const getWeather = async (req, res) => {
  const { lat, lon } = req.query;
  const { wellId } = req.params;

  const data = await fetchWeather(lat, lon, wellId);
  res.json(data);
};