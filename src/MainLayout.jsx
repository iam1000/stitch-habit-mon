import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    Home,
    User,
    Trophy,
    ShoppingBag,
    Settings,
    LogOut,
    X,
    Book,
    Moon,
    Sun,
    Globe,
    TrendingUp
} from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';

const MainLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t, language, toggleLanguage } = useLanguage();
    const { signOut } = useAuth();

    // Initial Tabs State
    const [tabs, setTabs] = useState([
        { id: '/dashboard', label: t.dashboard, icon: Home }
    ]);
    const [activeTab, setActiveTab] = useState('/dashboard');

    // Menu Items Definition
    const menuItems = [
        { icon: Home, label: t.dashboard, path: '/dashboard' },
        { icon: User, label: t.myMonster, path: '/my-monster' },
        { icon: Trophy, label: t.leaderboard, path: '/leaderboard' },
        { icon: ShoppingBag, label: t.shop, path: '/shop' },
{ icon: Book, label: 'NotebookLM', path: '/notebooks' },
        { icon: TrendingUp, label: t.investment, path: '/investment' },
        { icon: Globe, label: t.friends, path: '/friends' },
    ];

    // Sync Route with Tabs
    useEffect(() => {
        const currentPath = location.pathname;

        // If visiting a page not in tabs (e.g. from direct URL), add it
        const allItems = [...menuItems, { icon: Settings, label: t.settings, path: '/settings' }];

        if (allItems.some(item => item.path === currentPath)) {
            const menuItem = allItems.find(item => item.path === currentPath);

            setTabs(prev => {
                // Prevent duplicate tabs
                if (prev.some(tab => tab.id === currentPath)) return prev;
                return [...prev, { id: currentPath, label: menuItem.label, icon: menuItem.icon }];
            });
        }

        setActiveTab(currentPath);
    }, [location.pathname]); // Removed t dependencies to avoid unnecessary re-checks, though they might update labels? Labels update via map render.

    // Update tab labels when language changes
    useEffect(() => {
        const allItems = [...menuItems, { icon: Settings, label: t.settings, path: '/settings' }];

        setTabs(prev => prev.map(tab => {
            const item = allItems.find(i => i.path === tab.id);
            return item ? { ...tab, label: item.label } : tab;
        }));
    }, [language, t]); // Re-run when language/translation updates

    const handleMenuClick = (path) => {
        navigate(path);
    };

    const handleTabClick = (path) => {
        navigate(path);
    };

    const handleTabClose = (e, path) => {
        e.stopPropagation(); // Prevent tab click

        const newTabs = tabs.filter(tab => tab.id !== path);
        setTabs(newTabs);

        // If closing active tab, navigate to another one
        if (path === activeTab) {
            if (newTabs.length > 0) {
                navigate(newTabs[newTabs.length - 1].id);
            } else {
                // If closing last tab, go to dashboard
                navigate('/dashboard');
            }
        }
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    const { isDarkMode, toggleTheme } = useTheme();

    return (
        <div className="flex min-h-screen font-body transition-colors duration-200 bg-[var(--bg-main)]">
            {/* Sidebar */}
            <aside className="hidden lg:flex flex-col w-64 p-6 sticky top-0 h-screen z-30 transition-colors duration-200 bg-[var(--bg-card)] border-r border-[var(--border-color)]">
                <div className="flex items-center gap-2 mb-12">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#42f05f] to-[#2ecc71] rounded-lg"></div>
                    <span className="text-xl font-bold font-heading text-[var(--text-main)]">HabitMons</span>
                </div>

                <nav className="flex-1 space-y-2">
                    {menuItems.map((item, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleMenuClick(item.path)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.path ? 'bg-purple-50 dark:bg-purple-900/20 text-[#8c36e2] dark:text-purple-400 font-semibold' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="space-y-2">
                    <button
                        onClick={() => handleMenuClick('/settings')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === '/settings' ? 'bg-purple-50 dark:bg-purple-900/20 text-[#8c36e2] dark:text-purple-400 font-semibold' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                    >
                        <Settings className="w-5 h-5" />
                        {t.settings}
                    </button>
                    <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 rounded-xl transition-all">
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Tab Bar */}
                <div className="h-12 border-b border-[var(--border-color)] flex items-center justify-between px-4 gap-2 transition-colors duration-200 bg-[var(--bg-card)]">
                    <div className="flex-1 flex items-center gap-2 overflow-x-auto overflow-y-hidden hide-scrollbar">
                        {tabs.map((tab) => (
                            <div
                                key={tab.id}
                                onClick={() => handleTabClick(tab.id)}
                                className={`
                                    flex items-center gap-2 px-4 py-2 rounded-t-lg border-t border-l border-r border-transparent cursor-pointer min-w-[120px] justify-between group select-none text-sm transition-colors whitespace-nowrap
                                    ${activeTab === tab.id
                                        ? 'bg-[var(--bg-main)] border-[var(--border-color)] !border-b-[var(--bg-main)] text-[#8c36e2] font-bold relative top-[1px]'
                                        : 'text-[var(--text-muted)] hover:bg-[var(--bg-main)] hover:text-[var(--text-main)]'
                                    }
                                `}
                            >
                                <div className="flex items-center gap-2">
                                    <tab.icon size={14} />
                                    <span className="truncate max-w-[100px]">{tab.label}</span>
                                </div>
                                <button
                                    onClick={(e) => handleTabClose(e, tab.id)}
                                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Actions: Language & Theme */}
                    <div className="flex-none pl-2 ml-2 border-l border-[var(--border-color)] flex items-center gap-1">
                        <button
                            onClick={toggleLanguage}
                            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-main)] hover:text-[var(--text-main)] transition-colors font-bold text-xs flex items-center gap-1"
                            title="Switch Language"
                        >
                            <Globe size={14} />
                            {language === 'en' ? 'KR' : 'EN'}
                        </button>
                        <button
                            onClick={toggleTheme}
                            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-main)] hover:text-[var(--text-main)] transition-colors"
                            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        >
                            {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
                        </button>
                    </div>
                </div>

                {/* Content Viewport */}
                <div className="flex-1 overflow-y-auto transition-colors duration-200 bg-[var(--bg-main)]">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default MainLayout;
