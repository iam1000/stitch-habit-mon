# UI 개발 표준 가이드 (Standard UI/UX Guide)

> **문서 개요**: HabitMons 시스템의 일관된 사용자 경험(UX)을 제공하기 위한 화면 개발 표준 및 각 주요 기능별 상세 구현 내용을 담고 있습니다.  
> **대상**: 프론트엔드 개발자, UI/UX 디자이너  
> **최신 업데이트**: 2026-02-12

---

## 📋 목차
1. [개요 및 디자인 원칙 (Overview)](#1-개요-및-디자인-원칙-overview)
2. [공통 UI 컴포넌트 (Common Components)](#2-공통-ui-컴포넌트-common-components)
3. [주요 기능별 상세 가이드](#3-주요-기능별-상세-가이드)
    - 3.1 [기준정보 관리 (Master Data)](#31-기준정보-관리-master-data)
    - 3.2 [코드 관리 (Code Management)](#32-코드-관리-code-management)
    - 3.3 [권한 관리 (Permission)](#33-권한-관리-permission)
4. [신규 메뉴 추가 프로세스 (Add New Menu)](#4-신규-메뉴-추가-프로세스-add-new-menu)

---

## 1. 개요 및 디자인 원칙 (Overview)

### 1.1 핵심 가치
*   **일관성 (Consistency)**: 모든 화면은 동일한 레이아웃 구조와 인터랙션 방식을 따릅니다.
*   **직관성 (Intuition)**: 사용자가 학습하지 않아도 기능을 이해할 수 있도록 명확한 레이블과 아이콘을 사용합니다.
*   **심미성 (Aesthetics)**: Tailwind CSS 기반의 프리미엄 UI, 다크 모드 완벽 지원, 부드러운 애니메이션을 제공합니다.

### 1.2 레이아웃 구조
*   **사이드바 (Sidebar)**: 좌측 고정, 메인 내비게이션 역할. `MainLayout.jsx`에서 관리.
*   **헤더 (Header)**: 페이지 제목 및 글로벌 액션(언어 변경, 테마 변경, 사용자 프로필).
*   **컨텐츠 영역 (Content)**: 카드형 UI(`bg-white dark:bg-gray-800`, `rounded-xl`, `shadow-sm`)를 기본으로 사용.
*   **검색 및 필터 (Search Bar)**: 컨텐츠 상단에 별도 영역으로 분리하여 배치.

---

## 2. 공통 UI 컴포넌트 (Common Components)

### 2.1 테이블 (Table)
*   **헤더**: 굵은 텍스트, 배경색 구분 (`bg-gray-50 dark:bg-gray-900`)
*   **행 (Row)**: 호버 효과 (`hover:bg-gray-50`), 짝수/홀수 구분 없음 (Clean Design)
*   **입력 (Input)**: 인라인 수정(Inline Edit) 지원 시, 텍스트가 `input` 필드로 전환됨.
*   **추가 행 (Add Row)**: 테이블 최상단 또는 최하단에 고정된 입력 행 제공.
    *   장점: 별도 팝업 없이 빠른 연속 등록 가능.

### 2.2 버튼 (Button)
*   **Primary**: `bg-blue-600 hover:bg-blue-700 text-white` (주요 액션: 저장, 조회)
*   **Secondary**: `bg-white border border-gray-300 hover:bg-gray-50` (보조 액션: 취소, 닫기)
*   **Danger**: `text-red-600 hover:bg-red-50` (삭제, 경고)
*   **Icon Button**: 텍스트 없이 아이콘만 있는 버튼 (`p-2 rounded-full hover:bg-gray-100`)

---

## 3. 주요 기능별 상세 가이드

### 3.1 기준정보 관리 (Master Data Management)

시스템 운영에 필요한 핵심 데이터(공통 코드, 메뉴, 권한)를 통합 관리하는 화면입니다.

#### A. 화면 구조
*   **진입점**: 사이드바 > `Master Data`
*   **탭 구성**:
    1.  **공통 코드 (Common Code)**: 시스템 코드 그룹 및 상세값 관리
    2.  **메뉴 관리 (Menu Definition)**: 보여질 메뉴 목록과 속성 정의
    3.  **권한 관리 (Permission)**: 사용자별 메뉴 접근 제어

#### B. 데이터 흐름
*   **Source**: Google Sheets (`common_code_mgt`, `menu_def_mgt`, `auth_menu_mgt`)
*   **Sync**: 화면에서 변경 시 즉시 시트에 반영 (Netlify/Vercel Functions 경유)

---

### 3.2 코드 관리 (Code Management)

#### A. UI 컨셉: Split View
좌측 목록과 우측 상세 화면이 분리된 2단 구조를 채택하여, 계층적 데이터를 직관적으로 관리합니다.

*   **좌측 패널 (Group List)**: 코드 그룹(대분류) 목록.
    *   상단 검색바: 그룹명/ID로 필터링 가능.
*   **우측 패널 (Detail Codes)**: 선택된 그룹의 하위 상세 코드 목록.
    *   내부 검색바: 상세 코드명/ID로 필터링 가능.

#### B. 주요 기능
*   **그룹/코드 추가**: `TOP` 선택 시 그룹 추가, 특정 그룹 선택 시 하위 코드 추가.
*   **인라인 수정**: 더블 클릭 또는 수정 아이콘 클릭 시 해당 행이 입력 모드로 전환.
*   **삭제 검증**: 하위 코드가 존재하는 그룹은 삭제 불가 처리 (Validation).

---

### 3.3 권한 관리 (Permission)

#### A. 목적
사용자별로 접근 가능한 메뉴를 제어하고, 권한이 없는 페이지 접근을 차단합니다.

#### B. 구현 방식
1.  **데이터 로드**: 앱 시작 시 `menu_def_mgt`(전체 메뉴)와 `auth_menu_mgt`(내 권한)를 로드.
2.  **사이드바 필터링**: `MainLayout`에서 권한 있는 메뉴만 렌더링.
3.  **URL 차단**: 페이지 진입 시 권한 체크 로직을 통해 리다이렉트 (`/dashboard`로 이동).

#### C. 관리 화면 기능
*   **사용자 검색**: 이메일, 이름으로 사용자 조회.
*   **일괄 수정**: 특정 사용자의 여러 메뉴 권한을 체크박스로 한 번에 수정 가능하도록 UX 설계 (향후 고도화).

---

## 4. 신규 메뉴 추가 프로세스 (Add New Menu)

새로운 기능을 개발하여 사이드바에 메뉴로 추가하는 표준 절차입니다.

### Step 1: 페이지 컴포넌트 생성 [Frontend]
`src/pages/` 또는 `src/` 폴더에 새로운 `.jsx` 파일을 생성합니다.
(기존 `Dashboard.jsx`를 복사하여 시작하면 편리합니다.)

### Step 2: 라우트 등록 [App.jsx]
`App.jsx` 파일의 `<Routes>` 내부에 새 페이지 경로를 정의합니다.
```javascript
import NewPage from './NewPage';
// ...
<Route path="/new-feature" element={<NewPage />} />
```

### Step 3: 다국어 리소스 추가 [LanguageContext.jsx]
화면에 표시될 메뉴 이름(한글/영어)을 정의합니다.
```javascript
translations: {
  en: { newFeature: "New Feature", ... },
  ko: { newFeature: "새 기능", ... }
}
```

### Step 4: 메뉴 데이터 등록 [Google Sheet]
소스 코드를 수정하지 않고 **Google Sheet (`menu_def_mgt` 탭)**에 데이터를 추가합니다.
*   **menu_code**: `new_feature`
*   **label_key**: `newFeature` (위에서 정의한 키)
*   **path**: `/new-feature`
*   **icon_name**: `Star` (Lucide React 아이콘 이름)
*   **use_yn**: `Y`

### Step 5: 권한 부여 [Google Sheet]
**`auth_menu_mgt` 탭**에서 내 계정(이메일)에 해당 메뉴 접근 권한(`Y`)을 추가합니다.
새로고침하면 사이드바에 메뉴가 나타납니다! 🎉

---

**Tip**: 아이콘은 [Lucide React 공식 사이트](https://lucide.dev/icons)에서 검색하여 이름을 확인하세요.
