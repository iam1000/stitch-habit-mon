import { updateSheetsData } from '../src/lib/functions/sheets-core.js';

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods': 'PUT, POST, OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'PUT' && req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const result = await updateSheetsData(req.body);
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error updating data:', error);
        return res.status(500).json({ error: '데이터 수정 중 오류가 발생했습니다.', message: error.message });
    }
}
