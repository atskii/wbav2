import {
  Home, Calendar, Smile, AlertTriangle, X,
  ChevronLeft, ChevronRight, Menu, Settings, LifeBuoy
} from "lucide-react";

// ═══════════════════════════════════════════════════
//  APP: SIDEBAR / LAYOUT
// ═══════════════════════════════════════════════════
export default function Sidebar({ active, onNav, user, onLogout, selectedDate, setSelectedDate, todayDate, activeAlert, onDismissAlert, isMobileOpen, setIsMobileOpen }) {


  // Logika generowania dni w mini-kalendarzu
  const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);

  // Obliczamy przesunięcie dla pierwszego dnia miesiąca (0 = Pon, 6 = Ndz)
  const firstDayIndex = (startOfMonth.getDay() + 6) % 7;
  // Tworzymy tablicę z pustymi elementami do wypełnienia luk w siatce
  const emptyDays = Array.from({ length: firstDayIndex }, (_, i) => i);

  const daysInMonth = [];
  for (let i = 1; i <= endOfMonth.getDate(); i++) {
    daysInMonth.push(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i));
  }

  const changeMonth = (offset) => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + offset, 1));
  };

  const navItems = [
    { id: "dashboard", icon: <Home size={16} />, label: "Strona główna" },
    { id: "calendar", icon: <Calendar size={16} />, label: "Kalendarz" },
    { id: "mood", icon: <Smile size={16} />, label: "Monitor nastroju" },
    { id: "warning", icon: <LifeBuoy size={16} />, label: "Pomoc" },
    { id: "settings", icon: <Settings size={16} />, label: "Ustawienia" },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/20 z-[60] md:hidden" onClick={() => setIsMobileOpen(false)} />
      )}
      
      <aside className={`
        fixed md:sticky top-0 left-0 z-[70] h-screen bg-white border-r border-[#E8DDD0] flex flex-col transition-transform duration-300
        ${isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0"}
        md:w-64 flex-shrink-0
      `}>
        <div className={`px-5 py-6 border-b border-[#E8DDD0] flex items-center justify-between`}>
          <span className={`font-lora text-[#1E5C36] font-bold text-xl tracking-tight inline`}>Wellbeing app</span>
          <button onClick={() => setIsMobileOpen(false)} className="p-1.5 hover:bg-[#F5EFE6] rounded-xl text-[#5A7368] transition-all md:hidden">
            <X size={20} />
          </button>
        </div>

      <nav className="px-3 py-3 space-y-1">
        {navItems.map(n => {
          const isWarning = n.id === "warning";
          const hasAlert = isWarning && activeAlert !== null;

          return (
            <div key={n.id} className="relative flex flex-col items-end">
              {hasAlert && (
                <div className="text-right mb-0.5 pr-2 w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <span className="text-[8px] font-bold text-[#A51A1A] tracking-[0.15em] uppercase">AKCJA WYMAGANA</span>
                </div>
              )}

              <button onClick={() => { if (hasAlert) onDismissAlert(); onNav(n.id); setIsMobileOpen && setIsMobileOpen(false); }} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-[13px] font-bold transition-all relative overflow-hidden ${active === n.id ? (hasAlert ? "bg-[#1e3a2b] text-white shadow-md" : "bg-[#1E5C36] text-white shadow-lg shadow-green-900/20") : (hasAlert ? "bg-[#1e3a2b] text-white shadow-md hover:bg-[#162c20]" : "text-[#5A7368] hover:bg-[#F5EFE6]")}`}>

                {hasAlert && (
                  <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#D32F2F]"></div>
                )}

                <span className={`flex-shrink-0 ${hasAlert ? "animate-ring text-white" : ""}`}>
                  {n.icon}
                </span>
                <span className="inline">{n.label}</span>
              </button>

              {hasAlert && (
                <div className="absolute top-full left-0 right-0 mt-2 z-[100] animate-in fade-in zoom-in-95 duration-300">
                  <div className="bg-[#fceeb5] p-4 rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.2)] mx-1 relative border border-[#E8DDD0]">
                    <button onClick={(e) => { e.stopPropagation(); onDismissAlert(); }} className="absolute top-2 right-2 text-[#1A432E] opacity-50 hover:opacity-100 transition-opacity p-1 bg-[#fceeb5] rounded-full hover:bg-yellow-200" title="Zamknij ostrzeżenie">
                      <X size={14} />
                    </button>
                    <h2 className="font-lora text-base font-bold text-[#1A432E] leading-tight mb-2 pr-6">Zauważyliśmy coś ważnego</h2>
                    <p className="text-[#1A432E] text-[11px] leading-relaxed mb-4">
                      {activeAlert.text}
                    </p>
                    <button onClick={() => { onDismissAlert(); onNav("warning"); }} className="text-[#1A432E] font-bold text-[11px] underline decoration-2 underline-offset-4 hover:opacity-80 transition-opacity text-left">
                      {activeAlert.btnText}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="flex-1" />

      {/* MINI KALENDARZ W LEWYM DOLNYM ROGU */}
      <div className={`px-3 py-5 border-t border-[#E8DDD0] bg-[#FAFAFA] block`}>
        <div className="flex items-center justify-center gap-2 mb-4">
          <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-[#E8DDD0] rounded-md transition-colors"><ChevronLeft size={12} className="text-[#1A2F22]" /></button>
          <span className="text-[9px] font-black uppercase tracking-widest text-[#1A2F22]">
            {selectedDate.toLocaleString('pl-PL', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={() => changeMonth(1)} className="p-1 hover:bg-[#E8DDD0] rounded-md transition-colors"><ChevronRight size={12} className="text-[#1A2F22]" /></button>
        </div>
        <div className="grid grid-cols-7 gap-0.5 text-center text-[8px] font-black text-[#9FB5AD] mb-2 uppercase tracking-tighter">
          {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'].map((d, i) => (
            <div key={i} className="whitespace-nowrap">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {/* Najpierw mapujemy puste divy, aby przesunąć pierwszy dzień pod właściwą literę */}
          {emptyDays.map((_, idx) => (
            <div key={`empty-${idx}`} className="aspect-square"></div>
          ))}

          {/* Następnie mapujemy właściwe dni */}
          {daysInMonth.map((date, idx) => {
            const isToday = date.toDateString() === todayDate.toDateString();
            const isSelected = date.toDateString() === selectedDate.toDateString();
            return (
              <button
                key={`day-${idx}`}
                onClick={() => { setSelectedDate(date); onNav("calendar"); }}
                className={`aspect-square flex items-center justify-center rounded-md text-[11px] font-bold transition-all ${isSelected ? "bg-[#1E5C36] text-white" : isToday ? "text-[#1E5C36] border border-[#1E5C36]" : "text-[#5A7368] hover:bg-[#E8DDD0]"}`}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Profil użytkownika przeniesiony do prawego górnego rogu aplikacji */}
      </aside>
    </>
  );
}
