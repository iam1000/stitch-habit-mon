import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    CheckCircle2,
    Circle,
    Trophy,
    Settings,
    Check,
    Edit2,
    X,
    ShoppingBag,
    Home,
    User,
    Flame,
    Globe,
    LogOut
} from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { useAuth } from './AuthContext'; // Import useAuth
import { supabase } from './supabaseClient'; // Import supabase

const Friends = () => {
    const navigate = useNavigate();
    const { t, language, toggleLanguage } = useLanguage();
    const { user, signOut } = useAuth(); // Get user and signOut
    const [xp, setXp] = useState(0); // Start with 0 (fetch from DB)
    const [level, setLevel] = useState(1);
    const [habits, setHabits] = useState([]);
    const [loading, setLoading] = useState(true);

    // Nickname State
    const [nickname, setNickname] = useState('');
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempNickname, setTempNickname] = useState('');

    // Protected Route Check
    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    // Fetch Data on Load
    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Get Profile (XP, Level, Username)
                let { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (profileError && profileError.code === 'PGRST116') {
                    // Profile doesn't exist yet, create one
                    const { data: newProfile, error: createError } = await supabase
                        .from('profiles')
                        .insert([{ id: user.id, xp: 0, level: 1 }])
                        .select()
                        .single();
                    if (!createError) profile = newProfile;
                }

                if (profile) {
                    setXp(profile.xp);
                    setLevel(profile.level);
                    setNickname(profile.username || '');
                }

                // 2. Get Habits (and auto-create defaults if missing via RPC)
                const { data: habitsData, error: habitsError } = await supabase
                    .rpc('initialize_user_habits', { target_user_id: user.id });

                if (habitsError) throw habitsError;

                if (habitsData) {
                    setHabits(habitsData);
                }

            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user?.id]);


    const toggleHabit = async (habitId, currentCompleted, reward) => {
        try {
            // Optimistic UI Update first
            const newCompleted = !currentCompleted;
            setHabits(habits.map(h => h.id === habitId ? { ...h, completed: newCompleted } : h));

            // Calculate new XP
            let newXp = newCompleted ? xp + reward : xp - reward;
            if (newXp < 0) newXp = 0;
            setXp(newXp);

            // Update DB: Habits
            await supabase.from('habits').update({ completed: newCompleted }).eq('id', habitId);

            // Update DB: Profile XP
            await supabase.from('profiles').update({ xp: newXp }).eq('id', user.id);

            // Check Evolution
            if (newCompleted && newXp >= 100) {
                setTimeout(() => navigate('/evolution'), 1000);
            }

        } catch (error) {
            console.error("Error toggling habit:", error);
            // Revert on error (optional implementation)
        }
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    const handleSaveNickname = async () => {
        if (!tempNickname.trim()) {
            setIsEditingName(false);
            return;
        }

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ username: tempNickname })
                .eq('id', user.id);

            if (error) throw error;

            setNickname(tempNickname);
            setIsEditingName(false);
        } catch (error) {
            console.error('Error saving nickname:', error);
            alert('Failed to save nickname. Please try again.');
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">Loading your monster...</div>;

    return (
        <div className="p-6 lg:p-12">
            <header className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--text-main)] mb-1 font-heading">{t.friends}</h1>
                    <p className="text-gray-500">{t.monsterWaiting}</p>
                </div>
                <div className="flex items-center gap-4">
                    {/* Mobile/Simple Language Toggle */}
                    <button onClick={toggleLanguage} className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
                        <Globe size={20} />
                    </button>

                    <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex-none"></div>

                        {isEditingName ? (
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={tempNickname}
                                    onChange={(e) => setTempNickname(e.target.value)}
                                    className="border-b border-purple-500 outline-none w-32 text-sm font-semibold bg-transparent"
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveNickname()}
                                />
                                <button onClick={handleSaveNickname} className="text-green-500 hover:text-green-600">
                                    <Check size={16} />
                                </button>
                                <button onClick={() => setIsEditingName(false)} className="text-red-400 hover:text-red-500">
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 group">
                                <span className="font-semibold text-sm truncate max-w-[150px]" title={user?.email}>
                                    {nickname || user?.email?.split('@')[0] || t.profile}
                                </span>
                                <button
                                    onClick={() => {
                                        setTempNickname(nickname || user?.email?.split('@')[0] || '');
                                        setIsEditingName(true);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-purple-500"
                                >
                                    <Edit2 size={14} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Center Column: Monster & Quest */}
                <div className="lg:col-span-2 space-y-8">

                    {/* My Monster Card */}
                    <motion.div
                        className="card relative overflow-hidden bg-gradient-to-br from-[#e0c3fc] to-[#8ec5fc] border-none text-white min-h-[300px] flex flex-col items-center justify-center p-8"
                        whileHover={{ scale: 1.01 }}
                    >
                        {/* Background Sparkles */}
                        <div className="absolute top-0 left-0 w-full h-full opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>

                        {/* Monster Avatar (CSS Blob) */}
                        <motion.div
                            className="w-40 h-40 bg-gradient-to-tr from-[#42f05f] to-[#f49d25] rounded-[40%_60%_70%_30%/40%_50%_60%_50%] shadow-2xl relative z-10 mb-8 border-4 border-white/50"
                            animate={{
                                borderRadius: ["60% 40% 30% 70%/60% 30% 70% 40%", "30% 60% 70% 40%/50% 60% 30% 60%", "60% 40% 30% 70%/60% 30% 70% 40%"],
                                y: [0, -10, 0]
                            }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        >
                            {/* Face */}
                            <div className="absolute top-1/3 left-1/4 w-3 h-3 bg-black rounded-full animate-blink"></div>
                            <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-black rounded-full animate-blink"></div>
                            <div className="absolute bottom-1/3 left-1/3 w-8 h-4 border-b-4 border-black/50 rounded-full"></div>
                        </motion.div>

                        {/* Stats & XP */}
                        <div className="w-full max-w-sm relative z-10">
                            <div className="flex justify-between text-sm font-bold mb-2 text-white drop-shadow-md">
                                <span>{t.monsterName} (Lvl {level})</span>
                                <span>{xp}/100 XP</span>
                            </div>
                            <div className="h-6 bg-black/20 rounded-full backdrop-blur-sm p-1">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-[#42f05f] to-[#2ecc71] rounded-full shadow-[0_0_10px_rgba(66,240,95,0.8)]"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(xp, 100)}%` }}
                                    transition={{ type: "spring", stiffness: 50 }}
                                />
                            </div>
                            {xp >= 100 && (
                                <motion.div
                                    className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#f49d25] text-white font-bold px-4 py-1 rounded-full shadow-lg whitespace-nowrap"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                >
                                    {t.readyToEvolve}
                                </motion.div>
                            )}
                        </div>
                    </motion.div>

                    {/* Daily Quests */}
                    <div>
                        <h2 className="text-xl font-heading font-bold mb-4 flex items-center gap-2">
                            <Flame className="text-[#f49d25]" /> {t.dailyQuests}
                        </h2>
                        <div className="space-y-3">
                            {habits.map((habit) => (
                                <motion.div
                                    key={habit.id}
                                    layout
                                    className={`nav-item p-4 rounded-2xl flex items-center justify-between cursor-pointer border-2 transition-all ${habit.completed ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-transparent hover:border-[#42f05f] shadow-sm'}`}
                                    onClick={() => toggleHabit(habit.id, habit.completed, habit.xp_reward)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${habit.completed ? 'bg-[#2ecc71] text-white' : 'bg-gray-100 text-gray-300'}`}>
                                            {habit.completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                                        </div>
                                        <span className={`font-semibold ${habit.completed ? 'line-through text-gray-400' : 'text-[#1f2937]'}`}>
                                            {/* Use translation if key exists, else raw title for user entered habits */}
                                            {language === "ko" && t[habit.title] ? t[habit.title] : habit.title}
                                        </span>
                                    </div>
                                    <span className="text-sm font-bold text-[#8c36e2] bg-purple-50 px-3 py-1 rounded-full">+{habit.xp_reward} XP</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Right Panel: Shop & Leaderboard */}
                <div className="space-y-6">
                    <div className="card">
                        <h3 className="font-bold mb-4">{t.leaderboard} 🏆</h3>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                                        <div>
                                            <div className="font-bold text-sm">Player {i}</div>
                                            <div className="text-xs text-gray-400">Lvl {10 - i}</div>
                                        </div>
                                    </div>
                                    <span className="font-bold text-[#f49d25]">#{i}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card bg-[#1f2937] text-white">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <ShoppingBag size={18} /> {t.mysteryShop}
                        </h3>
                        <div className="aspect-square bg-gray-600/30 rounded-xl mb-4 flex items-center justify-center text-4xl">
                            🎁
                        </div>
                        <button className="w-full py-2 bg-[#8c36e2] rounded-lg font-bold text-sm hover:bg-[#7b2fc7] transition-colors">
                            {t.openBox}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Friends;
