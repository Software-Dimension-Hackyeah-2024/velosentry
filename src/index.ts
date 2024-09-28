import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { readFile } from 'node:fs/promises';
import { fetchRoutes } from './osrm-api';
import type { RouteElementsResponse, RouteResponse } from './osrm-schema';
import { getProcessedRouteFromElements, getRouteElements } from './utils';
import { Coords } from './types';

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
  coordinates: Coords[];
  elements: RouteElementsResponse['elements'];
  dangerousIntersectionsCoordinates: Coords[];
}

type ResultType = RouteResult[];

app.get('/', async (c) => {
  return c.json({ message: 'Hello, cyclist!' });
});

app.get('/route', async (c) => {
  let data: RouteResponse;
  let result: RouteResult;

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
  for (const route of routes) {
  }

  const route = routes[0];
  const nodeIds = route.legs[0].annotation.nodes;
  const elements = await getRouteElements(nodeIds);

  const { processedRoute, dangerousIntersectionsCoordinates } =
    getProcessedRouteFromElements(elements, nodeIds);

  const coordinates = processedRoute.reduce(
    (acc, curr) => [...acc, curr.endGeo],
    [processedRoute[0].startGeo],
  );

  const routeSafety = 7;
  result = {
    route,
    safety: routeSafety,
    coordinates,
    elements,
    dangerousIntersectionsCoordinates,
  };

  return c.json(result);
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
