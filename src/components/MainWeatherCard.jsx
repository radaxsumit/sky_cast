import React from "react";
import { Droplets, Eye, Gauge, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { getWeatherIcon } from "../utils/weatherIconMap.js";
import { getWeatherColor } from "../utils/weatherColorMap";
import cloudsBg from "../assets/cloudsbeautiful.jpg";

const Stat = ({ icon, label, value }) => (
    <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-2 text-white/70">
            {icon}
            <span className="text-xs font-semibold uppercase tracking-widest">
                {label}
            </span>
        </div>
        <span className="text-lg sm:text-xl font-bold">{value}</span>
    </div>
);

const Divider = () => (
    <div className="hidden sm:block h-8 w-[1px] bg-white/30" />
);

export const MainWeatherCard = ({ weatherData, unit }) => {
    if (!weatherData) return null;

    const {
        temperature,
        temp_f,
        feelsLike_c,
        feelsLike_f,
        condition,
        humidity,
        windSpeed,
        pressure,
        visibility,
        isDay
    } = weatherData;

    const temp = unit === "C"
        ? Math.round(temperature)
        : Math.round(temp_f);

    const feelsLike = unit === "C"
        ? Math.round(feelsLike_c)
        : Math.round(feelsLike_f);

    const WeatherIcon = getWeatherIcon(condition, isDay === 1);
    const iconColor = getWeatherColor(condition);

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative rounded-[2.5rem] overflow-hidden
                       bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600
                       p-6 sm:p-10 text-white shadow-2xl
                       backdrop-blur-xl"
        >

            {/* Background Image */}
            <img
                src={cloudsBg}
                alt="clouds"
                className="absolute inset-0 w-full h-full object-cover opacity-20"
            />

            {/* Glow Effect */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />

            <div className="relative z-10">

                {/* Top Bar */}
                <div className="flex justify-between items-center">
                    <div className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center gap-2 border border-white/30">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                        <span className="text-xs font-semibold uppercase tracking-wider">
                            Live Update
                        </span>
                    </div>

                    <button className="text-white/50 hover:text-white transition">
                        <MoreHorizontal />
                    </button>
                </div>

                {/* Main Content */}
                <div className="mt-10 flex flex-col lg:flex-row items-center justify-between gap-10">

                    {/* Temperature Section */}
                    <div className="text-center lg:text-left">
                        <div className="flex items-end justify-center lg:justify-start">
                            <motion.span
                                key={temp}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="text-6xl sm:text-8xl lg:text-9xl font-bold tracking-tight"
                            >
                                {temp}
                            </motion.span>

                            <span className="text-3xl sm:text-5xl ml-2 font-light">
                                °{unit}
                            </span>
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-semibold mt-4">
                            {condition}
                        </h2>

                        <p className="text-white/70 mt-2 font-medium text-sm sm:text-base">
                            Feels like {feelsLike}°
                        </p>
                    </div>

                    {/* Weather Icon */}
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 4 }}
                        className="drop-shadow-2xl"
                    >
                        <WeatherIcon
                            className={`w-28 h-28 sm:w-36 sm:h-36 lg:w-44 lg:h-44 ${iconColor}`}
                        />
                    </motion.div>
                </div>

                {/* Bottom Stats */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-10 py-5 px-4 flex flex-col sm:flex-row justify-between items-center gap-6 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/20"
                >
                    <Stat icon={<Gauge className="w-4 h-4" />} label="Wind" value={`${windSpeed} km/h`} />
                    <Divider />
                    <Stat icon={<Eye className="w-4 h-4" />} label="Humidity" value={`${humidity}%`} />
                    <Divider />
                    <Stat icon={<Droplets className="w-4 h-4" />} label="Visibility" value={`${visibility} km`} />
                </motion.div>

            </div>
        </motion.div>
    );
};
