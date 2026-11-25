import { motion } from 'motion/react';
import { ForecastPanel } from '../../components/forecast/ForecastPanel.jsx';
import { Hero, PlaceHeader } from '../../components/hero/Hero.jsx';
import { HourlyPanel } from '../../components/hourly/HourlyPanel.jsx';
import {
  AqiTile,
  CloudTile,
  FeelsLikeTile,
  HumidityTile,
  PressureTile,
  UvTile,
  VisibilityTile,
  WindTile,
} from '../../components/tiles/Tiles.jsx';

const rise = {
  hidden: { opacity: 0, y: 18 },
  shown: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.08 * i } }),
};

export function Dashboard({ data, scene, clock, settings, onUnitChange, onSearch, saved }) {
  const { current, days, location } = data;
  const unit = settings.unit;

  return (
    <motion.div key={`${location.lat},${location.lon}`} initial="hidden" animate="shown">
      <PlaceHeader data={data} clock={clock} unit={unit} onUnitChange={onUnitChange} onSearch={onSearch} saved={saved} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <motion.div variants={rise} custom={0} className="lg:col-span-8">
          <Hero data={data} scene={scene} clock={clock} unit={unit} className="h-full" />
        </motion.div>
        <motion.div variants={rise} custom={1} className="lg:col-span-4">
          <ForecastPanel days={days} unit={unit} currentC={current.tempC} className="h-full" />
        </motion.div>
        <motion.div variants={rise} custom={2} className="min-w-0 lg:col-span-12">
          <HourlyPanel days={days} localtime={location.localtime} minutesNow={clock.minutes} unit={unit} />
        </motion.div>

        <motion.div variants={rise} custom={3} className="grid grid-cols-2 gap-5 lg:col-span-12 lg:grid-cols-4">
          <AqiTile aqi={current.aqi} className="col-span-2 lg:col-span-1" />
          <UvTile uv={current.uv} />
          <WindTile current={current} windUnit={settings.wind} />
          <HumidityTile current={current} unit={unit} />
          <FeelsLikeTile current={current} unit={unit} />
          <VisibilityTile current={current} unit={unit} />
          <PressureTile current={current} />
          <CloudTile current={current} />
        </motion.div>
      </div>
    </motion.div>
  );
}
