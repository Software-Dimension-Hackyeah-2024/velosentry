import z from 'zod';

const GeoJSONLineStringSchema = z.object({
  type: z.literal('LineString'),
  coordinates: z.array(z.tuple([z.number(), z.number()])),
});

export const ManeuverType = z.enum([
  'turn', // a basic turn into direction of the modifier
  'new name', // no turn is taken/possible, but the road name changes. The road can take a turn itself, following modifier .
  'depart', // indicates the departure of the leg
  'arrive', // indicates the destination of the leg
  'merge', // merge onto a street (e.g. getting on the highway from a ramp, the modifier specifies the direction of the merge )
  'ramp', // @deprecated. Replaced by on_ramp and off_ramp .
  'on ramp', // take a ramp to enter a highway (direction given my modifier )
  'off ramp', // take a ramp to exit a highway (direction given my modifier )
  'fork', // take the left/right side at a fork depending on modifier
  'end of road', // road ends in a T intersection turn in direction of modifier
  'use lane', // @deprecated replaced by lanes on all intersection entries
  'continue', // Turn in direction of modifier to stay on the same road
  'roundabout', // traverse roundabout, if the route leaves the roundabout there will be an additional property exit for exit counting. The modifier specifies the direction of entering the roundabout.
  'rotary', // a traffic circle. While very similar to a larger version of a roundabout, it does not necessarily follow roundabout rules for right of way. It can offer rotary_name and/or rotary_pronunciation parameters (located in the RouteStep object) in addition to the exit parameter (located on the StepManeuver object).
  'roundabout turn', // Describes a turn at a small roundabout that should be treated as normal turn. The modifier indicates the turn direciton. Example instruction: At the roundabout turn left .
  'notification', // not an actual turn but a change in the driving conditions. For example the travel mode or classes. If the road takes a turn itself, the modifier describes the direction
  'exit roundabout', // Describes a maneuver exiting a roundabout (usually preceeded by a roundabout instruction)
  'exit rotary', // Describes the maneuver exiting a rotary (large named roundabout)
]);

const Modifier = z.enum([
  'uturn', // indicates reversal of direction
  'sharp right', // a sharp right turn
  'right', // a normal turn to the right
  'slight right', // a slight turn to the right
  'straight', // no relevant change in direction
  'slight left', // a slight turn to the left
  'left', // a normal turn to the left
  'sharp left', // a sharp turn to the left
]);

// See https://wiki.openstreetmap.org/wiki/Key:highway for more details
const RoadType = z.enum([
  'motorway',
  'trunk',
  'primary',
  'secondary',
  'tertiary',
  'unclassified',
  'residential',
  'motorway_link',
  'trunk_link',
  'primary_link',
  'secondary_link',
  'tertiary_link',
  'living_street',
  'service',
  'pedestrian',
  'track',
  'bus_guideway',
  'escape',
  'raceway',
  'road',
  'busway',
  'footway',
  'bridleway',
  'steps',
  'corridor',
  'path',
  'via_ferrata',
  'cycleway',
  'proposed',
  'construction',
]);

// See https://wiki.openstreetmap.org/wiki/Key:surface for more details
const RoadSurface = z.enum([
  'paved',
  'asphalt',
  'chipseal',
  'concrete',
  'paving_stones',
  'grass_paver',
  'sett',
  'unhewn_cobblestone',
  'cobblestone',
]);

const RoadLight = z.enum([
  'yes',
  'no',
  '24/7',
  'disused',
  'automatic',
  'limited',
]);

export type Tag = z.infer<typeof Tag>;
export const Tag = z.object({
  highway: RoadType,
  maxspeed: z.number().optional(),
  surface: RoadSurface.optional(),
  lit: RoadLight.optional(),
});

const Road = z.object({
  type: z.literal('way'),
  tags: z.array(Tag),
  nodes: z.array(z.number()),
  id: z.number(),
});

export type NodeProps = z.infer<typeof Node>;
export const Node = z.object({
  type: z.literal('node'),
  id: z.number(),
  lat: z.number(),
  lon: z.number(),
});

const Element = z.union([Road, Node]);

const StepManeuver = z.object({
  /** A [longitude, latitude] pair describing the location of the turn. */
  location: z.tuple([z.number(), z.number()]),
  /** The clockwise angle from true north to the direction of travel immediately before the maneuver. Range 0-359. */
  bearing_before: z.number(),
  /** The clockwise angle from true north to the direction of travel immediately after the maneuver. Range 0-359. */
  bearing_after: z.number(),
  type: ManeuverType,
  modifier: Modifier,
  /**
   * An optional integer indicating number of the exit to take. The property exists for the roundabout / rotary property:
   * Number of the roundabout exit to take. If exit is undefined the destination is on the roundabout.
   */
  exit: z.number().optional(),
});

/**
 * A Lane represents a turn lane at the corresponding turn location.
 */
const Lane = z.object({
  /**
   * a indication (e.g. marking on the road) specifying the turn lane.
   * A road can have multiple indications (e.g. an arrow pointing straight and left).
   * The indications are given in an array, each containing one of the following types.
   * Further indications might be added on without an API version change.
   */
  indications: z.array(
    z.enum([
      'none', // No dedicated indication is shown.
      'uturn', // An indication signaling the possibility to reverse (i.e. fully bend arrow).
      'sharp right', // An indication indicating a sharp right turn (i.e. strongly bend arrow).
      'right', // An indication indicating a right turn (i.e. bend arrow).
      'slight right', // An indication indicating a slight right turn (i.e. slightly bend arrow).
      'straight', // No dedicated indication is shown (i.e. straight arrow).
      'slight left', // An indication indicating a slight left turn (i.e. slightly bend arrow).
      'left', // An indication indicating a left turn (i.e. bend arrow).
      'sharp left', // An indication indicating a sharp left turn (i.e. strongly bend arrow).
    ]),
  ),
  /** a boolean flag indicating whether the lane is a valid choice in the current maneuver */
  valid: z.boolean(),
});

/**
 * An intersection gives a full representation of any cross-way the path passes bay.
 * For every step, the very first intersection (intersections[0]) corresponds to the location of the StepManeuver.
 * Further intersections are listed for every cross-way until the next turn instruction.
 */
const Intersection = z.object({
  /**
   * A [longitude, latitude] pair describing the location of the turn.
   */
  location: z.tuple([z.number(), z.number()]),
  /**
   * A list of bearing values (e.g. [0,90,180,270]) that are available at the intersection. The bearings describe all available roads at the intersection. Values are between 0-359 (0=true north)
   */
  bearings: z.array(z.number()),
  /**
   * An array of strings signifying the classes (as specified in the profile) of the road exiting the intersection.
   */
  classes: z.array(z.string()).optional(),
  /**
   * A list of entry flags, corresponding in a 1:1 relationship to the bearings. A value of true indicates that the respective road could be entered on a valid route. false indicates that the turn onto the respective road would violate a restriction.
   */
  entry: z.array(z.boolean()),
  /**
   * index into bearings/entry array. Used to calculate the bearing just before the turn.
   * Namely, the clockwise angle from true north to the direction of travel immediately before the maneuver/passing the intersection.
   * Bearings are given relative to the intersection. To get the bearing in the direction of driving, the bearing has to be rotated
   * by a value of 180. The value is not supplied for depart maneuvers.
   */
  in: z.number().optional(),
  /**
   * index into the bearings/entry array. Used to extract the bearing just after the turn.
   * Namely, The clockwise angle from true north to the direction of travel immediately after the maneuver/passing the intersection.
   * The value is not supplied for arrive maneuvers.
   */
  out: z.number().optional(),
  /**
   * Array of Lane objects that denote the available turn lanes at the intersection. If no lane information is available for an intersection, the lanes property will not be present.
   */
  lanes: z.array(Lane).optional(),
});

/**
 * A step consists of a maneuver such as a turn or merge, followed by a distance of
 * travel along a single way to the subsequent step.
 */
const RouteStep = z.object({
  /** The distance of travel from the maneuver to the subsequent step, in float meters. */
  distance: z.number(),
  /** The estimated travel time, in float number of seconds. */
  duration: z.number(),
  /** The unsimplified geometry of the route segment, depending on the geometries parameter. */
  geometry: GeoJSONLineStringSchema,
  /** The calculated weight of the step. */
  weight: z.number(),

  /** The name of the way along which travel proceeds. */
  name: z.string(),
  /** A reference number or code for the way. Optionally included, if ref data is available for the given way. (unused) */
  // ref: ,
  /**
   * A string containing an IPA phonetic transcription indicating how to pronounce the name in the name property.
   * This property is omitted if pronunciation data is unavailable for the step.
   * (unused)
   */
  // pronunciation:
  /** The destinations of the way. Will be undefined if there are no destinations. (unused) */
  // destinations:
  /** The exit numbers or names of the way. Will be undefined if there are no exit numbers or names. */
  exits: z.array(z.union([z.number(), z.string()])).optional(),
  /** A string signifying the mode of transportation. */
  mode: z.string(),
  /** A StepManeuver object representing the maneuver */
  maneuver: StepManeuver,
  /** A list of Intersection objects that are passed along the segment, the very first belonging to the StepManeuver */
  intersections: z.array(Intersection),
  // rotary_name: The name for the rotary. Optionally included, if the step is a rotary and a rotary name is available.
  // rotary_pronunciation: The pronunciation hint of the rotary name. Optionally included, if the step is a rotary and a rotary pronunciation is available.
  /** The legal driving side at the location for this step. Either left or right. */
  driving_side: z.union([z.literal('left'), z.literal('right')]),
});

/** Represents a route between two waypoints. */
export const RouteLeg = z.object({
  /** The distance traveled by this route leg, in float meters. */
  distance: z.number(),
  /** The estimated travel time, in float number of seconds. */
  duration: z.number(),
  /** The calculated weight of the route leg. */
  weight: z.number(),
  /**
   * Summary of the route taken as string. Depends on the summary parameter:
   * `true`  Names of the two major roads used. Can be empty if route is too short.
   * `false` empty string
   */
  summary: z.string().optional(),

  /** Depends on the steps parameter.
   * `true`  - array of RouteStep objects describing the turn-by-turn instructions
   * `false` - empty array
   */
  steps: z.array(RouteStep),

  /**
   * Additional details about each coordinate along the route geometry:
   */
  annotation: z.object({
    nodes: z.array(z.number()),
  }),
});

const Route = z.object({
  /** The distance traveled by the route, in float meters. */
  distance: z.number(),
  /** The estimated travel time, in float number of seconds. */
  duration: z.number(),
  /**
   * The whole geometry of the route value depending on overview parameter, format depending on the geometries parameter.
   * See RouteStep's geometry property for a parameter documentation.
   *
   * (omitted, as only the legs are used)
   */
  // geometry: ,
  /** The calculated weight of the route. */
  weight: z.number(),
  /** The name of the weight profile used during extraction phase. */
  weight_name: z.string(),
  /** The legs between the given waypoints, an array of RouteLeg objects. */
  legs: z.array(RouteLeg),
});

export type RouteResponse = z.infer<typeof RouteResponse>;
export const RouteResponse = z.object({
  code: z.literal('Ok'),
  routes: z.array(Route),
});

export type RouteElementsResponse = z.infer<typeof RouteElementsResponse>;
export const RouteElementsResponse = z.object({
  elements: z.array(Element),
});
