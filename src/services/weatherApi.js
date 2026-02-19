const API_KEY = import.meta.env.VITE_API_KEY;

/* --------------------------
   🔍 FETCH SUGGESTIONS
-------------------------- */
export const fetchSuggestions = async (query) => {
    if (!query || query.length < 2) return [];

    try {
        const res = await fetch(
            `https://api.weatherapi.com/v1/search.json?key=${import.meta.env.VITE_API_KEY}&q=${query}`
        );

        if (!res.ok) throw new Error("Suggestion fetch failed");

        const data = await res.json();

        return data.map((item) => ({
            name: item.name,
            region: item.region,
            country: item.country,
            display: `${item.name}, ${item.region}, ${item.country}`,
            lat: item.lat,
            lon: item.lon,
        }));
    } catch (err) {
        console.error("Suggestion error:", err);
        return [];
    }
};

/* --------------------------
   📍 GET USER LOCATION WEATHER
-------------------------- */
export const getUserLocationWeather = (fetchWeather) => {
    if (!("geolocation" in navigator)) {
        console.log("Geolocation not supported, fallback to Jaipur");
        fetchWeather("Jaipur");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;

            fetchWeather({
                lat: latitude,
                lon: longitude
            });
        },
        () => {
            console.log("Location denied, fallback to Jaipur");
            fetchWeather("Jaipur");
        }
    );
};

/* --------------------------
   🌦 FETCH WEATHER
-------------------------- */
export const getCurrentWeather = async (location) => {

    const query =
        typeof location === "object"
            ? `${location.lat},${location.lon}`
            : location;

    const response = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?q=${query}&days=3&aqi=yes&key=${API_KEY}`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch weather");
    }

    return await response.json();
};

