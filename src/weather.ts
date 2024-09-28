import { fetchWeatherApi } from 'openmeteo';
import { Hono } from 'hono';

const url = 'https://api.open-meteo.com/v1/forecast';

// Helper function to form time ranges
const range = (start: number, stop: number, step: number) =>
  Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

export const weather = new Hono();

weather.get('/', async (c) => {
  // TODO: Get route from params
  const latitude = 50.061657;
  const longitude = 19.937096;

  const params = {
    hourly: ['temperature_2m', 'rain', 'snowfall', 'snow_depth', 'visibility'],
    timezone: 'Europe/London',
    latitude,
    longitude,
  };

  const responses = await fetchWeatherApi(url, params);

  // Process first location. Add a for-loop for multiple locations or weather models
  const response = responses[0];

  // Attributes for timezone and location
  const utcOffsetSeconds = response.utcOffsetSeconds();
  const timezone = response.timezone();
  const timezoneAbbreviation = response.timezoneAbbreviation();

  const hourly = response.hourly()!;

  // Note: The order of weather variables in the URL query and the indices below need to match!
  const weatherData = {
    hourly: {
      time: range(
        Number(hourly.time()),
        Number(hourly.timeEnd()),
        hourly.interval(),
      ).map((t) => new Date((t + utcOffsetSeconds) * 1000)),
      temperature2m: hourly.variables(0)!.valuesArray()!,
      rain: hourly.variables(1)!.valuesArray()!,
      snowfall: hourly.variables(2)!.valuesArray()!,
      snowDepth: hourly.variables(3)!.valuesArray()!,
      visibility: hourly.variables(4)!.valuesArray()!,
    },
  };

  // `weatherData` now contains a simple structure with arrays for datetime and weather data
  for (let i = 0; i < weatherData.hourly.time.length; i++) {
    console.log(
      weatherData.hourly.time[i].toISOString(),
      weatherData.hourly.temperature2m[i],
      weatherData.hourly.rain[i],
      weatherData.hourly.snowfall[i],
      weatherData.hourly.snowDepth[i],
      weatherData.hourly.visibility[i],
    );
  }

  return c.text('Sweater Weather');
});
