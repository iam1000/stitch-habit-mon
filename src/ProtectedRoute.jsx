import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = () => {
    const { user, loading } = useAuth();

    // 1. 아직 로그인 정보를 불러오는 중이라면? -> 잠시 대기 (빈 화면)
    //    (이 처리가 없으면 로그인이 되어있어도 잠깐 튕기는 현상이 발생할 수 있음)
    if (loading) {
        return <div className="min-h-screen bg-[var(--bg-main)]"></div>;
    }

    // 2. 로그인 정보(user)가 있다면? -> 통과 (원래 화면 보여줌)
    // 3. 없다면? -> 로그인 페이지로 강제 이동 (현재 주소 기록 없이 교체)
    return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
