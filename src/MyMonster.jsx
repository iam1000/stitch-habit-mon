import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    User,
    Edit2,
    Camera,
    Share2,
    Save,
    X,
    ShoppingBag
} from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { useAuth } from './AuthContext';
import { supabase } from './supabaseClient';

const MyMonster = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [username, setUsername] = useState("");

    // Inventory State
    const [inventory, setInventory] = useState([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Fetch Profile and Inventory
    useEffect(() => {
        if (!user) return;

        const getData = async () => {
            try {
                // 1. Profile
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (profileData) {
                    setProfile(profileData);
                    setUsername(profileData.username || user.email.split('@')[0]);
                }

                // 2. Inventory (with Item details)
                const { data: invData, error } = await supabase
                    .from('user_inventory')
                    .select(`
                        *,
                        items (*)
                    `)
                    .eq('user_id', user.id);

                if (invData) {
                    setInventory(invData);
                }

            } catch (error) {
                console.error("Error loading data", error);
            } finally {
                setLoading(false);
            }
        };

        getData();
    }, [user, refreshTrigger]);

    const handleEquip = async (item) => {
        try {
            // Optimistic Update
            // If already equipped, we toggle off (Unequip)
            // If not equipped, we toggle on (Equip) - but need to handle one-per-type logic visually?
            // Let's rely on backend for single-type enforcement, but frontend needs to reflect it.

            const isEquipping = !item.equipped;
            const rpcName = isEquipping ? 'equip_item' : 'unequip_item';

            const { data, error } = await supabase.rpc(rpcName, { item_id_input: item.items.id });

            if (error) throw error;

            // Trigger refetch to get clean state (simplest for now)
            setRefreshTrigger(prev => prev + 1);

        } catch (error) {
            console.error("Equip error", error);
            alert("Failed to change equipment");
        }
    };

    const handleSave = async () => {
        if (!username.trim()) return;

        try {
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    username: username
                });

            if (error) throw error;

            setProfile(prev => ({ ...prev, username }));
            setIsEditing(false);
            alert("Profile updated!");
        } catch (error) {
            alert(`Error updating profile: ${error.message}`);
            console.error(error);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading Monster...</div>;

    // Derived Stats
    const level = profile?.level || 1;
    const stats = [
        { label: "Health", value: 100 + (level * 10), max: 200, color: "bg-red-400" },
        { label: "Happiness", value: 80 + (level * 2), max: 100, color: "bg-yellow-400" },
        { label: "Strength", value: 20 + (level * 5), max: 100, color: "bg-blue-400" },
        { label: "Intellect", value: 10 + (level * 3), max: 100, color: "bg-purple-400" },
    ];

    // Check equipped items for visual rendering
    const equippedItems = inventory.filter(i => i.equipped);
    const hasFireAura = equippedItems.some(i => i.items.name === 'Fire Aura');
    const hasShades = equippedItems.some(i => i.items.name === 'Cool Shades');
    const hasHat = equippedItems.some(i => i.items.name === 'Wizard Hat');
    const hasCrown = equippedItems.some(i => i.items.name === 'Golden Crown');
    const hasPetRock = equippedItems.some(i => i.items.name === 'Pet Rock');

    return (
        <div className="font-body pb-12">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-20 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-[800] text-[var(--text-main)] flex items-center gap-2 font-heading">
                        <User className="text-[#8c36e2]" />
                        {t.myMonster}
                    </h1>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8">

                {/* Monster Profile Card */}
                <div className="card bg-white mb-8 flex flex-col items-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-[#42f05f] to-[#2ecc71]"></div>

                    {/* Avatar Circle */}
                    <div className="w-32 h-32 rounded-full bg-white p-1 relative z-10 -mt-8 mb-4 shadow-lg group">
                        <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center overflow-visible relative">
                            {/* Visual Effects: Aura */}
                            {hasFireAura && (
                                <motion.div
                                    className="absolute -inset-4 border-4 border-orange-400 rounded-full opacity-60 z-0"
                                    animate={{ scale: [1, 1.2], opacity: [0.6, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                />
                            )}

                            {/* CSS Monster Headshot */}
                            <div className="w-20 h-20 bg-gradient-to-br from-[#42f05f] to-[#f49d25] rounded-[40%_60%_70%_30%/40%_50%_60%_50%] relative z-10 shadow-inner">
                                {/* Face */}
                                <div className="absolute top-1/3 left-1/4 w-2 h-2 bg-black rounded-full"></div>
                                <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-black rounded-full"></div>

                                {/* Accessories */}
                                {hasShades && (
                                    <div className="absolute top-[30%] left-[15%] w-[70%] h-4 bg-black rounded-sm flex items-center justify-between px-1">
                                        <div className="w-1/2 h-full border-r border-gray-800"></div>
                                    </div>
                                )}
                                {hasHat && (
                                    <div className="absolute -top-8 left-0 w-full flex justify-center">
                                        <div className="w-0 h-0 border-l-[30px] border-l-transparent border-r-[30px] border-r-transparent border-b-[50px] border-b-purple-600"></div>
                                    </div>
                                )}
                                {hasCrown && (
                                    <div className="absolute -top-6 left-1/4 text-2xl">👑</div>
                                )}
                            </div>

                            {/* Pet */}
                            {hasPetRock && (
                                <div className="absolute -bottom-2 -right-6 text-2xl animate-bounce">🪨</div>
                            )}

                        </div>
                    </div>

                    {/* Editable Username */}
                    <div className="flex flex-col items-center mb-6">
                        {isEditing ? (
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="text-2xl font-[800] text-center bg-gray-50 border-b-2 border-[#8c36e2] focus:outline-none px-2 py-1 rounded w-48 font-heading text-[var(--text-main)]"
                                    autoFocus
                                />
                                <button onClick={handleSave} className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600">
                                    <Save size={16} />
                                </button>
                                <button onClick={() => { setIsEditing(false); setUsername(profile.username || user.email.split('@')[0]); }} className="p-2 bg-gray-300 text-gray-700 rounded-full hover:bg-gray-400">
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <h2 className="text-2xl font-[800] text-[var(--text-main)] font-heading flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditing(true)}>
                                {profile?.username || "Unnamed Monster"}
                                <Edit2 size={16} className="text-gray-400 group-hover:text-[#8c36e2] transition-colors" />
                            </h2>
                        )}
                        <span className="text-sm bg-gray-100 text-gray-500 px-2 py-1 rounded-md font-body mt-2">
                            Level {level}
                        </span>
                    </div>

                    {/* Stats Grid */}
                    <div className="w-full max-w-lg grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="bg-gray-50 p-4 rounded-xl">
                                <div className="flex justify-between text-sm mb-2 font-bold text-gray-600">
                                    <span>{stat.label}</span>
                                    <span>{stat.value}/{stat.max}</span>
                                </div>
                                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${stat.color} transition-all duration-1000`}
                                        style={{ width: `${(stat.value / stat.max) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Inventory Section */}
                <div className="mt-8">
                    <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <ShoppingBag size={20} />
                        Inventory
                    </h3>

                    {inventory.length === 0 ? (
                        <div className="bg-white p-8 rounded-2xl text-center text-gray-400 border border-dashed border-gray-200">
                            No items yet. Go to the Shop to buy some!
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                            {inventory.map((invItem) => (
                                <div
                                    key={invItem.id}
                                    className={`
                                        bg-white p-4 rounded-xl border-2 cursor-pointer transition-all relative overflow-hidden group
                                        ${invItem.equipped ? 'border-[#8c36e2] ring-2 ring-[#8c36e2] ring-opacity-20' : 'border-gray-100 hover:border-gray-300'}
                                    `}
                                    onClick={() => handleEquip(invItem)}
                                >
                                    {invItem.equipped && (
                                        <div className="absolute top-2 right-2 bg-[#8c36e2] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                                            EQUIPPED
                                        </div>
                                    )}
                                    <div className="text-4xl text-center mb-2">{invItem.items.icon}</div>
                                    <div className="text-center">
                                        <p className="font-bold text-gray-700 text-sm truncate">{invItem.items.name}</p>
                                        <p className="text-xs text-gray-400 capitalize">{invItem.items.type}</p>
                                    </div>

                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-white font-bold text-sm">
                                            {invItem.equipped ? 'Unequip' : 'Equip'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
};

export default MyMonster;
