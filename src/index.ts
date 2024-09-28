import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { readFile } from 'node:fs/promises';
import { fetchRoutes } from './osrm-api';
import type { RouteResponse } from './osrm-schema';

const checkIfIsDangerousIntersection = (intersection: any): boolean => {
  return !!intersection;
};

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

interface RouteResult {
  route: RouteResponse['routes'][0];
  safety: number;
}

type ResultType = RouteResult[];

app.get('/', async (c) => {
  let data: RouteResponse;
  const result: ResultType = [];

  if (MOCK_OSRM_API) {
    data = JSON.parse(await readFile('./osrm-response-01.json', 'utf-8'));
  } else {
    data = await fetchRoutes({
      points: [
        [19.753417968750004, 50.17689812200107],
        [20.843811035156254, 50.88917404890332],
      ],
    });
  }

  const { routes } = data;
  for (let route of routes) {
    // dangerous intersections
    let dangerousIntersectionsCounter = 0;
    for (let leg of route.legs) {
      for (let step of leg.steps) {
        // check intersections
        for (let intersection of step.intersections) {
          if (checkIfIsDangerousIntersection(intersection))
            dangerousIntersectionsCounter++;
        }
      }
    }

    // other factors

    // final calculation
    const routeSafety = 7;
    result.push({ route, safety: routeSafety });
  }

  return c.json(result);
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
