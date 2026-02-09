import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { v4 as uuidv4 } from 'uuid';

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const { sheetId, clientEmail, privateKey, item, sheetName } = JSON.parse(event.body);

    if (!sheetId || !clientEmail || !privateKey || !item) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: '모든 데이터를 입력해주세요.' }) };
    }

    const serviceAccountAuth = new JWT({
      email: clientEmail,
      key: privateKey.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
    await doc.loadInfo();

    let sheet;
    if (sheetName) {
      sheet = doc.sheetsByTitle[sheetName];
      if (!sheet) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: `시트(${sheetName})가 존재하지 않습니다.` }) };
      }
    } else {
      sheet = doc.sheetsByIndex[0];
    }

    const newId = uuidv4();
    const newItem = {
      ...item,
      id: newId,
      ID: newId,
      uuid: newId,
      UUID: newId
    };

    await sheet.addRow(newItem);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, id: newId }),
    };
  } catch (error) {
    console.error('Error adding data:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: '데이터 추가 중 오류가 발생했습니다.', message: error.message }),
    };
  }
};
