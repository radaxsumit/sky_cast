// { Current Weather Data}
export const getCurrentWeather = async (city) => {
    try {
        const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?q=${city}&days=3&aqi=yes&key=${import.meta.env.VITE_API_KEY}`);
        console.log(response);
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`City {${city}} not found, please check the specified location`);
            } else if (response.status === 401) {
                throw new Error("Invalid API Key, Please check your openWeatherMap API configuration");
            }
        }

        const data = await response.json();
        return data;

    } catch (error) {
        if (error instanceof TypeError && error.message.includes("fetch")) {
            throw new Error("Network Error");
        }
        throw error;
    }
}

