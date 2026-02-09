import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export const handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'PUT, POST, OPTIONS',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'PUT' && event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    try {
        const { sheetId, clientEmail, privateKey, sheetName, uuid, item } = JSON.parse(event.body);

        if (!sheetId || !clientEmail || !privateKey || !uuid || !item) {
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

        console.log(`🔍 Update Request - UUID: ${uuid}, Found Header: ${idHeader}`);

        if (!idHeader) {
            console.error('Available headers:', sheetHeaders);
            return { statusCode: 400, headers, body: JSON.stringify({ error: '시트에서 ID/UUID 헤더를 찾을 수 없습니다. (A1셀 확인 필요)' }) };
        }

        // 행 찾기
        const rows = await sheet.getRows();
        const row = rows.find(r => String(r.get(idHeader)) === String(uuid));

        if (!row) {
            console.error(`❌ Row not found for UUID: ${uuid}`);
            return { statusCode: 404, headers, body: JSON.stringify({ error: '수정할 데이터를 찾을 수 없습니다. (ID 불일치)' }) };
        }

        // 데이터 업데이트 (시스템 ID 컬럼 보호)
        const updateData = { ...item };
        // ID 컬럼 업데이트 방지
        delete updateData[idHeader];
        if (idHeader !== 'id') delete updateData.id;
        if (idHeader !== 'uuid') delete updateData.uuid;

        row.assign(updateData);
        await row.save();

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true }),
        };
    } catch (error) {
        console.error('Error updating data:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: '데이터 수정 중 오류가 발생했습니다.', message: error.message }),
        };
    }
};
