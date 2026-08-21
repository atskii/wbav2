import { useState } from "react";
import { ChevronUp, ChevronDown, Check, RotateCcw, Settings, Trash2, Calendar, RefreshCw, HelpCircle } from "lucide-react";
import { supabase } from "../lib/supabase";
import { fetchGoogleCalendarEvents, mapGoogleEventsToTasks } from "../lib/googleCalendar";
import { APP_FAQS } from "../lib/constants";

// ═══════════════════════════════════════════════════
//  SETTINGS VIEW
// ═══════════════════════════════════════════════════
export default function SettingsView({ user, setUser, add }) {

  const OPTS = ["Wyjście na słońce", "Dobra kawa", "Dobra herbata", "Krótki spacer", "Rozmowa z bliskim", "Mała przekąska", "Muzyka", "Zmiana otoczenia", "Ćwiczenia oddechowe"];
  const [name, setName] = useState(user?.name || "");
  const [hours, setHours] = useState(user?.prefs?.hours || 8);
  const [startHour, setStartHour] = useState(user?.prefs?.startTime ? user.prefs.startTime.split(':')[0] : "08");
  const [startMinute, setStartMinute] = useState(user?.prefs?.startTime ? user.prefs.startTime.split(':')[1] : "00");
  const [picks, setPicks] = useState(user?.prefs?.picks || []);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isFaqSectionOpen, setIsFaqSectionOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const toggle = b => setPicks(p => p.includes(b) ? p.filter(x => x !== b) : [...p, b]);
  const handleHourChange = (delta) => { let newH = parseInt(startHour, 10) + delta; if (isNaN(newH)) newH = 8 + delta; if (newH < 0) newH = 23; if (newH > 23) newH = 0; setStartHour(String(newH).padStart(2, "0")); };
  const handleMinuteChange = (delta) => { let newM = parseInt(startMinute, 10) + delta; if (isNaN(newM)) newM = delta; if (newM < 0) newM = 59; if (newM > 59) newM = 0; setStartMinute(String(newM).padStart(2, "0")); };
  const handleHourInputBlur = () => { let val = parseInt(startHour, 10); if (isNaN(val)) val = 8; if (val < 0) val = 0; if (val > 23) val = 23; setStartHour(String(val).padStart(2, "0")); };
  const handleMinuteInputBlur = () => { let val = parseInt(startMinute, 10); if (isNaN(val)) val = 0; if (val < 0) val = 0; if (val > 59) val = 59; setStartMinute(String(val).padStart(2, "0")); };

  const handleGoogleSync = () => {
    if (typeof google === 'undefined' || !google.accounts) {
      add("Biblioteka Google API nie jest jeszcze załadowana. Odśwież stronę.", "warn");
      return;
    }
    
    setIsSyncing(true);
    const client = google.accounts.oauth2.initTokenClient({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/calendar.events.readonly',
      callback: async (tokenResponse) => {
        if (tokenResponse && tokenResponse.access_token) {
          try {
            const events = await fetchGoogleCalendarEvents(tokenResponse.access_token);
            const mappedTasks = mapGoogleEventsToTasks(events);
            
            const { data: existing } = await supabase.from('tasks').select('desc').eq('user_email', user.email).like('desc', '%[GCal:%');
            const existingIds = (existing || []).map(t => {
                const m = t.desc ? t.desc.match(/\[GCal:(.+?)\]/) : null;
                return m ? m[1] : null;
            }).filter(Boolean);

            const newTasks = mappedTasks.filter(t => {
                const m = t.desc.match(/\[GCal:(.+?)\]/);
                const gid = m ? m[1] : null;
                return !existingIds.includes(gid);
            }).map(t => ({...t, user_email: user.email}));

            if (newTasks.length > 0) {
                const { error } = await supabase.from('tasks').insert(newTasks);
                if (error) throw error;
                add(`Zsynchronizowano ${newTasks.length} nowych wydarzeń!`);
                setTimeout(() => window.location.reload(), 1500);
            } else {
                add(`Wszystkie wydarzenia są już zsynchronizowane. Brak nowych.`, "info");
            }
          } catch(e) {
            console.error("GCal Sync Error:", e);
            add("Błąd podczas synchronizacji Kalendarza Google.", "warn");
          }
        }
        setIsSyncing(false);
      },
      error_callback: () => { 
        setIsSyncing(false); 
        add("Anulowano lub błąd logowania Google.", "warn"); 
      }
    });
    client.requestAccessToken();
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const prefs = { name: name.trim(), hours, startTime: `${startHour}:${startMinute}`, picks };
      const { error } = await supabase.from('profiles').update({ prefs }).eq('email', user.email);
      if (error) throw error;
      setUser({ ...user, name: name.trim(), prefs });
      add("Ustawienia zostały zaktualizowane!");
    } catch (err) {
      console.error(err);
      add("Błąd podczas zapisywania ustawień.", "warn");
    } finally {
      setIsSaving(false);
    }
  };

  const [isDeleting, setIsDeleting] = useState(false);
  const handleDeleteAccount = async () => {
    if (!window.confirm("Czy na pewno chcesz trwale usunąć swoje konto i wszystkie dane? Tej operacji NIE można cofnąć!")) {
      return;
    }
    setIsDeleting(true);
    try {
      await supabase.from('tasks').delete().eq('user_email', user.email);
      await supabase.from('moods').delete().eq('user_email', user.email);
      await supabase.from('profiles').delete().eq('email', user.email);
      await supabase.auth.signOut();
      localStorage.removeItem("wba_user");
      setUser(null);
      // App.jsx will handle redirect to landing view when user is null
    } catch (err) {
      console.error(err);
      add("Błąd podczas usuwania konta.", "warn");
      setIsDeleting(false);
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
          <div className="flex-1">
            <h3 className="text-lg font-bold text-[#1A2F22] mb-1">Nazwa użytkownika</h3>
            <p className="text-sm text-[#5A7368]">Jak mamy się do Ciebie zwracać w aplikacji?</p>
          </div>
          <div className="w-full md:w-64">
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Twoje imię lub pseudonim"
              className="w-full px-4 py-2.5 border border-[#E8DDD0] rounded-xl focus:outline-none focus:border-[#0E6630] text-sm font-semibold bg-white text-gray-800"
              required
            />
          </div>
        </div>
        <div className="p-6 md:p-8 border-b border-[#E8DDD0] flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-[#FAFAFA] transition-colors">
          <div><h3 className="text-lg font-bold text-[#1A2F22] mb-1">Czas pracy</h3><p className="text-sm text-[#5A7368]">Ile godzin dziennie chcesz poświęcić na realizacje swoich zadań?</p></div>
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

        <div className="p-6 md:p-8 hover:bg-[#FAFAFA] transition-colors border-t border-[#E8DDD0]">
          <div className="mb-4 flex items-start gap-4 justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#1A2F22] mb-1 flex items-center gap-2">
                <Calendar size={20} className="text-[#2D9E6B]" />
                Integracja z Google
              </h3>
              <p className="text-sm text-[#5A7368]">
                Połącz swój Kalendarz Google, aby automatycznie zaimportować nadchodzące spotkania jako zablokowane zadania.
              </p>
            </div>
            <button 
              onClick={handleGoogleSync} 
              disabled={isSyncing}
              className="whitespace-nowrap px-4 py-2.5 bg-white border border-[#2D9E6B] text-[#1E5C36] rounded-xl font-semibold text-sm hover:bg-[#E8F4ED] transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              {isSyncing ? <RefreshCw size={16} className="animate-spin" /> : <Calendar size={16} />}
              {isSyncing ? "Pobieranie..." : "Synchronizuj Kalendarz"}
            </button>
          </div>
        </div>

      </div>

      <div className="mt-8 flex justify-end">
        <button onClick={handleSave} disabled={isSaving || isDeleting} className="flex items-center gap-2 px-8 py-3 bg-[#1E5C36] text-white rounded-2xl font-bold hover:bg-[#164a2c] transition-all shadow-lg hover:shadow-xl disabled:opacity-70">
          {isSaving ? <RotateCcw size={18} className="animate-spin" /> : <Check size={18} />}
          Zapisz ustawienia
        </button>
      </div>

      {/* FAQ Section */}
      <div className="mt-16 bg-white rounded-3xl shadow-sm border border-[#E8DDD0] overflow-hidden">
        <div 
          className="p-6 md:p-8 flex items-center justify-between cursor-pointer hover:bg-[#FAFAFA] transition-colors"
          onClick={() => setIsFaqSectionOpen(!isFaqSectionOpen)}
        >
          <div>
            <h3 className="text-xl font-bold text-[#1A2F22] mb-1 flex items-center gap-2">
              <HelpCircle size={22} className="text-[#2D9E6B]" />
              Często zadawane pytania (FAQ)
            </h3>
            <p className="text-sm text-[#5A7368]">Masz problem z obsługą? Sprawdź odpowiedzi na {APP_FAQS.length} najczęstszych pytań.</p>
          </div>
          <div className="bg-[#F5EFE6] p-2 rounded-xl text-[#5A7368]">
            {isFaqSectionOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </div>
        </div>
        
        {isFaqSectionOpen && (
          <div className="divide-y divide-[#E8DDD0] border-t border-[#E8DDD0] animate-in slide-in-from-top-4 duration-300">
            {APP_FAQS.map((faq, i) => (
              <div key={i} className="p-6 md:p-8 hover:bg-[#FAFAFA] transition-colors cursor-pointer" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[#1A2F22]">{faq.q}</h4>
                  {openFaq === i ? <ChevronUp size={18} className="text-[#2D9E6B]" /> : <ChevronDown size={18} className="text-[#9FB5AD]" />}
                </div>
                {openFaq === i && <p className="mt-4 text-sm text-[#5A7368] leading-relaxed animate-in fade-in slide-in-from-top-2">{faq.a}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="mt-16 bg-red-50/50 rounded-3xl border border-red-100 overflow-hidden">
        <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold text-red-700 mb-1 flex items-center gap-2">
              <Trash2 size={20} />
              Strefa niebezpieczna
            </h3>
            <p className="text-sm text-red-600/80">
              Trwałe usunięcie konta kasuje wszystkie zapisane zadania, nastroje i preferencje.
            </p>
          </div>
          <button 
            onClick={handleDeleteAccount} 
            disabled={isDeleting}
            className="whitespace-nowrap px-6 py-3 bg-white text-red-600 border border-red-200 rounded-2xl font-semibold text-sm hover:bg-red-50 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            {isDeleting ? "Usuwanie..." : "Usuń konto bezpowrotnie"}
          </button>
        </div>
      </div>

      </div>
    </div>
  );
}
