import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Share2, ArrowLeft, Star, Zap, Globe } from 'lucide-react';
import { useLanguage } from './LanguageContext';

// Simplistic particle system for "Confetti"
const Particles = () => {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(20)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-3 h-3 bg-[#f49d25] rounded-full"
                    initial={{ y: -20, x: Math.random() * window.innerWidth, opacity: 1 }}
                    animate={{ y: window.innerHeight + 20, rotate: 360 }}
                    transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, ease: "linear", delay: Math.random() * 2 }}
                    style={{
                        left: `${Math.random() * 100}%`,
                        backgroundColor: ['#42f05f', '#8c36e2', '#f49d25', '#2ecc71'][Math.floor(Math.random() * 4)]
                    }}
                />
            ))}
        </div>
    );
};

const Evolution = () => {
    const navigate = useNavigate();
    const { t, toggleLanguage, language } = useLanguage();

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center relative overflow-hidden font-game text-white text-center p-4">
            <Particles />

            {/* Language Toggle (Floating) */}
            <button
                onClick={toggleLanguage}
                className="absolute top-6 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all font-body text-sm font-bold"
            >
                <Globe className="w-4 h-4" />
                {language === 'en' ? '한국어' : 'English'}
            </button>

            {/* Light Rays Background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-to-r from-[#42f05f]/20 via-[#f49d25]/20 to-[#8c36e2]/20 rounded-full blur-[100px] animate-pulse"></div>

            <motion.div
                className="relative z-10 max-w-2xl w-full"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", duration: 0.8 }}
            >
                <motion.div
                    initial={{ y: -50 }}
                    animate={{ y: 0 }}
                    transition={{ delay: 0.5, type: 'spring' }}
                    className="mb-8"
                >
                    <span className="inline-block bg-[#f49d25] text-black font-[800] px-6 py-2 rounded-full text-xl mb-4 tracking-wider shadow-[0_0_20px_#f49d25]">
                        {t.levelUpTitle}
                    </span>
                    <h1 className="text-4xl md:text-6xl font-[800] font-heading leading-tight mb-2">
                        {t.evolvedTitle}
                    </h1>
                    <p className="text-gray-300 text-lg">{t.sayHello} <span className="text-[#42f05f] font-bold">Dino-Mon</span></p>
                </motion.div>

                {/* Evolution Stage */}
                <div className="relative h-80 flex items-center justify-center mb-12">
                    {/* Glow behind */}
                    <div className="absolute w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

                    {/* Monster Transformation */}
                    <motion.div
                        className="relative"
                        initial={{ rotate: 0 }}
                        animate={{ rotate: [0, -5, 5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        {/* CSS Dino-Mon */}
                        <div className="w-64 h-64 relative">
                            <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_20px_50px_rgba(66,240,95,0.4)]">
                                <path fill="#42f05f" d="M150,80 Q170,40 130,30 Q110,10 80,40 Q40,30 30,80 Q10,120 40,160 Q70,190 120,170 Q160,180 170,140 Q190,110 150,80 Z" />
                                {/* Spikes */}
                                <path fill="#2ecc71" d="M80,40 L90,20 L100,40 M110,35 L120,15 L130,35 M140,45 L150,25 L160,45" />
                                {/* Eye */}
                                <circle cx="120" cy="70" r="8" fill="white" />
                                <circle cx="122" cy="68" r="3" fill="black" />
                                {/* Teeth */}
                                <path fill="white" d="M140,110 L145,120 L150,110" />
                            </svg>
                            {/* Fire Aura Effect */}
                            <motion.div
                                className="absolute -inset-4 border-4 border-[#f49d25] rounded-full opacity-0"
                                animate={{ scale: [1, 1.2], opacity: [0.8, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            />
                        </div>
                    </motion.div>
                </div>

                {/* Stats Upgrade Card */}
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-10">
                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center gap-4">
                        <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center text-red-400">
                            <Star className="fill-current" />
                        </div>
                        <div className="text-left font-body">
                            <div className="text-xs text-gray-400 font-bold uppercase">{t.health}</div>
                            <div className="text-xl font-bold flex items-center gap-2">
                                150 <span className="text-green-400 text-sm">(+10)</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400">
                            <Zap className="fill-current" />
                        </div>
                        <div className="text-left font-body">
                            <div className="text-xs text-gray-400 font-bold uppercase">{t.power}</div>
                            <div className="text-xl font-bold flex items-center gap-2">
                                55 <span className="text-green-400 text-sm">(+5)</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button className="btn-primary bg-[#f49d25] hover:bg-[#e67e22] text-black shadow-[0_10px_30px_rgba(244,157,37,0.4)] flex items-center justify-center gap-2 px-8 py-4 text-lg font-heading">
                        <Share2 size={20} /> {t.share}
                    </button>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-8 py-4 rounded-full border-2 border-white/20 hover:bg-white/10 font-bold text-white flex items-center justify-center gap-2 transition-all font-heading"
                    >
                        <ArrowLeft size={20} /> {t.backToGame}
                    </button>
                </div>

            </motion.div>
        </div>
    );
};

export default Evolution;
