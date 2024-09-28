import { Tags } from './osrm-schema';

export type { RouteSegment, Coords, RoadSegmentSafety, RoadSegmentQuality };

type RouteSegment = {
  startGeo: Coords;
  endGeo: Coords;
  tags?: Tags;
};

type Coords = {
  latitude: number;
  longitude: number;
};

type RoadSegmentSafety = -1 | 0 | 1;
type RoadSegmentQuality = -1 | 0 | 1;
