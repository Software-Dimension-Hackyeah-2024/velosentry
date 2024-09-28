import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { readFile } from 'node:fs/promises';
import { fetchRoutes } from './osrm-api';
import type { RouteElementsResponse, RouteResponse } from './osrm-schema';
import { getRouteElements } from './utils';

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
  coordinates: { latitude: number; longitude: number }[];
  elements: RouteElementsResponse;
}

type ResultType = RouteResult[];

app.get('/', async (c) => {
  let data: RouteResponse;
  const result: ResultType = [];

  if (MOCK_OSRM_API) {
    data = JSON.parse(await readFile('./osrm-response-02.json', 'utf-8'));
  } else {
    data = await fetchRoutes({
      points: [
        [19.937096, 50.061657],
        [19.921474, 50.045345],
      ],
    });
  }

  const { routes } = data;
  for (let route of routes) {
    // dangerous intersections
    let dangerousIntersectionsCounter = 0;
    const coordinates = [];
    for (let leg of route.legs) {
      for (let step of leg.steps) {
        // add coords
        for (let coords of step.geometry.coordinates)
          coordinates.push({
            longitude: coords[0],
            latitude: coords[1],
          });

        // check intersections
        for (let intersection of step.intersections) {
          if (checkIfIsDangerousIntersection(intersection))
            dangerousIntersectionsCounter++;
        }
      }
    }

    // other factors
    const elements = await getRouteElements(route.legs[0].annotation.nodes);

    // final calculation

    const routeSafety = 7;
    result.push({ route, safety: routeSafety, coordinates, elements });
  }

  return c.json(result);
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
