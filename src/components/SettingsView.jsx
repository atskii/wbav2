import { useState } from "react";
import { ChevronUp, ChevronDown, Check, RotateCcw, Settings } from "lucide-react";
import { supabase } from "../lib/supabase";

// ═══════════════════════════════════════════════════
//  SETTINGS VIEW
// ═══════════════════════════════════════════════════
export default function SettingsView({ user, setUser, add }) {

  const OPTS = ["Wyjście na słońce", "Kilka minut przerwy", "Dobra kawa", "Krótki spacer", "Rozmowa z bliskim", "Mała przekąska", "Przerwa od pracy", "Muzyka", "Zmiana otoczenia"];
  const [hours, setHours] = useState(user?.prefs?.hours || 8);
  const [startHour, setStartHour] = useState(user?.prefs?.startTime ? user.prefs.startTime.split(':')[0] : "08");
  const [startMinute, setStartMinute] = useState(user?.prefs?.startTime ? user.prefs.startTime.split(':')[1] : "00");
  const [picks, setPicks] = useState(user?.prefs?.picks || []);
  const [isSaving, setIsSaving] = useState(false);
  const toggle = b => setPicks(p => p.includes(b) ? p.filter(x => x !== b) : [...p, b]);
  const handleHourChange = (delta) => { let newH = parseInt(startHour, 10) + delta; if (isNaN(newH)) newH = 8 + delta; if (newH < 0) newH = 23; if (newH > 23) newH = 0; setStartHour(String(newH).padStart(2, "0")); };
  const handleMinuteChange = (delta) => { let newM = parseInt(startMinute, 10) + delta; if (isNaN(newM)) newM = delta; if (newM < 0) newM = 59; if (newM > 59) newM = 0; setStartMinute(String(newM).padStart(2, "0")); };
  const handleHourInputBlur = () => { let val = parseInt(startHour, 10); if (isNaN(val)) val = 8; if (val < 0) val = 0; if (val > 23) val = 23; setStartHour(String(val).padStart(2, "0")); };
  const handleMinuteInputBlur = () => { let val = parseInt(startMinute, 10); if (isNaN(val)) val = 0; if (val < 0) val = 0; if (val > 59) val = 59; setStartMinute(String(val).padStart(2, "0")); };
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const prefs = { hours, startTime: `${startHour}:${startMinute}`, picks };
      const { error } = await supabase.from('profiles').update({ prefs }).eq('email', user.email);
      if (error) throw error;
      setUser({ ...user, prefs });
      add("Ustawienia zostały zaktualizowane!");
    } catch (err) {
      console.error(err);
      add("Błąd podczas zapisywania ustawień.", "warn");
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <div className="h-full w-full overflow-y-auto">
      <div className="font-dm-sans p-6 md:p-10 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-[#E8DDD0]"><Settings size={24} className="text-[#1E5C36]" /></div>
        <div><h1 className="font-lora text-3xl font-bold text-[#1A2F22]">Ustawienia</h1><p className="text-[#5A7368]">Dostosuj aplikację do swojego rytmu dnia</p></div>
      </div>
      <div className="bg-white rounded-3xl shadow-sm border border-[#E8DDD0] overflow-hidden">
        <div className="p-6 md:p-8 border-b border-[#E8DDD0] flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-[#FAFAFA] transition-colors">
          <div><h3 className="text-lg font-bold text-[#1A2F22] mb-1">Czas pracy</h3><p className="text-sm text-[#5A7368]">Ile godzin dziennie zazwyczaj pracujesz?</p></div>
          <div className="flex items-center gap-4 bg-[#F5EFE6] p-2 rounded-2xl w-fit">
            <button onClick={() => setHours(h => Math.max(1, h - 1))} className="w-10 h-10 rounded-xl bg-white border border-[#E8DDD0] flex items-center justify-center text-lg font-bold text-[#5A7368] hover:border-[#1E5C36] hover:text-[#1E5C36] transition-all shadow-sm">−</button>
            <span className="text-2xl font-bold text-[#1A2F22] w-12 text-center">{hours}</span>
            <button onClick={() => setHours(h => Math.min(24, h + 1))} className="w-10 h-10 rounded-xl bg-white border border-[#E8DDD0] flex items-center justify-center text-lg font-bold text-[#5A7368] hover:border-[#1E5C36] hover:text-[#1E5C36] transition-all shadow-sm">+</button>
          </div>
        </div>
        <div className="p-6 md:p-8 border-b border-[#E8DDD0] flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-[#FAFAFA] transition-colors">
          <div><h3 className="text-lg font-bold text-[#1A2F22] mb-1">Początek dnia</h3><p className="text-sm text-[#5A7368]">Od której godziny chcesz rozpoczynać zadania?</p></div>
          <div className="flex items-center gap-2 bg-[#F5EFE6] p-2 rounded-2xl w-fit">
            <div className="flex flex-col items-center bg-white p-2 rounded-xl border border-[#E8DDD0] shadow-sm">
              <button onClick={() => handleHourChange(-1)} className="p-1 text-[#5A7368] hover:text-[#1E5C36] transition-colors"><ChevronUp size={20} strokeWidth={3} /></button>
              <input type="text" value={startHour} onChange={e => setStartHour(e.target.value.replace(/\D/g, ''))} onBlur={handleHourInputBlur} className="w-12 text-center text-2xl font-bold text-[#1A2F22] bg-transparent outline-none focus:text-[#2D9E6B] transition-colors" maxLength={2} />
              <button onClick={() => handleHourChange(1)} className="p-1 text-[#5A7368] hover:text-[#1E5C36] transition-colors"><ChevronDown size={20} strokeWidth={3} /></button>
            </div>
            <div className="text-2xl font-bold text-[#1A2F22] pb-1">:</div>
            <div className="flex flex-col items-center bg-white p-2 rounded-xl border border-[#E8DDD0] shadow-sm">
              <button onClick={() => handleMinuteChange(1)} className="p-1 text-[#5A7368] hover:text-[#1E5C36] transition-colors"><ChevronUp size={20} strokeWidth={3} /></button>
              <input type="text" value={startMinute} onChange={e => setStartMinute(e.target.value.replace(/\D/g, ''))} onBlur={handleMinuteInputBlur} className="w-12 text-center text-2xl font-bold text-[#1A2F22] bg-transparent outline-none focus:text-[#2D9E6B] transition-colors" maxLength={2} />
              <button onClick={() => handleMinuteChange(-1)} className="p-1 text-[#5A7368] hover:text-[#1E5C36] transition-colors"><ChevronDown size={20} strokeWidth={3} /></button>
            </div>
          </div>
        </div>
        <div className="p-6 md:p-8 hover:bg-[#FAFAFA] transition-colors">
          <div className="mb-4"><h3 className="text-lg font-bold text-[#1A2F22] mb-1">Poprawiacze nastroju</h3><p className="text-sm text-[#5A7368]">Co najszybciej poprawia Ci nastrój podczas kryzysu?</p></div>
          <div className="flex flex-wrap gap-2 mt-4">
            {OPTS.map(b => (
              <label key={b} className={`flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer transition-all text-sm font-medium ${picks.includes(b) ? "bg-[#E8F4ED] border border-[#2D9E6B] text-[#1E5C36] shadow-sm" : "bg-[#F5EFE6] border border-transparent text-[#5A7368] hover:border-[#E8DDD0]"}`}>
                <input type="checkbox" checked={picks.includes(b)} onChange={() => toggle(b)} className="hidden" />
                {picks.includes(b) && <Check size={14} />}
                <span>{b}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-8 flex justify-end">
        <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-8 py-3 bg-[#1E5C36] text-white rounded-2xl font-bold hover:bg-[#164a2c] transition-all shadow-lg hover:shadow-xl disabled:opacity-70">
          {isSaving ? <RotateCcw size={18} className="animate-spin" /> : <Check size={18} />}
          Zapisz ustawienia
        </button>
      </div>
      </div>
    </div>
  );
}
