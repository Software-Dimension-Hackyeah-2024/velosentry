import { RoadSmoothness, Tags } from '../osrm-schema';
import { GOOD_QUALITY_ROAD_SURFACE, LOW_QUALITY_ROAD_SURFACE } from './config';

export { getStreetSegmentQualityCategory };

function getStreetSegmentQualityCategory(tags?: Tags): RoadSmoothness {
  if (!tags) {
    return 'unknown';
  }

  if (tags.smoothness) {
    return tags.smoothness;
  }

  if (tags.surface) {
    if (GOOD_QUALITY_ROAD_SURFACE.includes(tags.surface)) {
      return 'good';
    }
    if (LOW_QUALITY_ROAD_SURFACE.includes(tags.surface)) {
      return 'bad';
    }
  }
  return 'unknown';
}
