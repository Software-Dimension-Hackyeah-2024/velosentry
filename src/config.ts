import { Tags } from './osrm-schema';

export { DANGEROUS_TYPES_OF_ROAD, DANGEROUS_VELOCITY };

const DANGEROUS_TYPES_OF_ROAD: Tags['highway'][] = [
  'motorway',
  'trunk',
  'primary',
  'secondary',
  'motorway_link',
  'trunk_link',
  'primary_link',
  'secondary_link',
  'escape',
  'bus_guideway',
  'raceway',
  'busway',
];

const DANGEROUS_VELOCITY: number = 50;
