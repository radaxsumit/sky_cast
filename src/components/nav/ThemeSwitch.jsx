// Day/night switch matching the FigJam reference: sun with halo rings and clouds by day,
// cratered moon with halo rings and stars by night. Sized in em, so `size` scales it cleanly.

const SIZES = { sm: 3.5, md: 5 }; // px per em → sm ≈ 66×25, md ≈ 95×35

const SPARKLE = 'M0,-5 C0.6,-1.6 1.6,-0.6 5,0 C1.6,0.6 0.6,1.6 0,5 C-0.6,1.6 -1.6,0.6 -5,0 C-1.6,-0.6 -0.6,-1.6 0,-5Z';
const STARS = [
  [30, 19, 1],
  [56, 12, 0.55],
  [47, 37, 0.8],
  [22, 49, 0.5],
  [74, 47, 0.45],
  [69, 26, 0.35],
];
const DOTS = [
  [40, 14],
  [62, 52],
  [15, 31],
  [84, 20],
];
const FRONT_CLOUD = [
  [110, 74, 20],
  [133, 62, 19],
  [156, 54, 20],
  [179, 43, 19],
  [196, 58, 17],
  [150, 80, 18],
  [122, 84, 16],
];
const BACK_CLOUD = [
  [100, 61, 18],
  [124, 50, 18],
  [148, 41, 19],
  [172, 30, 18],
  [191, 38, 16],
];

export function ThemeSwitch({ dark, onChange, size = 'md' }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Dark mode"
      onClick={() => onChange(!dark)}
      className="tt"
      data-dark={dark ? 'true' : 'false'}
      style={{ fontSize: SIZES[size] ?? SIZES.md }}
    >
      <span className="tt-track" aria-hidden="true">
        <span className="tt-rings">
          <span />
          <span />
          <span />
        </span>

        <svg className="tt-stars" viewBox="0 0 190 70" preserveAspectRatio="none">
          {STARS.map(([x, y, s], i) => (
            <path key={i} d={SPARKLE} transform={`translate(${x} ${y}) scale(${s})`} fill="#fff" />
          ))}
          {DOTS.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="1.1" fill="#fff" opacity="0.8" />
          ))}
        </svg>

        <svg className="tt-clouds" viewBox="0 0 190 70" preserveAspectRatio="none">
          <g fill="#ffffff" opacity="0.55">
            {BACK_CLOUD.map(([x, y, r], i) => (
              <circle key={i} cx={x} cy={y} r={r} />
            ))}
          </g>
          <g fill="#ffffff">
            {FRONT_CLOUD.map(([x, y, r], i) => (
              <circle key={i} cx={x} cy={y} r={r} />
            ))}
          </g>
        </svg>
      </span>

      <span className="tt-knob" aria-hidden="true">
        <span className="tt-moon">
          <span />
          <span />
          <span />
        </span>
      </span>
    </button>
  );
}
