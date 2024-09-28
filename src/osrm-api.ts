import { RouteResponse } from './osrm-schema';

export type FetchRouteOptions = {
  points: [number, number][];
};

const ROUTE_API = 'http://router.project-osrm.org/route';

export async function fetchRoutes(options: FetchRouteOptions) {
  const { points } = options;

  const coordinatesStr = points.map(([lon, lat]) => `${lon},${lat}`).join(';');

  const result = await fetch(
    `${ROUTE_API}/v1/bike/${coordinatesStr}?overview=false&geometries=geojson&steps=true&alternatives=true`,
  ).then((r) => r.json());

  return RouteResponse.parse(result);
}
