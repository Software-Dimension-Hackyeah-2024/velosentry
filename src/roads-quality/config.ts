import { Tags } from '../osrm-schema';

export { GOOD_QUALITY_ROAD_SURFACE, LOW_QUALITY_ROAD_SURFACE };

const GOOD_QUALITY_ROAD_SURFACE: Tags['surface'][] = [
  'asphalt',
  'chipseal',
  'concrete',
  'paved',
  'paving_stones',
  'sett',
  'bricks',
  'metal',
  'wood',
];

const LOW_QUALITY_ROAD_SURFACE: Tags['surface'][] = [
  'unpaved',
  'unhewn_cobblestone',
  'cobblestone',
  'grass_paver',
  'unpaved',
  'compacted',
  'dirt',
  'gravel',
  'ground',
  'sand',
  'grass',
  'earth',
  'mud',
  'fine_gravel',
  'stepping_stones',
  'rubber',
  'shells',
  'rock',
  'pebblestone',
  'woodchips',
  'snow',
  'ice',
  'salt',
];
