import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const translations = {
    en: {
        // Landing Page
        howItWorks: "Main Features",
        login: "Sign In",
        levelUp: "✨ Professional Wealth Management",
        headline: "Stitch Your Data,",
        headlineSuffix: "Orchestrate Wealth.",
        subheadline: "Integrate Google Sheets, AI research with NotebookLM, and professional Master Data governance in one seamless platform.",
        startPlaying: "Get Started",
        watchDemo: "Watch Demo",
        step1Title: "Strategic Dashboard",
        step1Desc: "Real-time visualization of your financial health and asset distribution.",
        step2Title: "Investment Tracking",
        step2Desc: "Smart portfolio management with seamless Google Sheets synchronization.",
        step3Title: "AI Integration",
        step3Desc: "Analyze market trends using integrated NotebookLM analysis tools.",
        step4Title: "Master Governance",
        step4Desc: "Enterprise-grade control over codes, menus, and user permissions.",

        // Dashboard
        dashboard: "Dashboard",
        myMonster: "My Monster",
        leaderboard: "Leaderboard",
        shop: "Shop",
        settings: "Settings",
        codeMgt: "Master Data",
        codeMgtDesc: "Manage system codes, menu structures, and user permissions centrally.",
        commonCode: "Common Code",
        menuMgmt: "Menu Management",
        permMgmt: "Permission Management",

        helloPlayer: "Hello, Player! 👋",
        monsterWaiting: "Your monster is waiting for you.",
        profile: "Profile",
        monsterName: "Blobby",
        readyToEvolve: "Ready to Evolve! ✨",
        dailyQuests: "Daily Quests",
        mysteryShop: "Mystery Shop",
        openBox: "Open Daily Box",
        drinkWater: "Drink 2L Water",
        squats: "20 Squats",
        readPages: "Read 10 Pages",
        noSugar: "No Sugar",
        friends: "Friends",

        // Evolution
        levelUpTitle: "LEVEL UP!",
        evolvedTitle: "Your Blob Evolved!",
        sayHello: "Say hello to",
        health: "Health",
        power: "Power",
        share: "Share Evolution",
        backToGame: "Back to Game",

        // Investment Management
        investment: "Investment",
        investmentManagement: "Investment Management",
        investmentDescription: "Track your assets at a glance with Google Sheets integration.",

        // Investment Tabs
        investmentList: "Investment List",
        addInvestment: "Add Investment",
        connectionSettings: "Connection Settings",

        // Investment Settings
        autoConfigured: "Service account credentials are automatically configured",
        spreadsheetId: "Spreadsheet ID (between /d/ and /edit in URL)",
        saveSettings: "Save Settings",
        loadData: "Load Data",

        // Investment Form
        addNewItem: "Add New Item",
        addButton: "Add",
        date: "Date",
        category: "Category",
        name: "Name",
        quantity: "Quantity",
        price: "Price",
        totalAmount: "Total",
        note: "Note",
        stock: "Stock",
        crypto: "Crypto",
        realEstate: "Real Estate",
        cash: "Cash",

        // Investment Filters
        startDate: "Start Date",
        endDate: "End Date",
        all: "All",
        searchByName: "Search by name...",
        search: "Search",
        reset: "Reset",
        filterConditions: "Filter Conditions",

        // Messages
        noData: "No data available. Please set up connection and search.",
        sheetHeaderNote: "(The first row of the sheet must be: date, category, name, quantity, price, note)",
        totalItems: "Total",
        itemsOf: "items",
        showing: "Showing",
        nameRequired: "Name and price are required.",
        dataLoadError: "An error occurred while loading data. Please check your settings or sheet sharing. (Sheet headers must be: date, category, name, quantity, price, note)",
        dataAddError: "An error occurred while adding data.",
        dataAddedSuccess: "Data added successfully.",
        settingsSaved: "Settings saved.",
        allSettings: "Please enter all settings values.",

        // Accounts Management
        accountList: "Accounts Management",
        addAccount: "Add Account Info",
        accountId: "Account ID",
        accountName: "Account Name",
        financialCompany: "Financial Company",
        accountType: "Account Type",
        accountNumber: "Account Number",
        deposit: "Deposit/Withdrawal",
        savings: "Savings",
        loan: "Loan",
        financialInstitute: "Financial Institute",

        // Account Types (Partial)
        ISA: "ISA",
        Pension: "Pension",
        StockAccount: "Stock Account",
        General: "General",
        CMA: "CMA",
    },
    ko: {
        // Landing Page
        howItWorks: "주요 핵심 기능",
        login: "로그인",
        levelUp: "✨ 지능형 자산 및 데이터 관리",
        headline: "당신의 데이터를 연결하고,",
        headlineSuffix: "자산을 체계화하세요.",
        subheadline: "구글 시트 연동, NotebookLM을 통한 AI 분석, 강력한 기준정보 시스템까지. 전문가 수준의 데이터 에코시스템을 경험하세요.",
        startPlaying: "시작하기",
        watchDemo: "데모 보기",
        step1Title: "전략적 대시보드",
        step1Desc: "실시간 자산 현황과 투자 성과를 직관적인 시각화로 한눈에 파악합니다.",
        step2Title: "정교한 투자 관리",
        step2Desc: "구글 시트와 완벽하게 동기화되는 스마트한 포트폴리오 관리 기능을 제공합니다.",
        step3Title: "AI 인사이트 연동",
        step3Desc: "NotebookLM 도구를 활용하여 시장 트렌드와 리서치 데이터를 AI로 분석하세요.",
        step4Title: "기준정보 거버넌스",
        step4Desc: "시스템 코드, 메뉴, 권한 관리를 통해 탄탄하고 확장성 있는 시스템을 구축합니다.",

        // Dashboard
        dashboard: "대시보드",
        myMonster: "내 몬스터",
        leaderboard: "랭킹",
        shop: "상점",
        settings: "설정",
        codeMgt: "기준정보관리",
        codeMgtDesc: "시스템의 코드, 메뉴 구조, 사용자 권한을 통합 관리합니다.",
        commonCode: "공통 코드",
        menuMgmt: "메뉴 관리",
        permMgmt: "권한 관리",

        helloPlayer: "안녕하세요, 플레이어님! 👋",
        monsterWaiting: "몬스터가 기다리고 있어요.",
        profile: "프로필",
        monsterName: "블로비",
        readyToEvolve: "진화 준비 완료! ✨",
        dailyQuests: "일일 퀘스트",
        mysteryShop: "미스터리 상점",
        openBox: "일일 박스 열기",
        drinkWater: "물 2L 마시기",
        squats: "스쿼트 20회",
        readPages: "책 10페이지 읽기",
        noSugar: "설탕 먹지 않기",
        friends: "친구들",

        // Evolution
        levelUpTitle: "레벨 업!",
        evolvedTitle: "블롭이 진화했습니다!",
        sayHello: "새로운 친구를 환영해주세요:",
        health: "체력",
        power: "파워",
        share: "진화 공유하기",
        backToGame: "게임으로 돌아가기",

        // Investment Management
        investment: "투자관리",
        investmentManagement: "투자 관리",
        investmentDescription: "구글 시트와 연동하여 자산을 한눈에 파악하세요.",

        // Investment Tabs
        investmentList: "투자내역조회",
        addInvestment: "투자항목 추가",
        connectionSettings: "연동설정",

        // Investment Settings
        autoConfigured: "서비스 계정 인증 정보는 자동으로 설정됩니다",
        spreadsheetId: "Spreadsheet ID (URL의 /d/와 /edit 사이)",
        saveSettings: "설정 저장",
        loadData: "데이터 불러오기",

        // Investment Form
        addNewItem: "새 항목 추가",
        addButton: "추가하기",
        date: "날짜",
        category: "분류",
        name: "종목명",
        quantity: "수량",
        price: "단가",
        totalAmount: "총액",
        note: "비고",
        stock: "주식",
        crypto: "코인",
        realEstate: "부동산",
        cash: "현금",

        // Investment Filters
        startDate: "시작 날짜",
        endDate: "종료 날짜",
        all: "전체",
        searchByName: "종목명 검색...",
        search: "조회하기",
        reset: "초기화",
        filterConditions: "조회 조건",

        // Messages
        noData: "조회 버튼을 눌러 데이터를 불러와주세요.",
        sheetHeaderNote: "(시트의 첫 행은 반드시 date, category, name, quantity, price, note 여야 합니다)",
        totalItems: "총",
        itemsOf: "개 항목 중",
        showing: "표시",
        nameRequired: "종목명과 가격은 필수입니다.",
        dataLoadError: "데이터를 불러오는 중 오류가 발생했습니다. 설정이나 시트 공유 상태를 확인해주세요. (시트 헤더가 date, category, name, quantity, price, note 여야 합니다)",
        dataAddError: "데이터 추가 중 오류가 발생했습니다.",
        dataAddedSuccess: "데이터가 성공적으로 추가되었습니다.",
        settingsSaved: "설정이 저장되었습니다.",
        allSettings: "설정(시트 ID, 이메일, 키)을 모두 입력해주세요.",

        // Accounts Management
        accountList: "계좌 관리",
        addAccount: "계좌정보 추가",
        accountId: "계좌ID",
        accountName: "계좌명",
        financialCompany: "금융기관",
        accountType: "계좌유형",
        accountNumber: "계좌번호",
        deposit: "입출금",
        savings: "예적금",
        loan: "대출",
        financialInstitute: "금융기관",

        // Account Types
        ISA: "ISA",
        "연금": "연금",
        "증권계좌": "증권계좌",
        "일반": "일반",
        "CMA": "CMA",
    }
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('en');

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'en' ? 'ko' : 'en');
    };

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, t: translations[language] }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
