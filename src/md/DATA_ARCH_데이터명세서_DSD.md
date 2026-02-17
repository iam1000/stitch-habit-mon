# DSD (Data Specification Document) - 데이터 명세서

## 1. 개요 (Overview)
본 문서는 구축 목표 시스템의 물리적 데이터베이스 스키마와 컬럼 명세를 정의합니다.
*   **DBMS Target:** PostgreSQL (Supabase)
*   **Naming Convention:** Snake Case (`user_id`, `created_at`)

### 1.1 데이터 소스 매핑 (Data Source Mapping)
본 명세서의 정의된 논리 테이블(Logical Table)과 실제 운영 중인 물리 데이터 소스(Physical Source) 간의 매핑 정보입니다.

| 구분 | 논리 테이블명 (Table Name) | 실제 물리 소스 (Physical Source) | 비고 |
| :--- | :--- | :--- | :--- |
| **Auth** | `TB_USERS` | **Supabase** `auth.users` | 시스템 사용자 (Managed) |
| **Auth** | `TB_MENU_DEFINITIONS` | **Google Sheet** `menu_def_mgt` | 메뉴 마스터 |
| **Auth** | `TB_USER_PERMISSIONS` | **Google Sheet** `auth_menu_mgt` | 사용자-메뉴 권한 매핑 |
| **Master** | `TB_COMMON_CODES` | **Google Sheet** `CODES` | 공통 코드 그룹/상세 |
| **Invest** | `TB_ACCOUNT_MASTER` | **Google Sheet** `accounts_master` | 계좌 정보 |
| **Invest** | `TB_INVESTMENT_TRANSACTIONS` | **Google Sheet** `investment_list` | 투자 거래 내역 |

---

## 2. 데이터 표준화 (Standardization)

### 2.1 도메인 정의 (Domains)
데이터 타입의 일관성을 위해 다음과 같이 도메인을 정의하여 사용합니다.

| 도메인명 | 데이터 타입 | 길이/정밀도 | 설명 |
| :--- | :--- | :--- | :--- |
| **ID_UUID** | `UUID` | - | 고유 식별자 (자동 생성) |
| **ID_VAR** | `VARCHAR` | 50 | 코드성 식별자 (Natural Key) |
| **NAME** | `VARCHAR` | 100 | 명칭, 이름 |
| **CODE** | `VARCHAR` | 20 | 분류 코드 |
| **YN_FLAG** | `BOOLEAN` | - | 여부 (True/False) |
| **AMT** | `DECIMAL` | 15,2 | 금액 (소수점 2자리) |
| **QTY** | `DECIMAL` | 15,6 | 수량 (소수점 6자리 - 코인 호환) |
| **DESC** | `TEXT` | - | 긴 설명 |
| **DT** | `TIMESTAMPTZ` | - | 일시 (Timezone 포함) |

---

## 3. 테이블 명세 (Table Specifications)

### 3.1 사용자 및 권한 (Auth)

#### **TB_USERS** (사용자 마스터 - *Optional*)
Supabase `auth.users` 외에 애플리케이션 레벨의 사용자 정보를 관리합니다.
*(Supabase Auth만 사용하는 경우 `public.users` 트리거를 통해 동기화 권장)*
| 컬럼명(Physical) | 한글명(Logical) | Domain | Null | Default | PK/FK | 비고 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `user_id` | 사용자 ID | **ID_UUID** | **N** | - | **PK** | FK to auth.users.id |
| `email` | 이메일 | **NAME** | **N** | - | UK | |
| `display_name` | 표시명/닉네임 | **NAME** | Y | - | | |
| `avatar_url` | 프로필 사진 | **DESC** | Y | - | | |
| `role_code` | 권한 역할 | **CODE** | **N** | 'USER' | | ADMIN/USER |
| `created_at` | 가입 일시 | **DT** | **N** | `now()` | | |

#### **TB_MENU_DEFINITIONS** (메뉴 정의)
시스템 메뉴 목록을 관리합니다.
| 컬럼명(Physical) | 한글명(Logical) | Domain | Null | Default | PK/FK | 비고 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `menu_code` | 메뉴 코드 | **ID_VAR** | **N** | - | **PK** | 예: `dashboard` |
| `label_key` | 다국어 키 | **NAME** | **N** | - | | i18n 키 |
| `router_path` | 라우터 경로 | **NAME** | **N** | - | | 예: `/dashboard` |
| `icon_name` | 아이콘 명 | **CODE** | Y | - | | Lucide Icon |
| `sort_order` | 정렬 순서 | `INT` | **N** | 999 | | |
| `use_yn` | 사용 여부 | **YN_FLAG** | **N** | `true` | | |

#### **TB_USER_PERMISSIONS** (사용자 권한)
사용자별 메뉴 접근 권한을 매핑합니다.
| 컬럼명(Physical) | 한글명(Logical) | Domain | Null | Default | PK/FK | 비고 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | 권한 ID | **ID_UUID** | **N** | `gen_random_uuid()` | **PK** | |
| `user_id` | 사용자 ID | **ID_UUID** | **N** | - | FK | Supabase User |
| `menu_code` | 메뉴 코드 | **ID_VAR** | **N** | - | FK | TB_MENU_DEFINITIONS |
| `access_yn` | 접근 허용 | **YN_FLAG** | **N** | `false` | | |
| `granted_at` | 부여 일시 | **DT** | **N** | `now()` | | |

---

### 3.2 기준 정보 (Master Data)

#### **TB_COMMON_CODES** (공통 코드)
그룹 코드와 상세 코드를 통합 관리하는 계층형 테이블입니다.
| 컬럼명(Physical) | 한글명(Logical) | Domain | Null | Default | PK/FK | 비고 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `code_id` | 코드 ID | **ID_VAR** | **N** | - | **PK** | |
| `group_code` | 그룹 코드 | **ID_VAR** | **N** | 'ROOT' | FK | Self-Reference |
| `code_name` | 코드 명 | **NAME** | **N** | - | | |
| `sort_order` | 정렬 순서 | `INT` | **N** | 999 | | |
| `description` | 설명 | **DESC** | Y | - | | |
| `use_yn` | 사용 여부 | **YN_FLAG** | **N** | `true` | | |

---

### 3.3 투자 관리 (Investment)

#### **TB_ACCOUNT_MASTER** (계좌 마스터)
| 컬럼명(Physical) | 한글명(Logical) | Domain | Null | Default | PK/FK | 비고 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `account_id` | 계좌 ID | **ID_UUID** | **N** | `gen_random_uuid()` | **PK** | |
| `user_id` | 소유자 ID | **ID_UUID** | **N** | - | FK | Supabase User |
| `account_name` | 계좌 별칭 | **NAME** | **N** | - | | |
| `financial_company` | 금융사 | **NAME** | Y | - | | |
| `account_type` | 계좌 유형 | **CODE** | **N** | 'GENERAL' | FK | 일반/연금/ISA |
| `account_number` | 계좌 번호 | **NAME** | Y | - | | 암호화 권장 |
| `is_active` | 활성 여부 | **YN_FLAG** | **N** | `true` | | 숨김 처리용 |
| `created_at` | 생성 일시 | **DT** | **N** | `now()` | | |

#### **TB_INVESTMENT_TRANSACTIONS** (투자 거래 내역)
| 컬럼명(Physical) | 한글명(Logical) | Domain | Null | Default | PK/FK | 비고 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `transaction_id` | 거래 ID | **ID_UUID** | **N** | `gen_random_uuid()` | **PK** | |
| `account_id` | 계좌 ID | **ID_UUID** | **N** | - | FK | TB_ACCOUNT_MASTER |
| `transaction_date` | 거래 일자 | `DATE` | **N** | `CURRENT_DATE` | | |
| `category` | 자산 유형 | **CODE** | **N** | - | FK | 주식/코인/현금 |
| `item_name` | 종목명 | **NAME** | **N** | - | | |
| `quantity` | 수량 | **QTY** | **N** | 0 | | |
| `price` | 단가/금액 | **AMT** | **N** | 0 | | |
| `currency` | 통화 | **CODE** | **N** | 'KRW' | | KRW, USD |
| `note` | 비고 | **DESC** | Y | - | | |
| `created_at` | 등록 일시 | **DT** | **N** | `now()` | | |

---

## 4. 인덱스 설계 (Index Strategy)

검색 성능 최적화를 위한 인덱스 정의입니다.

1.  **IDX_TRANS_DATE_ACCT**: `TB_INVESTMENT_TRANSACTIONS` (`account_id`, `transaction_date` DESC)
    *   목적: 특정 계좌의 거래 내역을 최신순으로 조회
2.  **IDX_CODE_GROUP**: `TB_COMMON_CODES` (`group_code`, `sort_order`)
    *   목적: 그룹별 하위 코드 목록을 순서대로 조회
3.  **IDX_PERM_USER**: `TB_USER_PERMISSIONS` (`user_id`)
    *   목적: 로그인 시 해당 사용자의 모든 권한 조회

---

## 5. 마이그레이션 매핑 (Migration Mapping)

Google Sheets(AS-IS) 데이터를 RDBMS(TO-BE)로 옮길 때의 컬럼 매핑 가이드입니다.

### 투자내역 (Investment List)
| Google Sheet (`investment_list`) | PostgreSQL (`TB_INVESTMENT_TRANSACTIONS`) | 변환 규칙 |
| :--- | :--- | :--- |
| `id` (uuid) | `transaction_id` | 그대로 사용 |
| `date` (string) | `transaction_date` | `YYYY-MM-DD` 포맷 파싱 |
| `category` | `category` | 코드값 매핑 필요 시 변환 |
| `account_id` | `account_id` | FK 정합성 체크 필수 |
| `quantity` | `quantity` | 문자열 -> 숫자 변환 (null -> 0) |
| `price` | `price` | 문자열 -> 숫자 변환 (null -> 0) |
