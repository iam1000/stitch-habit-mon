# 매뉴얼 이미지 자동화 도구 - TRD (Technical Requirements Document)

## 1. 시스템 아키텍처 (System Architecture)

### 1.1 기술 스택
- **Runtime**: Node.js
- **Library**: Puppeteer (Headless Chrome Node.js API)
- **OS**: Windows (Cross-platform compatible)

### 1.2 동작 흐름 (Flowchart Logic)
1. **초기화**: 저장 경로(`src/md/images`) 확인 및 생성.
2. **브라우저 실행**: Puppeteer를 `headless: false` 모드로 실행 (사용자 상호작용 허용).
3. **접속 및 로그인 감지**:
   - `http://localhost:5173/investment` (보호된 라우트)로 접속 시도.
   - `Promise.race`를 사용하여 `input[type="email"]` (로그인 폼)과 `nav` (메인 UI) 요소 중 어느 것이 먼저 렌더링되는지 감지.
   - **로그인 필요 시**: `nav` 요소가 나타날 때까지 무한 대기 (Polling).
4. **시나리오 실행**:
   - `SCENARIOS` 배열을 순회.
   - 지정된 `url`로 이동 (`networkidle2` 대기).
   - 지정된 `action` 함수 실행 (주로 버튼 클릭).
   - `clickButtonByText` 헬퍼 함수를 통해 XPath로 정확한 버튼 식별.
5. **캡처 및 저장**: 화면 렌더링 대기 후 `page.screenshot` 실행.
6. **종료**: 브라우저 리소스 해제.

## 2. 주요 모듈 및 로직 (Core Modules & Logic)

### 2.1 시나리오 설정 (`SCENARIOS` Array)
```javascript
const SCENARIOS = [
    {
        name: '시나리오명',
        url: '/target-route',
        action: async (page) => { ... }, // 캡처 전 수행할 동작
        filename: 'output_filename.png'
    },
    // ...
];
```

### 2.2 버튼 클릭 헬퍼 (`clickButtonByText`)
- **목적**: 텍스트 내용만으로 버튼을 찾아 클릭함으로써 CSS Selector 의존성을 줄임.
- **구현**: XPath(`//button[contains(., 'text')]` 등)를 사용하여 버튼, 링크, `div`, `span` 등 다양한 태그를 스캔.
- **호환성**: 최신 Puppeteer의 `page.$$('xpath/...')` 문법과 구형 `evaluate` 방식을 모두 지원.

### 2.3 로그인 감지 로직
- **Race Condition 처리**: 페이지 로딩 속도에 따라 리다이렉션 직후 요소를 찾지 못하는 문제를 방지하기 위해, 로그인 폼과 메인 요소 등장을 경쟁적으로 대기.
- **안정성**: 단순 URL 체크보다 DOM 요소를 직접 확인하여 정확도 향상.

## 3. 디렉토리 구조 (Directory Structure)
```
c:\AI_DEV\stitch\
├── scripts\
│   └── capture_manual_images.js  # 메인 스크립트
└── src\
    └── md\
        └── images\               # 이미지 저장소 (자동 생성)
            ├── 01_investment_list_mockup.png
            └── ...
```

## 4. 환경 변수 및 설정
- **BASE_URL**: `http://localhost:5173` (스크립트 내 하드코딩, 필요시 환경변수 분리 가능)
- **Viewport**: 1920 x 1080 (FHD 해상도 고정)

## 5. 에러 처리
- **요소 찾기 실패**: 버튼을 찾지 못해도 경고(`console.warn`)만 출력하고 캡처를 진행하여 전체 프로세스가 중단되지 않도록 함.
- **타임아웃**: 로그인 대기 등에서 충분한 타임아웃 설정.
