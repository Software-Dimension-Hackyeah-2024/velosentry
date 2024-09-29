import { ClusterMappedData } from './mapClustersToCentroidPoints';
import { lineString, nearestPointOnLine } from '@turf/turf';
import { Point } from 'geojson';

export function moveClusterAccidentsToLine(  clusters: Record<string, ClusterMappedData>,
                                      lineCoordinates: [number, number][]):Record<string, ClusterMappedData>{

  const line = lineString(lineCoordinates);

  const result: Record<string, ClusterMappedData> = {};

  for (const clusterKey in clusters) {
    if (clusters.hasOwnProperty(clusterKey)) {
      const cluster = clusters[clusterKey];

      const nearestPoint = nearestPointOnLine(line, cluster.point);

      result[clusterKey] = {
        point: nearestPoint.geometry as Point,
        severityCount: cluster.severityCount
      };
    }
  }

  return result;
}