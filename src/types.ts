import { Tags } from './osrm-schema';
import { RoadSegmentQuality } from './roads-quality/utils';
import { RoadSegmentSafety } from './roads-safety/utils';

export type { RouteSegment, Coords };

type RouteSegment = {
  startGeo: Coords;
  endGeo: Coords;
  tags?: Tags;
  safety: RoadSegmentSafety;
  quality: RoadSegmentQuality;
};

type Coords = {
  latitude: number;
  longitude: number;
};
