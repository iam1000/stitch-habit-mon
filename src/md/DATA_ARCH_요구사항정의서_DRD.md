# DRD (Data Requirements Document) - 데이터 요구사항 정의서

## 1. 개요 (Overview)
본 문서는 **사용자 인증, 투자 관리, 기준정보 관리** 모듈에서 필요한 데이터의 비즈니스 요건을 정의합니다. 시스템이 정상적으로 동작하기 위해 필수적으로 관리되어야 하는 데이터 항목(Entities), 속성(Attributes), 그리고 제약 조건(Constraints)을 명시합니다.

---

## 2. 데이터 개체 및 속성 정의 (Entities & Attributes)

### 2.1 사용자 및 권한 (Identity & Access Management)
사용자의 시스템 접근을 통제하고 메뉴별 권한을 부여하기 위한 데이터 요건입니다.

#### A. 사용자 (Users)
*   **목적:** 시스템 사용자를 식별하고 로그인 세션을 유지함
*   **필수 속성:**
    *   `User ID` (UUID): 시스템 내부 식별자 (변경 불가, 고유 값)
    *   `Email` (String): 로그인 ID 역할 (고유 값)
    *   `Provider` (String): 로그인 제공자 (Email, Google, OAuth 등)
    *   `Created At` (Datetime): 가입 일시
*   **요건:** 이메일은 중복될 수 없으며, 모든 트랜잭션의 `Created By`/`Updated By`에 매핑될 수 있어야 함.

#### B. 메뉴 권한 (Menu Permissions)
*   **목적:** 특정 사용자에게 특정 메뉴의 접근 권한을 부여함
*   **필수 속성:**
    *   `User ID` (UUID/Email): 권한 대상 사용자 식별자
    *   `Menu Code` (String): `menu_def_mgt`에 정의된 메뉴 코드 참조
    *   `Access YN` (Boolean/Char): 접근 허용 여부 ('Y' or 'N')
*   **요건:** 한 사용자는 여러 메뉴 권한을 가질 수 있으며(M:N), 권한이 없는 메뉴는 UI에서 숨김 처리되어야 함.

---

### 2.2 투자 관리 (Investment Management)
개인 자산 포트폴리오를 구성하고 투자 내역을 기록하기 위한 데이터 요건입니다.

#### A. 계좌 마스터 (Account Master)
*   **목적:** 자산이 보관되는 물리적/논리적 계좌 정보를 관리함
*   **필수 속성:**
    *   `Account ID` (UUID): 계좌 고유 식별자
    *   `Account Name` (String): 사용자가 지정한 계좌 별칭 (예: "우리은행 월급통장")
    *   `Financial Company` (String): 금융기관명 (예: "키움증권", "국민은행")
    *   `Account Type` (Enum): 계좌 성격 (예: "ISA", "연금저축", "일반", "CMA")
*   **요건:** `Account ID`는 투자 내역(Transaction)의 부모 키(Parent Key)로 사용되며, 삭제 시 해당 계좌의 모든 내역 처리에 대한 정책(Cascade Delete or Block)이 필요함.

#### B. 투자 거래 내역 (Investment Transactions)
*   **목적:** 종목 매매, 입출금 등 실제 자산 변동 내역을 기록함
*   **필수 속성:**
    *   `Transaction ID` (UUID): 거래 내역 고유 식별자
    *   `Date` (Date): 거래 발생 일자 (필수)
    *   `Account ID` (UUID): 거래가 발생한 계좌 참조 (필수)
    *   `Category` (Enum): 자산군 (주식, 코인, 부동산, 현금 등)
    *   `Item Name` (String): 종목명 또는 적요
    *   `Quantity` (Decimal): 거래 수량 (부동산, 현금은 0 또는 1)
    *   `Price/Amount` (Decimal): 단가 또는 거래 금액
    *   `Currency` (String): 통화 코드 (KRW, USD 등. *기본값 KRW*)
*   **요건:** `(Account ID, Item Name)` 조합으로 현재 보유잔고(Balance)를 계산할 수 있어야 함.

---

### 2.3 기준정보 관리 (Reference Data)
시스템 전반에서 사용되는 공통 코드와 설정값을 관리하기 위한 데이터 요건입니다.

#### A. 공통 코드 (Common Codes)
*   **목적:** 드롭다운 목록(성별, 계좌유형, 자산군 등)의 표준화된 값을 관리함
*   **필수 속성:**
    *   `Code ID` (String): 코드 식별자 (예: `INV_TYPE_STK`)
    *   `Code Name` (String): 코드 표시명 (예: "주식")
    *   `Group Code` (String): 상위 그룹 코드 식별자 (`ROOT`인 경우 최상위 그룹)
    *   `Order` (Integer): 화면 표시 순서
    *   `Use YN` (Boolean/Char): 사용 여부
*   **요건:** 계층형(Hierarchy) 구조를 지원해야 하며, `Group Code`는 반드시 존재하는 부모 코드를 참조해야 함.

---

## 3. 데이터 제약조건 및 규칙 (Constraints & Rules)

### 3.1 참조 무결성 (Referential Integrity)
*   **계좌-내역:** `Account Master`에 존재하지 않는 `Account ID`를 가진 트랜잭션은 생성될 수 없다.
*   **코드-그룹:** `Group Code`가 존재하지 않는 하위 코드는 생성될 수 없다.
*   **사용자-권한:** 시스템에 등록되지 않은 (`Users` 테이블에 없는) 사용자에 대해 권한을 부여할 수 없다.

### 3.2 데이터 유효성 (Validation)
*   **필수값:** 모든 마스터 데이터의 `Name(명칭)`, `ID(식별자)`는 Null일 수 없다.
*   **금액/수량:** 음수(-) 입력이 가능한지 여부는 `Category`별 비즈니스 로직에 따른다. (예: 매도 시 수량은 음수 처리 또는 별도 로직)
*   **날짜:** 미래 날짜 입력 허용 여부는 설정에 따른다. (기본 허용)

### 3.3 보관 및 이력 (Retention & History)
*   **변경 이력:** 중요 데이터(계좌 정보, 권한 정보) 변경 시 `Updated At`, `Updated By`를 기록해야 한다.
*   **삭제 정책:**
    *   계좌/투자내역: **Soft Delete** (실제 삭제 대신 `deleted_at` 마킹) 권장
    *   로그/임시데이터: 일정 기간(예: 3개월) 후 자동 Hard Delete or Archiving

---

## 4. 데이터 볼륨 및 성능 요건 (Volume & Performance)
*   **예상 볼륨:**
    *   사용자: 수백 명 (초기)
    *   투자 내역: 사용자당 연간 수천 건 예상
*   **성능 목표:**
    *   대시보드 로딩(자산 현황 집계): 1초 이내
    *   내역 검색 및 필터링: 0.5초 이내
