# Netlify ↔ Vercel 멀티플랫폼 배포 가이드

> **목적**: Netlify와 Vercel 양쪽 플랫폼 모두에서 배포 가능하도록 코드 구조 개선  
> **작성일**: 2026-02-12

---

## 📋 목차
1. [변경 사항 요약](#1-변경-사항-요약)
2. [멀티플랫폼 지원 전략](#2-멀티플랫폼-지원-전략)
3. [단계별 구현 가이드](#3-단계별-구현-가이드)
4. [플랫폼별 배포 설정](#4-플랫폼별-배포-설정)
5. [비교표](#5-비교표)
6. [전환 체크리스트](#6-전환-체크리스트)
7. [추천 시나리오](#7-추천-시나리오)
8. [Vercel 배포 상세 가이드 (2026-02-12 추가)](#8-vercel-배포-상세-가이드-2026-02-12-추가)

---

## 1. 변경 사항 요약

### 🎯 목표
- ✅ Netlify와 Vercel 모두에서 배포 가능
- ✅ 플랫폼 전환 시 코드 수정 최소화
- ✅ 로컬 개발 환경 유지

### 📦 필요한 파일 변경

| 구분 | 현재 (Netlify Only) | 변경 후 (Multi-Platform) |
|------|---------------------|-------------------------|
| Functions | `netlify/functions/*.js` | `lib/functions/*.js` (공통 로직)<br>`netlify/functions/*.js` (래퍼)<br>`api/*.js` (래퍼) |
| API 경로 | `/.netlify/functions/` (하드코딩) | `VITE_API_BASE_URL` (환경변수) |
| 설정 파일 | `netlify.toml` | `netlify.toml` + `vercel.json` |
| 환경 변수 | `.env` (Git 포함) | `.env.example` + 플랫폼별 설정 |

---

## 2. 멀티플랫폼 지원 전략

### 전략 A: 공통 로직 분리 (✅ 추천)

**장점**:
- 비즈니스 로직 중복 없음
- 유지보수 용이
- 플랫폼 전환 시 래퍼만 수정

**구조**:
```
src/
├── lib/
│   └── functions/
│       ├── sheets-core.js       # 공통 비즈니스 로직
│       └── auth-helper.js       # 인증 헬퍼
├── netlify/
│   └── functions/
│       ├── sheets-data.js       # Netlify 래퍼
│       └── sheets-add.js
└── api/                         # Vercel 래퍼
    ├── sheets-data.js
    └── sheets-add.js
```

### 전략 B: 조건부 분기 (간단하지만 비추천)

**단점**: 코드 복잡도 증가, 테스트 어려움

```javascript
// ❌ 이 방법은 유지보수가 어렵습니다
export const handler = async (event, context) => {
  const isVercel = process.env.VERCEL === '1';
  const req = isVercel ? context.req : event;
  const res = isVercel ? context.res : null;
  // ...
};
```

---

## 3. 단계별 구현 가이드

### Step 1: 공통 로직 분리

#### 1-1. 공통 함수 폴더 생성

```powershell
# Windows PowerShell
cd c:\AI_DEV\stitch
mkdir src\lib\functions
```

#### 1-2. 공통 비즈니스 로직 작성

**파일: `src/lib/functions/sheets-core.js`**

```javascript
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

/**
 * Google Sheets 데이터 조회 공통 함수
 * @param {Object} params - 요청 파라미터
 * @returns {Promise<Object>} 결과 데이터
 */
export async function getSheetsData(params) {
  const { sheetId, clientEmail, privateKey, filters, sheetName } = params;

  if (!sheetId || !clientEmail || !privateKey) {
    throw new Error('모든 설정값을 입력해주세요.');
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
      throw new Error(`시트를 찾을 수 없습니다: ${sheetName}`);
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

  // 필터링 로직 (기존과 동일)
  if (filters) {
    if (headerValues.includes('date')) {
      if (filters.startDate) {
        data = data.filter(item => item.date >= filters.startDate);
      }
      if (filters.endDate) {
        data = data.filter(item => item.date <= filters.endDate);
      }
    }

    Object.keys(filters).forEach(key => {
      if (key === 'startDate' || key === 'endDate') return;
      const filterVal = filters[key];

      if (filterVal && filterVal !== 'all') {
        if (key === 'account_name' || key === 'account_company' || key === 'name') {
          const term = filterVal.toLowerCase();
          data = data.filter(item => item[key] && String(item[key]).toLowerCase().includes(term));
        } else if (key === 'account_type' || key === 'category') {
          data = data.filter(item => item[key] === filterVal);
        } else if (key === 'searchName') {
          if (headerValues.includes('name')) {
            const term = filterVal.toLowerCase();
            data = data.filter(item => item['name'] && String(item['name']).toLowerCase().includes(term));
          } else if (headerValues.includes('account_name')) {
            const term = filterVal.toLowerCase();
            data = data.filter(item => item['account_name'] && String(item['account_name']).toLowerCase().includes(term));
          }
        } else if (headerValues.includes(key)) {
          data = data.filter(item => item[key] === filterVal);
        }
      }
    });
  }

  // 정렬
  if (headerValues.includes('date')) {
    data.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB - dateA;
    });
  }

  return { data };
}

/**
 * Google Sheets 데이터 추가 공통 함수
 */
export async function addSheetsData(params) {
  const { sheetId, clientEmail, privateKey, item, sheetName } = params;

  if (!sheetId || !clientEmail || !privateKey) {
    throw new Error('모든 설정값을 입력해주세요.');
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
      throw new Error(`시트를 찾을 수 없습니다: ${sheetName}`);
    }
  } else {
    sheet = doc.sheetsByIndex[0];
  }

  await sheet.addRow(item);
  
  return { success: true, message: '데이터가 추가되었습니다.' };
}

/**
 * Google Sheets 데이터 수정 공통 함수
 */
export async function updateSheetsData(params) {
  const { sheetId, clientEmail, privateKey, item, sheetName, uuid } = params;

  if (!sheetId || !clientEmail || !privateKey || !uuid) {
    throw new Error('필수 설정값이 누락되었습니다.');
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
      throw new Error(`시트를 찾을 수 없습니다: ${sheetName}`);
    }
  } else {
    sheet = doc.sheetsByIndex[0];
  }

  const rows = await sheet.getRows();
  const targetRow = rows.find(row => row.get('id') === uuid || row.get('uuid') === uuid);

  if (!targetRow) {
    throw new Error('수정할 데이터를 찾을 수 없습니다.');
  }

  Object.keys(item).forEach(key => {
    targetRow.set(key, item[key]);
  });

  await targetRow.save();
  
  return { success: true, message: '데이터가 수정되었습니다.' };
}

/**
 * Google Sheets 데이터 삭제 공통 함수
 */
export async function deleteSheetsData(params) {
  const { sheetId, clientEmail, privateKey, sheetName, uuid } = params;

  if (!sheetId || !clientEmail || !privateKey || !uuid) {
    throw new Error('필수 설정값이 누락되었습니다.');
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
      throw new Error(`시트를 찾을 수 없습니다: ${sheetName}`);
    }
  } else {
    sheet = doc.sheetsByIndex[0];
  }

  const rows = await sheet.getRows();
  const targetRow = rows.find(row => row.get('id') === uuid || row.get('uuid') === uuid);

  if (!targetRow) {
    throw new Error('삭제할 데이터를 찾을 수 없습니다.');
  }

  await targetRow.delete();
  
  return { success: true, message: '데이터가 삭제되었습니다.' };
}
```

---

### Step 2: Netlify Functions 래퍼 작성

기존 `netlify/functions/sheets-data.js`를 래퍼로 변경:

**파일: `netlify/functions/sheets-data.js`**

```javascript
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
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
```

**동일한 방식으로 다른 Functions도 래퍼로 변경**:
- `netlify/functions/sheets-add.js` → `addSheetsData` 호출
- `netlify/functions/sheets-update.js` → `updateSheetsData` 호출
- `netlify/functions/sheets-delete.js` → `deleteSheetsData` 호출

---

### Step 3: Vercel Functions 래퍼 작성

**파일: `api/sheets-data.js`**

```javascript
import { getSheetsData } from '../src/lib/functions/sheets-core.js';

export default async function handler(req, res) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const result = await getSheetsData(req.body);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
```

**동일한 방식으로 다른 Functions도 작성**:
- `api/sheets-add.js`
- `api/sheets-update.js`
- `api/sheets-delete.js`

---

### Step 4: Frontend API 경로 환경 변수화

#### 4-1. 환경 변수 추가

**파일: `.env`**

```bash
# 기존 변수들...
VITE_SUPABASE_URL=...
VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL=...

# 🆕 API Base URL (플랫폼별로 다름)
VITE_API_BASE_URL=/.netlify/functions
```

**파일: `.env.vercel` (Vercel용)**

```bash
# Vercel 배포 시 사용
VITE_API_BASE_URL=/api
```

#### 4-2. Frontend 코드 수정

**파일: `src/hooks/useInvestmentData.js`**

**변경 전**:
```javascript
const apiUrl = import.meta.env.DEV
  ? 'http://localhost:3001/api/sheets/data'
  : '/.netlify/functions/sheets-data';  // ❌ 하드코딩
```

**변경 후**:
```javascript
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/.netlify/functions';

const apiUrl = import.meta.env.DEV
  ? 'http://localhost:3001/api/sheets/data'
  : `${API_BASE}/sheets-data`;  // ✅ 환경 변수 사용
```

#### 4-3. 모든 API 호출 수정

다음 파일들에서 API 경로를 환경 변수로 변경:
- `src/hooks/useInvestmentData.js`
- `src/Investment.jsx`
- `src/Dashboard.jsx`

**일괄 변경 패턴**:
```javascript
// Before
const apiUrl = import.meta.env.DEV
  ? 'http://localhost:3001/api/sheets/[name]'
  : '/.netlify/functions/sheets-[name]';

// After
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/.netlify/functions';
const apiUrl = import.meta.env.DEV
  ? 'http://localhost:3001/api/sheets/[name]'
  : `${API_BASE}/sheets-[name]`;
```

---

### Step 5: 플랫폼별 설정 파일

#### 5-1. Netlify 설정 유지

**파일: `netlify.toml`** (기존 유지)

```toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[functions]
  node_bundler = "esbuild"
```

#### 5-2. Vercel 설정 추가

**파일: `vercel.json` (신규 생성)**

```json
{
  "projectSettings": {
    "framework": "vite"
  },
  "rewrites": [
    {
      "source": "/((?!api/.*).*)",
      "destination": "/index.html"
    }
  ],
  "env": {
    "VITE_API_BASE_URL": "/api"
  }
}
```

---

### Step 6: package.json 스크립트 추가

**파일: `package.json`**

```json
{
  "scripts": {
    "dev": "vite",
    "dev:all": "concurrently \"npm run dev\" \"npm run server\"",
    "build": "vite build",
    "build:netlify": "VITE_API_BASE_URL=/.netlify/functions vite build",
    "build:vercel": "VITE_API_BASE_URL=/api vite build",
    "preview": "vite preview",
    "server": "node server.js"
  }
}
```

---

## 4. 플랫폼별 배포 설정

### Netlify 배포

#### 방법 1: Git Push (기존 방식)
```powershell
git add .
git commit -m "Multi-platform support"
git push origin main
```

Netlify가 자동으로 빌드 및 배포.

#### 방법 2: 환경 변수 설정 (선택)

Netlify 대시보드 → Settings → Environment variables:
```
VITE_API_BASE_URL = /.netlify/functions
```

---

### Vercel 배포

#### 방법 1: Vercel CLI

```powershell
# Vercel CLI 설치 (최초 1회)
npm i -g vercel

# 프로젝트 연동
cd c:\AI_DEV\stitch
vercel

# 질문 답변:
# - Set up and deploy? Yes
# - Which scope? (본인 계정 선택)
# - Link to existing project? No
# - Project name? habitmons
# - Directory? ./
# - Override settings? No

# 배포
vercel --prod
```

#### 방법 2: Vercel Dashboard (Github 연동)

1. [vercel.com/dashboard](https://vercel.com/dashboard) 접속
2. "Add New Project" → Github 저장소 선택
3. Environment Variables 추가:
   ```
   VITE_API_BASE_URL = /api
   ```
4. Deploy 클릭

---

## 5. 비교표

### 변경 전 vs 변경 후

| 항목 | 변경 전 (Netlify Only) | 변경 후 (Multi-Platform) |
|------|----------------------|-------------------------|
| **Functions 구조** | `netlify/functions/*.js`<br>(모든 로직 포함) | `src/lib/functions/*.js` (공통 로직)<br>`netlify/functions/*.js` (래퍼)<br>`api/*.js` (래퍼) |
| **코드 중복** | N/A (단일 플랫폼) | ❌ 없음 (공통 로직 공유) |
| **API 경로** | `/.netlify/functions/` (하드코딩) | `VITE_API_BASE_URL` (환경변수) |
| **플랫폼 전환** | 전체 코드 수정 필요 | 환경 변수만 변경 |
| **로컬 개발** | `npm run dev:all` | `npm run dev:all` (유지) |
| **배포 시간** | - | Netlify/Vercel 중 빠른 쪽 선택 가능 |

---

### 플랫폼별 장단점

| 항목 | Netlify | Vercel |
|------|---------|--------|
| **무료 빌드 시간** | 300분/월 | 6,000분/월 ✅ |
| **Functions 실행 시간** | 10초 | 10초 (무료), 60초 (Hobby) |
| **환경 변수 관리** | UI 편리 | UI 편리 |
| **한국 접속 속도** | 빠름 | 매우 빠름 ✅ |
| **설정 복잡도** | 낮음 | 낮음 |
| **Forms 기능** | ✅ 지원 | ❌ 미지원 |
| **Split Testing** | ✅ 지원 | ✅ 지원 |

---

## 6. 전환 체크리스트

### ✅ Netlify → Vercel 전환 시

- [ ] `src/lib/functions/sheets-core.js` 생성 완료
- [ ] 기존 Netlify Functions를 래퍼로 변경
- [ ] `api/*.js` Vercel Functions 생성
- [ ] `.env`에 `VITE_API_BASE_URL=/.netlify/functions` 추가
- [ ] `vercel.json` 생성
- [ ] Frontend API 호출 코드 환경 변수화
- [ ] Git Push
- [ ] Vercel 환경 변수 설정 (`VITE_API_BASE_URL=/api`)
- [ ] Vercel 배포 테스트

### ✅ 양쪽 플랫폼 동시 유지 시

- [ ] 위 모든 항목 완료
- [ ] Netlify 배포 테스트 (기존 URL)
- [ ] Vercel 배포 테스트 (새 URL)
- [ ] 두 URL 모두 정상 작동 확인
- [ ] DNS를 원하는 플랫폼으로 연결

---

## 7. 추천 시나리오

### 시나리오 A: Netlify 크레딧 한도 임시 초과
**해결책**: Vercel로 즉시 전환 후 다음 달 Netlify 복귀

1. 위 가이드대로 멀티플랫폼 지원 구현
2. Vercel에 배포
3. DNS를 Vercel로 변경
4. 다음 달 1일 Netlify 크레딧 리셋 후 DNS 복구

### 시나리오 B: 장기적으로 Vercel 사용
**해결책**: Vercel 고정, Netlify 백업용

1. 멀티플랫폼 지원 구현
2. 주 배포: Vercel
3. 백업: Netlify (비활성화 또는 staging 용도)

### 시나리오 C: 완전히 플랫폼 독립적인 구조
**해결책**: 위 가이드 + Docker 컨테이너

추후 필요 시 Cloudflare Pages, Railway, Render 등으로도 쉽게 이전 가능.

---

## 8. Vercel 배포 상세 가이드 (2026-02-12 추가)

실제 배포 과정에서 확인된 상세 설정 및 트러블슈팅 가이드입니다.

### Step 1: GitHub에 코드 Push

```bash
git add .
git commit -m "Refactor for Vercel deployment"
git push
```

### Step 2: Vercel 프로젝트 생성

1. **[Vercel Dashboard](https://vercel.com/dashboard)** 접속
2. **Add New...** -> **Project**
3. **Import Git Repository**에서 해당 리포지토리 선택 (Import)

### Step 3: 프로젝트 설정 확인

* **Framework Preset**: `Vite`
* **Root Directory**: `./`
* **Build Command**: `npm run build`
* **Output Directory**: `dist`

### Step 4: 환경 변수 등록 (Environment Variables) **✨중요!**

Vercel 대시보드의 **Settings > Environment Variables** 에서 등록합니다.
(로컬 `.env` 파일의 값을 그대로 복사)

| Key | Value 설명 | 비고 |
| :--- | :--- | :--- |
| **`VITE_API_BASE_URL`** | **`/api`** | **필수 설정** |
| `VITE_SUPABASE_URL` | Supabase URL | |
| `VITE_SUPABASE_ANON_KEY` | Supabase Anon Key | |
| `VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL` | 구글 서비스 계정 이메일 | |
| `VITE_GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | `-----BEGIN PRIVATE KEY...` 전체 포함 | 줄바꿈(`\n`) 포함 그대로 입력 |
| `VITE_GOOGLE_SHEET_CONFIG` | `['...']` JSON 문자열 | 작은따옴표 제외하고 내용만 입력 |
| `VITE_DATA_SHEET_ID` | 데이터 시트 ID | |
| `VITE_AUTH_SHEET_ID` | 권한 시트 ID | |

### Step 5: 트러블슈팅 (Troubleshooting)

#### 1. Runtime Version Error 해결
**증상**: `Error: Function Runtimes must have a valid version` 오류 발생
**원인**: `vercel.json`에 `functions` 런타임(`nodejs18.x`)을 강제 설정하면 Vercel 자동 감지와 충돌할 수 있음.
**해결**: `vercel.json`에서 `functions` 섹션 제거 (Vercel이 자동 감지하도록 둠).

#### 2. 데이터 조회 실패 (Code/Management 탭)
**증상**: 투자관리 탭은 작동하나, 기준정보/권한관리 탭에서 데이터 조회 안 됨.
**원인**: 해당 컴포넌트들이 `localStorage`의 `sheet_id`에만 의존하게 구현됨. Vercel 최초 접속 시 `localStorage`가 비어있어 실패.
**해결**: 환경 변수로 Fallback 하도록 코드 수정.
```javascript
// 변경 전
const sheetId = localStorage.getItem('sheet_id') || '';

// 변경 후
const sheetId = localStorage.getItem('sheet_id') || import.meta.env.VITE_DATA_SHEET_ID || '';
```

---

## 🎉 완료!

이제 **Netlify와 Vercel 양쪽에서 모두 배포 가능**하며, 필요 시 언제든 플랫폼을 전환할 수 있습니다!

**핵심 장점**:
- ✅ 비즈니스 로직 중복 없음
- ✅ 플랫폼 전환 시간 최소화 (5분 이내)
- ✅ 한 플랫폼에 문제 발생 시 즉시 다른 플랫폼으로 전환 가능
- ✅ 로컬 개발 환경 영향 없음
- ✅ **안정적인 데이터 연결** (환경 변수 Fallback 적용)

궁금한 점이 있으시면 언제든 질문해 주세요! 🚀
