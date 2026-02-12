import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, LayoutDashboard, TrendingUp, BookOpen, ShieldCheck, Globe, ArrowUp } from 'lucide-react';
import { useLanguage } from './LanguageContext';

const LandingPage = () => {
    const { t, language, toggleLanguage } = useLanguage();
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 200) {
                setShowScrollTop(true);
            } else {
                setShowScrollTop(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <div className="min-h-screen bg-[#f8f9fa] overflow-x-hidden relative font-body" id="top">
            {/* Background Decor - Constrained to prevent ghost scroll */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 opacity-60" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-50 rounded-full blur-[100px] translate-y-1/4 -translate-x-1/4 opacity-60" />
            </div>

            {/* Navbar - Sticky for constant access */}
            <nav className="sticky top-0 w-full bg-[#f8f9fa]/80 backdrop-blur-md z-[100] border-b border-gray-100 transition-all duration-300">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div
                        className="flex items-center gap-2 cursor-pointer group"
                        onClick={scrollToTop}
                    >
                        <div className="w-9 h-9 bg-gradient-to-br from-[#4f46e5] to-[#818cf8] rounded-xl flex items-center justify-center shadow-lg transform rotate-3 group-hover:rotate-0 transition-transform duration-300">
                            <Sparkles className="text-white w-5 h-5" />
                        </div>
                        <span className="text-xl font-[900] tracking-tight font-heading italic group-hover:text-[#4f46e5] transition-colors" style={{ color: '#111827' }}>DonMany</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4 md:gap-8">
                        <button
                            onClick={toggleLanguage}
                            className="flex items-center gap-1.5 px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg hover:bg-white/50 transition-colors text-xs sm:text-sm font-bold"
                            style={{ color: '#374151' }}
                        >
                            <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            {language === 'en' ? '한국어' : 'EN'}
                        </button>

                        <div className="flex items-center gap-3 sm:gap-6 md:gap-8">
                            <a
                                href="#features"
                                className="hidden sm:block font-bold hover:text-[#4f46e5] transition-colors"
                                style={{ color: '#374151' }}
                                onClick={(e) => {
                                    e.preventDefault();
                                    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }}
                            >
                                {t.howItWorks}
                            </a>
                            <Link to="/login" className="px-4 py-2 sm:px-6 sm:py-2 rounded-xl bg-white font-[800] border-2 border-[#e5e7eb] hover:border-[#4f46e5] transition-all shadow-sm text-xs sm:text-sm"
                                style={{ color: '#111827' }}
                            >
                                {t.login}
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Hero & Features Wrapper - Accurate height for no scroll */}
            <div className="flex flex-col min-h-[calc(100vh-73px)] justify-center">
                {/* Hero Section */}
                <main className="container mx-auto px-6 pt-4 pb-8 flex flex-col lg:flex-row items-center relative z-10">
                    <div className="lg:w-1/2 text-center lg:text-left z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <span className="inline-block px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 font-bold text-[13px] mb-4 border border-indigo-100">
                                {t.levelUp}
                            </span>
                            <h1 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-[800] leading-[1.2] mb-4 font-heading tracking-tight" style={{ color: '#111827' }}>
                                {t.headline} <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-emerald-500 leading-normal inline-block ml-2">{t.headlineSuffix}</span>
                            </h1>
                            <p className="text-base sm:text-lg text-gray-500 mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0">
                                {t.subheadline}
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <Link to="/login" className="px-7 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 group">
                                    {t.startPlaying}
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </motion.div>
                    </div>

                    {/* Hero Visualization */}
                    <div className="lg:w-1/2 relative mt-8 lg:mt-0 flex justify-center items-center">
                        <motion.div
                            className="relative z-10 w-full max-w-[480px]"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            <div
                                className="relative aspect-video rounded-[28px] bg-slate-900 shadow-2xl overflow-hidden border border-slate-700/50"
                                style={{
                                    perspective: '1000px',
                                    transform: 'rotateY(-10deg) rotateX(5deg)'
                                }}
                            >
                                {/* Inner Dashboard Styling */}
                                <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 p-5 flex flex-col gap-5">
                                    <div className="flex justify-between items-center opacity-50">
                                        <div className="flex gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3 flex-1">
                                        <div className="col-span-2 bg-slate-800/50 rounded-xl border border-white/5 p-3 flex flex-col gap-3">
                                            <div className="w-20 h-3 bg-indigo-500/30 rounded-full" />
                                            <div className="flex-1 w-full relative">
                                                <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
                                                    <motion.path
                                                        d="M0 60 Q 40 20, 80 40 T 120 10 T 160 50 T 200 5 T 240 30"
                                                        fill="none"
                                                        stroke="#4f46e5"
                                                        strokeWidth="3"
                                                        initial={{ pathLength: 0 }}
                                                        animate={{ pathLength: 1 }}
                                                        transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
                                                    />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="bg-slate-800/50 rounded-xl border border-white/5 p-3 flex flex-col gap-3">
                                            <div className="w-full aspect-square rounded-full border-2 border-indigo-500/20 flex items-center justify-center">
                                                <div className="w-2/3 h-2/3 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin-slow" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </main>

                {/* Features Section - Tightly Integrated */}
                <section className="container mx-auto px-6 pb-12" id="features">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { icon: <LayoutDashboard className="w-6 h-6 text-indigo-500" />, title: t.step1Title, desc: t.step1Desc },
                            { icon: <TrendingUp className="w-6 h-6 text-emerald-500" />, title: t.step2Title, desc: t.step2Desc },
                            { icon: <BookOpen className="w-6 h-6 text-purple-500" />, title: t.step3Title, desc: t.step3Desc },
                            { icon: <ShieldCheck className="w-6 h-6 text-blue-500" />, title: t.step4Title, desc: t.step4Desc }
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="p-5 bg-white rounded-[24px] border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group"
                            >
                                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-4 group-hover:bg-indigo-50 transition-colors">
                                    {item.icon}
                                </div>
                                <h3 className="text-lg font-[900] mb-2" style={{ color: '#111827' }}>{item.title}</h3>
                                <p className="leading-relaxed text-[13px] font-semibold" style={{ color: '#4b5563' }}>{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Back to Top Button */}
            <AnimatePresence>
                {showScrollTop && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.5, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.5, y: 20 }}
                        onClick={scrollToTop}
                        className="fixed bottom-8 right-8 w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-2xl z-50 hover:bg-indigo-700 transition-colors"
                    >
                        <ArrowUp size={24} />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LandingPage;
