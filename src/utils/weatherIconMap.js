import {Sun, Moon, Cloud, CloudRain, CloudSnow, CloudLightning, CloudFog,} from "lucide-react";

export const getWeatherIcon = (condition, isDay = true) => {
    if (!condition) return Cloud;

    const text = condition.toLowerCase();

    if (text.includes("clear") || text.includes("sunny"))
        return isDay ? Sun : Moon;

    if (text.includes("cloud"))
        return Cloud;

    if (text.includes("rain") || text.includes("drizzle"))
        return CloudRain;

    if (text.includes("thunder") || text.includes("storm"))
        return CloudLightning;

    if (text.includes("snow"))
        return CloudSnow;

    if (text.includes("fog") || text.includes("mist") || text.includes("haze"))
        return CloudFog;

    return Cloud;
};
