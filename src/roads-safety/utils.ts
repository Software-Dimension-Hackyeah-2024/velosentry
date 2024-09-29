import { distance } from '@turf/turf';
import { Tags } from '../osrm-schema';
import { Coords, RouteSegment } from '../types';
import {
  DANGEROUS_TYPES_OF_ROAD,
  DANGEROUS_VELOCITY,
  SAFE_TYPES_OF_ROAD,
} from './config';

export {
  checkIfIntersectingWithDangerousRoad,
  getStreetSegmentSafetyCategory,
  calculateOverallRouteSafety,
};
export type { RouteSegmentType };

type RouteSegmentType = 'Designated' | 'Low speed' | 'High speed' | 'Unknown';

function checkIfIntersectingWithDangerousRoad(
  firstSegment: RouteSegment,
  secondSegment: RouteSegment,
): boolean {
  const firstSegmentSafetyCategory = getStreetSegmentSafetyCategory(
    firstSegment.tags,
  );
  const secondSegmentSafetyCategory = getStreetSegmentSafetyCategory(
    secondSegment.tags,
  );

  return (
    secondSegmentSafetyCategory === 'High speed' &&
    secondSegmentSafetyCategory < firstSegmentSafetyCategory
  );
}

function getStreetSegmentSafetyCategory(tags?: Tags): RouteSegmentType {
  if (!tags) {
    return 'Unknown';
  }
  if (tags.highway) {
    if (DANGEROUS_TYPES_OF_ROAD.includes(tags.highway)) {
      return 'High speed';
    }
    if (SAFE_TYPES_OF_ROAD.includes(tags.highway)) {
      return 'Designated';
    }
  }

  if (tags.maxspeed && tags.maxspeed > DANGEROUS_VELOCITY) {
    return 'High speed';
  }

  return 'Low speed';
}

function calculateOverallRouteSafety(
  dangerousIntersections: Coords[],
  route: RouteSegment[],
  distance: number,
): number {
  const weightsSum = route.reduce((acc, curr) => acc + curr.weight, 0);
  const weightedScores = route.map(
    (segment) => mapRouteTypeToScore(segment.safety) * segment.weight,
  );

  const dangerousIntersectionsPenalty = Math.ceil(
    (dangerousIntersections.length / distance) * 1000 * 5,
  );

  return (
    (weightedScores.reduce((acc, curr) => acc + curr, 0) / weightsSum) * 100 -
    dangerousIntersectionsPenalty
  );
}

function mapRouteTypeToScore(routeType: RouteSegmentType): number {
  switch (routeType) {
    case 'Designated':
      return 1;
    case 'Unknown':
      return 0.5;
    case 'Low speed':
      return 0.3;
    case 'High speed':
      return 0;
  }
}
