import { RoadSmoothness, Tags } from './osrm-schema';
import { RouteSegmentType } from './roads-safety/utils';

export type { RouteSegment, Coords };

type RouteSegment = {
  startGeo: Coords;
  endGeo: Coords;
  tags?: Tags;
  safety: RouteSegmentType;
  quality: RoadSmoothness;
  weight: number;
};

type Coords = {
  latitude: number;
  longitude: number;
};
