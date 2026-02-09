import express from 'express';
import cors from 'cors';
import { JWT } from 'google-auth-library';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Google Sheets 데이터 읽기
app.post('/api/sheets/data', async (req, res) => {
  try {
    const { sheetId, clientEmail, privateKey, filters, sheetName } = req.body;

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

    // 시트 선택 로직 (이름으로 찾거나, 없으면 첫 번째 시트)
    let sheet;
    if (sheetName) {
      sheet = doc.sheetsByTitle[sheetName];
      if (!sheet) {
        // 시트가 없으면 생성 시도? 아니면 에러? 일단 에러보다는 로그 남기고 첫번째?
        // 아니, 사용자가 명시한 시트가 없으면 에러가 맞음.
        // 하지만 초기 세팅 편의를 위해 일단 첫번째꺼 로드하는 fallback은 위험할 수 있음 (데이터 섞임)
        // 여기서는 명확하게 에러를 리턴하거나, 생성해주거나 해야함.
        // 일단 에러 메시지 리턴.
        return res.status(404).json({ error: `시트를 찾을 수 없습니다: ${sheetName}` });
      }
    } else {
      sheet = doc.sheetsByIndex[0];
    }

    const rows = await sheet.getRows();

    // 동적 데이터 매핑: 헤더 정보를 모르므로, 그냥 row 객체의 _rawData나 혹은 key-value 쌍을 그대로 반환해야 함.
    // 하지만 google-spreadsheet 라이브러리의 row 객체는 get() 메서드를 사용함.
    // 헤더 정보를 클라이언트에서 관리하므로, 여기서는 모든 헤더 값을 다 내려주는게 좋음.
    // row.toObject()가 있으면 좋겠지만, 직접 headerValues를 확인해서 매핑.

    const headerValues = sheet.headerValues;

    let data = rows.map(row => {
      const rowData = {};
      headerValues.forEach(header => {
        rowData[header] = row.get(header) || '';
      });
      return rowData;
    });

    const originalDataCount = data.length;
    console.log('📊 Original data count:', originalDataCount);

    // 필터링 적용 (공통 필터만 적용 가능하거나, 필터를 동적으로 처리해야 함)
    // 현재 필터는 date, category, name 등 특정 컬럼에 의존함.
    // 범용성을 위해 filters 객체의 키가 데이터의 키와 일치하면 필터링하도록 수정 가능.

    if (filters) {
      // 날짜 범위 (date 컬럼이 있을 때만)
      if (headerValues.includes('date')) {
        if (filters.startDate) {
          data = data.filter(item => item.date >= filters.startDate);
        }
        if (filters.endDate) {
          data = data.filter(item => item.date <= filters.endDate);
        }
      }

      // 그 외 필터들 (category, name 등 유동적으로 처리)
      // filters 객체를 순회하며 처리
      // filters 객체를 순회하며 처리
      Object.keys(filters).forEach(key => {
        if (key === 'startDate' || key === 'endDate') return; // 이미 처리함
        const filterVal = filters[key];

        if (filterVal && filterVal !== 'all') {
          // 1. 명시적 부분 검색 필드 (종목명, 계좌명, 금융기관)
          if (key === 'account_name' || key === 'account_company' || key === 'name') {
            const term = filterVal.toLowerCase();
            data = data.filter(item => item[key] && String(item[key]).toLowerCase().includes(term));
          }
          // 2. 명시적 일치 검색 필드 (카테고리, 계좌유형)
          else if (key === 'account_type' || key === 'category') {
            data = data.filter(item => item[key] === filterVal);
          }
          // 3. 기존 searchName 처리 (호환성 유지)
          else if (key === 'searchName') {
            if (headerValues.includes('name')) {
              const term = filterVal.toLowerCase();
              data = data.filter(item => item['name'] && String(item['name']).toLowerCase().includes(term));
            } else if (headerValues.includes('account_name')) {
              const term = filterVal.toLowerCase();
              data = data.filter(item => item['account_name'] && String(item['account_name']).toLowerCase().includes(term));
            }
          }
          // 4. 그 외 필드 (헤더에 존재하는 경우 일치 검색)
          else if (headerValues.includes(key)) {
            data = data.filter(item => item[key] === filterVal);
          }
        }
      });
    }

    console.log(`✅ Final filtered data count: ${data.length}`);

    // 정렬: date가 있으면 date 기준 최신순, 아니면 그대로
    if (headerValues.includes('date')) {
      data.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA;
      });
    }

    res.json({ data });
  } catch (error) {
    console.error('Error loading data:', error);
    res.status(500).json({ error: '데이터를 불러오는 중 오류가 발생했습니다. (시트명 및 권한 확인)' });
  }
});

// Google Sheets에 데이터 추가
app.post('/api/sheets/add', async (req, res) => {
  try {
    const { sheetId, clientEmail, privateKey, item, sheetName } = req.body;

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

    // 시트 선택
    let sheet;
    if (sheetName) {
      sheet = doc.sheetsByTitle[sheetName];
      if (!sheet) {
        // 시트가 없으면 생성? 아니면 에러. 일단 에러.
        // 계좌 관리 시트가 없을 수 있으므로.
        // 하지만 사용자 경험상 자동으로 만들어주는게 좋음.
        // 여기서는 일단 에러처리하고, 사용자에게 시트를 만들라고 안내.
        return res.status(404).json({ error: `시트(${sheetName})가 존재하지 않습니다. 구글 시트에서 해당 이름의 시트를 추가해주세요.` });
      }
    } else {
      sheet = doc.sheetsByIndex[0];
    }

    // UUID 생성
    const newId = uuidv4();
    // 어떤 헤더명을 쓸지 모르니 가능한 키 모두에 할당 (Google Sheets가 알아서 매칭)
    const newItem = {
      ...item,
      id: newId,
      ID: newId,
      uuid: newId,
      UUID: newId
    };

    // 시트에 데이터 추가
    await sheet.addRow(newItem);

    res.json({ success: true, id: newId });
  } catch (error) {
    console.error('Error adding data:', error);
    res.status(500).json({ error: '데이터 추가 중 오류가 발생했습니다.' });
  }
});

// Google Sheets 데이터 수정
app.put('/api/sheets/update', async (req, res) => {
  try {
    const { sheetId, clientEmail, privateKey, sheetName, uuid, item } = req.body;

    if (!sheetId || !clientEmail || !privateKey || !uuid || !item) {
      return res.status(400).json({ error: '필수 데이터가 누락되었습니다.' });
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
    const headers = sheet.headerValues;
    const idHeader = headers.find(h => ['id', 'ID', 'uuid', 'UUID', 'Uuid'].includes(h));

    console.log(`🔍 Update Request - UUID: ${uuid}, Found Header: ${idHeader}`);

    if (!idHeader) {
      console.error('Available headers:', headers);
      return res.status(400).json({ error: '시트에서 ID/UUID 헤더를 찾을 수 없습니다. (A1셀 확인 필요)' });
    }

    // 행 찾기
    const rows = await sheet.getRows();
    const row = rows.find(r => String(r.get(idHeader)) === String(uuid));

    if (!row) {
      console.error(`❌ Row not found for UUID: ${uuid}`);
      return res.status(404).json({ error: '수정할 데이터를 찾을 수 없습니다. (ID 불일치)' });
    }

    // 데이터 업데이트 (시스템 ID 컬럼 보호)
    // row.assign(item)은 header와 매칭되는 키만 업데이트함
    const updateData = { ...item };
    // ID 컬럼 업데이트 방지
    delete updateData[idHeader];
    if (idHeader !== 'id') delete updateData.id;
    if (idHeader !== 'uuid') delete updateData.uuid;

    row.assign(updateData);
    await row.save();

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating data:', error);
    res.status(500).json({ error: '데이터 수정 중 오류가 발생했습니다.' });
  }
});

// Google Sheets 데이터 삭제
app.delete('/api/sheets/delete', async (req, res) => {
  try {
    // delete 메서드는 body를 잘 안쓰지만, 편의상 body나 query로 받음. 
    // Express에서 delete body 지원함.
    const { sheetId, clientEmail, privateKey, sheetName, uuid } = req.body;

    if (!sheetId || !clientEmail || !privateKey || !uuid) {
      return res.status(400).json({ error: '필수 데이터가 누락되었습니다.' });
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
    const headers = sheet.headerValues;
    const idHeader = headers.find(h => ['id', 'ID', 'uuid', 'UUID', 'Uuid'].includes(h));

    console.log(`🗑️ Delete Request - UUID: ${uuid}, Found Header: ${idHeader}`);

    if (!idHeader) {
      return res.status(400).json({ error: '시트에서 ID/UUID 헤더를 찾을 수 없습니다.' });
    }

    const rows = await sheet.getRows();
    const row = rows.find(r => String(r.get(idHeader)) === String(uuid));

    if (!row) {
      console.error(`❌ Row not found for UUID: ${uuid}`);
      return res.status(404).json({ error: '삭제할 데이터를 찾을 수 없습니다.' });
    }

    await row.delete();

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting data:', error);
    res.status(500).json({ error: '데이터 삭제 중 오류가 발생했습니다.' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ API Server running on http://localhost:${PORT}`);
});
