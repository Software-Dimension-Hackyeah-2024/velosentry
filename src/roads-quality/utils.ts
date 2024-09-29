import { Tags } from '../osrm-schema';
import { GOOD_QUALITY_ROAD_SURFACE, LOW_QUALITY_ROAD_SURFACE } from './config';

export { getStreetSegmentQualityCategory };
export type { RoadSegmentQuality };

type RoadSegmentQuality = -1 | 0 | 1;

function getStreetSegmentQualityCategory(tags?: Tags): RoadSegmentQuality {
  if (!tags) {
    return 0;
  }
  if (tags.highway) {
    if (LOW_QUALITY_ROAD_SURFACE.includes(tags.surface)) {
      return -1;
    }
    if (GOOD_QUALITY_ROAD_SURFACE.includes(tags.surface)) {
      return 1;
    }
  }
  return 0;
}
