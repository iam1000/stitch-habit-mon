import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const translations = {
    en: {
        // Landing Page
        howItWorks: "How it works",
        login: "Login",
        levelUp: "✨ Level up your life",
        headline: "Turn Habits into",
        headlineSuffix: "Monster Evolutions!",
        subheadline: "Stop boring checklists. Start checking off quests, feeding your monster, and watching it evolve as you grow!",
        startPlaying: "Start Playing",
        watchDemo: "Watch Demo",
        step1Title: "1. Do Quests",
        step1Desc: "Complete daily habits like 'Drink Water' or 'Read'.",
        step2Title: "2. Earn XP",
        step2Desc: "Get experience points and coins for every task.",
        step3Title: "3. Evolve!",
        step3Desc: "Watch your cute blob turn into an epic monster.",

        // Dashboard
        dashboard: "Dashboard",
        myMonster: "My Monster",
        leaderboard: "Leaderboard",
        shop: "Shop",
        settings: "Settings",
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
        howItWorks: "이용 방법",
        login: "로그인",
        levelUp: "✨ 당신의 삶을 레벨업하세요",
        headline: "습관을 바꾸세요",
        headlineSuffix: "몬스터 진화로!",
        subheadline: "지루한 체크리스트는 그만! 퀘스트를 깨고, 몬스터에게 먹이를 주고, 성장하는 모습을 지켜보세요!",
        startPlaying: "게임 시작하기",
        watchDemo: "데모 보기",
        step1Title: "1. 퀘스트 수행",
        step1Desc: "'물 마시기'나 '독서' 같은 일일 습관을 완료하세요.",
        step2Title: "2. XP 획득",
        step2Desc: "모든 태스크 완료 시 경험치와 코인을 얻습니다.",
        step3Title: "3. 진화!",
        step3Desc: "귀여운 블롭이 멋진 몬스터로 변하는 걸 지켜보세요.",

        // Dashboard
        dashboard: "대시보드",
        myMonster: "내 몬스터",
        leaderboard: "랭킹",
        shop: "상점",
        settings: "설정",
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
