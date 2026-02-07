import React, { useState } from 'react';
import {
    Globe,
    Bell,
    Moon,
    Sun,
    Trash2,
    LogOut,
    Check
} from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

import { useTheme } from './ThemeContext';

const Settings = () => {
    const { t, language, toggleLanguage } = useLanguage();
    const { signOut } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const navigate = useNavigate();

    // Mock Notifications
    const [notifications, setNotifications] = useState({
        dailyQuest: true,
        monsterHunger: true,
        updates: false
    });

    const handleToggleNotif = (key) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleResetGame = () => {
        if (window.confirm("ARE YOU SURE? This will delete your monster and all items! 😱")) {
            alert("Game Reset! (Mock action)");
            // In real logic: Supabase delete row, then reload
        }
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    return (
        <div className="font-body pb-12 transition-colors duration-200">
            {/* Header */}
            <header className="bg-[var(--bg-card)] border-b border-[var(--border-color)] sticky top-0 z-20 px-6 py-4">
                <h1 className="text-xl font-[800] text-[var(--text-main)] font-heading">
                    {t.settings}
                </h1>
            </header>

            <main className="container mx-auto px-6 py-8 max-w-2xl">

                {/* 1. Language & Appearance */}
                <section className="mb-8">
                    <h2 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4">Preferences</h2>
                    <div className="bg-[var(--bg-card)] rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden">

                        {/* Language */}
                        <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-500 flex items-center justify-center">
                                    <Globe size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-[var(--text-main)]">Language</p>
                                    <p className="text-xs text-[var(--text-muted)]">Current: {language === 'en' ? 'English' : '한국어'}</p>
                                </div>
                            </div>
                            <button
                                onClick={toggleLanguage}
                                className="px-4 py-2 bg-[var(--bg-main)] hover:opacity-80 rounded-lg text-sm font-bold text-[var(--text-main)] transition-colors"
                            >
                                Switch to {language === 'en' ? 'KR' : 'EN'}
                            </button>
                        </div>

                        {/* Dark Mode */}
                        <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-yellow-50 text-yellow-500'}`}>
                                    {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
                                </div>
                                <div>
                                    <p className="font-bold text-[var(--text-main)]">Theme</p>
                                    <p className="text-xs text-[var(--text-muted)]">{isDarkMode ? 'Dark Mode (ON)' : 'Light Mode (OFF)'}</p>
                                </div>
                            </div>
                            <button
                                onClick={toggleTheme}
                                className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${isDarkMode ? 'bg-purple-600' : 'bg-gray-300'}`}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 transform ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>

                    </div>
                </section>

                {/* 2. Notifications */}
                <section className="mb-8">
                    <h2 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4">Notifications</h2>
                    <div className="bg-[var(--bg-card)] rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden divide-y divide-[var(--border-color)]">
                        {['dailyQuest', 'monsterHunger', 'updates'].map((key) => (
                            <div key={key} className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/30 text-red-500 flex items-center justify-center">
                                        <Bell size={20} />
                                    </div>
                                    <p className="font-bold text-[var(--text-main)] capitalize">
                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleToggleNotif(key)}
                                    className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${notifications[key] ? 'bg-green-500 border-green-500 text-white' : 'bg-[var(--bg-card)] border-[var(--border-color)]'}`}
                                >
                                    {notifications[key] && <Check size={14} />}
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 3. Account Actions */}
                <section>
                    <h2 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4">Account</h2>
                    <div className="bg-[var(--bg-card)] rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden">

                        <button
                            onClick={handleResetGame}
                            className="w-full flex items-center gap-3 p-4 hover:bg-[var(--bg-main)] text-left transition-colors text-red-500 border-b border-[var(--border-color)]"
                        >
                            <Trash2 size={20} />
                            <div>
                                <p className="font-bold">Reset Game Data</p>
                                <p className="text-xs text-red-300">Warning: Cannot be undone</p>
                            </div>
                        </button>

                        <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 p-4 hover:bg-[var(--bg-main)] text-left transition-colors text-[var(--text-main)]"
                        >
                            <LogOut size={20} />
                            <p className="font-bold">Sign Out</p>
                        </button>

                    </div>
                    <p className="text-center text-xs text-gray-400 mt-6">
                        HabitMons v0.1.0 • Built with Stitch
                    </p>
                </section>

            </main>
        </div>
    );
};

export default Settings;
