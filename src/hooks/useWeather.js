import { getCurrentWeather } from "../services/weatherApi.js";
import { useState } from "react";

export const useWeather = () => {
    const [current, setCurrent] = useState(null);
    const [forecast, setForecast] = useState([]);
    const [hourlyData, setHourlyData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchWeather = async (location) => {
        setLoading(true);
        setError(null);

        try {
            const data = await getCurrentWeather(location);

            // ✅ CURRENT WEATHER
            setCurrent({
                location: data.location.name,
                country: data.location.country,
                temperature: data.current.temp_c,
                temp_f: data.current.temp_f,
                feelsLike_c: data.current.feelslike_c,
                feelsLike_f: data.current.feelslike_f,
                condition: data.current.condition.text,
                icon: data.current.condition.icon,

                humidity: data.current.humidity,
                windSpeed: data.current.wind_kph,
                pressure: data.current.pressure_mb,
                visibility: data.current.vis_km,

                sunrise: data.forecast.forecastday[0].astro.sunrise,
                sunset: data.forecast.forecastday[0].astro.sunset,

                localTime: data.location.localtime,
                date: data.forecast.forecastday[0].date,

                aqi: data.current.air_quality["us-epa-index"],
            });

            // ✅ FORECAST
            setForecast(
                data.forecast.forecastday.map(day => ({
                    date: day.date,
                    day: new Date(day.date).toLocaleDateString("en-US", {
                        weekday: "short",
                    }),
                    max_c: Math.round(day.day.maxtemp_c),
                    max_f: Math.round(day.day.maxtemp_f),
                    min_c: Math.round(day.day.mintemp_c),
                    min_f: Math.round(day.day.mintemp_f),
                    condition: day.day.condition.text,
                    icon: day.day.condition.icon,
                }))
            );

            // ✅ HOURLY DATA
            setHourlyData(
                data.forecast.forecastday[0].hour.map(h => ({
                    time: h.time.split(" ")[1],
                    temp_c: h.temp_c,
                    temp_f: h.temp_f,
                }))
            );

        } catch (e) {
            setError(
                e instanceof Error ? e.message : "Something went wrong"
            );
        } finally {
            setLoading(false);
        }
    };

    return { current, forecast, hourlyData, loading, error, fetchWeather };
};
