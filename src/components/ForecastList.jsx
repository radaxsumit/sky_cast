import React from "react";
import { motion } from "framer-motion";
import {
    Sun,
    Cloud,
    CloudRain,
    CloudLightning,
    CloudDrizzle
} from "lucide-react";

const ForecastItem = ({ day, isCurrent, unit, index }) => {

    const getIcon = () => {
        const cond = day.condition.toLowerCase();

        if (cond.includes("sun") || cond.includes("clear"))
            return <Sun className="w-6 h-6 text-yellow-500 drop-shadow-md" />;

        if (cond.includes("cloud"))
            return <Cloud className="w-6 h-6 text-slate-400 drop-shadow-md" />;

        if (cond.includes("rain"))
            return <CloudRain className="w-6 h-6 text-blue-500 drop-shadow-md" />;

        if (cond.includes("storm"))
            return <CloudLightning className="w-6 h-6 text-indigo-500 drop-shadow-md" />;

        return <CloudDrizzle className="w-6 h-6 text-blue-400 drop-shadow-md" />;
    };

    const minTemp = unit === "C" ? day.min_c : day.min_f;
    const maxTemp = unit === "C" ? day.max_c : day.max_f;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            whileHover={{ y: -4 }}
            className={`flex items-center justify-between p-4 sm:p-5 rounded-3xl 
      transition-all cursor-pointer ${
                isCurrent
                    ? "bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/40 dark:border-indigo-800/40 shadow-sm"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800/60"
            }`}
        >
            {/* LEFT */}
            <div className="flex items-center gap-4">
                <div
                    className={`p-2 rounded-2xl ${
                        isCurrent
                            ? "bg-white dark:bg-slate-800 shadow-md"
                            : "bg-slate-100 dark:bg-slate-800/60"
                    }`}
                >
                    {getIcon()}
                </div>

                <div>
                    <p className="font-bold text-slate-800 dark:text-white text-sm sm:text-base">
                        {day.day}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 capitalize">
                        {day.condition}
                    </p>
                </div>
            </div>

            {/* RIGHT */}
            <div className="flex gap-4 items-center">
                <motion.span
                    key={minTemp}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-bold text-slate-800 dark:text-white text-sm sm:text-base"
                >
                    {minTemp}°
                </motion.span>

                <motion.span
                    key={maxTemp}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-slate-400 dark:text-slate-500 font-medium text-sm sm:text-base"
                >
                    {maxTemp}°
                </motion.span>
            </div>
        </motion.div>
    );
};

export const ForecastList = ({ forecast = [], unit }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-white dark:bg-slate-900
                 rounded-[2rem] p-6 sm:p-8
                 shadow-sm shadow-slate-200/50
                 dark:shadow-none dark:border dark:border-slate-800
                 flex flex-col transition-colors"
        >
            <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white mb-6 sm:mb-8">
                3 Day Forecast
            </h3>

            <div className="flex flex-col gap-4 sm:gap-6">
                {forecast.map((day, idx) => (
                    <ForecastItem
                        key={day.date}
                        day={day}
                        isCurrent={idx === 0}
                        unit={unit}
                        index={idx}
                    />
                ))}
            </div>
        </motion.div>
    );
};
