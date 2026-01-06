import React from "react";
import { Wind, Sun, Sunrise, Sunset, Activity } from "lucide-react";

const StatCard = ({ icon, label, value, badge, badgeColor, subtext }) => (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-sm shadow-slate-200/50 dark:shadow-none dark:border dark:border-slate-800 flex flex-col justify-between transition-colors">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 transition-colors">
                    {React.cloneElement(icon, { className: "w-5 h-5" })}
                </div>
                <span className="font-semibold text-slate-400 dark:text-slate-500 text-sm uppercase tracking-wide">
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

        <div>
            <div className="text-3xl font-bold text-slate-800 dark:text-white">
                {value}
            </div>
            {subtext && (
                <p className="text-slate-400 dark:text-slate-500 text-sm font-medium mt-1">
                    {subtext}
                </p>
            )}
        </div>
    </div>
);


export const WeatherStatsGrid = ({ weatherData , isDarkMode }) => {

    const {
        temperature, humidity, windSpeed, pressure, visibility, location, icon, airQuality,condition
    } = weatherData;
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <StatCard
                icon={<Activity />}
                label="Air Quality"
                value={weatherData.visibility}
                badge="Good"
                badgeColor="bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400"
            />

            <StatCard
                icon={<Sun />}
                label="Sun & UV"
                value={weatherData.condition}
                subtext="Low UV risk"
            />

            <StatCard
                icon={<Wind />}
                label="Wind Speed"
                value={weatherData.windSpeed}
                subtext="From North East"
            />

            <StatCard
                icon={<Sunrise />}
                label="Sunrise & Sunset"
                // value={weather.sunrise}
                // subtext={`Sunset: ${weather.sunset}`}
            />
        </div>
    );
};



