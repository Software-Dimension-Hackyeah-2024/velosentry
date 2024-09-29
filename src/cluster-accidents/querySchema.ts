import { z } from 'zod';

export const clusterAccidentsQuerySchema = z.object({
  coords: z
    .string()
    .refine(val => {
      const coordPairs = val.split(';');
      return coordPairs.every(pair => {
        const coords = pair.split(',').map(Number);
        return coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1]);
      });
    }, "Coords must be in format lng,lat;lng,lat"),
  maxDistance: z
    .number()
    .min(5, "Max distance must be at least 5")
    .max(1500, "Max distance must be 1500 or less")
    .default(200),
  clusterDistance: z
    .number()
    .min(5, "Cluster distance must be at least 5")
    .max(1500, "Cluster distance must be 1500 or less")
    .default(200),
});