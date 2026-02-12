import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowLeft, Mail, Lock, ArrowRight } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { signIn, signUp } = useAuth();
    const navigate = useNavigate();
    const { t } = useLanguage();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (isSignUp) {
                const { error } = await signUp(email, password);
                if (error) throw error;
                alert('가입 확인 이메일을 확인해주세요!');
            } else {
                const { error } = await signIn(email, password);
                if (error) throw error;
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4 relative overflow-hidden font-body">
            {/* Background Decor - Same as Landing Page */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 opacity-60" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-50 rounded-full blur-[100px] translate-y-1/4 -translate-x-1/4 opacity-60" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Back Button */}
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-gray-400 hover:text-indigo-600 transition-all mb-6 group font-bold"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span>돌아가기</span>
                </button>

                <div className="bg-white/80 backdrop-blur-xl rounded-[32px] shadow-2xl shadow-indigo-500/10 border border-white p-8 md:p-10">
                    <div className="flex flex-col items-center mb-10 text-center">
                        <div className="w-14 h-14 bg-gradient-to-br from-[#4f46e5] to-[#818cf8] rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 mb-6">
                            <Sparkles className="text-white w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-[900] mb-3 font-heading tracking-tight" style={{ color: '#111827' }}>
                            {isSignUp ? 'DonMany 시작하기' : '반가워요, 다시 왔네요!'}
                        </h1>
                        <p className="text-gray-500 font-semibold text-sm max-w-[240px]">
                            {isSignUp ? '스마트한 자산 관리의 첫걸음, 지금 시작해보세요.' : '오늘의 자산 현황과 투자 인사이트를 확인하세요.'}
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-red-50 text-red-500 text-sm p-4 rounded-2xl mb-6 text-center font-bold border border-red-100"
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700 ml-1">이메일 주소</label>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                                    <Mail size={18} />
                                </span>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 outline-none transition-all font-semibold text-gray-900 placeholder:text-gray-300"
                                    placeholder="your@email.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700 ml-1">비밀번호</label>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                                    <Lock size={18} />
                                </span>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 outline-none transition-all font-semibold text-gray-900 placeholder:text-gray-300"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 group mt-4 relative overflow-hidden"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>{isSignUp ? '계정 생성하기' : '로그인'}</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors underline underline-offset-4"
                        >
                            {isSignUp ? '이미 계정이 있으신가요? 로그인' : '아직 계정이 없으신가요? 회원가입'}
                        </button>
                    </div>
                </div>

                <p className="text-center mt-10 text-gray-400 text-xs font-semibold">
                    © 2026 DonMany. All rights reserved.
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
