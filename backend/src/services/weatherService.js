import { env } from '../config/env.js';
import WellModel from '../models/Well.js';

const buildWeatherUrl = (lat, lng) => {
  const base = env.OPENWEATHER_BASE_URL.replace(/\/$/, '');
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    units: 'metric',
    appid: env.OPENWEATHER_API_KEY || '',
  });
  return `${base}/weather?${params.toString()}`;
};

export const getWeatherForWell = async (wellId) => {
  if (!env.OPENWEATHER_API_KEY) {
    const error = new Error('OpenWeather API key is not configured');
    error.statusCode = 500;
    throw error;
  }

  const well = await WellModel.findById(wellId).lean();
  if (!well) {
    const notFound = new Error('Well not found');
    notFound.statusCode = 404;
    throw notFound;
  }

  const { lat, lng } = well.location || {};
  if (lat == null || lng == null) {
    const bad = new Error('Well does not have valid coordinates');
    bad.statusCode = 400;
    throw bad;
  }

  const url = buildWeatherUrl(lat, lng);
  const response = await fetch(url);

  if (!response.ok) {
    const error = new Error('Failed to fetch weather data from OpenWeather');
    error.statusCode = 502;
    throw error;
  }

  const data = await response.json();

  const rainfall =
    (data.rain && (data.rain['1h'] || data.rain['3h'])) != null
      ? data.rain['1h'] || data.rain['3h']
      : 0;

  let waterLevelTrend = 'stable';
  if (rainfall > 10) waterLevelTrend = 'rising';
  else if (rainfall < 1) waterLevelTrend = 'falling';

  return {
    wellId: well._id,
    wellName: well.name,
    coordinates: { lat, lng },
    source: 'OpenWeather',
    raw: data,
    summary: {
      temperature: data.main?.temp,
      feelsLike: data.main?.feels_like,
      humidity: data.main?.humidity,
      weather: data.weather?.[0]?.description,
      rainfallMm: rainfall,
      waterLevelTrend,
    },
  };
};

