// src/utils/weatherColorMap.js

export const getWeatherColor = (condition) => {
    if (!condition) return "text-white ";

    const c = condition.toLowerCase();

    if (c.includes("clear") || c.includes("sun"))
        return "text-yellow-300 ";

    if (c.includes("cloud"))
        return "text-slate-300 ";

    if (c.includes("rain") || c.includes("drizzle"))
        return "text-blue-400 ";

    if (c.includes("storm") || c.includes("thunder"))
        return "text-indigo-400 ";

    if (c.includes("snow"))
        return "text-sky-200 ";

    if (c.includes("fog") || c.includes("mist"))
        return "text-gray-300 ";

    return "text-white";
};
