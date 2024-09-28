
import { bbox, destination, lineString, point } from '@turf/turf';
import {  ZdarzeniaResponse } from './obserwatoriumbrd-schema';

export type FetchRouteOptions = {
  points: [number, number][];
};

const ROUTE_API = 'https://obserwatoriumbrd.pl/app/api/nodes/post_zdarzenia.php';

export async function fetchAPIAccidents(options: FetchRouteOptions) {
  const { points } = options;

  const line = lineString(points);
  const bounds = bbox(line);



  const [minLng, minLat, maxLng, maxLat] = bounds;

  const formData = new URLSearchParams();
  formData.append('type', 'DETAILS');
  formData.append('rok[]', '2023');
  formData.append('rok[]', '2022');
  formData.append('rok[]', '2021');
  formData.append('groupBy', 'DET');
  formData.append('obszar_mapy[topRightCorner][lat]', maxLat.toString());
  formData.append('obszar_mapy[topRightCorner][lng]', maxLng.toString());
  formData.append('obszar_mapy[bottomLeftCorner][lat]', minLat.toString());
  formData.append('obszar_mapy[bottomLeftCorner][lng]', minLng.toString());

  console.log("formData", [...formData])

  const result = await fetch(ROUTE_API, {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
    .then(response => response.json())

  return ZdarzeniaResponse.parse(result);
}


function expandBbox(bounds:ReturnType<typeof bbox>, distance: number) {
  const [minLng, minLat, maxLng, maxLat] = bounds;

  const bottomLeft = point([minLng, minLat]);
  const topRight = point([maxLng, maxLat]);

  const expandedBottomLeft = destination(bottomLeft, distance / 1000, -135, { units: 'kilometers' });
  const expandedTopRight = destination(topRight, distance / 1000, 45, { units: 'kilometers' });

  const expandedMinLng = expandedBottomLeft.geometry.coordinates[0];
  const expandedMinLat = expandedBottomLeft.geometry.coordinates[1];
  const expandedMaxLng = expandedTopRight.geometry.coordinates[0];
  const expandedMaxLat = expandedTopRight.geometry.coordinates[1];

  return [expandedMinLng, expandedMinLat, expandedMaxLng, expandedMaxLat];
}