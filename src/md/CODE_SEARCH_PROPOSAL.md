# 코드 관리 검색 기능 구현 제안서

## 1. 개요
현재 코드 관리 화면은 그룹(좌측)과 그룹별 상세 코드(우측)로 나뉘어 있습니다.
코드가 많아질수록 특정 코드를 찾기 어려워지므로, 효과적인 검색 기능이 필요합니다.

## 2. 구현 옵션

### 옵션 A: 각 영역별 필터링 (Local Filtering)
좌측 그룹 목록과 우측 상세 목록에 각각 검색창을 두는 방식입니다.
*   **작동 방식**:
    *   좌측 검색창: 그룹명(`code_name`), 그룹코드(`code_id`)로 그룹 목록 필터링.
    *   우측 검색창: **현재 선택된 그룹 내**의 코드만 필터링.
*   **장점**: 구현이 간단하고, 특정 그룹 내에서 작업할 때 편리합니다.
*   **단점**: 찾으려는 코드가 어느 그룹에 있는지 모를 때는 사용하기 어렵습니다.

### 옵션 B: 통합 검색 (Global Search) - **[추천]** 🌟
화면 상단(헤더)에 통합 검색창을 배치하는 방식입니다.
*   **작동 방식**:
    *   검색어를 입력하면, **모든 그룹을 무시하고 전체 코드** 중에서 검색어와 일치하는(`code_id`, `code_name`, `description`) 항목을 찾아 우측 패널에 표시합니다.
    *   검색 결과 목록에는 '소속 그룹' 정보가 함께 표시됩니다.
*   **장점**: 코드가 어디에 숨어있든 바로 찾을 수 있어 탐색 용이성이 뛰어납니다.
*   **UX 흐름**:
    1.  상단 헤더에 있는 검색창에 키워드 입력 (예: "배송").
    2.  우측 화면이 **'검색 결과 모드'**로 자동 전환되며, "배송" 관련 코드가 모두 나열됨.
    3.  원하는 코드를 바로 수정하거나 삭제 가능.
    4.  검색어를 지우면 다시 원래의 그룹별 보기 모드로 자동 복귀.

## 3. 기술적 구현 방안 (Client-side Filtering)
현재 모든 코드 데이터(`codes` state)가 클라이언트에 로드되어 있으므로, 별도의 서버 요청 없이 **즉각적인 실시간 검색** 구현이 가능합니다.

*   **State 추가**: `searchKeyword` (검색어 저장)
*   **로직 변경 (`detailList`)**:
    ```javascript
    const detailList = useMemo(() => {
        // 1. 검색어가 있을 경우 (통합 검색 모드)
        if (searchKeyword.trim()) {
            return codes.filter(c => 
                c.code_name.includes(searchKeyword) || 
                c.code_id.includes(searchKeyword) ||
                (c.description && c.description.includes(searchKeyword))
            );
        }
        
        // 2. 검색어가 없을 경우 (기존 로직)
        if (!selectedGroup) return [];
        if (selectedGroup.uuid === 'TOP') return realGroupList;
        return codes.filter(c => c.group_code === selectedGroup.code_id);
    }, [codes, selectedGroup, searchKeyword]);
    ```

## 4. UI/UX 디자인 예시
*   **위치**: 우측 패널 상단 제목 영역 우측에 **검색 입력바** 배치.
*   **스타일**: 
    - 돋보기 아이콘(`Search` Icon) 포함.
    - 다크 모드 호환 (`dark:bg-gray-700`).
*   **기능**: 입력 즉시 필터링, `X` 버튼으로 검색어 클리어.

---
**제안**: 사용성을 고려하여 **[옵션 B: 통합 검색]** 방식으로 구현하는 것을 추천드립니다.
승인하시면 즉시 적용 가능합니다.
