import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Trophy,
    Medal,
    Crown,
    Search
} from 'lucide-react';
import { useLanguage } from './LanguageContext';

const Leaderboard = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();

    // Mock Leaderboard Data
    const leaders = [
        { id: 1, name: "DragonSlayer99", level: 45, xp: 4500, avatar: "🐲" },
        { id: 2, name: "HabitMaster", level: 42, xp: 4150, avatar: "🧙‍♂️" },
        { id: 3, name: "PixelHero", level: 38, xp: 3900, avatar: "👾" },
        { id: 4, name: "MorningPerson", level: 35, xp: 3500, avatar: "☀️" },
        { id: 5, name: "GymRat", level: 33, xp: 3200, avatar: "💪" },
        { id: 6, name: "BookWorm", level: 30, xp: 3000, avatar: "📚" },
        { id: 7, name: "CodeNinja", level: 28, xp: 2800, avatar: "💻" },
        { id: 8, name: "WaterLover", level: 25, xp: 2500, avatar: "💧" },
        { id: 9, name: "SleepyHead", level: 22, xp: 2200, avatar: "😴" },
        { id: 10, name: "Walker", level: 20, xp: 2000, avatar: "🚶" },
    ];

    const getRankIcon = (rank) => {
        switch (rank) {
            case 1: return <Crown className="text-yellow-500 fill-yellow-500 animate-bounce-slow" size={24} />;
            case 2: return <Medal className="text-gray-400 fill-gray-400" size={24} />;
            case 3: return <Medal className="text-amber-700 fill-amber-700" size={24} />;
            default: return <span className="text-gray-500 font-bold w-6 text-center">{rank}</span>;
        }
    };

    const getRankStyle = (rank) => {
        switch (rank) {
            case 1: return "bg-yellow-50 border-yellow-200 shadow-sm";
            case 2: return "bg-gray-50 border-gray-200";
            case 3: return "bg-orange-50 border-orange-200";
            default: return "bg-white border-transparent hover:border-gray-100";
        }
    };

    return (
        <div className="font-body pb-24">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-20 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-[800] text-[var(--text-main)] flex items-center gap-2 font-heading">
                        <Trophy className="text-[#8c36e2]" />
                        {t.leaderboard}
                    </h1>
                </div>

                <div className="relative hidden sm:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="pl-9 pr-4 py-2 bg-gray-50 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#8c36e2]/20 w-48"
                    />
                </div>
            </header>

            <main className="container mx-auto px-6 py-8">

                {/* Top 3 Podium (Visual Flare) */}
                <div className="flex justify-center items-end gap-4 mb-12 h-48">
                    {[leaders[1], leaders[0], leaders[2]].map((leader, index) => {
                        const rank = index === 1 ? 1 : (index === 0 ? 2 : 3);
                        const height = rank === 1 ? 'h-40' : (rank === 2 ? 'h-32' : 'h-24');
                        const color = rank === 1 ? 'bg-gradient-to-t from-yellow-300 to-yellow-100' : (rank === 2 ? 'bg-gradient-to-t from-gray-300 to-gray-100' : 'bg-gradient-to-t from-orange-300 to-orange-100');

                        return (
                            <motion.div
                                key={leader.id}
                                className="flex flex-col items-center"
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: index * 0.2 }}
                            >
                                <div className="relative mb-2">
                                    <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center text-3xl z-10 relative">
                                        {leader.avatar}
                                    </div>
                                    {rank === 1 && <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-2xl animate-bounce">👑</div>}
                                </div>
                                <div className={`w-24 ${height} ${color} rounded-t-xl flex flex-col justify-end p-2 text-center shadow-lg`}>
                                    <span className="font-bold text-[var(--text-main)] text-sm truncate w-full">{leader.name}</span>
                                    <span className="text-xs text-gray-600 font-bold">{leader.xp} XP</span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>


                {/* Ranking List */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden max-w-2xl mx-auto">
                    <div className="p-4 border-b border-gray-50 flex text-gray-400 text-xs font-bold uppercase tracking-wider">
                        <span className="w-12 text-center">Rank</span>
                        <span className="flex-1 pl-4">Player</span>
                        <span className="w-20 text-center">Level</span>
                        <span className="w-24 text-right pr-4">XP</span>
                    </div>

                    {leaders.map((leader, index) => (
                        <motion.div
                            key={leader.id}
                            className={`flex items-center p-4 border-b border-gray-50 last:border-none transition-colors ${getRankStyle(index + 1)}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 + 0.5 }}
                            whileHover={{ scale: 1.01, backgroundColor: "#fafafa" }}
                        >
                            <div className="w-12 flex justify-center">
                                {getRankIcon(index + 1)}
                            </div>
                            <div className="flex-1 flex items-center gap-3 pl-4">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl shadow-inner">
                                    {leader.avatar}
                                </div>
                                <div className="font-bold text-[var(--text-main)]">
                                    {leader.name}
                                </div>
                            </div>
                            <div className="w-20 text-center font-bold text-gray-500">
                                {leader.level}
                            </div>
                            <div className="w-24 text-right pr-4 font-mono font-bold text-[#8c36e2]">
                                {leader.xp.toLocaleString()}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* User's Current Rank (Fixed Bottom) */}
                <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t border-gray-200 p-4 lg:pl-72 z-10">
                    <div className="container mx-auto flex items-center justify-between max-w-2xl">
                        <div className="flex items-center gap-3">
                            <span className="font-bold text-gray-500 w-8 text-center">#99</span>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#42f05f] to-[#2ecc71] flex items-center justify-center text-white font-bold">
                                Me
                            </div>
                            <div>
                                <div className="font-bold">My Monster</div>
                                <div className="text-xs text-gray-500">Keep pushing to reach Top 10!</div>
                            </div>
                        </div>
                        <div className="font-bold text-[#8c36e2]">
                            1,250 XP
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default Leaderboard;
