import { z } from 'zod';

// Define schema for a single zdarzenie (event)
export const ZdarzenieSchema = z.object({
  id: z.number(),
  wsp_gps_x: z.number(),
  wsp_gps_y: z.number(),
  ciezkosc: z.enum(['C', 'L', 'S']),
});

// Define schema for gmina (municipality)
const GminaSchema = z.object({
  zdarzenia: z.number(),
  gmi_nazwa: z.string(),
  mie_nazwa: z.string(),
  mie_rodzaj: z.string(),
  gmi_kod: z.string(),
  gmi_rodzaj: z.string().nullable(),
  fallback_center_lng: z.number(),
  fallback_center_lat: z.number(),
  zdarzenia_detale: z.array(ZdarzenieSchema),
});

// Define schema for powiat (district)
const PowiatSchema = z.object({
  pow_nazwa: z.string(),
  pow_kod: z.string(),
  zdarzenia: z.number(),
  fallback_center_lng: z.number(),
  fallback_center_lat: z.number(),
  gminy: z.array(GminaSchema),
});

// Define schema for wojewodztwo (province)
const WojewodztwoSchema = z.object({
  woj_nazwa: z.string(),
  woj_kod: z.string(),
  zdarzenia: z.number(),
  fallback_center_lng: z.number(),
  fallback_center_lat: z.number(),
  powiaty: z.array(PowiatSchema),
});

// Define schema for the mapa (map) object
const MapaSchema = z.object({
  wojewodztwa: z.array(WojewodztwoSchema),
  zdarzenia_count: z.number(),
  isMIE: z.boolean(),
  groupBy: z.string(),
});

// Define the root schema
const RootSchema = z.object({
  mapa: MapaSchema,
  zdarzenia_count: z.number(),
});

export type ZdarzeniaResponse = z.infer<typeof RootSchema>;
export const ZdarzeniaResponse = RootSchema;