// src/utils/weatherColorMap.js

export const getWeatherColor = (condition) => {
    if (!condition) return "text-white shadow-[0_0_18px_rgba(186,230,253,0.9)]";

    const c = condition.toLowerCase();

    if (c.includes("clear") || c.includes("sun"))
        return "text-yellow-300 shadow-[0_0_18px_rgba(253,224,71,0.9)]";

    if (c.includes("cloud"))
        return "text-slate-300 shadow-[0_0_14px_rgba(203,213,225,0.6)]";

    if (c.includes("rain") || c.includes("drizzle"))
        return "text-blue-400 shadow-[0_0_16px_rgba(147,197,253,0.8)]";

    if (c.includes("storm") || c.includes("thunder"))
        return "text-indigo-400 shadow-[0_0_20px_rgba(129,140,248,0.9)]";

    if (c.includes("snow"))
        return "text-sky-200 shadow-[0_0_18px_rgba(186,230,253,0.9)]";

    if (c.includes("fog") || c.includes("mist"))
        return "text-gray-300 ";

    return "text-white";
};
