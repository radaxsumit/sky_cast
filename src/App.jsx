import React, {useEffect, useState} from 'react'
import {SideNav} from "./components/SideNav.jsx";
import {Loader2} from 'lucide-react';
import Header from "./components/Header.jsx";
import {MainWeatherCard} from "./components/MainWeatherCard.jsx";
import {TempChart} from "./components/TempChart.jsx";
import WeatherStatsGrid from "./components/WeatherStatsGrid.jsx";
import {ForecastList} from "./components/ForecastList.jsx";


const App = () => {
    const [loading, setLoading] = useState(false);
    // const [unit, setUnit] = useState < TemperatureUnit > ('F');

    const [isDarkMode, setIsDarkMode] = useState(()=>{
        if( typeof window !== 'undefined'){
            return document.documentElement.classList.contains('dark');
        }
        return false;
    });

    // Update DOM and LocalStorage whenever isDarkMode state changes
    useEffect(()=>{
        if(isDarkMode){
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    },[isDarkMode]);

    const toggleDarkMode = () => setIsDarkMode(prev => !prev);

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
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-500">
            <SideNav isDarkMode={isDarkMode}/>

            <main className="flex-1 flex flex-col p-4 md:p-8 lg:p-10 ml-0 md:ml-20 overflow-x-hidden relative ">
                <Header isDarkMode={isDarkMode} togglrDarkMode={toggleDarkMode}/>

                <div className="grid grid-cols-12  gap-8 mt-8">
                    <div className="lg:col-span-8 flex flex-col gap-8">
                        <MainWeatherCard />
                        <TempChart />
                        <WeatherStatsGrid/>
                    </div>

                    <div className="lg:col-span-4 h-full">
                        <ForecastList/>
                    </div>
                </div>
            </main>
        </div>
    )
}
export default App
