import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../AuthContext';
import { getApiUrl } from '../utils/apiConfig';

export const useInvestmentData = () => {
    const { user } = useAuth();
    const [investmentData, setInvestmentData] = useState([]);
    const [accountData, setAccountData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Google Sheet Config
    // Google Sheet Config & Names
    const SHEET_ID = localStorage.getItem('sheet_id') || localStorage.getItem('sheetId') || import.meta.env.VITE_DATA_SHEET_ID;
    const CLIENT_EMAIL = import.meta.env.VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const PRIVATE_KEY = import.meta.env.VITE_GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n');

    // Parse Sheet Names from Config
    const configStr = import.meta.env.VITE_GOOGLE_SHEET_CONFIG;
    let investmentSheetName = 'INVESTMENT';
    let accountsSheetName = 'ACCOUNTS';

    try {
        if (configStr) {
            const config = JSON.parse(configStr);
            const invConfig = config.find(c => c.id === 'INVESTMENT');
            if (invConfig && invConfig.sheetName) investmentSheetName = invConfig.sheetName;

            const accConfig = config.find(c => c.id === 'ACCOUNTS');
            if (accConfig && accConfig.sheetName) accountsSheetName = accConfig.sheetName;
        }
    } catch (e) {
        console.error("Failed to parse sheet config in useInvestmentData", e);
    }

    const loadData = useCallback(async () => {
        if (!SHEET_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
            setError("Google Sheet configuration is missing.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);



        try {
            const apiUrl = getApiUrl('data');

            // Fetch Investment Data and Account Data in parallel using dynamic sheet names
            const [investRes, accountRes] = await Promise.all([
                fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sheetId: SHEET_ID, clientEmail: CLIENT_EMAIL, privateKey: PRIVATE_KEY, sheetName: investmentSheetName })
                }),
                fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sheetId: SHEET_ID, clientEmail: CLIENT_EMAIL, privateKey: PRIVATE_KEY, sheetName: accountsSheetName })
                })
            ]);


            const investResult = await investRes.json();
            const accountResult = await accountRes.json();

            // Process Account Data
            const accounts = (accountResult.data || []).map(acc => ({
                id: String(acc.account_id || acc.id), // Prefer account_id based on config
                name: acc.account_name,
                type: acc.account_type || 'Unknown'
            }));
            setAccountData(accounts);

            // Process Investment Data
            const investments = (investResult.data || []).map(item => ({
                ...item,
                date: item.date, // e.g., '2024-02-11'
                category: String(item.category), // Account ID reference
                item_name: item.name || item.item_name || 'Unknown Item',
                qty: Number(item.quantity) || Number(item.qty) || 0,
                price: Number(item.price) || 0,
                amount: (Number(item.amount) || 0) || ((Number(item.quantity) || Number(item.qty) || 0) * (Number(item.price) || 0)), // Calculate amount if missing
                type: (Number(item.quantity) || Number(item.qty) || 0) >= 0 ? 'buy' : 'sell' // Simple inference
            })).sort((a, b) => new Date(a.date) - new Date(b.date));

            setInvestmentData(investments);

        } catch (err) {
            console.error("Failed to load investment data:", err);
            setError(err.message || "Failed to load data");
        } finally {
            setLoading(false);
        }
    }, [SHEET_ID, CLIENT_EMAIL, PRIVATE_KEY]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    return { investmentData, accountData, loading, error, refresh: loadData };
};
