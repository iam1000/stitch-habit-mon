import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const MonthlyBarChart = ({ data }) => {
    // Process data for monthly activity
    const chartData = useMemo(() => {
        const aggregated = {};

        data.forEach(item => {
            const date = new Date(item.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!aggregated[monthKey]) {
                aggregated[monthKey] = { name: monthKey, buy: 0, sell: 0 };
            }

            const amount = Number(item.amount) || (item.qty * item.price);

            // Assuming positive amount is Buy, negative is Sell? Or type field?
            // If item.type is available
            if (item.type === 'buy') {
                aggregated[monthKey].buy += Math.abs(amount);
            } else if (item.type === 'sell') {
                aggregated[monthKey].sell += Math.abs(amount);
            } else {
                // Fallback: Positive amount = Buy, Negative = Sell
                if (amount >= 0) aggregated[monthKey].buy += amount;
                else aggregated[monthKey].sell += Math.abs(amount);
            }
        });

        // Convert to array and sort by month
        return Object.values(aggregated).sort((a, b) => a.name.localeCompare(b.name));
    }, [data]);

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} tickLine={false} axisLine={false} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1F2937', color: '#F3F4F6', border: 'none', borderRadius: '8px' }}
                        formatter={(value) => `₩ ${value.toLocaleString()}`}
                    />
                    <Legend />
                    <Bar dataKey="buy" fill="#8884d8" name="Buy" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="sell" fill="#82ca9d" name="Sell" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default MonthlyBarChart;
