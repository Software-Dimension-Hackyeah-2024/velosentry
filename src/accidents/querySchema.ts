import { z } from 'zod';

export const accidentsQuerySchema = z.object({
  coords: z
    .string()
    .refine(val => {
      const coordPairs = val.split(';'); // Rozdzielamy pary współrzędnych po średniku
      return coordPairs.every(pair => {
        const coords = pair.split(',').map(Number); // Dzielimy każdą parę po przecinku i konwertujemy na liczby
        return coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1]); // Sprawdzamy, czy mamy poprawne liczby
      });
    }, "Coords must be in format lng,lat;lng,lat"),
  maxDistance: z
    .number()
    .min(5, "Max distance must be at least 5")
    .max(1500, "Max distance must be 1500 or less")
    .default(200), // Ustawiamy domyślną wartość 200, jeśli brak tego parametru
});