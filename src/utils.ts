import { NodeProps, RouteElementsResponse, Tag } from './osrm-schema';

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

function getProcessedRouteFromElements(
  elements: RouteElementsResponse['elements'],
  nodeIds: number[],
): RouteSegment[] {
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

  while (i < nodeIds.length - 1) {
    for (const way of ways) {
      if (
        way.nodes.includes(nodeIds[i]) &&
        way.nodes.includes(nodeIds[i + 1])
      ) {
        processedRoute.push({
          startGeo: {
            lat: nodesMap.get(nodeIds[i])?.lat ?? 0,
            lon: nodesMap.get(nodeIds[i])?.lon ?? 0,
          },
          endGeo: {
            lat: nodesMap.get(nodeIds[i + 1])?.lat ?? 0,
            lon: nodesMap.get(nodeIds[i + 1])?.lon ?? 0,
          },
          tags: way.tags,
        });
        i++;
        break;
      }
    }
  }
  return processedRoute;
}

type RouteSegment = {
  startGeo: {
    lat: number;
    lon: number;
  };
  endGeo: {
    lat: number;
    lon: number;
  };
  tags: Tag[];
};
