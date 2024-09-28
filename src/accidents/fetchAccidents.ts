import { fetchAPIAccidents } from './obserwatoriumbrd-api';
import { transformAccidents } from './transform';
import { filterByDistance } from './filterByDistance';

export type FetchRouteOptions = {
  points: [number, number][];
  maxDistance: number;
};

export async function fetchAccidents({points,maxDistance}:FetchRouteOptions) {
  const apiResponse = await fetchAPIAccidents({points})
  const accidents = transformAccidents(apiResponse)
  return  filterByDistance(points,accidents,maxDistance);
}