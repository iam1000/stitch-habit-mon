import React, { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { Tag, Menu, Lock } from 'lucide-react';
import CodeManagementTab from './CodeManagementTab';
import MenuManagementTab from './MenuManagementTab';
import PermissionManagementTab from './PermissionManagementTab';

const CodeManagement = () => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('code'); // 'code', 'menu', 'auth'
    const [visitedTabs, setVisitedTabs] = useState(new Set(['code']));

    // Lazy Load Trigger
    useEffect(() => {
        setVisitedTabs(prev => {
            const newSet = new Set(prev);
            if (!newSet.has(activeTab)) {
                newSet.add(activeTab);
                return newSet;
            }
            return prev;
        });
    }, [activeTab]);

    return (
        <div className="p-6 lg:p-12 h-screen flex flex-col box-border overflow-hidden">
            {/* Header */}
            <header className="mb-6 flex-none">
                <h1 className="text-3xl font-bold text-[var(--text-main)] mb-2 font-heading">{t.codeMgt}</h1>
                <p className="text-gray-500 text-sm">{t.codeMgtDesc}</p>
            </header>

            {/* Tab Navigation (Investment Style) */}
            <div className="flex flex-wrap gap-2 mb-4 border-b border-gray-200 dark:border-gray-700 pb-1 flex-none">
                <button
                    onClick={() => setActiveTab('code')}
                    className={`px-4 py-2 rounded-t-lg flex items-center gap-2 transition-colors ${activeTab === 'code'
                        ? 'bg-indigo-600 text-white font-medium'
                        : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300'
                        }`}
                >
                    <Tag size={18} /> {t.commonCode}
                </button>
                <button
                    onClick={() => setActiveTab('menu')}
                    className={`px-4 py-2 rounded-t-lg flex items-center gap-2 transition-colors ${activeTab === 'menu'
                        ? 'bg-indigo-600 text-white font-medium'
                        : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300'
                        }`}
                >
                    <Menu size={18} /> {t.menuMgmt}
                </button>
                <button
                    onClick={() => setActiveTab('auth')}
                    className={`px-4 py-2 rounded-t-lg flex items-center gap-2 transition-colors ${activeTab === 'auth'
                        ? 'bg-indigo-600 text-white font-medium'
                        : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300'
                        }`}
                >
                    <Lock size={18} /> {t.permMgmt}
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-h-0 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden relative">
                {/* 
                   We use simple conditional rendering here. 
                   Since we want to cache the state of tabs (Lazy Load & Keep Alive), 
                   we can use the 'display: none' trick strictly for tabs that need it, 
                   or just rely on React state preservation if we don't unmount them.
                   
                   However, the user asked for "Lazy Loading & Caching".
                   If we do `{activeTab === 'code' && <CodeTab />}`, it unmounts when switching.
                   To Keep Alive, we must render all of them and toggle visibility.
                */}

                <div style={{ display: activeTab === 'code' ? 'block' : 'none', height: '100%' }}>
                    {visitedTabs.has('code') && <CodeManagementTab />}
                </div>

                <div style={{ display: activeTab === 'menu' ? 'block' : 'none', height: '100%' }}>
                    {visitedTabs.has('menu') && <MenuManagementTab />}
                </div>

                <div style={{ display: activeTab === 'auth' ? 'block' : 'none', height: '100%' }}>
                    {visitedTabs.has('auth') && <PermissionManagementTab />}
                </div>
            </div>
        </div>
    );
};

export default CodeManagement;
