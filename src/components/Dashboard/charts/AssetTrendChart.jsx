import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AssetTrendChart = ({ data, startDate }) => {
    // Process data for chart
    const chartData = useMemo(() => {
        const sorted = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
        let cumulativeValue = 0;
        const trendMap = new Map();

        // 1. Calculate Cumulative Value over ALL time
        sorted.forEach(item => {
            const amount = Number(item.amount) || (item.qty * item.price);
            cumulativeValue += amount;

            // Key: YYYY-MM-DD
            // Assuming item.date is 'YYYY-MM-DD' from the hook
            trendMap.set(item.date, cumulativeValue);
        });

        // 2. Convert to Array
        let trendArray = Array.from(trendMap, ([date, value]) => ({ date, value }));

        // 3. Filter by startDate
        if (startDate) {
            trendArray = trendArray.filter(d => new Date(d.date) >= startDate);
        }

        return trendArray;
    }, [data, startDate]);

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis
                        dataKey="date"
                        stroke="#9CA3AF"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(str) => {
                            const d = new Date(str);
                            return `${d.getMonth() + 1}/${d.getDate()}`;
                        }}
                    />
                    <YAxis
                        stroke="#9CA3AF"
                        fontSize={12}
                        tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1F2937', color: '#F3F4F6', border: 'none', borderRadius: '8px' }}
                        formatter={(value) => `₩ ${value.toLocaleString()}`}
                    />
                    <Area type="monotone" dataKey="value" stroke="#8884d8" fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default AssetTrendChart;
