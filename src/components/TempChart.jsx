export const TempChart = ({ hourlyData = [], convertTemp, unit }) => {
    if (!hourlyData.length) {
        return (
            <div className="bg-white rounded-3xl p-8 text-center text-slate-400">
                Loading temperature chart...
            </div>
        );
    }

    const convertedData = hourlyData.map(item => ({
        ...item,
        temp: convertTemp(item.temp),
    }));

    return (
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm transition-colors">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">
                    Temperature Forecast (°{unit})
                </h3>
            </div>

            {/* ✅ FIXED HEIGHT CONTAINER */}
            <div className="h-[220px] w-full">
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

                        <Tooltip />

                        <Area
                            type="monotone"
                            dataKey="temp"
                            stroke="#6366f1"
                            strokeWidth={3}
                            fill="url(#tempGradient)"
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
