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
        backToGame: "Back to Game"
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
        backToGame: "게임으로 돌아가기"
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
