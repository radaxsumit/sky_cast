import React from 'react'
import {Search, MapPin, Moon, Sun, Loader2} from 'lucide-react';


const Header = ({isDarkMode, toggleDarkMode, weatherData}) => {
    const {
        location , date ,localTime
    } = weatherData;
    return (
        <header className="flex flex-col md:flex-row items-center justify-between gap-6 ">
            <div className="flex-shrink-0">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">WeatherDashboard</h1>
                <div className="flex gap-2 mt-1 items-center text-slate-400">
                    <MapPin className="w-4 h-4 text-indigo-500"/>
                    <span className="text-sm font-medium">{location} • {date} </span>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <div className=" relative w-full sm:w-64 md:80">
                    <form>
                        <input
                            type="text"
                            placeholder="Search City By location..."
                            className="w-full pl-12 pr-10 py-3.5 bg-white text-slate-700 dark:bg-slate-900 rounded-2xl shadow-lg shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/40 placeholder-slate-400 dark:placeholder-slate-600 transition-all outline-none "
                        />
                        <Search
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-600"/>
                    </form>
                </div>

                <div
                    className="flex items-center gap-3 p-2 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-all ">
                    <div className=" flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
                        <button className="px-3 py-1.5 rounded-lg text-xs dark:text-slate-400 font-bold transition-all">°C</button>
                        <button className="px-3 py-1.5 rounded-lg text-xs dark:text-slate-400 font-bold transition-all">°F</button>
                    </div>

                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-700"/>

                    <button
                        onClick={toggleDarkMode}
                        aria-label="Toggel Theme"
                        className=" p-2 rounded-xl text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-900 transition-all">
                        {isDarkMode ? <Sun className="w-5 h-5"/> : <Moon className="w-5 h-5"/>}
                    </button>
                </div>
            </div>
        </header>
    )
}
export default Header
