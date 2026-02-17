# 데이터 매핑 표준화 설계 (Data Mapping Standardization) v2.0

## 1. 개요 (Overview)
화면 개발 시 발생하는 데이터 참조(Foreign Key Join) 및 코드 변환(Code Mapping) 요구사항을 일관된 규칙으로 정의하여,
개발자와 기획자 간의 커뮤니케이션 비용을 줄이고 구현 자동화를 돕기 위한 표준 설계입니다.

## 2. 매핑 규칙 구조 (Mapping Rule Structure)

매핑 규칙은 **"Main Sheet(주체)"**와 **"Reference Sheet(객체)"** 간의 관계를 정의합니다.

### JSON 스키마 (Schema)

```json
{
  "view_id": "화면ID (예: INVESTMENT_LIST)",
  "main_sheet": "메인 시트명 (예: INVESTMENT)",
  "mapping_rules": [
    {
      "column_id": "메인 시트 컬럼명 (FK)",
      "mapping": {
        "type": "참조 유형 (SHEET_JOIN | CODE_MAP)",
        "ref_sheet": "참조 시트명 (Master Table)",
        "ref_key": "참조 시트의 키 컬럼 (PK)",
        "display_column": "화면에 표시할 컬럼명 (Display Value)",
        "filters": { "참조 데이터 필터 조건 (Optional)" }
      }
    }
  ]
}
```

---

## 3. 적용 시나리오 (Scenarios)

### Case A: 투자내역의 `category`를 계좌명(`account_name`)으로 표시
*   **상황**: `INVESTMENT` 시트의 `category` 컬럼에는 계좌의 `uuid`가 저장됨. 화면에는 `ACCOUNTS` 시트의 `account_name`을 보여줘야 함.
*   **규칙 정의**:
    ```json
    {
      "column_id": "category",
      "mapping": {
        "type": "SHEET_JOIN",
        "ref_sheet": "ACCOUNTS",
        "ref_key": "uuid",               // INVESTMENT.category == ACCOUNTS.uuid
        "display_column": "account_name" // 화면출력: ACCOUNTS.account_name
      }
    }
    ```

### Case B: 계좌목록의 `account_type`을 코드명(`code_name`)으로 표시
*   **상황**: `ACCOUNTS` 시트의 `account_type` 컬럼에는 코드값(`ACCOUNT_TYPE_01`)이 저장됨. 화면에는 `CODES` 시트의 `code_name`을 보여줘야 함.
*   **규칙 정의**:
    ```json
    {
      "column_id": "account_type",
      "mapping": {
        "type": "CODE_MAP",
        "ref_sheet": "CODES",
        "ref_key": "code_id",            // ACCOUNTS.account_type == CODES.code_id
        "display_column": "code_name",   // 화면출력: CODES.code_name
        "filters": { "group_code": "ACCOUNT_TYPE" } // CODES 로딩 시 필터
      }
    }
    ```

---

## 4. 구현 가이드 (Implementation Guide)

1.  **설정 정의**: 화면별 매핑 규칙을 상수 또는 설정 파일로 관리합니다.
2.  **데이터 로더 (`useDataMapper`)**:
    *   화면 진입 시 `mapping_rules`를 파싱합니다.
    *   필요한 `ref_sheet`(예: ACCOUNTS, CODES) 데이터를 비동기로 로드(Load)하여 Map 형태로 캐싱합니다.
        *   Keys: `ref_key`
        *   Values: Row Data object
3.  **렌더링 (`CellRenderer`)**:
    *   컬럼 값을 출력할 때, 해당 컬럼에 `mapping` 규칙이 있는지 확인합니다.
    *   규칙이 있다면, 캐싱된 Map에서 원본 값(FK)으로 참조 데이터를 찾아 `display_column` 값을 출력합니다.
    *   참조 데이터가 로딩 중이거나 없으면 원본 값 또는 '-'를 출력합니다.
