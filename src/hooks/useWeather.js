import { getCurrentWeather } from "../services/weatherApi.js";
import { useState } from "react";

export const useWeather = () => {
    const [current, setCurrent] = useState(null);
    const [forecast, setForecast] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchWeatherByCity = async (city) => {
        if (!city) return;

        setLoading(true);
        setError(null);
        const data = await getCurrentWeather(city);



        try {
            const data = await getCurrentWeather(city);

            setCurrent({
                location: data.location.name,
                country: data.location.country,
                temperature: data.current.temp_c,
                temp_f: data.current.temp_f,
                feelsLike: data.current.feelslike_c,
                condition: data.current.condition.text,
                icon: data.current.condition.icon,

                humidity: data.current.humidity,
                windSpeed: data.current.wind_kph,
                pressure: data.current.pressure_mb,
                visibility: data.current.vis_km,

                localTime: data.location.localtime,
                date: data.forecast.forecastday[0].date,

                aqi: data.current.air_quality["us-epa-index"],
            });

            setForecast(
                data.forecast.forecastday.map(day => ({
                    date: day.date,
                    day: new Date(day.date).toLocaleDateString("en-US", {
                        weekday: "short", // Mon, Tue
                    }),
                    minTemp: Math.round(day.day.mintemp_c),
                    maxTemp: Math.round(day.day.maxtemp_c),
                    condition: day.day.condition.text,
                    icon: day.day.condition.icon,
                }))
            );
            // const dayNameShort = day.date.toLocaleDateString('en-US', optionsShort)
        } catch (e) {
            setError(
                e instanceof Error ? e.message : "Something went wrong"
            );
        } finally {
            setLoading(false);
        }
    };

    return { current, forecast, loading, error, fetchWeatherByCity };
};
