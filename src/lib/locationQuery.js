// Builds the WeatherAPI `q` for a place: exact id when we have one, else coordinates, else free text.
export function locationQuery(place) {
  if (typeof place === 'string') return place.trim();
  if (typeof place?.id === 'number') return `id:${place.id}`;
  if (place?.lat != null && place?.lon != null) return `${place.lat},${place.lon}`;
  return place?.name?.trim() ?? '';
}
