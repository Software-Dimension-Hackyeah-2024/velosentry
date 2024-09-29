import { Tags } from '../osrm-schema';
import { RouteSegment } from '../types';
import {
  DANGEROUS_TYPES_OF_ROAD,
  DANGEROUS_VELOCITY,
  SAFE_TYPES_OF_ROAD,
} from './config';

export { checkIfIntersectingWithDangerousRoad, getStreetSegmentSafetyCategory };
export { RoadSegmentSafety };

type RoadSegmentSafety = -1 | 0 | 1;

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
    secondSegmentSafetyCategory === -1 &&
    secondSegmentSafetyCategory < firstSegmentSafetyCategory
  );
}

function getStreetSegmentSafetyCategory(tags?: Tags): RoadSegmentSafety {
  if (!tags) {
    return 0;
  }
  if (tags.highway) {
    if (DANGEROUS_TYPES_OF_ROAD.includes(tags.highway)) {
      return -1;
    }
    if (SAFE_TYPES_OF_ROAD.includes(tags.highway)) {
      return 1;
    }
  }

  if (tags.maxspeed && tags.maxspeed > DANGEROUS_VELOCITY) {
    return -1;
  }

  return 0;
}
