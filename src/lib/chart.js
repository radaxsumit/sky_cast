// Catmull-Rom → cubic Bézier through every point, for the hourly temperature curve.
export function smoothPath(points, tension = 0.5) {
  if (points.length === 0) return '';
  const r = (n) => Math.round(n * 10) / 10;
  let d = `M${r(points[0][0])},${r(points[0][1])}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1 = [p1[0] + ((p2[0] - p0[0]) / 6) * tension * 2, p1[1] + ((p2[1] - p0[1]) / 6) * tension * 2];
    const c2 = [p2[0] - ((p3[0] - p1[0]) / 6) * tension * 2, p2[1] - ((p3[1] - p1[1]) / 6) * tension * 2];
    d += ` C${r(c1[0])},${r(c1[1])} ${r(c2[0])},${r(c2[1])} ${r(p2[0])},${r(p2[1])}`;
  }
  return d;
}

// Temperatures → y pixels within [pad, height - pad]; higher temps sit higher.
export function scaleTemps(temps, height, pad) {
  const min = Math.min(...temps);
  const max = Math.max(...temps);
  if (max === min) return temps.map(() => height / 2);
  return temps.map((t) => Math.round(height - pad - ((t - min) / (max - min)) * (height - pad * 2)));
}
