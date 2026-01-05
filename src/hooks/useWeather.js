import { getCurrentWeather } from "../services/weatherApi.js";
import { useState } from "react";

export const useWeather = () => {
    const [weather, setWeather] = useState(null);
    const [forecast, setForecast] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchWeatherByCity = async (city) => {
        if (!city) return;

        setLoading(true);
        setError(null);

        try {
            const data = await getCurrentWeather(city);

            // ✅ NORMALIZE DATA HERE (VERY IMPORTANT)
            setWeather({
                temperature: data.current.temp_c,
                humidity: data.current.humidity,
                windSpeed: data.current.wind_kph,
                pressure: data.current.pressure_mb,
                visibility: data.current.vis_km,
                location: data.location.name,
                country: data.location.country,
                condition: data.current.condition.text,
                icon: data.current.condition.icon,

                aqi: data.current.air_quality["us-epa-index"],
                pm25: data.current.air_quality.pm2_5,
                pm10: data.current.air_quality.pm10,
            });

            // ✅ Normalize FORECAST
            const normalizedForecast = data.forecast.forecastday.map(day => ({
                date: day.date,
                minTemp: Math.round(day.day.mintemp_c),
                maxTemp: Math.round(day.day.maxtemp_c),
                condition: day.day.condition.text,
                icon: day.day.condition.icon,
            }));

            setForecast(normalizedForecast);

        } catch (e) {
            setError(
                e instanceof Error ? e.message : "Something went wrong"
            );
        } finally {
            setLoading(false);
        }
    };

    // ❌ REMOVE useEffect COMPLETELY FROM HOOK

    return { weather, loading, error, forecast, fetchWeatherByCity };
};
