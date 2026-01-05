import React from "react";
import {Cloud, Droplets, Eye, Gauge, MoreHorizontal} from "lucide-react";


const Stat = ({ icon, label, value}) => (<div className="flex flex-col items-center">
    <div className="flex items-center gap-2 text-white/60">
        {icon}
        <span className="text-xs font-medium uppercase tracking-widest">{label}</span>
    </div>
    <span className="text-xl font-bold">{value}</span>
</div>);

const Divider = () => (<div className="h-8 w-[2px] bg-white/20"></div>);

export const MainWeatherCard = ({weatherData, forecast=[]}) => {
    if (!weatherData) return null;

    const {
        temperature, humidity, windSpeed, pressure, visibility, location, icon, airQuality,condition
    } = weatherData;

    return (
        <div className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 p-10 text-white shadow-2xl shadow-indigo-200 dark:shadow-none transition-all">

            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
                <div className="flex justify-between items-center">
                    <div className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center gap-2 border border-white/20">
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
                        <div className="flex items-baseline"><span className="text-9xl font-bold tracking-tighter leading-none">{Math.round(weatherData.temperature)}</span>
                            <span className="text-5xl font-light ml-2">°C</span>
                        </div>
                        <h2 className="text-4xl font-semibold mt-4">{weatherData.condition}</h2>
                        <p className="text-white/70 mt-2 font-medium"> Feels like {Math.round(weatherData.temperature)}°</p>
                    </div>

                    <div className="drop-shadow-2xl">
                        {/*<img*/}
                        {/*    src={weatherData.icon}*/}
                        {/*    alt={weatherData.condition}*/}
                        {/*    className="h-48 w-48"*/}
                        {/*/>*/}
                        <Cloud className="h-50 w-50 animate-pulse"/>
                    </div>
                </div>

                {/* Stats */}
                <div
                    className="mt-12 py-6 flex justify-around items-center rounded-2xl bg-white/25 backdrop-blur-lg">
                    <Stat icon={<Gauge className="w-5 h-5" />} label="Wind" value={`${windSpeed} km/h`}/>
                    <Divider/>
                    <Stat icon={<Eye className="w-5 h-5" />} label="Humidity" value={`${humidity}%`}/>
                    <Divider/>
                    <Stat icon={<Droplets className="w-5 h-5" />} label="Visibility" value={`${visibility / 1000} km`}/>
                </div>
            </div>
        </div>
    );
};


