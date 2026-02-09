import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

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
    const { sheetId, clientEmail, privateKey, filters, sheetName } = JSON.parse(event.body);

    if (!sheetId || !clientEmail || !privateKey) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: '모든 설정값을 입력해주세요.' }) };
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
        return { statusCode: 404, headers, body: JSON.stringify({ error: `시트를 찾을 수 없습니다: ${sheetName}` }) };
      }
    } else {
      sheet = doc.sheetsByIndex[0];
    }

    const rows = await sheet.getRows();
    const headerValues = sheet.headerValues;

    let data = rows.map(row => {
      const rowData = {};
      headerValues.forEach(header => {
        rowData[header] = row.get(header) || '';
      });
      return rowData;
    });

    // 필터링 적용
    if (filters) {
      // 날짜 범위
      if (headerValues.includes('date')) {
        if (filters.startDate) {
          data = data.filter(item => item.date >= filters.startDate);
        }
        if (filters.endDate) {
          data = data.filter(item => item.date <= filters.endDate);
        }
      }

      // 동적 필터
      Object.keys(filters).forEach(key => {
        if (key === 'startDate' || key === 'endDate') return;
        const filterVal = filters[key];

        if (filterVal && filterVal !== 'all') {
          // 1. 부분 검색 (이름, 계좌명 등)
          if (key === 'account_name' || key === 'account_company' || key === 'name') {
            const term = filterVal.toLowerCase();
            data = data.filter(item => item[key] && String(item[key]).toLowerCase().includes(term));
          }
          // 2. 일치 검색 (카테고리, 유형)
          else if (key === 'account_type' || key === 'category') {
            data = data.filter(item => item[key] === filterVal);
          }
          // 3. searchName (호환성)
          else if (key === 'searchName') {
            if (headerValues.includes('name')) {
              const term = filterVal.toLowerCase();
              data = data.filter(item => item['name'] && String(item['name']).toLowerCase().includes(term));
            } else if (headerValues.includes('account_name')) {
              const term = filterVal.toLowerCase();
              data = data.filter(item => item['account_name'] && String(item['account_name']).toLowerCase().includes(term));
            }
          }
          // 4. 그 외 헤더 일치
          else if (headerValues.includes(key)) {
            data = data.filter(item => item[key] === filterVal);
          }
        }
      });
    }

    // 정렬 (날짜 기준 내림차순)
    if (headerValues.includes('date')) {
      data.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA;
      });
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ data }),
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
