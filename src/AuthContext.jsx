import React, { createContext, useState, useEffect, useContext, useCallback, useMemo, useRef } from 'react';
import { supabase } from './supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [permissions, setPermissions] = useState([]);
    const [menuDefs, setMenuDefs] = useState([]);
    const [loadingPermissions, setLoadingPermissions] = useState(false);
    const fetchedEmailRef = useRef(null); // Cache key to prevent redundant fetches

    // Google Sheet Config
    const SHEET_ID = import.meta.env.VITE_AUTH_SHEET_ID;
    const CLIENT_EMAIL = import.meta.env.VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const PRIVATE_KEY = import.meta.env.VITE_GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n');

    // Default Menus Fallback
    const DEFAULT_MENU_DEFS = [
        { menu_code: 'dashboard', label_key: 'dashboard', path: '/dashboard', icon_name: 'Home', sort_order: 1, use_yn: 'Y', location: 'sidebar' },
        { menu_code: 'my_monster', label_key: 'myMonster', path: '/my-monster', icon_name: 'User', sort_order: 2, use_yn: 'Y', location: 'sidebar' },
        { menu_code: 'leaderboard', label_key: 'leaderboard', path: '/leaderboard', icon_name: 'Trophy', sort_order: 3, use_yn: 'Y', location: 'sidebar' },
        { menu_code: 'shop', label_key: 'shop', path: '/shop', icon_name: 'ShoppingBag', sort_order: 4, use_yn: 'Y', location: 'sidebar' },
        { menu_code: 'notebook_lm', label_key: 'NotebookLM', path: '/notebooks', icon_name: 'Book', sort_order: 5, use_yn: 'Y', location: 'sidebar' },
        { menu_code: 'investment', label_key: 'investment', path: '/investment', icon_name: 'TrendingUp', sort_order: 6, use_yn: 'Y', location: 'sidebar' },
        { menu_code: 'friends', label_key: 'friends', path: '/friends', icon_name: 'Globe', sort_order: 7, use_yn: 'Y', location: 'sidebar' },
        { menu_code: 'code_mgmt', label_key: 'codeMgt', path: '/codes', icon_name: 'Tag', sort_order: 98, use_yn: 'Y', location: 'bottom' },
        { menu_code: 'settings', label_key: 'settings', path: '/settings', icon_name: 'Settings', sort_order: 99, use_yn: 'Y', location: 'bottom' }
    ];

    // Fetch Permissions & Menu Definitions
    const fetchPermissions = async (email) => {
        // Prevent redundant fetch if email hasn't changed
        // Using Ref to bypass closure staleness in useEffect
        if (email && email === fetchedEmailRef.current) {
            return;
        }

        // Fallback for missing env vars (Local Dev without full env)
        if (!email || !CLIENT_EMAIL || !PRIVATE_KEY || !SHEET_ID) {
            console.warn("Missing Google Sheet Env Vars or Email. Using Default Menus.");
            if (email) {
                setMenuDefs(DEFAULT_MENU_DEFS);
                setPermissions(DEFAULT_MENU_DEFS.map(m => m.menu_code)); // Grant all permissions by default locally
                fetchedEmailRef.current = email;
            }
            return;
        }

        setLoadingPermissions(true);
        try {
            const apiUrl = import.meta.env.DEV
                ? 'http://localhost:3001/api/sheets/data'
                : '/.netlify/functions/sheets-data';

            // 1. Fetch Menu Definitions (Master)
            const menuRes = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sheetId: SHEET_ID,
                    clientEmail: CLIENT_EMAIL,
                    privateKey: PRIVATE_KEY,
                    sheetName: 'menu_def_mgt'
                })
            });
            const menuData = await menuRes.json();

            // 2. Fetch User Permissions (Detail)
            const authRes = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sheetId: SHEET_ID,
                    clientEmail: CLIENT_EMAIL,
                    privateKey: PRIVATE_KEY,
                    sheetName: 'auth_menu_mgt'
                })
            });
            const authData = await authRes.json();

            if (menuData.data && Array.isArray(menuData.data)) {
                // Filter active menus (use_yn = Y) and sort
                const activeMenus = menuData.data
                    .filter(m => m.use_yn === 'Y')
                    .sort((a, b) => Number(a.sort_order) - Number(b.sort_order));
                setMenuDefs(activeMenus);
            } else {
                console.warn("Menu data is empty or invalid. Using defaults.");
                setMenuDefs(DEFAULT_MENU_DEFS);
            }

            if (authData.data && Array.isArray(authData.data)) {
                // Filter permissions for current user
                const myPerms = authData.data
                    .filter(p => p.user_email === email && p.access_yn === 'Y')
                    .map(p => p.menu_code);
                setPermissions(myPerms);
            } else {
                console.warn("Auth data is empty or invalid. Granting default permissions.");
                // Fallback: If auth sheet fails, allow all menus defined in DEFAULT_MENU_DEFS (or just dashboard?)
                // Safety choice: Allow all for now to prevent lockout during dev
                setPermissions(DEFAULT_MENU_DEFS.map(m => m.menu_code));
            }

            fetchedEmailRef.current = email; // Mark as fetched for this user

        } catch (error) {
            console.error("Failed to fetch permissions. Using Fallback.", error);
            // Fallback: Use Defaults
            setMenuDefs(DEFAULT_MENU_DEFS);
            setPermissions(DEFAULT_MENU_DEFS.map(m => m.menu_code));
            fetchedEmailRef.current = email;
        } finally {
            setLoadingPermissions(false);
        }
    };

    useEffect(() => {
        // Check active sessions and sets the user
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            setLoading(false);

            if (currentUser?.email) {
                fetchPermissions(currentUser.email);
            }
        };

        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            setLoading(false);

            if (currentUser?.email) {
                fetchPermissions(currentUser.email);
            } else {
                setPermissions([]);
                setMenuDefs([]);
                fetchedEmailRef.current = null; // Reset cache on logout
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const signUp = useCallback((email, password) => supabase.auth.signUp({ email, password }), []);
    const signIn = useCallback((email, password) => supabase.auth.signInWithPassword({ email, password }), []);
    const signOut = useCallback(() => {
        setPermissions([]);
        setMenuDefs([]);
        fetchedEmailRef.current = null; // Reset cache on explicit sign out
        return supabase.auth.signOut();
    }, []);

    const value = useMemo(() => ({
        signUp,
        signIn,
        signOut,
        user,
        permissions,
        menuDefs,
        loadingPermissions
    }), [signUp, signIn, signOut, user, permissions, menuDefs, loadingPermissions]);

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
