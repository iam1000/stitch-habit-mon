# 대시보드 UI/UX 설계 (Dashboard Redesign Proposal)

본 문서는 기존 대시보드를 전면 개편하여, **투자 관리(Investment Management)** 데이터를 중심으로 한 **자산 현황 및 통계 대시보드**를 구축하기 위한 설계안입니다.

---

## 1. 개요 (Overview)

*   **목표**: `INVESTMENT` (투자내역) 및 `ACCOUNTS` (계좌정보) 시트의 데이터를 시각화하여 한눈에 파악.
*   **핵심 가치**:
    *   내 총 자산 규모를 직관적으로 확인.
    *   시간 흐름에 따른 자산 변화(추이) 파악.
    *   계좌별/유형별 자산 분산 현황 분석.
*   **기술 스택**:
    *   **Chart Library**: `recharts` (React 생태계에서 가장 널리 쓰이는 가볍고 강력한 차트 라이브러리) 사용 권장.
        *   설치 필요: `npm install recharts`

---

## 2. 화면 레이아웃 (Layout Design)

### 2.1 전체 구조
*   **Header**: 대시보드 타이틀, 기간 설정(Date Range Picker), 데이터 새로고침 버튼.
*   **Top (KPI Cards)**: 핵심 요약 지표 4~5개.
*   **Middle (Main Charts)**:
    *   Left (60%): 자산 변동 추이 (Line/Area Chart).
    *   Right (40%): 자산 포트폴리오 비중 (Donut Chart).
*   **Bottom (Details)**:
    *   최근 투자 활동 (Recent List).
    *   월별 투자 통계 (Bar Chart).

### 2.2 Wireframe Mockup

```text
+-----------------------------------------------------------------------+
|  [ 대시보드 ]  [ 2024-01-01 ~ 2024-12-31 (▼) ]        [ 새로고침 ]    |
+-----------------------------------------------------------------------+
|                                                                       |
|  [ KPI 1: 총 자산 ]  [ KPI 2: 총 투자건수 ]  [ KPI 3: 최대 이익 종목 ] |
|  [ ￦ 150,000,000 ]  [ 42 건             ]  [ 삼성전자 (+20%)      ] |
|                                                                       |
+-----------------------------------------------------------------------+
|                                   |                                   |
|  [ 자산 변동 추이 (Trend) ]       |  [ 계좌별 자산 비중 (Pie) ]       |
|                                   |                                   |
|   1.8억 |      /                  |         (  ISA  )                |
|         |    _/                   |      (            )              |
|   1.5억 |  _/                     |    (    퇴직연금    )            |
|         | /                       |                                   |
|         +------------------       |                                   |
|            Jan  Feb  Mar          |                                   |
|                                   |                                   |
+-----------------------------------------------------------------------+
|                                                                       |
|  [ 월별 투자 금액 (Bar Chart) ]                                       |
|                                                                       |
|   |       |                                                           |
|   |   |   |                                                           |
|   +---+---+----------------------                                     |
|    1월 2월 3월                                                        |
|                                                                       |
+-----------------------------------------------------------------------+
```

### 2.3 Generated Design Preview
![Dashboard Design](https://lh3.googleusercontent.com/aida/AOfcidVLG7nTC_wsaor5i3-mKauQR_utpP2vDL7-JZSEbO_V-v5S_HvRy4WCtlSmR_efexXJxxKgXriPRak5MvNeAD7xkEFqqoPZEmZbDO-_g8sIlnVBs_ECE7MfhB1SHUVIvBtsyOvfDIH4Q7NOb6OZTx5ya49wbPUdjgws8zCq5h4ikBYaFWP_ayecrjDAU-tH1WwcNJS6PYsNocHKyqhIeCukxLS56ZEsu454DT7R96lO03smVKyRRIEJ3-5A)

---

## 3. 상세 컴포넌트 설계

### 3.1 KPI Cards (요약 지표)

1.  **총 평가 금액 (Total Estimated Value)**
    *   Logic: `SUM(수량 * 단가)` (현재가 데이터가 없다면 매수가 기준).
    *   Display: 금액 포맷 (예: 125,000,000 원).
2.  **누적 투자 건수**
    *   Logic: `COUNT(투자내역 Row)`.
3.  **최근 30일 변동분**
    *   Logic: (최근 30일 내 매수 금액 합계) - (최근 30일 내 매도 금액 합계).
4.  **최다 보유 계좌**
    *   Logic: 투자 금액 합계가 가장 큰 계좌명.

### 3.2 Main Charts

#### A. 일자별/월별 자산 추이 (Trend Chart)
*   **Type**: Area Chart or Line Chart.
*   **X축**: 날짜 (일/주/월 단위).
*   **Y축**: 총 자산 금액.
*   **Logic**:
    *   `date` 컬럼을 기준으로 데이터를 그룹화.
    *   매수(+) 및 매도(-) 내역을 누적하여(Cumulative Sum) 각 시점의 잔고 계산.
    *   데이터가 없는 날짜는 이전 날짜의 잔고를 유지(Last Observation Carried Forward).

#### B. 계좌별/종목별 비중 (Portfolio Chart)
*   **Type**: Donut Chart (Pie Chart).
*   **Segment**: `category` (계좌) 또는 `account_type` (계좌유형).
*   **Value**: 해당 그룹의 평가 금액 합계 `SUM(qty * price)`.
*   **Tooltip**: 그룹명, 금액, 퍼센트(%) 표시.

#### C. 월별 투자 활동 (Monthly Activity)
*   **Type**: Stacked Bar Chart.
*   **X축**: `YYYY-MM`.
*   **Y축**: 매수 금액, 매도 금액.
*   **Logic**: 월별로 매수(`qty > 0`)와 매도(`qty < 0` 가정) 금액을 집계하여 시각화.

---

## 4. 데이터 구조 및 로직 (Data Logic)

### 4.1 필요 데이터 (From Google Sheets)
대시보드 구현을 위해 `UseSheetData` 훅이나 기존 `Investment.jsx`의 `loadData` 로직을 재사용하여 다음 데이터를 메모리에 적재해야 합니다.

1.  **Investment Data (`INVESTMENT` sheet)**
    *   `date`: 날짜 (필수, YYYY-MM-DD)
    *   `category`: 계좌 ID (매핑용)
    *   `item_name`: 종목명
    *   `qty`: 수량
    *   `price`: 단가
    *   `amount`: 금액 (수량 * 단가, 시트에 없다면 FE에서 계산)
    *   `type`: 매수/매도 구분 (없다면 수량의 부호로 판단하거나 별도 컬럼 필요)

2.  **Account Data (`ACCOUNTS` sheet)**
    *   `id`: 계좌 ID
    *   `account_name`: 계좌명
    *   `account_type`: 계좌 유형

### 4.2 데이터 가공 (Frontend Processing)
*   **전처리**: 모든 금액 데이터 숫자 변환. 유효하지 않은 날짜 필터링.
*   **계좌 매핑**: Investment 데이터의 `category` ID를 Account 데이터의 `account_name`으로 변환.
*   **그룹화**: `lodash` 또는 `Array.reduce`를 사용하여 날짜별/계좌별 집계 수행.

---

## 5. 설치 패키지 (Dependencies)

차트 구현을 위해 아래 패키지 설치가 필요합니다.

```bash
npm install recharts
```

---

## 6. 개발 단계 (Phases)

1.  **패키지 설치**: `recharts` 설치.
2.  **데이터 로드 분리**: `Investment.jsx`의 데이터 로드 로직을 `useInvestmentData` 커스텀 훅으로 분리하여 대시보드에서도 재사용 가능하도록 리팩토링 (권장) 또는 대시보드에서 별도 로드.
3.  **UI 스켈레톤 작성**: 레이아웃 그리드 구성.
4.  **컴포넌트 개발**:
    *   `SummaryCard`: 숫자 표시용 컴포넌트.
    *   `AssetTrendChart`: Recharts 연동.
    *   `PortfolioChart`: Recharts 연동.
5.  **연동 및 테스트**: 실제 데이터 로드 및 차트 렌더링 확인.
