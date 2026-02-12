import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF00CC'];

const PortfolioChart = ({ data, accounts }) => {

    // Group by Account
    const chartData = useMemo(() => {
        const accMap = {};

        data.forEach(item => {
            const amount = Number(item.amount) || (item.qty * item.price);
            const accountId = String(item.category);

            // Assuming amounts are additive
            accMap[accountId] = (accMap[accountId] || 0) + amount;
        });

        const mappedData = Object.entries(accMap).map(([id, value]) => {
            const acc = accounts.find(a => String(a.id) === id);
            return {
                name: acc ? acc.name : `Account ${id}`,
                value: value
            };
        });

        // Filter out zero or negative (for pie chart visibility, usually positive is needed)
        // If value < 0, maybe exclude or separate?
        return mappedData.filter(d => d.value > 0);

    }, [data, accounts]);

    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        const timer = setTimeout(() => setIsMounted(true), 500);
        return () => clearTimeout(timer);
    }, []);

    if (!isMounted) return (
        <div className="h-[300px] w-full bg-gray-50/50 dark:bg-gray-800/50 animate-pulse rounded-xl flex items-center justify-center">
            <div className="text-gray-400 text-sm">차트 로드 중...</div>
        </div>
    );

    return (
        <div className="relative w-full h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300} debounce={100}>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1F2937', color: '#F3F4F6', border: 'none', borderRadius: '8px' }}
                        formatter={(value) => `₩ ${value.toLocaleString()}`}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default PortfolioChart;
