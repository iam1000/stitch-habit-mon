import React, { useState, useMemo } from 'react';
import { RefreshCw, Calendar as CalendarIcon, Filter } from 'lucide-react';
import { useInvestmentData } from './hooks/useInvestmentData';
import KPICards from './components/Dashboard/KPICards';
import AssetTrendChart from './components/Dashboard/charts/AssetTrendChart';
import PortfolioChart from './components/Dashboard/charts/PortfolioChart';
import MonthlyActivityChart from './components/Dashboard/charts/MonthlyActivityChart';

const Dashboard = () => {
    const { investmentData, accountData, loading, error, refresh } = useInvestmentData();
    const [dateRange, setDateRange] = useState('year'); // 'year', 'all', 'month'

    // Calculate Start Date for Filtering
    const startDate = useMemo(() => {
        const now = new Date();
        if (dateRange === 'year') {
            return new Date(now.getFullYear(), 0, 1);
        } else if (dateRange === 'month') {
            return new Date(now.getFullYear(), now.getMonth(), 1);
        }
        return new Date(0); // All time
    }, [dateRange]);

    // Filter Transactions for Activity Chart & List (Show only activity in selected range)
    const activityData = useMemo(() => {
        return investmentData.filter(item => new Date(item.date) >= startDate);
    }, [investmentData, startDate]);

    if (loading && investmentData.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-center text-red-500">
                <p>Error loading dashboard data: {error}</p>
                <button onClick={refresh} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Retry</button>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">투자 대시보드</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">자산 현황 및 투자 성과를 한눈에 확인하세요.</p>
                </div>

                <div className="flex items-center gap-2">
                    {/* Date Range Select */}
                    <div className="relative">
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        >
                            <option value="year">올해 (YTD)</option>
                            <option value="month">이번 달</option>
                            <option value="all">전체 기간</option>
                        </select>
                        <CalendarIcon className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                    </div>

                    <button
                        onClick={refresh}
                        className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 hover:text-indigo-600 hover:border-indigo-600 transition-colors"
                        title="새로고침"
                    >
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {/* KPI Cards - Uses Full Data for Total Assets */}
            <KPICards investmentData={investmentData} accountData={accountData} />

            {/* Main Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Asset Trend - Uses Full Data + Start Date */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 min-w-0 overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg">자산 변동 추이</h3>
                        <div className="text-xs text-gray-500 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Daily Trend</div>
                    </div>
                    <div className="h-[300px] w-full">
                        <AssetTrendChart data={investmentData} startDate={startDate} />
                    </div>
                </div>

                {/* Portfolio Distribution - Uses Full Data (Current Status) */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col min-w-0 overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg">포트폴리오 비중</h3>
                        <div className="text-xs text-gray-500 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">By Account</div>
                    </div>
                    <div className="flex-1 flex items-center justify-center min-h-[300px]">
                        <PortfolioChart data={investmentData} accounts={accountData} />
                    </div>
                </div>
            </div>

            {/* Sub Charts / Details Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Activity - Uses Filtered Data (Transactions in period) */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 min-w-0 overflow-hidden">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-6">월별 투자 활동</h3>
                    <div className="h-[300px] w-full">
                        <MonthlyActivityChart data={activityData} />
                    </div>
                </div>
                {/* Recent Transactions List - Uses Filtered Data */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-4">최근 투자 내역</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th className="px-4 py-3 rounded-tl-lg">Date</th>
                                    <th className="px-4 py-3">Item</th>
                                    <th className="px-4 py-3">Category</th>
                                    <th className="px-4 py-3 text-right">Amount</th>
                                    <th className="px-4 py-3 rounded-tr-lg">Type</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activityData.slice(-5).reverse().map((item, index) => (
                                    <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{item.date}</td>
                                        <td className="px-4 py-3">{item.item_name}</td>
                                        <td className="px-4 py-3">{(accountData.find(a => String(a.id) === String(item.category)) || {}).name || item.category}</td>
                                        <td className="px-4 py-3 text-right">₩ {(Number(item.amount || (item.qty * item.price))).toLocaleString()}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${item.type === 'buy' || item.amount > 0 ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                                                {item.type === 'buy' || item.amount > 0 ? 'Buy' : 'Sell'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {activityData.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-3 text-center">데이터가 없습니다.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
