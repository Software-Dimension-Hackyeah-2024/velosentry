import { RouteElementsResponse } from './osrm-schema';

export { getRouteElements };

async function getRouteElements(
  nodeIds: number[],
): Promise<RouteElementsResponse> {
  const url = `https://overpass-api.de/api/interpreter?data=[out:json][timeout:25];(node(id:${nodeIds.join(
    ',',
  )});way["highway"](bn););out%20body;out%20skel%20qt;`;

  console.log(url);

  const response = await fetch(url);

  if (!response.ok) {
    console.log('Error while fetching route elements');
  }

  const elements: RouteElementsResponse = await response.json();

  return elements;
}
