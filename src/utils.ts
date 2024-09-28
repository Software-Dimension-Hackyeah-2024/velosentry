import { Nodes, type Node } from './osrm-schema';
import type { RouteElementsResponse } from './osrm-schema';

export { getRouteElements, getProcessedRouteFromElements };

async function getRouteElements(
  nodeIds: number[],
): Promise<RouteElementsResponse['elements']> {
  const url = `https://overpass-api.de/api/interpreter?data=[out:json][timeout:25];(node(id:${nodeIds.join(
    ',',
  )});way["highway"](bn););out%20body;out%20skel%20qt;`;

  const response = await fetch(url);
  const elements: RouteElementsResponse = await response.json();

  return elements.elements;
}

export async function getDetailsForNodeIds(nodeIds: number[]): Promise<Node[]> {
  const url = new URL('https://overpass-api.de/api/interpreter');

  const nodeIdsString = nodeIds.join(',');

  url.searchParams.set(
    'data',
    `\
[out:json][timeout:25];
node(id:${nodeIdsString});
out body;
`,
  );

  return Nodes.parse((await fetch(url).then((r) => r.json())).elements);
}

function getProcessedRouteFromElements(
  elements: RouteElementsResponse['elements'],
) {
  const ways = elements.filter((element) => element.type === 'way');
  const nodes = elements.filter((element) => element.type === 'node');
  const processedRouteNodes = [];
}
