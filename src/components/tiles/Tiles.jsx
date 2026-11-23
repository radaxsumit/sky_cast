import { motion } from 'motion/react';
import { Cloud, Droplet, Eye, Gauge, Sun, Thermometer, Wind } from 'lucide-react';
import { AQI_LEVELS, aqiInfo } from '../../lib/aqi.js';
import { cloudLabel, feelsLikeNote, pressureLabel, uvLabel } from '../../lib/describe.js';
import { convertTemp, convertWind } from '../../lib/units.js';
import { CardTitle, GlassCard } from '../ui/GlassCard.jsx';
import { MetIcon } from '../ui/WeatherIcon.jsx';

function Tile({ title, icon, aside, children, className = '' }) {
  return (
    <GlassCard className={`flex min-h-[168px] flex-col p-5 ${className}`}>
      <CardTitle icon={icon} aside={aside}>
        {title}
      </CardTitle>
      <div className="flex flex-1 flex-col justify-between">{children}</div>
    </GlassCard>
  );
}

const Big = ({ children }) => (
  <p className="font-display tabular text-[2.4rem] leading-none font-semibold tracking-tight">{children}</p>
);
const Small = ({ children }) => <span className="text-ink-muted ml-1 text-base font-medium tracking-normal">{children}</span>;
const Note = ({ children }) => <p className="text-ink-muted mt-3 text-sm leading-snug">{children}</p>;

function Meter({ value, colour = 'var(--ink)' }) {
  return (
    <div className="bg-ink-faint mt-4 h-1.5 rounded-full" aria-hidden="true">
      <motion.div
        className="h-full rounded-full"
        style={{ background: colour }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

export function AqiTile({ aqi, className }) {
  if (!aqi) {
    return (
      <Tile title="Air quality" icon={Gauge} className={className}>
        <Note>Air quality isn’t reported for this place.</Note>
      </Tile>
    );
  }
  const info = aqiInfo(aqi.epa);
  const position = ((info.level - 0.5) / 6) * 100;
  return (
    <Tile
      title="Air quality"
      icon={Gauge}
      className={className}
      aside={<span className="text-ink-muted text-xs">US EPA {info.level} of 6</span>}
    >
      <div className="flex items-end justify-between gap-4">
        <Big>{info.label}</Big>
        {aqi.pm25 != null && (
          <p className="text-ink-muted text-right text-sm">
            <span className="text-ink tabular block text-lg font-semibold">{Math.round(aqi.pm25)}</span>
            PM2.5 µg/m³
          </p>
        )}
      </div>
      <div className="relative mt-5">
        <div
          className="h-2 rounded-full"
          style={{ background: `linear-gradient(90deg, ${AQI_LEVELS.map((l) => l.color).join(', ')})` }}
          aria-hidden="true"
        />
        <motion.div
          className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white shadow-md"
          style={{ background: info.color }}
          initial={{ left: '0%' }}
          animate={{ left: `${position}%` }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </Tile>
  );
}

export function UvTile({ uv, className }) {
  const level = Math.min(11, Math.max(1, Math.round(uv)));
  return (
    <Tile title="UV index" icon={Sun} className={className}>
      <div className="flex items-center justify-between">
        <Big>{Math.round(uv)}</Big>
        {uv >= 1 && <MetIcon name={`uv-index-${level}`} size={52} />}
      </div>
      <Note>{uvLabel(uv)}{uv >= 3 ? ', use sun protection' : ''}</Note>
    </Tile>
  );
}

export function WindTile({ current, windUnit, className }) {
  const speed = convertWind(current.windKph, current.windMph, windUnit);
  const gust = convertWind(current.gustKph, current.gustMph, windUnit);
  const label = windUnit === 'mph' ? 'mph' : 'km/h';
  return (
    <Tile title="Wind" icon={Wind} className={className}>
      <div className="flex items-center justify-between gap-2">
        <div>
          <Big>
            {speed}
            <Small>{label}</Small>
          </Big>
          <Note>
            Gusts {gust} {label}, from {current.windDir}
          </Note>
        </div>
        <svg viewBox="0 0 64 64" className="h-16 w-16 shrink-0" role="img" aria-label={`Wind from ${current.windDir}`}>
          <circle cx="32" cy="32" r="28" fill="none" stroke="var(--ink-faint)" strokeWidth="2" />
          {['N', 'E', 'S', 'W'].map((d, i) => (
            <text
              key={d}
              x={32 + 21 * Math.sin((i * Math.PI) / 2)}
              y={32 - 21 * Math.cos((i * Math.PI) / 2) + 3}
              textAnchor="middle"
              fontSize="8"
              fontWeight="600"
              fill="var(--ink-muted)"
            >
              {d}
            </text>
          ))}
          {/* Arrow points where the wind blows to (meteorological degree + 180). */}
          <motion.g
            style={{ originX: '32px', originY: '32px' }}
            initial={{ rotate: 0 }}
            animate={{ rotate: current.windDegree + 180 }}
            transition={{ type: 'spring', stiffness: 60, damping: 12 }}
          >
            <line x1="32" y1="44" x2="32" y2="18" stroke="var(--color-sun)" strokeWidth="3" strokeLinecap="round" />
            <path d="M32 13 L37 21 L27 21 Z" fill="var(--color-sun)" />
          </motion.g>
        </svg>
      </div>
    </Tile>
  );
}

export function HumidityTile({ current, unit, className }) {
  return (
    <Tile title="Humidity" icon={Droplet} className={className}>
      <Big>
        {current.humidity}
        <Small>%</Small>
      </Big>
      <div>
        <Meter value={current.humidity} colour="#38bdf8" />
        {current.dewpointC != null && <Note>Dew point {convertTemp(current.dewpointC, current.dewpointF, unit)}°</Note>}
      </div>
    </Tile>
  );
}

export function VisibilityTile({ current, unit, className }) {
  const miles = unit === 'F';
  const value = miles ? current.visMiles : current.visKm;
  const km = current.visKm;
  const note = km >= 10 ? 'Clear view' : km >= 4 ? 'Slightly reduced' : km >= 1 ? 'Hazy, reduced view' : 'Very poor visibility';
  return (
    <Tile title="Visibility" icon={Eye} className={className}>
      <Big>
        {value}
        <Small>{miles ? 'mi' : 'km'}</Small>
      </Big>
      <Note>{note}</Note>
    </Tile>
  );
}

export function PressureTile({ current, className }) {
  return (
    <Tile title="Pressure" icon={Gauge} className={className}>
      <Big>
        {Math.round(current.pressureMb)}
        <Small>hPa</Small>
      </Big>
      <Note>{pressureLabel(current.pressureMb)} for sea level</Note>
    </Tile>
  );
}

export function CloudTile({ current, className }) {
  return (
    <Tile title="Cloud cover" icon={Cloud} className={className}>
      <Big>
        {current.cloud}
        <Small>%</Small>
      </Big>
      <div>
        <Meter value={current.cloud} colour="var(--ink-muted)" />
        <Note>{cloudLabel(current.cloud)}</Note>
      </div>
    </Tile>
  );
}

export function FeelsLikeTile({ current, unit, className }) {
  return (
    <Tile title="Feels like" icon={Thermometer} className={className}>
      <Big>{convertTemp(current.feelsC, current.feelsF, unit)}°</Big>
      <Note>{feelsLikeNote(current)}</Note>
    </Tile>
  );
}
