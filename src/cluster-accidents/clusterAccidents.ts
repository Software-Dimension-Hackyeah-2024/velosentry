import { Accident, AccidentSeverity } from '../accidents/types';
import { clustersDbscan, featureCollection, point } from '@turf/turf';
import { Feature, FeatureCollection, Point } from 'geojson';
import { mapClustersToCentroidPoints } from './mapClustersToCentroidPoints';

export {accidentToPoint,clusterAccidents}

function accidentToPoint(accident: Accident): Feature<Point> {
  return point([accident.long, accident.lat], {
    id: accident.id,
    severity: accident.severity
  });
}

function clusterAccidents(
  accidents: Accident[],
  clusterDistance: number
): Record<string, { point: Point, severityCount: Record<AccidentSeverity, number> }> {

  let counter = 1000;

  const points = featureCollection(accidents.map(accidentToPoint));

  const clusteredPoints = clustersDbscan(points, clusterDistance, { units: 'meters' });

  console.log(JSON.stringify(clusteredPoints,null, 2))

  const clusters: Record<string, { points: FeatureCollection<Point>, severityCount: Record<AccidentSeverity, number> }> = {};

  clusteredPoints.features.forEach((point) => {
    const clusterId = point.properties?.cluster;

    if (clusterId !== undefined) {
      if (!clusters[clusterId]) {
        clusters[clusterId] = {
          points: featureCollection([]),
          severityCount: { MINOR: 0, SERIOUS: 0, FATAL: 0 }
        };
      }

      clusters[clusterId].points.features.push(point);

      const severity = point.properties?.severity as AccidentSeverity;
      clusters[clusterId].severityCount[severity]++;

      return;
    }

    clusters[counter] = {
      points: featureCollection([]),
      severityCount: { MINOR: 0, SERIOUS: 0, FATAL: 0 }
    };
    clusters[counter].points.features.push(point);

    const severity = point.properties?.severity as AccidentSeverity;
    clusters[counter].severityCount[severity]++;
    counter++;
  });



  return mapClustersToCentroidPoints(clusters);
}

