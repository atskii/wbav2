import React, { useState, useEffect } from 'react';
import { LogOut, Play, Trash2, Zap, Loader2 } from 'lucide-react';

export default function AdminPanel({ user, onLogout, addToast, supabase }) {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAccounts = async () => {
            setLoading(true);
            try {
                // Pobierz wszystkich użytkowników z tabeli profiles
                const { data, error } = await supabase.from('profiles').select('email');
                if (error) {
                    console.error('Błąd pobierania profili:', error);
                    addToast("Błąd pobierania listy użytkowników: " + error.message, "warn");
                } else if (data) {
                    // Filtruj konta admina z listy
                    setAccounts(data.map(p => p.email).filter(e => e && e !== user.email));
                }
            } catch (err) {
                console.error('Unexpected error:', err);
                addToast("Nieoczekiwany błąd przy pobieraniu użytkowników.", "warn");
            } finally {
                setLoading(false);
            }
        };
        fetchAccounts();
    }, [supabase, user.email]);

    const sendCommand = async (targetAccount, commandName, payload = null) => {
        const { error } = await supabase.from('remote_commands').insert({
            target_email: targetAccount,
            command_name: commandName,
            payload: payload
        });

        if (error) {
            addToast("Błąd wysyłania komendy: " + error.message, "warn");
        } else {
            addToast(`Wysłano: ${commandName} do ${targetAccount}`);
        }
    };

    return (
        <div className="min-h-screen bg-[#F5EFE6] p-10 font-sans">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-3xl shadow-xl border border-[#E8DDD0]">
                <div className="flex justify-between items-center mb-8 border-b pb-4">
                    <h1 className="text-3xl font-bold text-[#1A2F22]">Panel Sterowania Testami</h1>
                    <button onClick={onLogout} className="flex items-center gap-2 text-red-500 font-bold hover:bg-red-50 px-4 py-2 rounded-xl">
                        <LogOut size={20} /> Wyjdź
                    </button>
                </div>

                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-[#5A7368]">Zarejestrowani badani:</h2>

                    {loading ? (
                        <div className="flex items-center justify-center py-8 text-[#5A7368]">
                            <Loader2 size={24} className="animate-spin mr-2" />
                            <span>Ładowanie użytkowników...</span>
                        </div>
                    ) : accounts.length === 0 ? (
                        <p className="text-gray-400 italic">Brak innych użytkowników w bazie.</p>
                    ) : (
                        accounts.map(account => (
                            <div key={account} className="p-5 border border-[#E8DDD0] rounded-2xl bg-[#FAFAFA] flex flex-col gap-4">
                                <span className="font-bold text-lg text-[#1A2F22]">{account}</span>

                                <div className="flex flex-wrap gap-2">
                                    <button onClick={() => sendCommand(account, 'triggerScenario', 1)} className="flex items-center gap-1 bg-[#E8F4ED] text-[#1E5C36] px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#2D9E6B] hover:text-white transition-colors">
                                        <Play size={16} /> Scenariusz 1
                                    </button>
                                    <button onClick={() => sendCommand(account, 'triggerScenario', 4)} className="flex items-center gap-1 bg-[#E8F4ED] text-[#1E5C36] px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#2D9E6B] hover:text-white transition-colors">
                                        <Play size={16} /> Scenariusz 4
                                    </button>
                                    <button onClick={() => sendCommand(account, 'addRandomTasks')} className="flex items-center gap-1 bg-amber-50 text-amber-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-amber-500 hover:text-white transition-colors">
                                        <Zap size={16} /> Dodaj Tasks
                                    </button>
                                    <button onClick={() => sendCommand(account, 'generateFakeMoods')} className="flex items-center gap-1 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-500 hover:text-white transition-colors">
                                        <Zap size={16} /> Fake Moods
                                    </button>
                                    <button onClick={() => sendCommand(account, 'totalWipe')} className="flex items-center gap-1 bg-red-50 text-red-500 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-500 hover:text-white transition-colors ml-auto">
                                        <Trash2 size={16} /> Total Wipe
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
