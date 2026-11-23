export const MAX_SAVED = 8;

export function addCity(list, city) {
  return [city, ...list.filter((c) => c.id !== city.id)].slice(0, MAX_SAVED);
}

export function removeCity(list, id) {
  return list.filter((c) => c.id !== id);
}
