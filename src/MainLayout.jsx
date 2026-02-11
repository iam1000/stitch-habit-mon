import React, { useState, useEffect, useMemo } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    Home,
    LogOut,
    X,
    Moon,
    Sun,
    Globe
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
                    <div className="w-8 h-8 bg-gradient-to-br from-[#42f05f] to-[#2ecc71] rounded-lg"></div>
                    <span className="text-xl font-bold font-heading text-[var(--text-main)]">HabitMons</span>
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

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Tab Bar */}
                <div className="h-12 border-b border-[var(--border-color)] flex items-center justify-between px-4 gap-2 transition-colors duration-200 bg-[var(--bg-card)]">
                    <div className="flex-1 flex items-center gap-2 overflow-x-auto overflow-y-hidden hide-scrollbar">
                        {tabs.map((tab) => {
                            const Icon = tab.icon || Home;
                            return (
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
                                        <Icon size={14} />
                                        <span className="truncate max-w-[100px]">{tab.label}</span>
                                    </div>
                                    <button
                                        onClick={(e) => handleTabClose(e, tab.id)}
                                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            );
                        })}
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
                    {/* Persistent Views: Rendered if in tabs OR if current path matches (to ensure immediate render) */}
                    {(tabs.some(tab => tab.id === '/dashboard') || location.pathname === '/dashboard') && (
                        <div style={{ display: location.pathname === '/dashboard' ? 'block' : 'none', height: '100%' }}>
                            <Dashboard />
                        </div>
                    )}
                    {(tabs.some(tab => tab.id === '/investment') || location.pathname === '/investment') && (
                        <div style={{ display: location.pathname === '/investment' ? 'block' : 'none', height: '100%' }}>
                            <Investment />
                        </div>
                    )}
                    {(tabs.some(tab => tab.id === '/codes') || location.pathname === '/codes') && (
                        <div style={{ display: location.pathname === '/codes' ? 'block' : 'none', height: '100%' }}>
                            <CodeManagement />
                        </div>
                    )}
                    {(tabs.some(tab => tab.id === '/notebooks') || location.pathname === '/notebooks') && (
                        <div style={{ display: location.pathname === '/notebooks' ? 'block' : 'none', height: '100%' }}>
                            <Notebooks />
                        </div>
                    )}
                    {(tabs.some(tab => tab.id === '/friends') || location.pathname === '/friends') && (
                        <div style={{ display: location.pathname === '/friends' ? 'block' : 'none', height: '100%' }}>
                            <Friends />
                        </div>
                    )}
                    {(tabs.some(tab => tab.id === '/my-monster') || location.pathname === '/my-monster') && (
                        <div style={{ display: location.pathname === '/my-monster' ? 'block' : 'none', height: '100%' }}>
                            <MyMonster />
                        </div>
                    )}
                    {(tabs.some(tab => tab.id === '/shop') || location.pathname === '/shop') && (
                        <div style={{ display: location.pathname === '/shop' ? 'block' : 'none', height: '100%' }}>
                            <Shop />
                        </div>
                    )}
                    {(tabs.some(tab => tab.id === '/leaderboard') || location.pathname === '/leaderboard') && (
                        <div style={{ display: location.pathname === '/leaderboard' ? 'block' : 'none', height: '100%' }}>
                            <Leaderboard />
                        </div>
                    )}
                    {(tabs.some(tab => tab.id === '/settings') || location.pathname === '/settings') && (
                        <div style={{ display: location.pathname === '/settings' ? 'block' : 'none', height: '100%' }}>
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
