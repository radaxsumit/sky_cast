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
   🌦 FETCH WEATHER
-------------------------- */
export const getCurrentWeather = async (location) => {

    let query;

    if (typeof location === "string") {
        query = location;
    } else {
        query = `${location.lat},${location.lon}`;
    }

    const response = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?q=${query}&days=3&aqi=yes&key=${import.meta.env.VITE_API_KEY}`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch weather");
    }

    return await response.json();
};

