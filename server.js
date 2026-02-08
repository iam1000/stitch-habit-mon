import express from 'express';
import cors from 'cors';
import { JWT } from 'google-auth-library';
import { GoogleSpreadsheet } from 'google-spreadsheet';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Google Sheets 데이터 읽기
app.post('/api/sheets/data', async (req, res) => {
  try {
    const { sheetId, clientEmail, privateKey, filters } = req.body;

    if (!sheetId || !clientEmail || !privateKey) {
      return res.status(400).json({ error: '모든 설정값을 입력해주세요.' });
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
      return dateB - dateA; // 내림차순
    });

    res.json({ data });
  } catch (error) {
    console.error('Error loading data:', error);
    res.status(500).json({ error: '데이터를 불러오는 중 오류가 발생했습니다.' });
  }
});

// Google Sheets에 데이터 추가
app.post('/api/sheets/add', async (req, res) => {
  try {
    const { sheetId, clientEmail, privateKey, item } = req.body;

    if (!sheetId || !clientEmail || !privateKey || !item) {
      return res.status(400).json({ error: '모든 데이터를 입력해주세요.' });
    }

    const serviceAccountAuth = new JWT({
      email: clientEmail,
      key: privateKey.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];

    await sheet.addRow({
      date: item.date,
      category: item.category,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      note: item.note
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error adding data:', error);
    res.status(500).json({ error: '데이터 추가 중 오류가 발생했습니다.' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ API Server running on http://localhost:${PORT}`);
});
