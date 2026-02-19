import {Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";

export const TempChart = ({ hourlyData = [], converTemp, unit}) => {

    if (!hourlyData.length) {
        return (
            <div className="bg-white rounded-3xl p-8 text-center text-slate-400">
                Loading temperature chart...
            </div>
        );
    }

    const convertedData = hourlyData.map(item => ({
        time: item.time,
        temp:
            unit === "C"
                ? item.temp_c
                : item.temp_f
    }));


    return (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm shadow-slate-200/50 dark:shadow-none dark:border dark:border-slate-800 transition-colors">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                    Temperature Forecast (°{unit})
                </h3>

                <div className="flex gap-2 p-1 bg-slate-50 dark:bg-slate-800 rounded-full">
                    <button className="px-4 py-1.5 rounded-full text-xs font-bold bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm">
                        Today
                    </button>
                    <button className="px-4 py-1.5 rounded-full text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-slate-600 transition-colors">
                        Tomorrow
                    </button>
                </div>
            </div>

            <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={convertedData}>
                        <defs>
                            <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                        </defs>

                        <XAxis
                            dataKey="time"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12 }}
                        />

                        <YAxis hide />

                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-slate-900 dark:bg-slate-800 text-white px-3 py-1.5 rounded-xl text-sm font-bold shadow-xl border border-white/10">
                                            {payload[0].value}°{unit}
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />

                        <Area
                            type="monotone"
                            dataKey="temp"
                            stroke="#6366f1"
                            strokeWidth={3}
                            fill="url(#tempGradient)"
                            dot={{
                                r: 3,
                                fill: "#6366f1",
                                stroke: "transparent"
                            }}
                            activeDot={{
                                r: 5,
                                fill: "#6366f1",
                                stroke: "transparent"
                            }}
                        />


                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
