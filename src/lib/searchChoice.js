/**
 * What Enter should do in the city search.
 * Suggestions are only trusted when they were fetched for exactly what's in the box;
 * otherwise (still typing / request in flight) the typed text itself is searched.
 * @returns {{place: object} | {query: string} | null}
 */
export function enterChoice({ text, searched, results, active }) {
  const q = text.trim();
  if (!q) return null;
  const current = searched === q && results.length > 0;
  if (current) return { place: results[active >= 0 ? active : 0] };
  return { query: q };
}
