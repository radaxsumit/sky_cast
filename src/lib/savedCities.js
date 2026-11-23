export const MAX_SAVED = 8;

export function addCity(list, city) {
  return [city, ...list.filter((c) => c.id !== city.id)].slice(0, MAX_SAVED);
}

export function removeCity(list, id) {
  return list.filter((c) => c.id !== id);
}

// A saved city counts as "this place" when within ~0.1° (about 10 km).
export function findSaved(list, lat, lon) {
  return list.find((c) => Math.abs(c.lat - lat) < 0.1 && Math.abs(c.lon - lon) < 0.1);
}
