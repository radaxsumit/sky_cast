import React from 'react'
import { Sun, Cloud, CloudRain, CloudLightning, CloudDrizzle } from 'lucide-react';

const ForecastItem = ({ day, isCurrent }) => {
    const getIcon = () => {
        const cond = day.condition.toLowerCase();

        if (cond.includes("sun") || cond.includes("clear"))
            return <Sun className="w-6 h-6 text-yellow-500" />;

        if (cond.includes("cloud"))
            return <Cloud className="w-6 h-6 text-slate-400" />;

        if (cond.includes("rain"))
            return <CloudRain className="w-6 h-6 text-blue-500" />;

        if (cond.includes("storm"))
            return <CloudLightning className="w-6 h-6 text-indigo-500" />;

        return <CloudDrizzle className="w-6 h-6 text-blue-400" />;
    };

    return (
        <div
            className={`flex items-center justify-between p-4 rounded-3xl transition-all ${
                isCurrent
                    ? "bg-indigo-50/50 dark:bg-indigo-950/20 shadow-sm border border-indigo-100/50 dark:border-indigo-900/50"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
            }`}
        >
            {/* LEFT */}
            <div className="flex items-center gap-4">
                <div
                    className={`p-2 rounded-2xl ${isCurrent? "bg-white dark:bg-slate-800 shadow-sm": "bg-slate-50 dark:bg-slate-800/50"}`}>
                    {getIcon()}
                </div>

                <div>
                    <p className="font-bold text-slate-800 dark:text-white leading-none">{day.day}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 capitalize">{day.condition}</p>
                </div>
            </div>

            {/* RIGHT */}
            <div className="flex gap-4">
                <span className="font-bold text-slate-800 dark:text-white">{day.minTemp}°</span>
                <span className="text-slate-300 dark:text-slate-600 font-medium">{day.maxTemp}°</span>
            </div>
        </div>
    );
};

export const ForecastList = ({forecast}) => {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 h-full shadow-sm shadow-slate-200/50 dark:shadow-none dark:border dark:border-slate-800 flex flex-col transition-colors">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-8">7-Day Forecast</h3>

            <div className="flex-1 flex flex-col gap-8">
                {forecast.map((day, idx) => (
                    <ForecastItem
                        key={idx}
                        day={day}
                        isCurrent={idx === 0}
                        // convertTemp={convertTemp}
                    />
                ))}
            </div>
        </div>
    )
}
