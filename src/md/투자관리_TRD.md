# 투자관리 기능 TRD (Technical Requirements Document)

## 📋 문서 정보
- **작성일**: 2026-02-08
- **버전**: 1.0
- **작성자**: Development Team
- **문서 유형**: Technical Requirements Document
- **관련 문서**: [투자관리_PRD.md](./투자관리_PRD.md)

---

## 1. 시스템 아키텍처

### 1.1 전체 구조
```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Frontend   │◄────►│   Backend    │◄────►│ Google Sheets│
│  (React)     │ HTTP │  (Node.js)   │ API  │     API      │
└──────────────┘      └──────────────┘      └──────────────┘
       │                      │
       ▼                      ▼
┌──────────────┐      ┌──────────────┐
│ Local Storage│      │Service Account│
│  (Config)    │      │     JSON     │
└──────────────┘      └──────────────┘
```

### 1.2 기술 스택

#### Frontend
- **프레임워크**: React 18.x
- **빌드 도구**: Vite 7.x
- **스타일링**: Tailwind CSS
- **상태 관리**: React Hooks (useState, useEffect)
- **HTTP 클라이언트**: Fetch API
- **아이콘**: Lucide React
- **다국어**: Custom LanguageContext

#### Backend
- **런타임**: Node.js
- **프레임워크**: Express.js
- **Google API**: google-spreadsheet, google-auth-library
- **CORS**: cors 미들웨어
- **환경 변수**: dotenv

#### Infrastructure
- **개발 서버**: localhost:5173 (Frontend), localhost:3001 (Backend)
- **동시 실행**: concurrently
- **데이터 저장소**: Google Sheets
- **인증**: Service Account JSON

---

## 2. 데이터베이스 설계

### 2.1 Google Sheets 스키마

#### 시트 구조
```
A        B         C      D        E      F
date  | category | name | quantity| price | note
```

#### 컬럼 정의
| 컬럼명 | 타입 | 필수 | 설명 | 예시 |
|--------|------|------|------|------|
| date | String | ✅ | 날짜 (YYYY-MM-DD) | 2026-02-08 |
| category | String | ✅ | 분류 (한글 고정) | 주식, 코인, 부동산, 현금 |
| name | String | ✅ | 종목명 | 삼성전자 |
| quantity | Number | ⭕ | 수량 | 10 |
| price | Number | ✅ | 가격 (원) | 70000 |
| note | String | ⭕ | 메모 | 장기 투자 |

#### 데이터 예시
```
date       | category | name      | quantity | price | note
2026-02-08 | 주식     | 삼성전자   | 10       | 70000 | 장기 투자
2026-02-07 | 코인     | 비트코인   | 0.5      | 60000000 | 분할 매수
```

### 2.2 로컬 스토리지 스키마

#### google_sheet_config
```json
{
  "sheetId": "1a2b3c4d5e6f7g8h9i0j"
}
```

---

## 3. API 설계

### 3.1 Backend API Endpoints

#### 3.1.1 데이터 조회
```http
POST /api/sheets/data
Content-Type: application/json

Request Body:
{
  "sheetId": "string",
  "clientEmail": "string",
  "privateKey": "string",
  "filters": {
    "startDate": "YYYY-MM-DD",  // optional
    "endDate": "YYYY-MM-DD",    // optional
    "category": "string",        // optional ("all" | "주식" | "코인" | "부동산" | "현금")
    "searchName": "string"       // optional
  }
}

Response (200 OK):
{
  "data": [
    {
      "date": "2026-02-08",
      "category": "주식",
      "name": "삼성전자",
      "quantity": "10",
      "price": "70000",
      "note": "장기 투자"
    }
  ]
}

Response (400 Bad Request):
{
  "error": "모든 설정값을 입력해주세요."
}
```

**필터링 로직:**
1. 날짜 필터: `startDate <= date <= endDate`
2. 분류 필터: `category === filters.category` (category !== "all")
3. 종목명 검색: `name.toLowerCase().includes(searchName.toLowerCase())`
4. 모든 필터는 AND 조건으로 적용
5. 최종 결과는 날짜 기준 내림차순 정렬

#### 3.1.2 데이터 추가
```http
POST /api/sheets/add
Content-Type: application/json

Request Body:
{
  "sheetId": "string",
  "clientEmail": "string",
  "privateKey": "string",
  "item": {
    "date": "YYYY-MM-DD",
    "category": "string",
    "name": "string",
    "quantity": "string",
    "price": "string",
    "note": "string"
  }
}

Response (200 OK):
{
  "success": true,
  "message": "Data added successfully"
}

Response (400 Bad Request):
{
  "error": "모든 설정값을 입력해주세요."
}
```

---

## 4. 프론트엔드 구현

### 4.1 컴포넌트 구조

```
Investment.jsx (메인 컴포넌트)
├── State Management
│   ├── sheetId, clientEmail, privateKey (연동 설정)
│   ├── data, originalData (데이터)
│   ├── loading, error (UI 상태)
│   ├── activeTab (탭 상태: 'list' | 'add' | 'settings')
│   ├── filters (필터 상태)
│   ├── currentPage, itemsPerPage (페이지네이션)
│   ├── sortConfig (정렬 상태)
│   └── newItem (추가 폼)
│
├── Functions
│   ├── loadData() - 데이터 조회
│   ├── addData() - 데이터 추가
│   ├── saveConfig() - 설정 저장
│   ├── handleSort() - 정렬 처리
│   └── resetFilters() - 필터 초기화
│
└── UI Components
    ├── Header (제목, 설명)
    ├── Tab Navigation (3개 탭)
    ├── Tab Content
    │   ├── 투자내역조회 탭
    │   │   ├── Filter Section
    │   │   └── Data Table + Pagination
    │   ├── 투자항목 추가 탭
    │   │   └── Input Form
    │   └── 연동설정 탭
    │       └── Config Form
    └── Error Display
```

### 4.2 상태 관리

#### 4.2.1 State 정의
```javascript
// 연동 설정
const [sheetId, setSheetId] = useState('');
const [clientEmail, setClientEmail] = useState(serviceAccountCredentials.client_email);
const [privateKey, setPrivateKey] = useState(serviceAccountCredentials.private_key);

// 데이터
const [data, setData] = useState([]);
const [originalData, setOriginalData] = useState([]);

// UI 상태
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

// 탭 상태
const [activeTab, setActiveTab] = useState('list');

// 필터 상태
const [filters, setFilters] = useState({
  startDate: '',
  endDate: '',
  category: 'all',
  searchName: ''
});

// 페이지네이션
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage] = useState(10);

// 정렬
const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

// 추가 폼
const [newItem, setNewItem] = useState({
  date: new Date().toISOString().split('T')[0],
  category: '주식',
  name: '',
  quantity: '',
  price: '',
  note: ''
});
```

### 4.3 핵심 함수 로직

#### 4.3.1 loadData() - 데이터 조회
```javascript
const loadData = async () => {
  // 1. 설정 검증
  if (!sheetId || !clientEmail || !privateKey) {
    setError(t.allSettings);
    return;
  }

  setLoading(true);
  setError(null);

  console.log('🔍 Frontend: Sending filters to backend:', filters);

  try {
    // 2. API 호출
    const response = await fetch('http://localhost:3001/api/sheets/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sheetId, clientEmail, privateKey, filters }),
    });

    if (!response.ok) {
      throw new Error('데이터를 불러오는데 실패했습니다.');
    }

    // 3. 데이터 설정
    const result = await response.json();
    console.log('✅ Frontend: Received data count:', result.data.length);
    setData(result.data);
    setOriginalData(result.data);
    setSortConfig({ key: null, direction: null });
  } catch (err) {
    console.error('❌ Frontend error:', err);
    setError(t.dataLoadError);
  } finally {
    setLoading(false);
  }
};
```

#### 4.3.2 handleSort() - 정렬 처리
```javascript
const handleSort = (key) => {
  setCurrentPage(1); // 정렬 시 첫 페이지로
  
  // 정렬 방향 결정 (desc → asc → null)
  let direction = 'desc';
  if (sortConfig.key === key) {
    if (sortConfig.direction === 'desc') {
      direction = 'asc';
    } else if (sortConfig.direction === 'asc') {
      setSortConfig({ key: null, direction: null });
      setData([...originalData]);
      return;
    }
  }

  // 데이터 정렬
  const sorted = [...data].sort((a, b) => {
    let aVal = a[key];
    let bVal = b[key];

    // 타입별 처리
    if (key === 'date') {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    } else if (key === 'quantity' || key === 'price') {
      aVal = Number(aVal) || 0;
      bVal = Number(bVal) || 0;
    } else {
      aVal = String(aVal).toLowerCase();
      bVal = String(bVal).toLowerCase();
    }

    // 정렬
    if (direction === 'desc') {
      return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
    } else {
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    }
  });

  setData(sorted);
  setSortConfig({ key, direction });
};
```

#### 4.3.3 addData() - 데이터 추가
```javascript
const addData = async () => {
  // 1. 유효성 검증
  if (!newItem.name || !newItem.price) {
    alert(t.nameRequired);
    return;
  }

  setLoading(true);
  try {
    // 2. API 호출
    const response = await fetch('http://localhost:3001/api/sheets/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sheetId,
        clientEmail,
        privateKey,
        item: newItem
      }),
    });

    if (!response.ok) {
      throw new Error('데이터 추가에 실패했습니다.');
    }

    // 3. 데이터 새로고침
    await loadData();
    
    // 4. 폼 초기화
    setNewItem({ ...newItem, name: '', quantity: '', price: '', note: '' });
    alert(t.dataAddedSuccess);
    
    // 5. 투자내역조회 탭으로 이동
    setActiveTab('list');
  } catch (err) {
    console.error(err);
    setError(t.dataAddError);
  } finally {
    setLoading(false);
  }
};
```

### 4.4 UI 레이아웃

#### 4.4.1 레이아웃 클래스
```jsx
<div className="container mx-auto px-6 py-8 space-y-6 animate-fade-in">
```
- `container`: Tailwind 반응형 컨테이너
- `mx-auto`: 중앙 정렬
- `px-6`: 좌/우 패딩 (24px)
- `py-8`: 상/하 패딩 (32px)
- `space-y-6`: 자식 요소 간격 (24px)
- `animate-fade-in`: 페이드인 애니메이션

#### 4.4.2 필터 그리드 레이아웃
```jsx
<div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
  <div className="md:col-span-2">시작일</div>
  <div className="md:col-span-2">종료일</div>
  <div className="md:col-span-2">분류</div>
  <div className="md:col-span-3">종목명</div>
  <div className="md:col-span-2">조회하기</div>
  <div className="md:col-span-1">초기화</div>
</div>
```
- 총 12칸 그리드
- 모바일: 세로 스택 (grid-cols-1)
- 데스크톱: 한 줄 배치 (md:grid-cols-12)
- `items-end`: 하단 정렬

---

## 5. 백엔드 구현

### 5.1 서버 설정

#### 5.1.1 server.js 구조
```javascript
const express = require('express');
const cors = require('cors');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

const app = express();
app.use(cors());
app.use(express.json());

// 데이터 조회 API
app.post('/api/sheets/data', async (req, res) => { /* ... */ });

// 데이터 추가 API
app.post('/api/sheets/add', async (req, res) => { /* ... */ });

app.listen(3001, () => {
  console.log('✅ API Server running on http://localhost:3001');
});
```

### 5.2 Google Sheets API 인증

#### 5.2.1 Service Account 인증
```javascript
const serviceAccountAuth = new JWT({
  email: clientEmail,
  key: privateKey.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
await doc.loadInfo();
```

**주의사항:**
- `privateKey`의 `\\n`을 `\n`으로 변환
- Scope: `spreadsheets` (읽기/쓰기 권한)

### 5.3 필터링 로직

```javascript
// 원본 데이터 가져오기
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
  // 1. 날짜 범위 필터
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
  
  // 2. 분류 필터
  if (filters.category && filters.category !== 'all') {
    const beforeCount = data.length;
    data = data.filter(item => item.category === filters.category);
    console.log(`📂 Category filter (${filters.category}): ${beforeCount} -> ${data.length}`);
  }
  
  // 3. 종목명 검색
  if (filters.searchName) {
    const beforeCount = data.length;
    const searchTerm = filters.searchName.toLowerCase();
    data = data.filter(item => item.name.toLowerCase().includes(searchTerm));
    console.log(`🔎 Name search filter (${filters.searchName}): ${beforeCount} -> ${data.length}`);
  }
}

console.log(`✅ Final filtered data count: ${data.length}`);

// 날짜 기준 내림차순 정렬
data.sort((a, b) => {
  const dateA = new Date(a.date);
  const dateB = new Date(b.date);
  return dateB - dateA;
});
```

---

## 6. 다국어 지원

### 6.1 LanguageContext 번역 키

#### 6.1.1 영어 번역
```javascript
en: {
  // 투자관리
  investmentManagement: "Investment Management",
  investmentDescription: "Manage your assets linked to Google Sheets",
  investmentList: "Investment List",
  addInvestment: "Add Investment",
  connectionSettings: "Connection Settings",
  
  // 필터
  filterConditions: "Filter Conditions",
  startDate: "Start Date",
  endDate: "End Date",
  all: "All",
  searchByName: "Search by name...",
  search: "Search",
  reset: "Reset",
  
  // 분류 (코드성 값 - 번역 안됨)
  stock: "Stock",
  crypto: "Crypto",
  realEstate: "Real Estate",
  cash: "Cash",
  
  // ... 기타
}
```

#### 6.1.2 한국어 번역
```javascript
ko: {
  // 투자관리
  investmentManagement: "투자 관리",
  investmentDescription: "구글 시트에 연동하여 자산을 한눈에 파악하세요",
  investmentList: "투자내역조회",
  addInvestment: "투자항목 추가",
  connectionSettings: "연동설정",
  
  // ... (영어와 동일한 키 구조)
}
```

### 6.2 분류 값 처리

**중요:** 분류 값은 코드성 데이터로 **항상 한글**로 표시/저장

```jsx
// ❌ 잘못된 방법 (번역 사용)
<option value={t.stock}>{t.stock}</option>

// ✅ 올바른 방법 (한글 고정)
<option value="주식">주식</option>
```

---

## 7. 개발 환경 설정

### 7.1 필수 파일

#### 7.1.1 Service Account JSON
**위치**: `src/md/antigravity-486713-ce0c8ed9a651.json`

```json
{
  "type": "service_account",
  "project_id": "antigravity-486713",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "xxx@antigravity-486713.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

#### 7.1.2 package.json 스크립트
```json
{
  "scripts": {
    "dev": "vite",
    "server": "node server.js",
    "dev:all": "concurrently \"npm run dev\" \"npm run server\"",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### 7.2 실행 방법

```bash
# 개발 서버 실행 (프론트엔드 + 백엔드 동시)
npm run dev:all

# 프론트엔드만 실행
npm run dev

# 백엔드만 실행
npm run server
```

**접속:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

---

## 8. 코드 컨벤션

### 8.1 파일 구조
```
src/
├── Investment.jsx          # 메인 컴포넌트
├── LanguageContext.jsx     # 다국어 Context
├── md/
│   └── antigravity-486713-ce0c8ed9a651.json  # Service Account
server.js                   # 백엔드 서버
```

### 8.2 네이밍 규칙

#### 변수/함수
- **camelCase**: `loadData`, `handleSort`, `resetFilters`
- **Boolean**: `is-` 또는 `has-` 접두사 (`isLoading`, `hasError`)

#### 컴포넌트
- **PascalCase**: `Investment`, `LanguageContext`

#### 상수
- **UPPER_SNAKE_CASE**: `API_BASE_URL`, `ITEMS_PER_PAGE`

### 8.3 주석 규칙
```javascript
// 1. 단계별 주석
// 2. 중요 로직 설명
// 3. TODO 표시

/* 
 * 복잡한 로직에 대한
 * 여러 줄 설명
 */
```

---

## 9. 테스트 가이드

### 9.1 단위 테스트 시나리오

#### 9.1.1 데이터 조회
```
✅ 성공 케이스:
- 모든 설정이 올바를 때 데이터 조회 성공
- 필터 없이 전체 데이터 조회
- 날짜 필터로 특정 기간 데이터 조회
- 분류 필터로 특정 카테고리만 조회
- 종목명 검색으로 부분 일치 조회
- 여러 필터 조합 조회

❌ 실패 케이스:
- 설정 정보 누락 시 에러 메시지
- 잘못된 Spreadsheet ID
- 네트워크 오류
- 권한 오류
```

#### 9.1.2 데이터 추가
```
✅ 성공 케이스:
- 모든 필수 필드 입력 시 추가 성공
- 추가 후 자동으로 투자내역조회 탭 이동
- 추가 후 데이터 새로고침

❌ 실패 케이스:
- 필수 필드 누락 (종목명, 가격)
- 네트워크 오류
```

#### 9.1.3 정렬
```
✅ 정렬 테스트:
- 날짜 정렬 (desc → asc → 원본)
- 분류 정렬 (한글 가나다순)
- 종목명 정렬 (알파벳/한글순)
- 수량/가격 정렬 (숫자순)
```

#### 9.1.4 페이지네이션
```
✅ 페이지네이션 테스트:
- 페이지당 10개 표시
- 이전/다음 페이지 이동
- 첫/마지막 페이지에서 버튼 비활성화
- 전체 항목 수 표시
```

### 9.2 통합 테스트 플로우

```
1. 연동설정 탭에서 Spreadsheet ID 입력
2. 설정 저장
3. 투자내역조회 탭으로 이동
4. 조회하기 버튼 클릭
5. 데이터 로드 확인
6. 필터 조건 입력 (날짜, 분류, 종목명)
7. 조회하기 버튼 클릭
8. 필터링된 데이터 확인
9. 컬럼 헤더 클릭하여 정렬 확인
10. 페이지 이동 확인
11. 투자항목 추가 탭으로 이동
12. 새 항목 입력
13. 추가 버튼 클릭
14. 자동으로 투자내역조회 탭 이동 확인
15. 새 데이터 표시 확인
```

---

## 10. 문제 해결 가이드

### 10.1 흔한 문제

#### 문제 1: "모든 설정값을 입력해주세요" 에러
**원인**: Spreadsheet ID가 로컬 스토리지에 저장되지 않음
**해결**:
1. 연동설정 탭에서 Spreadsheet ID 입력
2. "설정 저장" 버튼 클릭
3. 브라우저 개발자 도구 > Application > Local Storage 확인

#### 문제 2: 필터링이 작동하지 않음
**원인**: 분류 값이 한글과 영문이 섞임
**해결**:
1. Google Sheets의 category 컬럼이 "주식", "코인" 등 **한글**인지 확인
2. Investment.jsx의 필터 select option이 `value="주식"` 등 한글인지 확인

#### 문제 3: Google Sheets API 권한 오류
**원인**: Service Account가 Spreadsheet에 대한 접근 권한 없음
**해결**:
1. Google Sheets 파일 열기
2. "공유" 버튼 클릭
3. Service Account Email 추가 (viewer 또는 editor 권한)

#### 문제 4: CORS 에러
**원인**: 백엔드 서버가 실행되지 않음
**해결**:
1. `npm run dev:all` 명령으로 프론트엔드와 백엔드 동시 실행
2. 터미널에서 "✅ API Server running on http://localhost:3001" 확인

### 10.2 디버깅 팁

#### 프론트엔드 디버깅
```javascript
// loadData 함수에서
console.log('🔍 Frontend: Sending filters to backend:', filters);
console.log('✅ Frontend: Received data count:', result.data.length);
```

#### 백엔드 디버깅
```javascript
// server.js에서
console.log('📊 Original data count:', originalDataCount);
console.log('🔍 Filters received:', JSON.stringify(filters, null, 2));
console.log('📅 Start date filter (...):', beforeCount -> afterCount);
console.log('✅ Final filtered data count:', data.length);
```

**로그 확인 위치:**
- 프론트엔드: 브라우저 개발자 도구 Console 탭
- 백엔드: 터미널에서 `npm run dev:all` 실행 중인 창

---

## 11. 성능 최적화

### 11.1 프론트엔드 최적화
- [ ] React.memo 사용 (테이블 행 컴포넌트)
- [ ] useMemo 사용 (정렬/필터링된 데이터)
- [ ] Lazy loading (큰 데이터셋)
- [ ] Debounce (검색 입력)

### 11.2 백엔드 최적화
- [ ] 응답 캐싱 (동일한 요청)
- [ ] 압축 (gzip)
- [ ] 에러 로깅 시스템

### 11.3 네트워크 최적화
- [ ] API 응답 압축
- [ ] HTTP/2 사용
- [ ] CDN 활용 (정적 자산)

---

## 12. 보안 고려사항

### 12.1 인증 정보 보호
- ✅ Service Account JSON 파일을 `.gitignore`에 추가
- ✅ Private Key를 환경 변수로 관리 (프로덕션)
- ⚠️ HTTPS 사용 (프로덕션 배포 시)

### 12.2 입력 검증
- ✅ 프론트엔드: 필수 필드 검증
- ✅ 백엔드: Request body 검증
- ⚠️ SQL Injection 방지 (해당 없음 - Google Sheets API 사용)
- ⚠️ XSS 방지 (React의 기본 이스케이핑 활용)

### 12.3 CORS 설정
```javascript
// 개발 환경: 모든 origin 허용
app.use(cors());

// 프로덕션 환경: 특정 origin만 허용 (권장)
app.use(cors({
  origin: 'https://yourdomain.com'
}));
```

---

## 13. 배포 가이드

### 13.1 프론트엔드 빌드
```bash
# 프로덕션 빌드
npm run build

# dist/ 폴더 생성됨
```

### 13.2 백엔드 배포
```bash
# PM2 사용 (권장)
npm install -g pm2
pm2 start server.js --name investment-api

# 또는 nohup
nohup node server.js &
```

### 13.3 환경 변수 설정
```bash
# .env 파일
PORT=3001
NODE_ENV=production
GOOGLE_SERVICE_ACCOUNT_PATH=./path/to/service-account.json
```

---

## 14. 유지보수 가이드

### 14.1 정기 점검 항목
- [ ] Google Sheets API 할당량 확인
- [ ] Service Account 인증 유효성 확인
- [ ] 에러 로그 검토
- [ ] 성능 모니터링

### 14.2 업데이트 계획
- [ ] React 버전 업그레이드
- [ ] 보안 패치 적용
- [ ] 의존성 패키지 업데이트

---

## 15. 참고 자료

### 15.1 공식 문서
- [Google Sheets API](https://developers.google.com/sheets/api)
- [google-spreadsheet npm](https://www.npmjs.com/package/google-spreadsheet)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)

### 15.2 코드 저장소
- GitHub Repository: (프로젝트 URL)
- Issue Tracker: (이슈 트래커 URL)

---

## 📝 변경 이력

| 날짜 | 버전 | 변경 내용 | 작성자 |
|------|------|-----------|--------|
| 2026-02-08 | 1.0 | 최초 문서 작성 | Dev Team |

---

## 부록 A: 전체 코드 참조

### Investment.jsx (핵심 부분)
```javascript
import React, { useState, useEffect } from 'react';
import { TrendingUp, Plus, Save, Loader, AlertTriangle, ChevronRight, ChevronLeft, Calculator, ArrowUpDown, ArrowUp, ArrowDown, Search, RotateCcw } from 'lucide-react';
import serviceAccountCredentials from './md/antigravity-486713-ce0c8ed9a651.json';
import { useLanguage } from './LanguageContext';

const Investment = () => {
  const { t } = useLanguage();
  
  // ... (State 정의)
  
  const loadData = async () => { /* ... */ };
  const addData = async () => { /* ... */ };
  const handleSort = (key) => { /* ... */ };
  const resetFilters = () => { /* ... */ };
  
  return (
    <div className="container mx-auto px-6 py-8 space-y-6 animate-fade-in">
      {/* UI 컴포넌트 */}
    </div>
  );
};

export default Investment;
```

### server.js (핵심 부분)
```javascript
const express = require('express');
const cors = require('cors');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/sheets/data', async (req, res) => {
  // ... (필터링 로직)
});

app.post('/api/sheets/add', async (req, res) => {
  // ... (추가 로직)
});

app.listen(3001);
```

---

**문서 끝**
