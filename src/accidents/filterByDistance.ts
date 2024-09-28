import { Accident } from './types';
import { lineString, point, pointToLineDistance } from '@turf/turf';

export function filterByDistance  (
  points: [number, number][],
  accidents: Accident[],
  maxDistance: number
): Accident[]  {
  const line = lineString(points);

  return accidents.filter(zdarzenie => {
    const zdarzeniePoint = point([zdarzenie.long, zdarzenie.lat]);

    const distance = pointToLineDistance(zdarzeniePoint, line, { units: 'meters' });

    return distance <= maxDistance;
  });
};