import { Tags } from '../osrm-schema';

export {
  DANGEROUS_TYPES_OF_ROAD,
  DANGEROUS_VELOCITY,
  SAFE_TYPES_OF_ROAD,
  NEUTRAL_TYPES_OF_ROAD,
};

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
  'via_ferrata',
  'steps',
  'proposed',
  'construction',
];

const SAFE_TYPES_OF_ROAD: Tags['highway'][] = [
  'residential',
  'living_street',
  'pedestrian',
  'track',
  'bridleway',
  'cycleway',
];

const NEUTRAL_TYPES_OF_ROAD: Tags['highway'][] = [
  'tertiary',
  'unclassified',
  'tertiary_link',
  'road',
  'footway',
  'corridor',
  'path',
];

const DANGEROUS_VELOCITY: number = 50;
