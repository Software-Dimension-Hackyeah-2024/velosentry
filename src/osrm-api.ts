import { RouteResponse } from './osrm-schema';

export type FetchRouteOptions = {
  points: [number, number][];
};

const ROUTE_API = 'https://routing.openstreetmap.de/routed-bike/route';

export async function fetchRoutes(options: FetchRouteOptions) {
  const { points } = options;

  const coordinatesStr = points.map(([lon, lat]) => `${lon},${lat}`).join(';');

  console.log(`${ROUTE_API}/v1/driving/${coordinatesStr}?overview=false&alternatives=true&steps=true&geometries=geojson&annotations=nodes`);
  try {
    const result = await fetch(
      `${ROUTE_API}/v1/driving/${coordinatesStr}?overview=false&alternatives=true&steps=true&geometries=geojson&annotations=nodes`,
    ).then((r) =>{ console.log(r); return r.json();});
 
    return RouteResponse.parse(result);

  }catch(e){
    console.error(e)
  }

}
