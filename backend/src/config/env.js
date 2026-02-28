/**
 * Environment config for external services
 */

export const env = {
  OPENWEATHER_BASE_URL: process.env.OPENWEATHER_BASE_URL || 'https://api.openweathermap.org/data/2.5',
  OPENWEATHER_API_KEY: process.env.OPENWEATHER_API_KEY || '',
};
