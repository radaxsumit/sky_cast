import React, { useState, useEffect } from "react";
import { Search, MapPin, Moon, Sun, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchSuggestions } from "../services/weatherApi.js";

const Header = ({
                    isDarkMode,
                    toggleDarkMode,
                    weatherData,
                    unit,
                    toggleUnit,
                    onSearch
                }) => {

    const { location, date } = weatherData;

    const [searchValue, setSearchValue] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    /* -----------------------------
       🔍 SEARCH SUGGESTIONS
    ------------------------------ */
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
        }, 400);

        return () => clearTimeout(timer);
    }, [searchValue]);

    const handleSelect = (suggestion) => {
        onSearch({ lat: suggestion.lat, lon: suggestion.lon });
        setSearchValue("");
        setShowSuggestions(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!searchValue.trim()) return;
        onSearch(searchValue);
        setSearchValue("");
        setShowSuggestions(false);
    };

    return (
        <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col lg:flex-row lg:items-center justify-between gap-6"
        >

            {/* LEFT SIDE */}
            <div className="flex flex-col">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 dark:text-white">
                    WeatherDashboard
                </h1>

                <div className="flex items-center gap-2 mt-1 text-slate-500 dark:text-slate-400">
                    <MapPin className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm font-medium">
                        {location} • {date}
                    </span>
                </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">

                {/* SEARCH BAR */}
                <div className="relative w-full sm:w-72 lg:w-80">

                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            placeholder="Search city..."
                            className="w-full pl-12 pr-10 py-3 rounded-2xl bg-white/90 dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-sm focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all outline-none"
                        />

                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                        {isSearching && (
                            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500 animate-spin" />
                        )}
                    </form>

                    {/* Suggestions Dropdown */}
                    <AnimatePresence>
                        {showSuggestions && suggestions.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.25 }}
                                className="absolute top-full left-0 w-full mt-3 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden"
                            >
                                {suggestions.map((item, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSelect(item)}
                                        className="w-full text-left px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0"
                                    >
                                        <p className="font-semibold text-slate-800 dark:text-white text-sm">
                                            {item.name}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {item.display}
                                        </p>
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                </div>

                {/* UNIT + THEME CONTROLS */}
                <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">

                    {/* UNIT TOGGLE */}
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                        <button
                            onClick={toggleUnit}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                unit === "C"
                                    ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-sm"
                                    : "text-slate-400"
                            }`}
                        >
                            °C
                        </button>

                        <button
                            onClick={toggleUnit}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
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
                        className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-all"
                    >
                        {isDarkMode ? (
                            <Sun className="w-5 h-5" />
                        ) : (
                            <Moon className="w-5 h-5" />
                        )}
                    </button>

                </div>

            </div>
        </motion.header>
    );
};

export default Header;
