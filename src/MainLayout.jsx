import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    Home,
    LogOut,
    X,
    Moon,
    Sun,
    Globe,
    Menu,
    Sparkles
} from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import Dashboard from './Dashboard';
import Investment from './Investment';
import CodeManagement from './CodeManagement';
import Notebooks from './Notebooks';
import Friends from './Friends';
import MyMonster from './MyMonster';
import Shop from './Shop';
import Leaderboard from './Leaderboard';
import Settings from './Settings';
import { getIconComponent } from './utils/iconMapper';

const MainLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t, language, toggleLanguage } = useLanguage();
    const { signOut, permissions, menuDefs, loadingPermissions, user } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const scrollContainerRef = useRef(null);
    const activeTabRef = useRef(null);

    // Initial Tabs State
    const [tabs, setTabs] = useState([
        { id: '/dashboard', label: t.dashboard, icon: Home }
    ]);
    const [activeTab, setActiveTab] = useState('/dashboard');

    // Filter Visible Menus based on Permissions & Menu Definitions
    const visibleMenus = useMemo(() => {
        return menuDefs.filter(menu => {
            // 'dashboard' is always visible/accessible, others depend on permissions
            return permissions.includes(menu.menu_code) || menu.menu_code === 'dashboard';
        });
    }, [menuDefs, permissions]);

    const sidebarMenus = visibleMenus.filter(m => m.location === 'sidebar');
    const bottomMenus = visibleMenus.filter(m => m.location === 'bottom');

    // Route Protection & Tab Sync
    useEffect(() => {
        if (loadingPermissions) return;

        const currentPath = location.pathname;

        // 1. Check Access Permission
        // Find if current path belongs to any visible menu
        const currentMenu = visibleMenus.find(m => m.path === currentPath);

        // If it's a known menu path but not in visibleMenus => Access Denied
        // (We need to check against ALL definitions to know if it's a restricted page vs generic page)
        const isKnownPage = menuDefs.some(m => m.path === currentPath);

        if (isKnownPage && !currentMenu) {
            alert(t.accessDenied || "Access Denied");
            navigate('/dashboard');
            return;
        }

        // 2. Add to Tabs if accessible
        if (currentMenu) {
            setTabs(prev => {
                // Prevent duplicate tabs
                if (prev.some(tab => tab.id === currentPath)) return prev;
                // Use icon mapper
                const IconComponent = getIconComponent(currentMenu.icon_name);
                return [...prev, {
                    id: currentPath,
                    label: t[currentMenu.label_key] || currentMenu.label_key,
                    icon: IconComponent
                }];
            });
        }

        setActiveTab(currentPath);
    }, [location.pathname, permissions, menuDefs, loadingPermissions, t]);

    // Auto-scroll active tab into view
    useEffect(() => {
        if (activeTabRef.current) {
            activeTabRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'nearest'
            });
        }
    }, [activeTab]);

    // Update tab labels when language changes
    useEffect(() => {
        setTabs(prev => prev.map(tab => {
            const menu = visibleMenus.find(m => m.path === tab.id);
            return menu
                ? { ...tab, label: t[menu.label_key] || menu.label_key }
                : tab;
        }));
    }, [language, t, visibleMenus]);

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
                navigate('/dashboard');
            }
        }
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    return (
        <div className="flex min-h-screen font-body transition-colors duration-200 bg-[var(--bg-main)]">
            {/* Sidebar */}
            <aside className="hidden lg:flex flex-col w-64 p-6 sticky top-0 h-screen z-30 transition-colors duration-200 bg-[var(--bg-card)] border-r border-[var(--border-color)]">
                <div className="flex items-center gap-2 mb-12">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#4f46e5] to-[#818cf8] rounded-xl flex items-center justify-center shadow-lg transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                        <Sparkles className="text-white w-4 h-4" />
                    </div>
                    <span className="text-xl font-[900] tracking-tight font-heading italic text-[var(--text-main)]">DonMany</span>
                </div>

                {/* Sidebar Menus (Top) */}
                <nav className="flex-1 space-y-2">
                    {(loadingPermissions && sidebarMenus.length === 0) ? (
                        <div className="p-4 text-sm text-gray-400">Loading menus...</div>
                    ) : (
                        sidebarMenus.map((item) => {
                            const Icon = getIconComponent(item.icon_name);
                            return (
                                <button
                                    key={item.menu_code}
                                    onClick={() => handleMenuClick(item.path)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.path ? 'bg-purple-50 dark:bg-purple-900/20 text-[#8c36e2] dark:text-purple-400 font-semibold' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                >
                                    <Icon className="w-5 h-5" />
                                    {t[item.label_key] || item.label_key}
                                </button>
                            );
                        })
                    )}
                </nav>

                {/* Bottom Menus & SignOut */}
                <div className="space-y-2">
                    {bottomMenus.map((item) => {
                        const Icon = getIconComponent(item.icon_name);
                        return (
                            <button
                                key={item.menu_code}
                                onClick={() => handleMenuClick(item.path)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.path ? 'bg-purple-50 dark:bg-purple-900/20 text-[#8c36e2] dark:text-purple-400 font-semibold' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                            >
                                <Icon className="w-5 h-5" />
                                {t[item.label_key] || item.label_key}
                            </button>
                        );
                    })}

                    <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 rounded-xl transition-all">
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Mobile Sidebar Drawer */}
            <div className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />

                {/* Drawer */}
                <aside className={`absolute inset-y-0 left-0 w-72 bg-[var(--bg-card)] p-6 shadow-2xl flex flex-col transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="flex items-center justify-between mb-12">
                        <div className="flex items-center gap-2">
                            <div className="w-9 h-9 bg-gradient-to-br from-[#4f46e5] to-[#818cf8] rounded-xl flex items-center justify-center shadow-lg transform -rotate-3">
                                <Sparkles className="text-white w-5 h-5" />
                            </div>
                            <span className="text-2xl font-[900] tracking-tight font-heading italic text-[var(--text-main)]">DonMany</span>
                        </div>
                        <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                            <X size={24} />
                        </button>
                    </div>

                    <nav className="flex-1 space-y-2 overflow-y-auto hide-scrollbar">
                        {sidebarMenus.map((item) => {
                            const Icon = getIconComponent(item.icon_name);
                            return (
                                <button
                                    key={item.menu_code}
                                    onClick={() => {
                                        handleMenuClick(item.path);
                                        setIsSidebarOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.path ? 'bg-purple-100 dark:bg-purple-900/40 text-[#8c36e2] dark:text-purple-400 font-bold' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                >
                                    <Icon className="w-5 h-5" />
                                    {t[item.label_key] || item.label_key}
                                </button>
                            );
                        })}
                    </nav>

                    <div className="mt-8 space-y-2 border-t border-[var(--border-color)] pt-6">
                        {bottomMenus.map((item) => {
                            const Icon = getIconComponent(item.icon_name);
                            return (
                                <button
                                    key={item.menu_code}
                                    onClick={() => {
                                        handleMenuClick(item.path);
                                        setIsSidebarOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.path ? 'bg-purple-100 dark:bg-purple-900/40 text-[#8c36e2] dark:text-purple-400 font-bold' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                                >
                                    <Icon className="w-5 h-5" />
                                    {t[item.label_key] || item.label_key}
                                </button>
                            );
                        })}
                        <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 rounded-xl transition-all font-bold">
                            <LogOut className="w-5 h-5" />
                            Sign Out
                        </button>
                    </div>
                </aside>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Tab Bar */}
                <div className="h-12 border-b border-[var(--border-color)] flex items-center justify-between px-2 sm:px-4 gap-2 transition-colors duration-200 bg-[var(--bg-card)]">
                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="lg:hidden p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-main)] hover:text-[var(--text-main)] transition-colors"
                    >
                        <Menu size={22} />
                    </button>

                    <div className="flex-1 relative h-full flex items-center overflow-hidden">
                        <div
                            ref={scrollContainerRef}
                            className="w-full flex items-center gap-1 sm:gap-2 overflow-x-auto overflow-y-hidden hide-scrollbar h-full pt-1 pl-6 pr-12 sm:px-4"
                        >
                            {tabs.map((tab) => {
                                const Icon = tab.icon || Home;
                                const isActive = activeTab === tab.id;
                                return (
                                    <div
                                        key={tab.id}
                                        ref={isActive ? activeTabRef : null}
                                        onClick={() => handleTabClick(tab.id)}
                                        className={`
                                            flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 rounded-t-lg border-t border-l border-r border-transparent cursor-pointer min-w-0 flex-shrink-0 transition-all duration-300 group select-none text-sm whitespace-nowrap
                                            ${isActive
                                                ? 'bg-[var(--bg-main)] border-[var(--border-color)] !border-b-[var(--bg-main)] text-[#8c36e2] font-bold relative top-[1px] z-10'
                                                : 'text-[var(--text-muted)] hover:bg-[var(--bg-main)] hover:text-[var(--text-main)]'
                                            }
                                        `}
                                    >
                                        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                                            <Icon size={isActive ? 16 : 14} className={`flex-shrink-0 ${isActive ? 'text-[#8c36e2]' : ''}`} />
                                            <span className={`inline-block truncate transition-all duration-300 ${isActive ? 'max-w-[120px] font-bold' : 'max-w-[80px]'}`}>
                                                {tab.label}
                                            </span>
                                        </div>
                                        <button
                                            onClick={(e) => handleTabClose(e, tab.id)}
                                            className={`flex-shrink-0 p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all ${isActive ? 'opacity-100 ml-1 text-gray-600 dark:text-gray-300' : 'opacity-0 group-hover:opacity-100 text-gray-400'}`}
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                        {/* Scroll Gradient Hint */}
                        <div className="absolute right-0 inset-y-0 w-8 bg-gradient-to-l from-[var(--bg-card)] to-transparent pointer-events-none z-20" />
                    </div>

                    {/* Actions: Language & Theme */}
                    <div className="flex-none pl-2 ml-2 border-l border-[var(--border-color)] flex items-center gap-4">
                        {/* Login Info */}
                        {user && (
                            <div className="hidden md:flex items-center text-xs text-gray-500 dark:text-gray-400 font-mono">
                                <span>{user.email}</span>
                                {user.last_sign_in_at && (() => {
                                    const d = new Date(user.last_sign_in_at);
                                    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
                                    return <span className="ml-1 opacity-75">( {dateStr} )</span>;
                                })()}
                            </div>
                        )}
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
                    {/* Content Views: Rendered only when active to prevent hidden chart dimension errors */}
                    {location.pathname === '/dashboard' && (
                        <div className="h-full">
                            <Dashboard />
                        </div>
                    )}
                    {location.pathname === '/investment' && (
                        <div className="h-full">
                            <Investment />
                        </div>
                    )}
                    {location.pathname === '/codes' && (
                        <div className="h-full">
                            <CodeManagement />
                        </div>
                    )}
                    {location.pathname === '/notebooks' && (
                        <div className="h-full">
                            <Notebooks />
                        </div>
                    )}
                    {location.pathname === '/friends' && (
                        <div className="h-full">
                            <Friends />
                        </div>
                    )}
                    {location.pathname === '/my-monster' && (
                        <div className="h-full">
                            <MyMonster />
                        </div>
                    )}
                    {location.pathname === '/shop' && (
                        <div className="h-full">
                            <Shop />
                        </div>
                    )}
                    {location.pathname === '/leaderboard' && (
                        <div className="h-full">
                            <Leaderboard />
                        </div>
                    )}
                    {location.pathname === '/settings' && (
                        <div className="h-full">
                            <Settings />
                        </div>
                    )}

                    {/* Non-persistent Views (via Outlet) */}
                    {!['/dashboard', '/investment', '/codes', '/notebooks', '/friends', '/my-monster', '/shop', '/leaderboard', '/settings'].includes(location.pathname) && (
                        <Outlet />
                    )}
                </div>
            </div>
        </div>
    );
};

export default MainLayout;
