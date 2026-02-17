# 데이터 구조 검토 보고서 (Data Structure Review Report)

## 1. 개요
현재 시스템의 사용자 인증, 투자관리, 기준정보 관리 モ듈에서 사용 중인 데이터 구조를 분석하고, 향후 DB 마이그레이션(DRD/DSD/ERD 작성)을 위한 개선 사항을 제안합니다.

---

## 2. 현행 데이터 구조 분석 (AS-IS)

현재 시스템은 **Hybrid Database Architecture**를 사용하고 있습니다.
*   **인증(Auth):** Supabase Auth (PostgreSQL 기반 Managed Service)
*   **데이터(Data):** Google Sheets (NoSQL-like Transactional Store)

### 2.1 사용자 인증 (User Authentication)
*   **Source:** Supabase Auth (`auth.users`)
*   **식별자:** `UUID` (사용자 고유 ID), `email` (로그인 ID)
*   **특이사항:** 실제 사용자 정보는 Supabase에 있지만, 애플리케이션 내의 권한 관리는 Google Sheets의 `email` 컬럼을 Foreign Key(FK) 처럼 사용하여 매핑하고 있습니다.

### 2.2 투자 관리 (Investment Management)
두 개의 시트를 관계형 테이블처럼 사용 중입니다.

**A. 계좌 마스터 (`accounts_master`)**
계좌 정보를 관리하는 마스터 테이블입니다.
| Column | Type | Description | Key |
| :--- | :--- | :--- | :--- |
| `account_id` | String | 계좌 고유 ID (UUID) | PK |
| `account_name` | String | 계좌 별칭 (예: 내 주식계좌) | |
| `account_company` | String | 금융사 (예: 키움증권) | |
| `account_type` | enum | 계좌 유형 (ISA, 연금 등) | |
| `account_number` | String | 계좌번호 | |

**B. 투자 내역 (`investment_list`)**
실제 투자 트랜잭션 데이터를 관리합니다.
| Column | Type | Description | Key |
| :--- | :--- | :--- | :--- |
| `id` (uuid) | String | 트랜잭션 고유 ID | PK |
| `date` | Date | 거래 일자 | |
| `category` | enum | 자산 유형 (주식, 코인 등) | |
| `name` | String | 종목명 | |
| `account_id` | String | **계좌 ID (accounts_master 참조)** | FK (Logical) |
| `quantity` | Number | 수량 | |
| `price` | Number | 단가/평가금액 | |
| `note` | String | 비고 | |

*   **관계:** `investment_list` (N) : (1) `accounts_master`
*   **이슈:** `account_id`가 시트상에서 강제 참조 무결성을 가지지 않으므로, 삭제된 계좌의 내역이 남을 수 있음.

### 2.3 기준정보 관리 (Master Data Management)

**A. 공통 코드 (`CODES`)**
그룹 코드와 상세 코드를 하나의 테이블에서 계층적으로 관리합니다.
| Column | Type | Description | Key |
| :--- | :--- | :--- | :--- |
| `uuid` | String | 고유 ID | PK |
| `code_id` | String | 코드 식별자 (예: BANK_TYPE) | |
| `code_name` | String | 코드명 | |
| `group_code` | String | 그룹 코드 참조 (`ROOT`면 최상위 그룹) | Self-Ref |
| `use_yn` | char(1) | 사용 여부 (Y/N) | |
| `order` | Number | 정렬 순서 | |

**B. 메뉴 정의 (`menu_def_mgt`)**
애플리케이션 메뉴 구조를 정의합니다.
| Column | Type | Description |
| :--- | :--- | :--- |
| `menu_code` | String | 메뉴 고유 코드 (PK) |
| `label_key` | String | 다국어 키 |
| `path` | String | 라우팅 경로 |
| `use_yn` | char(1) | 활성화 여부 |

**C. 메뉴 권한 (`auth_menu_mgt`)**
사용자와 메뉴 간의 N:M 관계를 정의합니다.
| Column | Type | Description |
| :--- | :--- | :--- |
| `user_email` | String | 사용자 이메일 (Supabase User 참조) |
| `menu_code` | String | 메뉴 코드 (`menu_def_mgt` 참조) |
| `access_yn` | char(1) | 접근 허용 여부 |

---

## 3. 검토 의견 및 개선 제안

### ✅ 긍정적인 점
1.  **논리적 분리:** 트랜잭션(`investment_list`)과 마스터(`accounts_master`) 데이터가 논리적으로 잘 분리되어 있습니다.
2.  **확장성 고려:** 공통 코드(`CODES`)를 재귀적 구조(`group_code`)로 설계하여 유연성을 확보했습니다.
3.  **캐싱 적용:** API 호출 비용 문제를 해결하기 위한 서버 캐싱이 적용되어 있습니다.

### ⚠️ 위험 요소 및 개선 과제
1.  **참조 무결성 취약 (Referential Integrity):**
    *   Google Sheets는 FK 제약조건이 없습니다. `accounts_master`에서 계좌를 삭제해도 `investment_list`에 데이터가 남아 "고아 데이터(Orphan data)"가 발생할 수 있습니다.
    *   **제안:** DB 마이그레이션 시 `ON DELETE CASCADE` 또는 `RESTRICT` 제약조건 필수 적용.

2.  **데이터 타입 미준수:**
    *   가격(`price`), 수량(`quantity`) 등의 숫자 필드에 문자열이 들어갈 위험이 상존합니다.
    *   **제안:** DSD(데이터 명세서) 작성 시 타입과 Length, Nullable 여부를 엄격히 정의해야 합니다.

3.  **인증 키 관리 (Email vs UUID):**
    *   현재 권한 관리에 `user_email`을 사용 중이나, 이메일은 변경될 수 있는 정보입니다.
    *   **제안:** 불변 값인 Supabase `user_id (UUID)`를 기준으로 테이블을 재설계하는 것이 안전합니다.

---

## 4. 향후 문서 작성 계획 (Next Steps)

위 분석을 바탕으로 다음 문서들을 순차적으로 작성할 것을 권장합니다.

1.  **DSD (Data Specification Document):** 각 테이블(시트)별 컬럼의 상세 스펙(Type, Length, Constraint) 정립
2.  **ERD (Entity Relationship Diagram):** 테이블 간의 관계 시각화 (특히 Auth - Menu - User 간 관계 정립)
3.  **DRD (Data Requirements Document):** 비즈니스 로직에 필요한 필수 데이터 요건 정의

이 순서대로 진행 시, 추후 RDBMS로의 마이그레이션이 매우 수월해질 것입니다.
