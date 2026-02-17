import {React, useState, useEffect} from "react";
import { Search, MapPin, Moon, Sun, LocateFixed  } from "lucide-react";
import {fetchSuggestions} from "../services/weatherApi.js";

const Header = ({
                    isDarkMode,
                    toggleDarkMode,
                    weatherData,
                    unit,
                    toggleUnit,
                    onSearch
                }) => {

    const { location, date } = weatherData;
    const [searchValue, setSearchValue] = useState("")
    const [suggestions, setSuggestions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const handleSelect = (suggestion) => {
        onSearch({ lat: suggestion.lat, lon: suggestion.lon });
        setSearchValue("");
        setShowSuggestions(false);
    };

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchValue.length >= 3) {
                setIsSearching(true);
                const results = await fetchSuggestions(searchValue);
                setSuggestions(results);
                setIsSearching(false);
                setShowSuggestions(true);
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchValue]);




    const handleSubmit = (e) => {
        e.preventDefault();
        if (!searchValue.trim()) return;

        onSearch(searchValue);
        setSearchValue("");
    };

    return (
        <header className="flex flex-col md:flex-row items-center justify-between gap-6">

            {/* LEFT */}
            <div className="flex-shrink-0">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
                    WeatherDashboard
                </h1>

                <div className="flex gap-2 mt-1 items-center text-slate-400">
                    <MapPin className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm font-medium">
                        {location} • {date}
                    </span>
                </div>
            </div>

            {/* RIGHT */}
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">

                {/* SEARCH */}
                <div className="relative w-full sm:w-64 md:w-80">
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute w-full mt-15 bg-slate-900 rounded-xl shadow-xl z-50">
                            {suggestions.map((item, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleSelect(item)}
                                    className="px-4 py-3 hover:bg-slate-800 cursor-pointer"
                                >
                                    <p className="font-semibold">{item.name}</p>
                                    <p className="text-xs text-slate-400">{item.display}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            placeholder="Search city..."
                            className="w-full pl-12 pr-10 py-3.5 bg-white text-slate-700 dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/40 placeholder-slate-400 dark:placeholder-slate-600 transition-all outline-none"
                        />
                        <button
                            onClick={() => {
                                navigator.geolocation.getCurrentPosition((pos) => {
                                    onSearch({ lat: pos.coords.latitude, lon: pos.coords.longitude });
                                });
                            }}
                            className="text-sm text-indigo-500 hover:underline"
                        >
                            <LocateFixed className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6"/>
                        </button>

                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-600" />

                    </form>

                </div>

                {/* UNIT + THEME */}
                <div className="flex items-center gap-3 p-2 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">

                    {/* UNIT TOGGLE */}
                    <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
                        <button
                            onClick={toggleUnit}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                unit === "C"
                                    ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-sm"
                                    : "text-slate-400"
                            }`}
                        >
                            °C
                        </button>

                        <button
                            onClick={toggleUnit}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                unit === "F"
                                    ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-sm"
                                    : "text-slate-400"
                            }`}
                        >
                            °F
                        </button>
                    </div>

                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />

                    {/* DARK MODE */}
                    <button
                        onClick={toggleDarkMode}
                        className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 dark:text-slate-400"
                    >
                        {isDarkMode ? (
                            <Sun className="w-5 h-5" />
                        ) : (
                            <Moon className="w-5 h-5" />
                        )}
                    </button>
                </div>

            </div>
        </header>
    );
};

export default Header;
