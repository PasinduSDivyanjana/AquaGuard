import axios from "axios";
import WeatherCache from "../models/WeatherCache.js";

export const fetchWeather = async (lat, lon, wellId) => {
  const cache = await WeatherCache.findOne({ well: wellId });

  if (cache && Date.now() - cache.fetchedAt < 3600000) {
    return cache;
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`;

  const { data } = await axios.get(url);

  const weatherData = {
    well: wellId,
    temperature: data.main.temp,
    humidity: data.main.humidity,
    rainfall: data.rain ? data.rain["1h"] : 0,
    fetchedAt: new Date(),
  };

  await WeatherCache.findOneAndUpdate({ well: wellId }, weatherData, {
    upsert: true,
  });

  return weatherData;
};