import { FeatureCollection, Point } from 'geojson';
import { AccidentSeverity } from '../accidents/types';
import { centroid } from '@turf/turf';

export {mapClustersToCentroidPoints}

export interface ClusterData {
  points: FeatureCollection<Point>;
  severityCount: Record<AccidentSeverity, number>;
}

export interface ClusterMappedData {
  point: Point;
  severityCount: Record<AccidentSeverity, number>;
}

function mapClustersToCentroidPoints(
  clusters: Record<string, ClusterData>
): Record<string, ClusterMappedData> {
  const result: Record<string, { point: Point, severityCount: Record<AccidentSeverity, number> }> = {};

  for (const clusterKey in clusters) {
    if (clusters.hasOwnProperty(clusterKey)) {
      const cluster = clusters[clusterKey];


      const centerPoint = centroid(cluster.points);

      result[clusterKey] = {
        point: centerPoint.geometry as Point,
        severityCount: cluster.severityCount
      };
    }
  }

  return result;
}