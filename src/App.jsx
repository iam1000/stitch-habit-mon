// React Router DOM에서 필요한 컴포넌트들을 임포트합니다. (라우팅 기능 제공)
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 각 페이지 컴포넌트들을 임포트합니다.
import LandingPage from './LandingPage'; // 랜딩 페이지 (홈)
import Dashboard from './Dashboard';     // 대시보드 (메인 게임 화면)
import Evolution from './Evolution';     // 진화 화면
import Login from './Login';             // 로그인/회원가입 화면
import Shop from './Shop';               // 상점 화면
import MyMonster from './MyMonster';     // 내 몬스터 상세 화면
import Leaderboard from './Leaderboard'; // 랭킹 화면
import Settings from './Settings';       // 설정 화면
import Notebooks from './Notebooks';     // 노트북(학습) 화면
import Friends from './Friends';         // 친구 화면

// 전역 상태 관리를 위한 Context Provider들을 임포트합니다.
import { LanguageProvider } from './LanguageContext'; // 다국어 지원 (한국어/영어)
import { AuthProvider } from './AuthContext';         // 사용자 인증 (로그인 상태)
import { ThemeProvider } from './ThemeContext';       // 테마 (다크모드/라이트모드)

// 공통 레이아웃 컴포넌트 (네비게이션 바 등이 포함된 틀)
import MainLayout from './MainLayout';

function App() {
  return (
    // 1. LanguageProvider: 앱 전체에 다국어 데이터를 공급합니다.
    <LanguageProvider>
      {/* 2. ThemeProvider: 앱 전체에 테마(다크/라이트) 상태를 공급합니다. */}
      <ThemeProvider>
        {/* 3. AuthProvider: 앱 전체에 로그인 정보(User Session)를 공급합니다. */}
        <AuthProvider>
          {/* 4. Router: URL 변경에 따른 페이지 이동을 관리하는 라우터입니다. */}
          <Router>
            {/* 앱의 최상위 컨테이너. 다크모드 배경색과 화면 전환 애니메이션 설정 */}
            <div className="App dark:bg-gray-900 min-h-screen transition-colors duration-200">
              {/* Routes: 현재 URL과 매칭되는 Route 하나만 렌더링합니다. */}
              <Routes>
                {/* 기본 경로(/)는 랜딩 페이지를 보여줍니다. */}
                <Route path="/" element={<LandingPage />} />

                {/* 로그인 경로(/login)는 로그인 페이지를 보여줍니다. */}
                <Route path="/login" element={<Login />} />

                {/* 중첩 라우팅: MainLayout(상단/하단 탭바)이 적용되는 페이지들입니다. */}
                <Route element={<MainLayout />}>
                  {/* 대시보드 */}
                  <Route path="/dashboard" element={<Dashboard />} />
                  {/* 상점 */}
                  <Route path="/shop" element={<Shop />} />
                  {/* 내 몬스터 */}
                  <Route path="/my-monster" element={<MyMonster />} />
                  {/* 랭킹 */}
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  {/* 설정 */}
                  <Route path="/settings" element={<Settings />} />
                  {/* 노트북 */}
                  <Route path="/notebooks" element={<Notebooks />} />
                  {/* 친구 */}
                  <Route path="/friends" element={<Friends />} />

                </Route>

                {/* 진화 화면은 레이아웃 없이 전체 화면으로 보여줍니다. */}
                <Route path="/evolution" element={<Evolution />} />
              </Routes>
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
