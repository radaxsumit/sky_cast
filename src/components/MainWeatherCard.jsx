import React from "react";
import {Cloud, Droplets, Eye, Gauge, MoreHorizontal} from "lucide-react";
import {getWeatherIcon} from "../utils/weatherIconMap.js";
import {getWeatherColor} from "../utils/weatherColorMap";
import cloudsBg from "../assets/cloudsbeautiful.jpg";

const Stat = ({icon, label, value}) => (<div className="flex flex-col items-center">
    <div className="flex items-center gap-2 text-white/60">
        {icon}
        <span className="text-xs font-medium uppercase tracking-widest">{label}</span>
    </div>
    <span className="text-xl font-bold">{value}</span>
</div>);

const Divider = () => (<div className="h-8 w-[2px] bg-white/20"></div>);

export const MainWeatherCard = ({weatherData, unit}) => {
    const {condition, isDay} = weatherData;

    if (!weatherData) return null;
    const temp =
        unit === "C" ? weatherData.temp_c : weatherData.temp_f;

    const feelsLike =
        unit === "C" ? weatherData.feelslike_c : weatherData.feelslike_f;


    const {
        temperature,
        humidity,
        windSpeed,
        pressure,
        visibility,
        icon,
        airQuality,
        isday,
        temp_f,
    } = weatherData;

    const WeatherIcon = getWeatherIcon(condition, isday === 1);
    const iconColor = getWeatherColor(condition);

    return (
        <div
            className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 p-10 text-white shadow-2xl shadow-indigo-200 dark:shadow-none transition-all">
            <img
                src={cloudsBg}
                alt="clouds"
                className="absolute inset-0 w-full h-full object-cover opacity-25"
            />
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
                <div className="flex justify-between items-center">
                    <div
                        className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center gap-2 border border-white/20">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                        <span className="text-xs font-semibold uppercase tracking-wider">Live Update</span>
                    </div>

                    <button className="text-white/40 hover:text-white transition-colors">
                        <MoreHorizontal/>
                    </button>
                </div>

                {/* Main content */}
                <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                        <div className="flex items-baseline"><span
                            className="text-9xl font-bold tracking-tighter leading-none">{unit === "C" ? weatherData.temperature : weatherData.temp_f}</span>
                            <span className="text-5xl font-light ml-2">°{unit}</span>
                        </div>
                        <h2 className="text-4xl font-semibold mt-4">{weatherData.condition}</h2>
                        <p className="text-white/70 mt-2 font-medium"> Feels
                            like {unit === "C" ? weatherData.feelsLike_c : weatherData.feelsLike_f}°</p>
                    </div>

                    <div className="drop-shadow-2xl">
                        <WeatherIcon
                            className={`w-44 h-44 ${iconColor} animate-[float_4s_ease-in-out_infinite]`}
                        />
                    </div>
                </div>

                {/* Stats */}
                <div
                    className="mt-12 py-6 flex justify-around items-center rounded-2xl bg-white/25 backdrop-blur-lg">
                    <Stat icon={<Gauge className="w-5 h-5"/>} label="Wind" value={`${windSpeed} km/h`}/>
                    <Divider/>
                    <Stat icon={<Eye className="w-5 h-5"/>} label="Humidity" value={`${humidity}%`}/>
                    <Divider/>
                    <Stat icon={<Droplets className="w-5 h-5"/>} label="Visibility" value={`${visibility / 1000} km`}/>
                </div>
            </div>
        </div>
    );
};


