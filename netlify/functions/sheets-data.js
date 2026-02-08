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
    const { sheetId, clientEmail, privateKey, filters } = JSON.parse(event.body);

    if (!sheetId || !clientEmail || !privateKey) {
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
    const rows = await sheet.getRows();
    
    let data = rows.map(row => ({
      date: row.get('date') || '',
      category: row.get('category') || '',
      name: row.get('name') || '',
      quantity: row.get('quantity') || '',
      price: row.get('price') || '',
      note: row.get('note') || '',
    }));

    const originalDataCount = data.length;
    console.log('📊 Original data count:', originalDataCount);
    console.log('🔍 Filters received:', JSON.stringify(filters, null, 2));

    // 필터링 적용
    if (filters) {
      // 날짜 범위 필터
      if (filters.startDate) {
        const beforeCount = data.length;
        data = data.filter(item => item.date >= filters.startDate);
        console.log(`📅 Start date filter (${filters.startDate}): ${beforeCount} -> ${data.length}`);
      }
      if (filters.endDate) {
        const beforeCount = data.length;
        data = data.filter(item => item.date <= filters.endDate);
        console.log(`📅 End date filter (${filters.endDate}): ${beforeCount} -> ${data.length}`);
      }
      
      // 분류 필터
      if (filters.category && filters.category !== 'all') {
        const beforeCount = data.length;
        data = data.filter(item => item.category === filters.category);
        console.log(`📂 Category filter (${filters.category}): ${beforeCount} -> ${data.length}`);
      }
      
      // 종목명 검색 (부분 일치)
      if (filters.searchName) {
        const beforeCount = data.length;
        const searchTerm = filters.searchName.toLowerCase();
        data = data.filter(item => item.name.toLowerCase().includes(searchTerm));
        console.log(`🔎 Name search filter (${filters.searchName}): ${beforeCount} -> ${data.length}`);
      }
    }

    console.log(`✅ Final filtered data count: ${data.length}`);

    // 날짜 기준 내림차순 정렬 (최신 날짜가 먼저)
    data.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB - dateA;
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ data }),
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
