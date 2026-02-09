import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export const handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'DELETE, POST, OPTIONS',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    // Allow DELETE and POST (some clients might use POST for delete)
    if (event.httpMethod !== 'DELETE' && event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    try {
        const { sheetId, clientEmail, privateKey, sheetName, uuid } = JSON.parse(event.body);

        if (!sheetId || !clientEmail || !privateKey || !uuid) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: '필수 데이터가 누락되었습니다.' }) };
        }

        const serviceAccountAuth = new JWT({
            email: clientEmail,
            key: privateKey.replace(/\\n/g, '\n'),
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
        await doc.loadInfo();
        const sheet = sheetName ? doc.sheetsByTitle[sheetName] : doc.sheetsByIndex[0];

        // 헤더 로드 및 ID 컬럼 찾기
        await sheet.loadHeaderRow();
        const sheetHeaders = sheet.headerValues;
        const idHeader = sheetHeaders.find(h => ['id', 'ID', 'uuid', 'UUID', 'Uuid'].includes(h));

        console.log(`🗑️ Delete Request - UUID: ${uuid}, Found Header: ${idHeader}`);

        if (!idHeader) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: '시트에서 ID/UUID 헤더를 찾을 수 없습니다.' }) };
        }

        // 행 찾기
        const rows = await sheet.getRows();
        const row = rows.find(r => String(r.get(idHeader)) === String(uuid));

        if (!row) {
            console.error(`❌ Row not found for UUID: ${uuid}`);
            return { statusCode: 404, headers, body: JSON.stringify({ error: '삭제할 데이터를 찾을 수 없습니다.' }) };
        }

        await row.delete();

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true }),
        };
    } catch (error) {
        console.error('Error deleting data:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: '데이터 삭제 중 오류가 발생했습니다.', message: error.message }),
        };
    }
};
