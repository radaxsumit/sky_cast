import React, {useEffect, useState} from 'react'
import {SideNav} from "./components/SideNav.jsx";
import {Loader2} from 'lucide-react';
import Header from "./components/Header.jsx";
import {MainWeatherCard} from "./components/MainWeatherCard.jsx";
import {TempChart} from "./components/TempChart.jsx";
import {WeatherStatsGrid} from "./components/WeatherStatsGrid.jsx"
import {ForecastList} from "./components/ForecastList.jsx";
import {useWeather} from "./hooks/useWeather";


const App = () => {

    const {weather, forecast, loading, error, fetchWeatherByCity,} = useWeather();

    useEffect(() => {
        fetchWeatherByCity("Jaipur");
    }, []);

    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return document.documentElement.classList.contains('dark');
        }
        return false;
    });

    // Update DOM and LocalStorage whenever isDarkMode state changes
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const toggleDarkMode = () => setIsDarkMode(prev => !prev);
    const [unit, setUnit] = useState("F"); // "F" | "C"

    const toggleUnit = () => {
        setUnit((prev) => (prev === "F" ? "C" : "F"));
    };

    const convertTemp = (temp) => {
        if (unit === "C") {
            return Math.round(((temp - 32) * 5) / 9);
        }
        return temp;
    }

    if (loading) {
        return (
            <div
                className="h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin"/>
                    <p className="text-slate-500 font-medium">Fetching sky data...</p>
                </div>
            </div>
        );
    }
    return (
        <div
            className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-500">
            <SideNav isDarkMode={isDarkMode}/>

            <main className="flex-1 flex flex-col p-4 md:p-8 lg:p-10 ml-0 md:ml-20 overflow-x-hidden relative ">
                {/* Top loading bar */}
                {loading && weather && (
                    <div className="absolute top-0 left-0 right-0 h-1 z-[60] overflow-hidden">
                        <div
                            className="h-full bg-indigo-500 animate-[shimmer_1.5s_infinite] w-1/3 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                    </div>
                )}

                {weather && (
                    <div className={`flex flex-col transition-all duration-700 ${loading ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
                        <Header isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} weatherData={weather} forecast={forecast} />

                        <div className="grid grid-cols-12  gap-8 mt-8">
                            <div className="lg:col-span-8 flex flex-col gap-8">
                                <MainWeatherCard weatherData={weather} forecast={forecast} />
                                {/*<TempChart/>*/}
                                <WeatherStatsGrid weatherData={weather} isDarkMode={isDarkMode} />
                            </div>

                            <div className="lg:col-span-4 h-full">
                                {/*<ForecastList/>*/}
                            </div>
                        </div>
                    </div>
                )}

                {error && !weather && (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30 text-red-600 p-6 rounded-2xl border max-w-md text-center">
                            <p className="font-semibold text-lg mb-2 text-red-700 dark:text-red-400">
                                Connection Error
                            </p>
                            <p>{error}</p>
                            <button
                                // onClick={() => loadWeather()}
                                className="mt-4 px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg shadow-red-200 dark:shadow-none"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
export default App
