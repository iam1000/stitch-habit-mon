import React, { useMemo } from 'react';
import { TrendingUp, PieChart, DollarSign, Activity } from 'lucide-react';

const KPICard = ({ title, value, subValue, icon: Icon, colorClass }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
            {subValue && <p className="text-sm text-gray-400 mt-1">{subValue}</p>}
        </div>
        <div className={`p-4 rounded-full ${colorClass} bg-opacity-10`}>
            <Icon size={24} className={colorClass.replace('bg-', 'text-')} />
        </div>
    </div>
);

const KPICards = ({ investmentData, accountData }) => {
    // Calculate Metrics
    const metrics = useMemo(() => {
        let totalInvestment = 0;
        let buyCount = 0;
        let sellCount = 0;
        const accountHoldings = {};

        investmentData.forEach(item => {
            const amount = Number(item.amount) || ((Number(item.qty) || Number(item.quantity) || 0) * (Number(item.price) || 0));
            // Assuming amount is correct (signed or based on signed qty). 
            // If qty is negative for sell, amount is negative.
            totalInvestment += amount;

            if (amount > 0) buyCount++;
            else sellCount++;

            // Accumulate per account
            const accId = String(item.category);
            accountHoldings[accId] = (accountHoldings[accId] || 0) + amount;
        });

        // Top Account
        let topAccountName = '-';
        let topAccountValue = 0;
        Object.entries(accountHoldings).forEach(([accId, value]) => {
            if (value > topAccountValue) {
                topAccountValue = value;
                const acc = accountData.find(a => String(a.id) === accId);
                topAccountName = acc ? acc.name : accId;
            }
        });

        // Last Transaction (Newest)
        const lastItem = investmentData.length > 0 ? investmentData[investmentData.length - 1] : null;

        return {
            totalAmount: totalInvestment,
            transactionCount: investmentData.length,
            topAccount: topAccountName,
            topAccountVal: topAccountValue,
            lastTransaction: lastItem
        };
    }, [investmentData, accountData]);

    const formatMoney = (val) => `₩ ${Math.round(val || 0).toLocaleString()}`;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <KPICard
                title="총 자산 (추정)"
                value={formatMoney(metrics.totalAmount)}
                subValue="순 투자 원금 기준"
                icon={DollarSign}
                colorClass="bg-blue-500 text-blue-500"
            />
            <KPICard
                title="총 투자 건수"
                value={`${metrics.transactionCount} 건`}
                subValue="매수/매도 포함"
                icon={Activity}
                colorClass="bg-purple-500 text-purple-500"
            />
            <KPICard
                title="주력 계좌"
                value={metrics.topAccount}
                subValue={formatMoney(metrics.topAccountVal)}
                icon={PieChart}
                colorClass="bg-green-500 text-green-500"
            />
            <KPICard
                title="최근 활동"
                value={metrics.lastTransaction ? (metrics.lastTransaction.item_name || metrics.lastTransaction.name || metrics.lastTransaction.item || '알 수 없음') : '기록 없음'}
                subValue={metrics.lastTransaction ? `${metrics.lastTransaction.date || ''} · ${formatMoney(metrics.lastTransaction.amount)}` : '데이터가 없습니다'}
                icon={TrendingUp}
                colorClass="bg-orange-500 text-orange-500"
            />
        </div>
    );
};

export default KPICards;
