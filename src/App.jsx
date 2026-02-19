import React, {useEffect, useState} from 'react'
import { motion, AnimatePresence } from "framer-motion";
import {SideNav} from "./components/SideNav.jsx";
import {Loader2} from 'lucide-react';
import Header from "./components/Header.jsx";
import {MainWeatherCard} from "./components/MainWeatherCard.jsx";
import {TempChart} from "./components/TempChart.jsx";
import {WeatherStatsGrid} from "./components/WeatherStatsGrid.jsx"
import {ForecastList} from "./components/ForecastList.jsx";
import {useWeather} from "./hooks/useWeather";
import { getUserLocationWeather } from "./services/weatherApi.js";

const App = () => {

    const { current, forecast, hourlyData, loading, error, fetchWeather } = useWeather();

    useEffect(() => {
        getUserLocationWeather(fetchWeather);
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

    const [unit, setUnit] = useState("C"); // "F" | "C"

    const toggleUnit = () => {
        setUnit(prev => (prev === "C" ? "F" : "C"));
    };


    const convertTemp = (tempC, tempF) => {
        return unit === "C" ? tempC : tempF;
    };


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
        <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-500">

            <SideNav isDarkMode={isDarkMode} />

            <main className="flex-1 flex flex-col px-4 sm:px-6 md:px-10 lg:px-14 py-6 ml-0 md:ml-20 overflow-x-hidden relative">

                {/* Animated Loading Bar */}
                {loading && current && (
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 1.2 }}
                        className="absolute top-0 left-0 h-1 bg-indigo-500 z-50"
                    />
                )}

                <AnimatePresence mode="wait">

                    {current && (
                        <motion.div
                            key={current.location}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="flex flex-col gap-8"
                        >
                            <Header
                                weatherData={current}
                                unit={unit}
                                toggleUnit={toggleUnit}
                                isDarkMode={isDarkMode}
                                toggleDarkMode={toggleDarkMode}
                                onSearch={fetchWeather}
                            />

                            {/* Responsive Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">

                                {/* LEFT SIDE */}
                                <div className="lg:col-span-8 flex flex-col gap-6">

                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        <MainWeatherCard
                                            weatherData={current}
                                            forecast={forecast}
                                            unit={unit}
                                        />
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <TempChart
                                            weatherData={current}
                                            isDarkMode={isDarkMode}
                                            hourlyData={hourlyData}
                                            converTemp={convertTemp}
                                            unit={unit}
                                        />
                                    </motion.div>

                                </div>

                                {/* RIGHT SIDE */}
                                <div className="lg:col-span-4 flex flex-col gap-6">

                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <ForecastList forecast={forecast} unit={unit} />
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        <WeatherStatsGrid
                                            weatherData={current}
                                            isDarkMode={isDarkMode}
                                            unit={unit}
                                        />
                                    </motion.div>

                                </div>
                            </div>

                        </motion.div>
                    )}

                </AnimatePresence>

                {/* Error Section */}
                {error && !current && (
                    <div className="flex-1 flex items-center justify-center">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30 text-red-600 p-8 rounded-3xl border max-w-md text-center shadow-xl"
                        >
                            <p className="font-semibold text-xl mb-3 text-red-700 dark:text-red-400">
                                Connection Error
                            </p>
                            <p className="text-sm opacity-80">{error}</p>

                            <button
                                onClick={() => fetchWeather("Jaipur")}
                                className="mt-6 px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all shadow-lg"
                            >
                                Retry
                            </button>
                        </motion.div>
                    </div>
                )}

            </main>
        </div>
    );

}
export default App
