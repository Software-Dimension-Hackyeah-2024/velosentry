import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { readFile } from 'node:fs/promises';
import { fetchRoutes } from './osrm-api';
import type { RouteResponse } from './osrm-schema';

/**
 * Using a cached API response saved to a file, instead of hitting the real API.
 */
const MOCK_OSRM_API = true;

const app = new Hono();

// CORS configuration
app.use(
  '*',
  cors({
    origin: '*', // Allow all origins
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
    allowHeaders: ['Content-Type', 'Authorization'], // Allowed headers in requests
    exposeHeaders: ['Content-Length', 'X-Response-Time'], // Headers exposed to the client
    credentials: true, // Include credentials in the response
    maxAge: 86400, // Cache preflight response for 1 day (in seconds)
  }),
);

app.get('/', async (c) => {
  let result: RouteResponse;

  if (MOCK_OSRM_API) {
    result = JSON.parse(await readFile('./osrm-response-02.json', 'utf-8'));
  } else {
    result = await fetchRoutes({
      points: [
        [19.937096,50.061657],
        [19.921474,50.045345],
      ],
    });
  }

  return c.json(result);
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
