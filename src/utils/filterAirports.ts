import type { Airport, MapBounds } from 'types';

export function filterAirportsByBounds(airports: Airport[], bounds: MapBounds | null) {
  if (!bounds) return airports;
  const { north, south, east, west } = bounds;
  return airports.filter((a) => {
    const { latitude: lat, longitude: lon } = a.coordinates;
    const inLat = lat >= south && lat <= north;
    const inLon = west <= east ? (lon >= west && lon <= east) : (lon >= west || lon <= east);
    return inLat && inLon;
  });
}
