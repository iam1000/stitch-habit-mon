# DonMany (자산 관리 및 모니터링)

## 📌 프로젝트 소개
**DonMany**는 개인의 자산 관리(투자) 현황을 파악하고, 시스템 운영에 필요한 다양한 기준 정보를 통합적으로 관리하기 위한 웹 애플리케이션입니다.

*   **주요 기능:**
    *   **Dashboard:** 개인화된 정보를 한눈에 볼 수 있는 대시보드
    *   **Investment:** 주식, 코인 등 자산 현황 및 수익률 관리
    *   **Codes/Admin:** 시스템 전반의 공통 코드 및 메뉴 권한 관리

---

## 📚 프로젝트 문서 (Documents)
본 프로젝트의 모든 산출물은 개발 단계(분석-설계-개발-테스트)에 따라 체계적으로 관리됩니다.
전체 문서 목록은 아래 맵을 참고하세요.

👉 **[프로젝트 산출물 맵 보기 (Project Documents Map)](./PROJECT_DOCUMENTS_MAP.md)**

### 주요 문서 바로가기
*   **[데이터 요구사항 정의서 (DRD)](./DATA_ARCH_요구사항정의서_DRD.md)**
*   **[테이블 명세서 (DSD)](./DATA_ARCH_데이터명세서_DSD.md)**
*   **[API 캐싱 가이드](./DATA_GUIDE_API캐싱.md)**

---

## 🚀 시작하기 (Getting Started)

### 1. 개발 환경 설정
```bash
# 의존성 설치
npm install
```

### 2. 로컬 서버 실행
```bash
# 프론트엔드 + 백엔드(Proxy) 동시 실행
npm run dev:all
```

### 3. 환경 변수 (.env)
본 프로젝트는 `Google Sheets API`와 `Supabase`를 사용합니다.
`.env` 파일에 다음 정보가 설정되어 있어야 합니다.
*   `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
*   `VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL`, `VITE_GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
*   `VITE_DATA_SHEET_ID` 등

---

## 🛠 기술 스택 (Tech Stack)
*   **Frontend:** React, Vite, TailwindCSS
*   **Backend (Data):** Google Sheets API (NoSQL-like), Supabase (Auth/DB)
*   **Caching:** In-Memory Caching (Custom Implementation)
