import { motion } from 'motion/react';
import { ForecastPanel } from '../../components/forecast/ForecastPanel.jsx';
import { Hero } from '../../components/hero/Hero.jsx';
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

// One orchestrated entrance per place: the hero arrives, then the panels rise in together.
const panels = {
  hidden: { opacity: 0, y: 24 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.25 } },
};

export function Dashboard({ data, scene, clock, settings, onUnitChange, onSearch, saved }) {
  const { current, days, location } = data;
  const unit = settings.unit;

  return (
    <motion.div key={`${location.lat},${location.lon}`} initial="hidden" animate="shown">
      <Hero
        data={data}
        scene={scene}
        clock={clock}
        settings={settings}
        onUnitChange={onUnitChange}
        onSearch={onSearch}
        saved={saved}
      />

      <motion.div variants={panels} className="flex flex-col gap-4 sm:gap-5">
        <HourlyPanel days={days} localtime={location.localtime} unit={unit} />

        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          <ForecastPanel days={days} unit={unit} currentC={current.tempC} className="col-span-2 lg:col-span-1 lg:row-span-3" />
          <AqiTile aqi={current.aqi} className="col-span-2" />
          <UvTile uv={current.uv} />
          <WindTile current={current} windUnit={settings.wind} />
          <HumidityTile current={current} unit={unit} />
          <FeelsLikeTile current={current} unit={unit} />
          <VisibilityTile current={current} unit={unit} />
          <PressureTile current={current} />
          <CloudTile current={current} />
        </div>
      </motion.div>
    </motion.div>
  );
}
