/**
 * 데이터 매핑 규칙 정의 (Data Mapping Rules)
 * 
 * 특정 화면(View)이나 시트(Sheet)에서 데이터 조회 시,
 * 다른 시트의 데이터를 참조(Reference)하여 값을 변환해 보여줘야 할 때 사용하는 규칙입니다.
 * 
 * [사용 방법]
 * 1. 화면 ID(View ID)를 키로 사용하여 규칙 배열을 정의합니다.
 *    - 화면 ID는 소스 코드에서 해당 화면을 식별하는 고유 문자열입니다.
 *    - 예: Investment.jsx의 'activeTab' 상태값이나 컴포넌트 이름 등을 조합하여 사용.
 * 
 * 2. 각 규칙(Rule)은 다음과 같은 구조를 가집니다:
 *    - targetColumn: 현재 화면(Main Sheet)의 컬럼명 (DB의 Foreign Key)
 *      -> 소스 상의 데이터 필드명 (예: data[row].category)
 *    - mapping: 매핑 상세 설정
 *      - type: 매핑 방식 (CODE_MAP: 코드값 변환, SHEET_JOIN: 시트 조인)
 *      - refSheet: 데이터를 가져올 참조 시트명 (DB의 Reference Table)
 *        -> 구글 시트의 탭 이름 (예: 'CODES', 'ACCOUNTS')
 *      - refKey: 참조 시트의 키 컬럼명 (DB의 Primary Key)
 *        -> 참조 시트의 데이터 중 매칭될 컬럼 (예: 'code_id', 'uuid')
 *      - displayColumn: 화면에 실제로 보여줄 참조 시트의 컬럼명 (Display Value)
 *        -> 화면 출력 시 사용할 컬럼 (예: 'code_name', 'account_name')
 *      - filters: (Optional) 참조 데이터 로딩 시 적용할 필터 조건 (예: 특정 그룹코드만 조회)
 * 
 * [화면 ID 매핑 가이드]
 * - ACCOUNTS_MANAGER: Investment.jsx 내 'accounts_code_mapped' 탭
 * - INVESTMENT_LIST: Investment.jsx 내 'list' 탭 (투자내역 조회)
 */

export const MAPPING_RULES = {
    // -------------------------------------------------------------------------
    // 1. [계좌 관리(코드)] 탭용 매핑 규칙
    // 화면 ID: ACCOUNTS_MANAGER (Investment.jsx > activeTab === 'accounts_code_mapped')
    // -------------------------------------------------------------------------
    "ACCOUNTS_MANAGER": [
        {
            "targetColumn": "account_type", // [Main] ACCOUNTS 시트의 'account_type' 컬럼
            "mapping": {
                "type": "CODE_MAP",         // 매핑 타입: 코드값 변환
                "refSheet": "CODES",        // [Ref] 참조할 시트: CODES
                "refKey": "code_id",        // [Ref] 참조 키: CODES.code_id
                "displayColumn": "code_name",// [Display] 화면 표시: CODES.code_name
                "filters": {                // [Filter] CODES 시트 조회 조건
                    "group_code": "ACCOUNT_TYPE",
                    "use_yn": "Y"
                }
            },
            "description": "계좌유형 코드(ACCOUNT_TYPE_01 등)를 한글명(ISA중개형 등)으로 표시"
        }
    ],

    // -------------------------------------------------------------------------
    // 2. [투자 내역 조회] 탭용 매핑 규칙 
    // 화면 ID: INVESTMENT_LIST (Investment.jsx > activeTab === 'list')
    // -------------------------------------------------------------------------
    "INVESTMENT_LIST": [
        {
            "targetColumn": "category",     // [Main] INVESTMENT 시트의 'category' 컬럼 (FK: 계좌UUID)
            "mapping": {
                "type": "SHEET_JOIN",       // 매핑 타입: 시트 조인
                "refSheet": "accounts_master",     // [Ref] 참조할 시트: accounts_master
                "refKey": "account_id",           // [Ref] 참조 키: accounts_master.account_id (PK)
                "displayColumn": "account_name" // [Display] 화면 표시: accounts_master.account_name
            },
            "description": "투자내역의 category(계좌account_id)를 accounts_master 시트와 조인하여 계좌명으로 표시"
        }
    ]
};
