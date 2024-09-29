import { Tags } from '../osrm-schema';
import { RouteSegment } from '../types';
import {
  DANGEROUS_TYPES_OF_ROAD,
  DANGEROUS_VELOCITY,
  SAFE_TYPES_OF_ROAD,
} from './config';

export { checkIfIntersectingWithDangerousRoad, getStreetSegmentSafetyCategory };
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
