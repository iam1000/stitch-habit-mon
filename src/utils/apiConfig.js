/**
 * API URL Helper for Multi-Platform Deployment (Netlify & Vercel)
 * 
 * Handles URL construction based on environment:
 * - Local Dev: http://localhost:3001/api/sheets/{endpoint}
 * - Netlify: /.netlify/functions/sheets-{endpoint}
 * - Vercel: /api/sheets-{endpoint}
 * 
 * @param {string} endpoint - The API endpoint name (e.g., 'data', 'add', 'update', 'delete')
 * @returns {string} The full API URL
 */
export const getApiUrl = (endpoint) => {
    if (import.meta.env.DEV) {
        return `http://localhost:3001/api/sheets/${endpoint}`;
    }
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
    return `${baseUrl}/sheets-${endpoint}`;
};
