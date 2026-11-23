import { useEffect, useRef } from 'react';

// One canvas, one rAF loop. Rain = slanted streaks, snow = drifting flakes, sleet = both.
export function Precipitation({ kind, intensity }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || kind === 'none' || intensity <= 0) return undefined;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let w = 0;
    let h = 0;
    let particles = [];
    let raf = 0;
    let last = performance.now();

    const spawn = (snow, anywhere) => ({
      snow,
      x: Math.random() * (w + 200) - 100,
      y: anywhere ? Math.random() * h : -20,
      v: snow ? 30 + Math.random() * 50 : 700 + Math.random() * 500,
      len: snow ? 1.2 + Math.random() * 2.4 : 10 + Math.random() * 16,
      sway: Math.random() * Math.PI * 2,
      alpha: snow ? 0.6 + Math.random() * 0.4 : 0.25 + Math.random() * 0.35,
    });

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const area = (w * h) / 10000;
      const count = Math.round(area * intensity * (kind === 'snow' ? 2.2 : 3.2));
      particles = Array.from({ length: Math.min(count, 900) }, (_, i) =>
        spawn(kind === 'snow' || (kind === 'sleet' && i % 2 === 0), true),
      );
    };

    const wind = 0.18; // rain slant
    const tick = (t) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = 'round';
      for (const p of particles) {
        if (p.snow) {
          p.sway += dt;
          p.y += p.v * dt;
          p.x += Math.sin(p.sway) * 18 * dt;
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.len, 0, Math.PI * 2);
          ctx.fill();
        } else {
          p.y += p.v * dt;
          p.x += p.v * wind * dt;
          ctx.globalAlpha = p.alpha;
          ctx.strokeStyle = '#dbe7ff';
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.len * wind, p.y - p.len);
          ctx.stroke();
        }
        if (p.y > h + 20) Object.assign(p, spawn(p.snow, false));
      }
      raf = requestAnimationFrame(tick);
    };

    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    raf = requestAnimationFrame(tick);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [kind, intensity]);

  if (kind === 'none' || intensity <= 0) return null;
  return <canvas ref={ref} className="absolute inset-0 h-full w-full" />;
}
