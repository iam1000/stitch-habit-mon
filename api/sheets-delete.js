import { deleteSheetsData } from '../src/lib/functions/sheets-core.js';

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods': 'DELETE, POST, OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'DELETE' && req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const result = await deleteSheetsData(req.body);
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error deleting data:', error);
        return res.status(500).json({ error: '데이터 삭제 중 오류가 발생했습니다.', message: error.message });
    }
}
