# 대시보드 리팩토링 및 신규 기능 TRD (Technical Requirements Document)
(Technical Requirements Document)

## 1. 시스템 아키텍처 (Architecture)
*   **프론트엔드**: React + Vite
*   **상태 관리**: Local State (`useState`) + Custom Hooks (`useInvestmentData`)
*   **스타일링**: Tailwind CSS + `recharts` (차트 라이브러리)
*   **데이터 소스**: Google Sheets API (Backend proxy via Netlify Functions or Local Express)

## 2. 데이터 흐름 (Data Flow)
1.  **Fetch Data**: `useInvestmentData` 훅에서 `INVESTMENT` 시트와 `ACCOUNTS` 시트 데이터를 동시에 병렬 호출 (`Promise.all`).
2.  **Data Transformation (전처리)**:
    *   **Investment Data**: 날짜(`date`) 포맷팅, 수량(`qty`) 및 단가(`price`) 숫자 변환.
    *   **Account Data**: 계좌 ID(`id`)와 계좌명(`account_name`) 매핑 객체 생성.
    *   **Join**: Investment 데이터의 `category` (계좌 ID)를 Account 데이터의 `account_name`으로 변환.
3.  **Aggregation (집계)**:
    *   **Daily Trend**: 날짜별로 그룹화 -> 해당 날짜까지의 누적 매수/매도 금액 계산 -> `Total Value`.
    *   **Portfolio**: 현재 보유 중인 자산(`qty > 0`)을 계좌별/유형별로 그룹화 -> `Sum(qty * price)`.
    *   **Monthly Activity**: 월별(`YYYY-MM`)로 그룹화 -> `Sum(Buy Amount)`, `Sum(Sell Amount)`.
4.  **Rendering**: 계산된 통계 데이터를 `Dashboard.jsx`의 차트 컴포넌트에 props로 전달.

## 3. 핵심 컴포넌트 구조 (Component Structure)

```
src/
├── components/
│   ├── Dashboard/
│   │   ├── DashboardHeader.jsx      # 타이틀, 날짜 선택기, 새로고침 버튼
│   │   ├── KPICards.jsx             # 요약 카드 4종 (총 자산, 수익률 등)
│   │   ├── charts/
│   │   │   ├── AssetTrendChart.jsx  # 라인/영역 차트 (Recharts)
│   │   │   ├── PortfolioChart.jsx   # 도넛 차트 (Recharts)
│   │   │   └── MonthlyBarChart.jsx  # 막대 차트 (Recharts)
│   │   └── RecentTransactions.jsx   # 최근 거래 내역 리스트 (Optional)
├── hooks/
│   └── useInvestmentData.js         # 데이터 페칭 및 가공 로직 분리
└── Dashboard.jsx                    # 메인 컨테이너 (Layout & State)
```

## 4. 데이터 로직 상세 (Data Logic Details)

### 4.1. `useInvestmentData` Hook
*   **Configuration**:
    *   `VITE_DATA_SHEET_ID`: Primary Google Sheet ID source (fallback).
    *   `localStorage.getItem('sheet_id')`: User-overriddable Sheet ID.
    *   `VITE_GOOGLE_SHEET_CONFIG`: JSON config for dynamic sheet name resolution (`INVESTMENT`, `ACCOUNTS`).
*   **Output**: `{ investmentData, accountData, loading, error, refresh() }`
*   **Logic**:
    *   **Dynamic Sheet Loading**: Parses `VITE_GOOGLE_SHEET_CONFIG` to determine the exact sheet names (e.g., `investment_list`) instead of hardcoded defaults.
    *   **Parallel Fetch**: `Promise.all` for Investment and Account data.
    *   **Column Mapping & Transformation**:
        *   `qty`: Maps from `quantity` (in Sheet) or `qty`.
        *   `item_name`: Maps from `name` (in Sheet) or `item_name`.
        *   `account_id`: Maps from `account_id` or `id`.
        *   `amount`: Uses provided `amount` or calculates `qty * price` as fallback.
        *   `type`: Infers `buy`/`sell` from signed quantity if explicit type is missing.

### 4.2.KPI 계산 로직
*   **Total Assets (Net Investment)**:
    *   Sum of `amount` for all transactions.
    *   Logic: `amount` is calculated based on signed `qty`. (Buy +, Sell -).
    *   *Note*: Represents "Net Invested Principal" if using historical cost basis.
*   **Top Performer (Account)**:
    *   Groups holdings by `account_id`.
    *   Identifies the account with the highest total invested value.
*   **Recent Activity**:
    *   Identifies the last transaction in the sorted list (by date).
    *   Displays Item Name, Date, and Amount.

### 4.3. 차트 데이터 포맷 (Recharts Compatible)
*   **AssetTrendChart**: `[{ date: '2024-01-01', value: 1000000 }, { date: '2024-01-02', value: 1050000 }, ...]`
*   **PortfolioChart**: `[{ name: 'ISA', value: 5000000 }, { name: '연금저축', value: 3000000 }, ...]`
*   **MonthlyBarChart**: `[{ name: 'Jan', buy: 100000, sell: 50000 }, ...]`

## 5. 의존성 (Dependencies)
*   `recharts`: `npm install recharts` (차트 구현 필수)
*   `date-fns`: 날짜 조작 및 포맷팅 (선택 사항, `Intl` 또는 `moment` 대체 가능)
*   `lucide-react`: 아이콘 (이미 설치됨)

## 6. 개발 로드맵 (Development Phase)
1.  **환경 설정**: `recharts` 패키지 설치.
2.  **데이터 훅 구현**: `useInvestmentData.js` 작성 및 데이터 로드 테스트.
3.  **UI 스켈레톤 구현**: `Dashboard.jsx` 레이아웃 잡기.
4.  **차트 컴포넌트 구현**: 각 차트별 컴포넌트 개발 및 데이터 연동.
5.  **통합 및 스타일링**: 전체적인 디자인 폴리싱 (Dark Mode 지원 확인).
