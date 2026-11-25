// Tiny in-memory TTL cache so saved-city cards and repeat searches don't hammer the free API tier.
export function createCache(ttlMs = 600_000, now = Date.now) {
  const store = new Map();
  return {
    get(key) {
      const hit = store.get(key);
      if (!hit) return undefined;
      if (now() - hit.at > ttlMs) {
        store.delete(key);
        return undefined;
      }
      return hit.value;
    },
    set(key, value) {
      store.set(key, { value, at: now() });
    },
  };
}
