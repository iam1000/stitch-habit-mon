import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ShoppingBag,
    Coins,
    Check
} from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { useAuth } from './AuthContext';
import { supabase } from './supabaseClient';

const Shop = () => {
    const { t } = useLanguage();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);
    const [coins, setCoins] = useState(0);
    const [inventory, setInventory] = useState(new Set());

    useEffect(() => {
        // If no user, stop loading
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                // 1. Get User Coins
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('coins')
                    .eq('id', user.id)
                    .single();

                if (profile) setCoins(profile.coins || 0);

                // 2. Get All Shop Items
                const { data: shopItems, error: itemsError } = await supabase
                    .from('items')
                    .select('*')
                    .order('price', { ascending: true });

                if (shopItems && shopItems.length > 0) {
                    setItems(shopItems);
                } else {
                    console.warn("Shop empty or error", itemsError);
                }

                // 3. Get User Inventory
                const { data: userInv } = await supabase
                    .from('user_inventory')
                    .select('item_id')
                    .eq('user_id', user.id);

                if (userInv) {
                    const ownedIds = new Set(userInv.map(i => i.item_id));
                    setInventory(ownedIds);
                }

            } catch (error) {
                console.error("Error loading shop:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const handleBuy = async (item) => {
        if (inventory.has(item.id)) return;
        if (coins < item.price) {
            alert("Not enough coins!");
            return;
        }

        const confirmBuy = window.confirm(`Buy ${item.name} for ${item.price} coins?`);
        if (!confirmBuy) return;

        try {
            const { data, error } = await supabase
                .rpc('purchase_item', { item_id_input: item.id });

            if (error) throw error;

            if (data.success) {
                // Update Local State directly for speed
                setCoins(data.new_balance);
                setInventory(prev => new Set(prev).add(item.id));
                alert("Purchase Successful! 🎉");
            } else {
                alert(`Purchase Failed: ${data.message}`);
            }

        } catch (error) {
            console.error("Purchase error:", error);
            alert("Transaction failed. Please try again.");
        }
    };

    if (loading) return <div className="p-12 text-center text-gray-500">Loading Shop...</div>;

    return (
        <div className="font-body pb-12">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-20 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-[800] text-[var(--text-main)] flex items-center gap-2 font-heading">
                        <ShoppingBag className="text-[#8c36e2]" />
                        {t.shop}
                    </h1>
                </div>

                <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-full border border-yellow-100">
                    <div className="w-6 h-6 bg-[#f49d25] rounded-full flex items-center justify-center text-white shadow-sm">
                        <Coins size={14} />
                    </div>
                    <span className="font-bold text-[#f49d25]">{coins.toLocaleString()}</span>
                </div>
            </header>

            {/* Shop Grid */}
            <main className="container mx-auto px-6 py-8">
                <h2 className="text-lg font-bold text-gray-700 mb-6">Daily Rotation</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {items.map((item) => {
                        const isOwned = inventory.has(item.id);
                        return (
                            <div
                                key={item.id}
                                className={`card relative p-0 overflow-hidden flex flex-col hover:-translate-y-1 transition-transform duration-200 ${isOwned ? 'opacity-80' : ''}`}
                            >
                                <div className="bg-gray-50 h-32 flex items-center justify-center text-5xl">
                                    {item.icon}
                                </div>
                                <div className="p-4 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider bg-gray-100 px-2 py-0.5 rounded">{item.type}</span>
                                            <h3 className="font-bold text-[var(--text-main)] mt-1">{item.name}</h3>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-4">
                                        {isOwned ? (
                                            <button disabled className="w-full py-2 bg-gray-100 text-gray-400 rounded-lg font-bold flex items-center justify-center gap-2 cursor-not-allowed">
                                                <Check size={16} /> Owned
                                            </button>
                                        ) : (
                                            <button onClick={() => handleBuy(item)} className="w-full py-2 bg-[#8c36e2] hover:bg-[#7b2fc7] text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-colors shadow-md">
                                                <Coins size={16} /> {item.price}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </main>
        </div>
    );
};

export default Shop;
