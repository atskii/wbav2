import { useState } from "react";
import { X, ChevronDown, Clock } from "lucide-react";
import { EMOJIS, MOOD_L } from "../lib/constants";

export default function MoodModal({ onClose, onAdd, defaultNote = "", forced = false }) {
  const [sel, setSel] = useState(3); // <--- Zmiana domyślnego indeksu na 3
  const [note, setNote] = useState(defaultNote);
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const timeStr = today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-[#1A2F22]/60 backdrop-blur-sm p-4" onClick={!forced ? onClose : undefined}>
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md border border-white/20 animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-[#1A2F22] text-xl">Zarejestruj swój nastrój</h3>
          {!forced && <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-all"><X size={20} className="text-[#9FB5AD]" /></button>}
        </div>

        <p className="text-sm font-bold text-[#1A2F22] mb-3">Jak się czujesz?</p>

        <div className="flex gap-3 mb-6">
          <div className="flex-1 opacity-50 cursor-not-allowed" title="Opcja zablokowana w tej wersji">
            <p className="text-[10px] font-bold text-[#5A7368] uppercase tracking-widest mb-1">W tym momencie</p>
            <div className="px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-sm flex justify-between items-center text-gray-500">
              Dzisiaj <ChevronDown size={14} />
            </div>
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold text-[#5A7368] uppercase tracking-widest mb-1">Godzina</p>
            <div className="px-4 py-3 bg-[#F5EFE6] border border-[#E8DDD0] rounded-xl text-sm font-bold text-[#1E5C36] flex items-center gap-2">
              <Clock size={14} /> {timeStr}
            </div>
          </div>
        </div>

        <p className="text-[10px] font-bold text-[#5A7368] uppercase tracking-widest mb-3">Twój nastrój</p>
        <div className="flex justify-between mb-2">
          {EMOJIS.map((e, i) => (
            <button key={i} onClick={() => setSel(i)} className={`w-12 h-12 text-2xl rounded-2xl transition-all duration-150 ${sel === i ? "ring-2 ring-[#1E5C36] bg-[#E8F4ED] scale-110 shadow-md" : "hover:bg-[#F5EFE6] hover:scale-105"}`}>{e}</button>
          ))}
        </div>
        <p className="text-center text-xs font-bold text-[#1E5C36] mb-6">{MOOD_L[sel]}</p>

        <p className="text-[10px] font-bold text-[#5A7368] uppercase tracking-widest mb-2">Notatka z dnia (opcjonalnie)</p>
        <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Zapisz, co wpłynęło na Twój nastrój (np. ciężki wykład, sukces)..." rows={2} className="w-full px-4 py-3 rounded-xl border border-[#E8DDD0] text-sm focus:outline-none focus:border-[#2D9E6B] bg-white resize-none mb-6 text-[#1A2F22] leading-relaxed" />

        <button onClick={() => { onAdd({ id: Date.now(), d: dateStr, v: sel, note }); if (!forced) onClose(); }} className="w-full py-4 bg-[#1E5C36] text-white rounded-2xl font-bold text-sm hover:bg-[#164a2c] transition-all shadow-xl shadow-green-900/20 active:scale-[0.98]">
          Zapisz i kontynuuj
        </button>
      </div>
    </div>
  );
}
