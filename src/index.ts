import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { readFile } from 'node:fs/promises';
import { fetchRoutes } from './osrm-api';
import type { RouteElementsResponse, RouteResponse } from './osrm-schema';
import { getProcessedRouteFromElements, getRouteElements } from './utils';
import { fetchAccidents } from './accidents/fetchAccidents';
import { Accident } from './accidents/types';
import { accidentsQuerySchema } from './accidents/querySchema';
import { Coords, RouteSegment } from './types';

/**
 * Using a cached API response saved to a file, instead of hitting the real API.
 */
const MOCK_OSRM_API = false;

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
  processedRoute: RouteSegment[];
  dangerousIntersectionsCoordinates: Coords[];
}

type ResultType = RouteResult[];

app.get('/', async (c) => {
  return c.json({ message: 'Hello, cyclist!' });
});

app.get('/route', async (c) => {
  let data: RouteResponse;
  let result: ResultType = [];

  if (MOCK_OSRM_API) {
    data = JSON.parse(await readFile('./osrm-response-02.json', 'utf-8'));
  } else {
    const startCoords = c.req.query('startCoords')?.split(',').map(Number);
    const endCoords = c.req.query('endCoords')?.split(',').map(Number);

    if (
      !startCoords ||
      !endCoords ||
      startCoords.length !== 2 ||
      endCoords.length !== 2
    ) {
      return c.json(result);
    }
    data = await fetchRoutes({
      points: [startCoords as [number, number], endCoords as [number, number]],
    });
    console.log('TEST');
  }
  console.log(data);

  const { routes } = data;
  for (const route of routes) {
    const nodeIds = route.legs[0].annotation.nodes;
    const elements = await getRouteElements(nodeIds);

    const { processedRoute, dangerousIntersectionsCoordinates } =
      getProcessedRouteFromElements(elements, nodeIds);

    const coordinates = processedRoute.reduce(
      (acc, curr) => [...acc, curr.endGeo],
      [processedRoute[0].startGeo],
    );

    const routeSafety = 7;
    result.push({
      route,
      safety: routeSafety,
      coordinates,
      processedRoute,
      dangerousIntersectionsCoordinates,
    });
  }

  console.log('RES', result);

  return c.json(result);
});

app.get('/accidents', async (c) => {
  const { coords, maxDistance } = accidentsQuerySchema.parse({
    coords: c.req.query('coords'),
    maxDistance: c.req.query('maxDistance')
      ? Number(c.req.query('maxDistance'))
      : 200,
  });

  const parsedCoords = coords.split(';').map((pair) => {
    const [lng, lat] = pair.split(',').map(Number); // Dzielimy każdą parę współrzędnych i konwertujemy je na liczby
    return [lng, lat] as [number, number];
  });
  let result: Accident[];

  result = await fetchAccidents({
    points: parsedCoords,
    maxDistance: maxDistance,
  });

  return c.json(result);
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
