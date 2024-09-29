import { NodeProps, RouteElementsResponse, Nodes } from './osrm-schema';
import { Coords, RouteSegment } from './types';
import {
  checkIfIntersectingWithDangerousRoad,
  getStreetSegmentSafetyCategory,
  RouteSegmentType,
} from './roads-safety/utils';
import { getStreetSegmentQualityCategory } from './roads-quality/utils';

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

export async function getDetailsForNodeIds(
  nodeIds: number[],
): Promise<NodeProps[]> {
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
  nodeIds: number[],
  weights: number[],
): {
  processedRoute: RouteSegment[];
  dangerousIntersectionsCoordinates: Coords[];
} {
  const ways = elements.filter((element) => element.type === 'way');
  const nodes: NodeProps[] = elements.filter(
    (element) => element.type === 'node',
  );
  const nodesMap = new Map<number, NodeProps>();

  for (const node of nodes) {
    nodesMap.set(node.id, node);
  }

  let i = 0;
  const processedRoute: RouteSegment[] = [];
  const dangerousIntersections: Coords[] = [];

  while (i < nodeIds.length - 1) {
    for (const way of ways) {
      if (
        way.nodes.includes(nodeIds[i]) &&
        way.nodes.includes(nodeIds[i + 1])
      ) {
        processedRoute.push({
          startGeo: {
            latitude: nodesMap.get(nodeIds[i])?.lat ?? 0,
            longitude: nodesMap.get(nodeIds[i])?.lon ?? 0,
          },
          endGeo: {
            latitude: nodesMap.get(nodeIds[i + 1])?.lat ?? 0,
            longitude: nodesMap.get(nodeIds[i + 1])?.lon ?? 0,
          },
          tags: way.tags,
          safety: getStreetSegmentSafetyCategory(way.tags),
          quality: getStreetSegmentQualityCategory(way.tags),
          weight: weights[i],
        });

        if (
          processedRoute.length > 1 &&
          checkIfIntersectingWithDangerousRoad(
            processedRoute[processedRoute.length - 2],
            processedRoute[processedRoute.length - 1],
          )
        ) {
          dangerousIntersections.push(
            processedRoute[processedRoute.length - 1].startGeo,
          );
        }
        i++;
        break;
      }
    }
  }
  return {
    processedRoute: processedRoute,
    dangerousIntersectionsCoordinates: dangerousIntersections,
  };
}
