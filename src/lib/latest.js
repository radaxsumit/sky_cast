// Guards against out-of-order responses: only the most recently started request may commit its result.
export function createLatest() {
  let current = 0;
  return {
    next: () => ++current,
    isLatest: (token) => token === current,
  };
}
