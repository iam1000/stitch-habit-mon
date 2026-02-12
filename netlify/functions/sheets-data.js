import { getSheetsData } from '../../src/lib/functions/sheets-core.js';

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
    const params = JSON.parse(event.body);
    const result = await getSheetsData(params);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error('Error loading data:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: '데이터를 불러오는 중 오류가 발생했습니다.', message: error.message }),
    };
  }
};
