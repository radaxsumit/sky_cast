
export interface WeatherData {
    city: string;
    state: string;
    country: string;
    temperature: number;
    condition: string;
    feelsLike: number;
    pressure: string;
    visibility: string;
    humidity: string;
    date: string;
    forecast: ForecastDay[];
    hourlyTemp: HourlyTemp[];
    airQuality: string;
    uvIndex: number;
    windSpeed: string;
    sunrise: string;
    sunset: string;
}

export interface ForecastDay {
    day: string;
    condition: string;
    high: number;
    low: number;
    icon: string;
}

export interface HourlyTemp {
    time: string;
    temp: number;
}
