const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

exports.handler = async (event, context) => {
  // CORS 헤더 설정
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // OPTIONS 요청 처리 (CORS preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // POST 요청만 허용
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const { sheetId, clientEmail, privateKey, item } = JSON.parse(event.body);

    if (!sheetId || !clientEmail || !privateKey || !item) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: '모든 설정값을 입력해주세요.' }),
      };
    }

    const serviceAccountAuth = new JWT({
      email: clientEmail,
      key: privateKey.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
    await doc.loadInfo();
    
    const sheet = doc.sheetsByIndex[0];
    
    // 새 행 추가
    await sheet.addRow({
      date: item.date,
      category: item.category,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      note: item.note,
    });

    console.log('✅ Data added successfully:', item);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: 'Data added successfully' }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal Server Error', message: error.message }),
    };
  }
};
