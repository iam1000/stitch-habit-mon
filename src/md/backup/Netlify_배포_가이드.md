# Netlify 배포 가이드

## 📋 배포 개요

이 프로젝트는 **React 프론트엔드**와 **Netlify Functions 백엔드**로 구성되어 있습니다.

### 아키텍처
```
┌─────────────────┐      ┌──────────────────────┐      ┌──────────────┐
│ React Frontend  │─────►│ Netlify Functions    │─────►│Google Sheets │
│   (Static)      │ HTTPS│ (Serverless)         │ API  │     API      │
└─────────────────┘      └──────────────────────┘      └──────────────┘
```

---

## 🚀 배포 전 준비사항

### 1. 필수 파일 확인

#### ✅ 프로젝트 파일 구조
```
stitch-habit-mon/
├── netlify.toml                    # Netlify 설정
├── .env                            # 환경 변수 (Git에 포함됨)
├── .env.example                    # 환경 변수 예시
├── netlify/
│   └── functions/
│       ├── sheets-data.js          # 데이터 조회 API
│       └── sheets-add.js           # 데이터 추가 API
├── src/
│   ├── Investment.jsx              # 환경 변수에서 자동 로드
│   └── md/
│       └── antigravity-xxx.json    # Service Account JSON (Git에 포함됨)
├── server.js                       # 로컬 개발용 (배포 안됨)
└── package.json
```

### 2. 환경 변수 및 인증 정보

**현재 설정:** 환경 변수(`.env`)와 Service Account JSON 파일이 **Git에 포함**되어 있습니다.

#### .env 파일 구조
```env
# Google Service Account (투자관리 기능)
VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL=antigravity@antigravity-486713.iam.gserviceaccount.com
VITE_GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

#### ⚠️ 보안 주의사항

**공개 저장소인 경우:**
- 민감한 정보(Service Account)가 Git에 포함되므로 **Private 저장소**로 설정하세요!
- 또는 `.gitignore`에서 `.env` 및 `src/md/*.json`을 주석 해제하여 제외하세요.

**Private 저장소인 경우:**
- 현재 설정으로 문제 없습니다. ✅
- 팀원들이 별도로 인증 정보를 설정할 필요가 없어 편리합니다.

---

## 📦 Netlify 배포 단계

### Step 1: GitHub에 푸시

```bash
# 변경사항 확인
git status

# ⚠️ Private 저장소인지 확인!
# Public 저장소라면 .env 및 Service Account JSON 파일이 노출됩니다!

# 커밋 및 푸시
git add .
git commit -m "Add Netlify Functions for investment management"
git push origin main
```

**보안 체크:**
```bash
# 저장소가 Public인지 확인
gh repo view --json visibility

# Private으로 변경 (필요 시)
gh repo edit --visibility private
```

### Step 2: Netlify 사이트 생성

1. **Netlify 대시보드** 접속: https://app.netlify.com
2. **"Add new site"** → **"Import an existing project"** 클릭
3. **GitHub** 연결 후 저장소 선택: `stitch-habit-mon`
4. **빌드 설정 확인**:
   ```
   Build command: npm run build
   Publish directory: dist
   ```
5. **"Deploy site"** 클릭

### Step 3: 환경 변수 설정

✅ **환경 변수가 `.env` 파일에 이미 포함되어 Git에 커밋**되었으므로, Netlify에서 별도 설정이 **불필요**합니다!

**작동 방식:**
1. `.env` 파일이 Git에 포함되어 있음
2. Vite 빌드 시 `VITE_*` 환경 변수가 자동으로 번들에 포함됨
3. `Investment.jsx`에서 자동으로 로드:
   ```javascript
   const [clientEmail, setClientEmail] = useState(
     import.meta.env.VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL || ''
   );
   ```
4. 사용자는 "연동설정" 탭에서 **Spreadsheet ID만 입력**하면 됨

**Netlify에서 환경 변수 설정이 필요한 경우:**
- `.env` 파일을 Git에서 제외하고 싶은 경우에만
- 그 경우 `.gitignore`에서 `.env`를 주석 해제하고,
- Netlify 대시보드 → **Site settings** → **Environment variables**에서 수동 추가

### Step 4: 배포 확인

1. Netlify 배포 완료 대기 (약 1-3분)
2. **Site URL** 클릭 (예: `https://your-app.netlify.app`)
3. 투자관리 메뉴 접속
4. **연동설정** 탭에서:
   - Spreadsheet ID 입력
   - 설정 저장
5. **투자내역조회** 탭에서 데이터 조회 테스트

---

## 🔧 로컬 vs 프로덕션 차이점

### API 엔드포인트

| 환경 | 데이터 조회 | 데이터 추가 |
|------|------------|------------|
| **로컬 (개발)** | `http://localhost:3001/api/sheets/data` | `http://localhost:3001/api/sheets/add` |
| **Netlify (프로덕션)** | `/.netlify/functions/sheets-data` | `/.netlify/functions/sheets-add` |

### 자동 전환 로직 (Investment.jsx)
```javascript
// 개발 환경에서는 localhost, 프로덕션에서는 Netlify Functions
const apiUrl = import.meta.env.DEV 
  ? 'http://localhost:3001/api/sheets/data'
  : '/.netlify/functions/sheets-data';
```

---

## 🧪 배포 후 테스트

### 필수 테스트 체크리스트

#### 1. 기본 기능
- [ ] 홈페이지 로딩
- [ ] 메뉴 네비게이션
- [ ] 언어 전환 (영어/한국어)

#### 2. 투자관리 기능
- [ ] 연동설정 탭에서 Spreadsheet ID 저장
- [ ] 투자내역조회: 데이터 로드
- [ ] 필터링: 날짜, 분류, 종목명 검색
- [ ] 정렬: 컬럼 헤더 클릭
- [ ] 페이지네이션: 이전/다음 버튼
- [ ] 투자항목 추가: 새 데이터 입력 및 저장

#### 3. 에러 핸들링
- [ ] 잘못된 Spreadsheet ID 입력 시 에러 메시지
- [ ] 네트워크 오류 처리
- [ ] 필수 필드 누락 시 알림

---

## ⚠️ 흔한 문제 해결

### 문제 1: "Function invocation failed" 에러

**원인:** Netlify Functions에 필요한 패키지가 설치 안됨

**해결:**
```bash
# package.json에 dependencies 확인
npm install google-spreadsheet google-auth-library
```

### 문제 2: CORS 에러

**원인:** Netlify Functions의 CORS 헤더 설정 누락

**해결:** `sheets-data.js`, `sheets-add.js`에서 CORS 헤더 확인
```javascript
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
```

### 문제 3: Google Sheets API 권한 오류

**원인:** Service Account가 Spreadsheet에 접근 권한 없음

**해결:**
1. Google Sheets 파일 열기
2. "공유" 버튼 클릭
3. Service Account Email 추가 (`xxx@antigravity-486713.iam.gserviceaccount.com`)
4. 권한: **Editor** 또는 **Viewer** 부여

### 문제 4: 로컬에서는 작동하는데 Netlify에서 안 됨

**디버깅 방법:**
1. Netlify 대시보드 → **Functions** 탭
2. 해당 Function 클릭
3. **Logs** 확인
4. 에러 메시지 확인

---

## 🔄 재배포 방법

### 코드 변경 후
```bash
git add .
git commit -m "Update investment features"
git push origin main
```
→ **자동으로 Netlify에서 재배포 시작**

### 수동 재배포
1. Netlify 대시보드 → **Deploys** 탭
2. **"Trigger deploy"** → **"Deploy site"** 클릭

---

## 📊 배포 상태 확인

### Netlify 대시보드
- **Production URL**: 실제 서비스 URL
- **Deploy log**: 빌드 로그 확인
- **Functions**: Serverless 함수 상태
- **Analytics**: 트래픽 분석 (유료 기능)

### 빌드 로그 예시
```bash
✅ Build script successful
✅ Functions bundled
✅ Site deployed to production
```

---

## 🎯 성능 최적화

### 1. Functions 최적화
- [ ] Cold start 시간 단축 (패키지 최소화)
- [ ] 응답 캐싱
- [ ] 에러 로깅

### 2. Frontend 최적화
- [ ] Code splitting
- [ ] Lazy loading
- [ ] Image optimization

### 3. Netlify 설정
```toml
[build.environment]
  NODE_VERSION = "18"

[functions]
  node_bundler = "esbuild"  # 빠른 번들링
```

---

## 🔒 보안 체크리스트

### 배포 전
- [ ] **GitHub 저장소가 Private인지 확인** ⚠️ (매우 중요!)
  - Public 저장소면 `.env` 및 Service Account JSON이 노출됩니다!
  - Private 저장소 권장
- [x] `.env` 파일에 환경 변수 설정됨
- [x] `Investment.jsx`가 환경 변수를 자동 로드함
- [x] API 엔드포인트가 동적으로 전환됨

### 배포 후
- [ ] HTTPS 강제 활성화 (Netlify 기본)
- [ ] CORS 헤더 적절히 설정
- [ ] Google Sheets 공유 권한 확인
- [ ] 프로덕션 환경에서 Service Account 정상 작동 확인

### 보안 강화 옵션 (선택사항)

Git에서 민감 정보를 제외하려면:

1. **`.gitignore` 수정**
   ```gitignore
   .env                    # 주석 제거
   src/md/*.json          # 주석 제거
   ```

2. **Netlify 환경 변수 설정**
   - Site settings → Environment variables
   - `VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL` 추가
   - `VITE_GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` 추가

3. **Git에서 제거** (이미 커밋된 경우)
   ```bash
   git rm --cached .env
   git rm --cached src/md/*.json
   git commit -m "Remove sensitive files from Git"
   git push origin main
   ```

---

## 📝 체크리스트

### 배포 전 확인
- [ ] `netlify.toml` 파일 존재
- [ ] `netlify/functions/` 폴더에 2개 함수 존재
- [ ] `Investment.jsx`에서 환경 변수 자동 로드 확인
- [ ] `.env` 파일에 Service Account 정보 설정됨
- [ ] **GitHub 저장소가 Private인지 확인** ⚠️
- [ ] `package.json`에 필요한 dependencies 설치됨

### 배포 후 확인
- [ ] Netlify 빌드 성공
- [ ] Functions 배포 성공
- [ ] 프로덕션 URL 접속 가능
- [ ] 투자관리 기능 정상 작동

---

## 📞 문제 발생 시

1. **Netlify Deploy Log** 확인
2. **Browser Console** 에러 확인
3. **Netlify Functions Log** 확인
4. GitHub Issues에 문의

---

## 🔗 관련 링크

- [Netlify Functions 문서](https://docs.netlify.com/functions/overview/)
- [Google Sheets API](https://developers.google.com/sheets/api)
- [Netlify Deploy 가이드](https://docs.netlify.com/site-deploys/overview/)

---

**배포 완료!** 🎉

프로덕션 URL: `https://your-app.netlify.app`
