// Position along the sky arc for progress 0 (rising) → 1 (setting), as % of the viewport.
export function arcPosition(progress) {
  const p = Math.min(1, Math.max(0, progress));
  return {
    left: 6 + p * 88,
    top: 58 - Math.sin(p * Math.PI) * 44,
  };
}
