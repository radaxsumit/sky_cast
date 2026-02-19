import React from "react";
import { motion } from "framer-motion";
import { Wind, Sun, Sunrise, Activity } from "lucide-react";

/* -------------------------
   AQI Helper
-------------------------- */

const getAqiStatus = (aqi) => {
    if (aqi <= 2) return { label: "Good", color: "green" };
    if (aqi <= 4) return { label: "Moderate", color: "yellow" };
    return { label: "Poor", color: "red" };
};

const StatCard = ({
                      icon,
                      label,
                      value,
                      badge,
                      badgeColor,
                      subtext,
                      index,
                  }) => (
    <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1, duration: 0.4 }}
        whileHover={{
            y: -8,
            boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
        }}
        className="relative
      bg-white dark:bg-slate-900
      p-6 sm:p-7
      rounded-[1.75rem]
      border border-slate-100 dark:border-slate-800
      flex flex-col justify-between
      transition-all duration-300
      overflow-hidden"
    >
        {/* Soft background glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl" />

        <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 shadow-inner">
                    {React.cloneElement(icon, {
                        className:
                            "w-5 h-5 text-indigo-500 drop-shadow-[0_0_10px_rgba(99,102,241,0.4)]",
                    })}
                </div>

                <span className="font-semibold text-slate-400 dark:text-slate-500 text-xs sm:text-sm uppercase tracking-wide">
          {label}
        </span>
            </div>

            {badge && (
                <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${badgeColor}`}
                >
          {badge}
        </span>
            )}
        </div>

        <div className="relative z-10">
            <div className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">
                {value}
            </div>

            {subtext && (
                <p className="text-slate-400 dark:text-slate-500 text-xs sm:text-sm font-medium mt-1">
                    {subtext}
                </p>
            )}
        </div>
    </motion.div>
);

export const WeatherStatsGrid = ({ weatherData }) => {
    if (!weatherData) return null;

    const { condition, windSpeed, sunrise, sunset, aqi } = weatherData;

    const aqiData = getAqiStatus(aqi);

    const badgeStyles = {
        green:
            "bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400",
        yellow:
            "bg-yellow-100 dark:bg-yellow-950/40 text-yellow-600 dark:text-yellow-400",
        red:
            "bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400",
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-6"
        >
            <StatCard
                icon={<Activity />}
                label="Air Quality"
                value={aqi}
                badge={aqiData.label}
                badgeColor={badgeStyles[aqiData.color]}
                subtext="US EPA Index"
                index={0}
            />

            <StatCard
                icon={<Sun />}
                label="Condition"
                value={condition}
                subtext="Live atmospheric data"
                index={1}
            />

            <StatCard
                icon={<Wind />}
                label="Wind Speed"
                value={`${windSpeed} km/h`}
                subtext="Current wind flow"
                index={2}
            />

            <StatCard
                icon={<Sunrise />}
                label="Sunrise & Sunset"
                value={sunrise}
                subtext={`Sunset: ${sunset}`}
                index={3}
            />
        </motion.div>
    );
};
