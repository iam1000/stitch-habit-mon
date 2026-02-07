import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Zap, Target, Trophy, Globe } from 'lucide-react';
import { useLanguage } from './LanguageContext';

const LandingPage = () => {
    const { t, language, toggleLanguage } = useLanguage();

    return (
        <div className="min-h-screen bg-[#f8f9fa] overflow-hidden relative font-body">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-100 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 opacity-50 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-green-100 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 opacity-50 pointer-events-none" />

            {/* Navbar */}
            <nav className="container mx-auto px-6 py-6 flex justify-between items-center relative z-10">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#42f05f] to-[#2ecc71] rounded-xl flex items-center justify-center shadow-lg">
                        <Sparkles className="text-white w-6 h-6" />
                    </div>
                    <span className="text-2xl font-[800] text-[var(--text-main)] tracking-tight font-heading">HabitMons</span>
                </div>
                <div className="flex items-center gap-4 md:gap-8">
                    <button
                        onClick={toggleLanguage}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/50 transition-colors text-sm font-semibold text-gray-600"
                    >
                        <Globe className="w-4 h-4" />
                        {language === 'en' ? '한국어' : 'English'}
                    </button>

                    <div className="hidden md:flex items-center gap-8">
                        <a href="#how" className="font-semibold text-gray-500 hover:text-[#8c36e2] transition-colors">{t.howItWorks}</a>
                        <Link to="/login" className="px-6 py-2.5 rounded-full bg-white text-[var(--text-main)] font-bold border-2 border-transparent hover:border-[#42f05f] transition-all shadow-sm">
                            {t.login}
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="container mx-auto px-6 pt-12 pb-24 flex flex-col lg:flex-row items-center relative z-10">
                <div className="lg:w-1/2 text-center lg:text-left z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-block px-4 py-2 rounded-full bg-purple-100 text-[#8c36e2] font-bold text-sm mb-6">
                            {t.levelUp}
                        </span>
                        <h1 className="text-5xl lg:text-7xl font-[800] text-[var(--text-main)] leading-tight mb-6 font-heading">
                            {t.headline} <br />
                            <span className="text-gradient leading-normal py-2 inline-block">{t.headlineSuffix}</span>
                        </h1>
                        <p className="text-xl text-gray-500 mb-10 leading-relaxed max-w-lg mx-auto lg:mx-0">
                            {t.subheadline}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <Link to="/login" className="btn-primary flex items-center justify-center gap-2 group">
                                {t.startPlaying}
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <button className="btn-secondary">{t.watchDemo}</button>
                        </div>
                    </motion.div>
                </div>

                {/* Hero Image (3D Monster) */}
                <div className="lg:w-1/2 relative mt-16 lg:mt-0">
                    <motion.div
                        className="relative z-10 animate-float"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        {/* Hand-crafted CSS Monster Placeholder */}
                        <div className="w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] mx-auto bg-gradient-to-br from-[#42f05f] to-[#2ecc71] rounded-[80px] shadow-[0_40px_80px_-20px_rgba(66,240,95,0.4)] flex items-center justify-center relative border-8 border-white">
                            {/* Cute Face */}
                            <div className="flex flex-col items-center gap-4">
                                <div className="flex gap-8">
                                    <div className="w-8 h-12 bg-[#1f2937] rounded-full animate-bounce delay-75"></div>
                                    <div className="w-8 h-12 bg-[#1f2937] rounded-full animate-bounce"></div>
                                </div>
                                <div className="w-16 h-8 bg-black/20 rounded-full mt-2"></div>
                            </div>

                            {/* Floating elements */}
                            <div className="absolute -top-12 -right-8 w-24 h-24 bg-[#f49d25] rounded-full blur-xl opacity-60 animate-pulse"></div>
                            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-[#8c36e2] rounded-full blur-xl opacity-60 animate-pulse delay-700"></div>
                        </div>
                    </motion.div>
                </div>
            </main>

            {/* How it Works Cards */}
            <section className="container mx-auto px-6 py-20" id="how">
                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        { icon: <Target className="w-8 h-8 text-[#42f05f]" />, title: t.step1Title, desc: t.step1Desc },
                        { icon: <Zap className="w-8 h-8 text-[#f49d25]" />, title: t.step2Title, desc: t.step2Desc },
                        { icon: <Trophy className="w-8 h-8 text-[#8c36e2]" />, title: t.step3Title, desc: t.step3Desc }
                    ].map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2 }}
                            className="card bg-white"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-6">
                                {item.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                            <p className="text-gray-500 leading-relaxed font-body">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
