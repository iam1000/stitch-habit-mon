# Netlify ↔ Vercel 멀티플랫폼 배포 가이드 (통합본)

> **목적**: 하나의 프로젝트를 여러 플랫폼(Netlify, Vercel)에 자유롭게 배포하고 관리하기 위함  
> **대상**: 배포 경험이 없는 초심자부터 실무자까지  
> **최종 업데이트**: 2026-02-12

---

## 📋 목차
1. [개요 (Overview)](#1-개요-overview)
2. [공통 준비 사항 (Prerequisites)](#2-공통-준비-사항-prerequisites)
3. [플랫폼별 상세 배포 가이드](#3-플랫폼별-상세-배포-가이드)
    - 3.1 [Netlify 배포](#31-netlify-배포)
    - 3.2 [Vercel 배포](#32-vercel-배포)
    - 3.3 [신규 플랫폼 추가 (Template)](#33-신규-플랫폼-추가-template)
4. [운영 및 관리 (Operations)](#4-운영-및-관리-operations)
5. [트러블슈팅 (Troubleshooting)](#5-트러블슈팅-troubleshooting)

---

## 1. 개요 (Overview)

이 가이드는 **Stitch Habit Mon** 프로젝트를 **Netlify**와 **Vercel** 두 가지 서버리스 플랫폼에 동시에, 혹은 선택적으로 배포하는 방법을 다룹니다.

### 핵심 전략: One Code, Multi Deploy
우리는 플랫폼마다 코드를 수정하지 않습니다. **공통 비즈니스 로직**을 분리하고, 각 플랫폼에 맞는 **래퍼(Wrapper)** 함수를 사용하여 **단일 코드베이스로 여러 곳에 배포**합니다.

| 구분 | Netlify | Vercel | 비고 |
| :--- | :--- | :--- | :--- |
| **빌드 명령** | `npm run build` | `npm run build` | 동일 |
| **API 경로** | `/.netlify/functions` | `/api` | **환경변수로 구분** |
| **무료 혜택** | 빌드 300분/월 | 빌드 6,000분/월 | Vercel이 넉넉함 |
| **특징** | 설정 간편, Forms 지원 | 한국 속도 빠름, Next.js 최적화 | 상호 보완적 |

---

## 2. 공통 준비 사항 (Prerequisites)

어떤 플랫폼에 배포하든 아래 사항은 반드시 준비되어야 합니다.

### 2.1 프로젝트 폴더 구조 확인
프로젝트 루트(`c:\AI_DEV\stitch`)에 다음 폴더들이 존재하는지 확인하세요.

```text
src/
├── lib/functions/       # (핵심) 플랫폼 무관 공통 로직 (sheets-core.js 등)
netlify/
└── functions/           # Netlify용 래퍼 함수들
api/                     # Vercel용 래퍼 함수들
```

### 2.2 환경 변수 준비
배포 시 서버에 등록해야 할 **필수 환경 변수 목록**입니다. 로컬의 `.env` 내용을 참고하여 미리 메모장 등에 복사해두세요.

| 변수명 (Key) | 설명 | 예시 값 |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | Supabase 주소 | `https://...supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase 공개 키 | `eyJhb...` |
| `VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL` | 구글 서비스 계정 | `example@...iam.gserviceaccount.com` |
| `VITE_GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | 구글 비밀키 (전체 복사) | `-----BEGIN PRIVATE KEY-----\n...` |
| `VITE_GOOGLE_SHEET_CONFIG` | 시트 설정 JSON | `[{"id":"INVESTMENT",...}]` (따옴표 제외) |
| `VITE_DATA_SHEET_ID` | 데이터 시트 ID | `1mVf...` |
| `VITE_AUTH_SHEET_ID` | 권한 시트 ID | `1mVf...` |
| **`VITE_API_BASE_URL`** | **플랫폼별 API 경로 (중요!)** | Netlify: `/.netlify/functions`<br>Vercel: `/api` |

### 2.3 GitHub 리포지토리 확인
- 코드가 GitHub에 최신 상태로 Push 되어 있어야 합니다.
- **[중요]** 보안을 위해 리포지토리는 **Private(비공개)** 설정을 권장합니다.

---

## 3. 플랫폼별 상세 배포 가이드

### 3.1 Netlify 배포
가장 기본적이고 설정이 간편한 플랫폼입니다.

#### A. 사이트 생성 & GitHub 연동
1. [Netlify 대시보드](https://app.netlify.com) 접속 및 로그인.
2. **"Add new site"** -> **"Import an existing project"** 클릭.
3. **GitHub** 선택 -> `stitch-habit-mon` 리포지토리 선택.

#### B. 빌드 설정 및 환경 변수
1. **Build settings** 화면에서 아래 내용 확인 (자동 감지됨):
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
2. **Environment variables** 섹션은 로컬 `.env` 파일이 Git에 포함되어 있다면 별도 설정 불필요.
   - (보안 강화로 `.env`를 제외했다면, "Add variables"를 눌러 2.2의 변수들을 모두 등록해야 함)
   - **Tip**: Netlify는 별도 설정 없으면 `.netlify/functions` 경로를 기본으로 사용하므로 `VITE_API_BASE_URL`을 따로 설정하지 않아도 작동하지만, 명시적으로 `/.netlify/functions`를 넣어주는 것이 좋습니다.

#### C. 배포 완료 확인
1. **Deploy site** 버튼 클릭.
2. "Site deploy in progress" -> "Site is live" 상태 확인 (약 1분 소요).
3. 제공된 URL로 접속하여 로그인 및 데이터 조회 테스트.

---

### 3.2 Vercel 배포
한국 접속 속도가 빠르고 무료 빌드 시간이 넉넉하여 추천하는 플랫폼입니다.

#### A. 프로젝트 생성 & GitHub 연동
1. [Vercel 대시보드](https://vercel.com/dashboard) 접속 및 로그인.
2. **"Add New..."** -> **"Project"** 클릭.
3. **Import Git Repository**에서 `stitch-habit-mon` 리포지토리 **Import** 클릭.

#### B. 프로젝트 설정 (Configure Project) **✨ 가장 중요!**
1. **Framework Preset**: `Vite` (자동 선택됨).
2. **Root Directory**: `./` (기본값).
3. **Environment Variables**: 펼쳐서 2.2의 변수들을 **모두 등록**해야 합니다.
   - **`VITE_API_BASE_URL`**: 값으로 반드시 **`/api`** 를 입력하세요. (Netlify와 다른 점)
   - `VITE_GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`: 줄바꿈(`\n`)이 포함된 전체 문자열을 그대로 복사 붙여넣기 하세요.
   - `VITE_GOOGLE_SHEET_CONFIG`: 양쪽의 작은따옴표(`'`)를 제거한 순수 JSON 문자열만 입력하세요.

#### C. 배포 및 확인
1. **Deploy** 버튼 클릭.
2. 폭죽 애니메이션과 함께 "Congratulations!" 화면이 나오면 성공.
3. **Continue to Dashboard** -> **Visit** 버튼을 눌러 사이트 접속.
4. **필수 확인**: 투자관리, 기준정보관리 탭에서 데이터가 잘 나오는지 확인. (안 될 경우 트러블슈팅 참조)

---

### 3.3 (Template) 신규 플랫폼 추가
*향후 Cloudflare Pages, AWS Amplify 등 다른 플랫폼 추가 시 이 양식을 사용하세요.*

#### A. 프로젝트 설정
- 프레임워크: Vite / React
- 빌드 커맨드: `npm run build`
- 출력 디렉토리: `dist`

#### B. API 함수 (Serverless Functions)
- 해당 플랫폼의 Serverless Functions 규격에 맞는 래퍼 파일을 `functions/` 등의 폴더에 생성하세요.
- `src/lib/functions/sheets-core.js`를 임포트하여 사용하면 됩니다.

#### C. 환경 변수
- `VITE_API_BASE_URL`: 해당 플랫폼의 API URL 규칙에 맞게 설정 (예: `/api`, `/workers` 등)

---

## 4. 운영 및 관리 (Operations)

### 4.1 플랫폼 전환 시나리오
특정 플랫폼의 무료 사용량(크레딧)이 초과되었거나 장애가 발생했을 때 즉시 전환합니다.

1. **상황 발생**: Netlify 트래픽 초과로 사이트 접속 불가.
2. **조치**: 
   - Vercel에 이미 배포된 URL(`https://habitmons.vercel.app`)을 사용자에게 공지.
   - 또는 커스텀 도메인(DNS) 설정에서 CNAME 레코드를 Vercel 주소로 변경.
3. **복구**: 다음 달 크레딧 초기화 시 다시 Netlify로 복귀 가능.

### 4.2 파일 관리 규칙
- **공통 로직 수정**: `src/lib/functions/*.js`만 수정하면 모든 플랫폼에 반영됩니다.
- **플랫폼별 특화 기능**: `api/` (Vercel) 또는 `netlify/` (Netlify) 폴더 내 파일만 수정합니다.

---

## 5. 트러블슈팅 (Troubleshooting)

### Q1. Vercel에서 "Function Runtimes must have a valid version" 오류
- **원인**: `vercel.json`에 `runtime: nodejs18.x` 같은 설정이 고정되어 있어 최신 환경과 충돌.
- **해결**: `vercel.json`에서 `functions` 섹션을 삭제하여 Vercel이 버전을 자동 관리하게 하세요.

### Q2. 투자관리는 되는데 기준정보(Code/Menu) 조회가 안 돼요.
- **원인**: 코드가 `localStorage`의 `sheet_id`만 찾고 환경 변수를 안 보도록 되어 있었음.
- **해결**: 코드 수정 완료됨. (`localStorage` 없으면 `import.meta.env.VITE_DATA_SHEET_ID` 사용하도록 Fallback 처리)
- **팁**: 배포 후 데이터가 안 나오면 브라우저 콘솔(F12)의 네트워크 탭을 확인하세요. 404가 뜨면 API 경로 문제, 500이 뜨면 서버 설정(환경 변수 등) 문제입니다.

### Q3. "Private Key" 형식이 잘못되었다고 나와요.
- **원인**: `.env`의 `\n`이 줄바꿈으로 제대로 인식되지 않거나, 복사 과정에서 잘림.
- **해결**: Vercel/Netlify 환경 변수 설정에서 Private Key 값을 다시 붙여넣으세요. `-----BEGIN...` 부터 `...END-----` 까지 빠짐없이 한 줄(또는 줄바꿈 포함)로 들어가야 합니다.

### Q4. API 경로가 404 (Not Found)
- **원인**: `VITE_API_BASE_URL` 환경 변수가 잘못 설정됨.
- **해결**: 
  - Netlify: `/.netlify/functions` (앞에 점 주의)
  - Vercel: `/api`
  - 설정 후 반드시 **재배포(Redeploy)** 해야 적용됩니다.

---

**문서 관리자**: 개발팀 (문의: GitHub Issue)
