import { useState } from "react";
import { X, HelpCircle } from "lucide-react";
import { PRIOS } from "../lib/constants";
import { useTutorials } from "../hooks/useTutorials";

// ═══════════════════════════════════════════════════
//  MODALS
// ═══════════════════════════════════════════════════
export default function TaskModal({ onClose, onSave, taskToEdit, userEmail }) {
  const [title, setTitle] = useState(taskToEdit?.title || "");
  const { isTooltipSeen, markTooltipSeen, resetTooltipGroup, loading } = useTutorials(userEmail);
  
  const showDurationTutorial = !loading && !isTooltipSeen('task_duration');
  const showDeadlineTutorial = !loading && !isTooltipSeen('task_deadline');
  const showDifficultyTutorial = !loading && !isTooltipSeen('task_difficulty');
  const showPriorityTutorial = !loading && !isTooltipSeen('task_priority');
  const showRecurrenceTutorial = !loading && !isTooltipSeen('task_recurrence');
  const showLockTutorial = !loading && !isTooltipSeen('task_lock');

  const handleResetTooltips = () => {
    resetTooltipGroup([
      'task_duration',
      'task_deadline',
      'task_difficulty',
      'task_priority',
      'task_recurrence',
      'task_lock'
    ]);
  };

  const [duration, setDuration] = useState(taskToEdit?.duration ? taskToEdit.duration.replace(" min", "") : "60");
  const [deadline, setDeadline] = useState(taskToEdit?.deadline ? taskToEdit.deadline.replace(" o ", "T") : "");
  const [difficulty, setDifficulty] = useState(taskToEdit?.difficulty || 3);
  const [p, setP] = useState(taskToEdit?.p || "niski");
  const [desc, setDesc] = useState(taskToEdit?.desc || "");

  const [isLocked, setIsLocked] = useState(taskToEdit?.isLocked || false);
  const [activePanel, setActivePanel] = useState(null);
  const [lockDateTime, setLockDateTime] = useState(taskToEdit?.lockDateTime || "");
  const [recurrence, setRecurrence] = useState(taskToEdit?.recurrence || "jednorazowo");
  const [recurrenceEnd, setRecurrenceEnd] = useState(taskToEdit?.recurrenceEnd || "");

  const isRecurrenceActive = isLocked && recurrence !== "jednorazowo";
  const isSingleLockActive = isLocked && recurrence === "jednorazowo";

  const submit = () => {
    if (!title) return;

    const weight = Math.min(10, Math.round((difficulty * 1.5) + (parseInt(duration || 0) / 60)));

    let timeString = "";
    if (isLocked && lockDateTime) {
      const d = new Date(lockDateTime);
      const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateStr = d.toLocaleDateString();
      timeString = `🔒 ${timeStr} (${dateStr})`;

      if (recurrence !== "jednorazowo") {
        if (recurrence === "co tydzień") {
          const dayOfWeek = d.getDay() === 0 ? 6 : d.getDay() - 1;
          const daysArr = ["pon", "wt", "śr", "czw", "pt", "sob", "ndz"];
          timeString += ` 🔁 co tydzień ${daysArr[dayOfWeek]}`;
        } else {
          timeString += ` 🔁 ${recurrence}`;
        }

        if (recurrenceEnd) {
          timeString += ` 🛑 do ${recurrenceEnd}`;
        }
      }
    }

    onSave({
      id: taskToEdit?.id,
      title,
      p,
      cat: "praca",
      w: weight,
      t: timeString,
      duration: duration ? `${duration} min` : "",
      deadline: deadline ? deadline.replace("T", " o ") : "",
      difficulty,
      desc,
      isLocked,
      lockDateTime, recurrence, recurrenceEnd
    });
  };

  return (
    <div className="fixed inset-0 z-[700] flex items-center justify-center bg-[#1A2F22]/40 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-[2rem] sm:rounded-[3rem] shadow-2xl p-5 sm:p-10 w-full max-w-lg border border-white/20 relative my-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <h3 className="text-2xl sm:text-3xl font-bold text-[#1A2F22]">{taskToEdit ? "Edytuj zadanie" : "Nowe zadanie"}</h3>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleResetTooltips}
              className="p-2 hover:bg-[#E8F4ED] rounded-full transition-all text-[#5A7368] hover:text-[#1E5C36]"
              title="Przywróć samouczki"
            >
              <HelpCircle size={24} className="sm:w-6 sm:h-6" />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-all"><X size={24} className="text-[#1A2F22] sm:w-7 sm:h-7" /></button>
          </div>
        </div>

        <div className="space-y-5 sm:space-y-6">
          <div>
            <label className="text-xs font-black uppercase text-[#5A7368] mb-2 block tracking-widest">Co masz do zrobienia?</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Wpisz nazwę zadania..." className="w-full px-5 sm:px-6 py-3.5 sm:py-4 rounded-2xl border-2 border-[#E8DDD0] outline-none focus:border-[#2D9E6B] transition-all text-base sm:text-lg font-medium" />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="relative">
              <label className="text-xs font-black uppercase text-[#5A7368] mb-2 block">Szacowany czas</label>
              {showDurationTutorial && (
                <div className="hidden md:block absolute -top-8 right-[calc(100%+20px)] w-56 p-4 bg-white text-[#1A2F22] rounded-2xl shadow-2xl border-2 border-[#2D9E6B] z-[9999] animate-in fade-in slide-in-from-right-3 duration-300">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markTooltipSeen("task_duration");
                    }}
                    className="absolute top-2 right-2 p-1 hover:bg-[#E8F4ED] text-[#5A7368] hover:text-[#1E5C36] rounded-full transition-all cursor-pointer"
                    title="Zamknij podpowiedź"
                  >
                    <X size={13} />
                  </button>
                  <strong className="text-[#1E5C36] font-bold text-xs block mb-1">Szacowany czas:</strong>
                  <p className="text-[11px] leading-relaxed text-[#5A7368] pr-2">
                    Przewidywany czas na zadanie. Pomaga aplikacji idealnie rozplanować dzień i chronić Cię przed przeciążeniem.
                  </p>
                  {/* Strzałka w dół-prawo do pola */}
                  <div className="absolute bottom-4 -right-2.5 w-0 h-0 border-y-[8px] border-y-transparent border-l-[10px] border-l-white"></div>
                  <div className="absolute bottom-4 -right-3 w-0 h-0 border-y-[9px] border-y-transparent border-l-[11px] border-l-[#2D9E6B] -z-10"></div>
                </div>
              )}
              <div className="relative">
                <input type="number" value={duration} onChange={e => setDuration(e.target.value)} placeholder="Np. 45" className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 border-[#E8DDD0] text-sm pr-12 outline-none focus:border-[#2D9E6B]" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#9FB5AD]">MIN</span>
              </div>
            </div>

            <div className="relative">
              <label className={`text-xs font-black uppercase mb-2 block tracking-widest transition-all ${isLocked ? 'text-gray-400 line-through' : 'text-[#1A2F22]'}`}>Deadline</label>
              {showDeadlineTutorial && (
                <div className="hidden md:block absolute -top-12 left-[calc(100%+20px)] w-56 p-4 bg-white text-[#1A2F22] rounded-2xl shadow-2xl border-2 border-[#2D9E6B] z-[9999] animate-in fade-in slide-in-from-left-3 duration-300">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markTooltipSeen("task_deadline");
                    }}
                    className="absolute top-2 right-2 p-1 hover:bg-[#E8F4ED] text-[#5A7368] hover:text-[#1E5C36] rounded-full transition-all cursor-pointer"
                    title="Zamknij podpowiedź"
                  >
                    <X size={13} />
                  </button>
                  <strong className="text-[#1E5C36] font-bold text-xs block mb-1">Deadline:</strong>
                  <p className="text-[11px] leading-relaxed text-[#5A7368] pr-2">
                    Ostateczny termin realizacji. Aplikacja automatycznie dopasuje plan tak, by ukończyć zadanie przed tą datą.
                  </p>
                  {/* Strzałka w dół-lewo do pola */}
                  <div className="absolute bottom-4 -left-2.5 w-0 h-0 border-y-[8px] border-y-transparent border-r-[10px] border-r-white"></div>
                  <div className="absolute bottom-4 -left-3 w-0 h-0 border-y-[9px] border-y-transparent border-r-[11px] border-r-[#2D9E6B] -z-10"></div>
                </div>
              )}
              <input
                type="datetime-local"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                disabled={isLocked}
                className={`w-full px-2.5 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 text-xs sm:text-sm outline-none transition-all ${isLocked ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed line-through opacity-70' : 'border-[#E8DDD0] focus:border-[#2D9E6B] text-[#1A2F22] bg-white'}`}
              />
            </div>
          </div>

          <div className="relative">
            <label className="text-xs font-black uppercase text-[#5A7368] mb-2 block flex justify-between">
              Wysiłek umysłowy <span>{difficulty} / 5</span>
            </label>
            {showDifficultyTutorial && (
              <div className="hidden md:block absolute top-5 left-[calc(100%+20px)] w-56 p-4 bg-white text-[#1A2F22] rounded-2xl shadow-2xl border-2 border-[#2D9E6B] z-[9999] animate-in fade-in slide-in-from-left-3 duration-300">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    markTooltipSeen("task_difficulty");
                  }}
                  className="absolute top-2 right-2 p-1 hover:bg-[#E8F4ED] text-[#5A7368] hover:text-[#1E5C36] rounded-full transition-all cursor-pointer"
                  title="Zamknij podpowiedź"
                >
                  <X size={13} />
                </button>
                <strong className="text-[#1E5C36] font-bold text-xs block mb-1">Wysiłek umysłowy:</strong>
                <p className="text-[11px] leading-relaxed text-[#5A7368] pr-2">
                  Skala 1–5 określa poziom skupienia. Pomaga rozłożyć trudniejsze zadania i dobrać odpowiednie przerwy na regenerację.
                </p>
                {/* Strzałka w lewo-górę do suwaka */}
                <div className="absolute top-4 -left-2.5 w-0 h-0 border-y-[8px] border-y-transparent border-r-[10px] border-r-white"></div>
                <div className="absolute top-4 -left-3 w-0 h-0 border-y-[9px] border-y-transparent border-r-[11px] border-r-[#2D9E6B] -z-10"></div>
              </div>
            )}
            <input type="range" min="1" max="5" value={difficulty} onChange={e => setDifficulty(parseInt(e.target.value))} className="w-full h-2 bg-[#E8DDD0] rounded-lg appearance-none cursor-pointer accent-[#1E5C36]" />
            <div className="flex justify-between text-[9px] font-black text-[#9FB5AD] mt-2 px-1">
              <span>NISKI</span>
              <span>BARDZO WYSOKI</span>
            </div>
          </div>

          <div className="relative">
            <label className="text-xs font-black uppercase text-[#5A7368] mb-3 block tracking-widest">Ważność</label>
            {showPriorityTutorial && (
              <div className="hidden md:block absolute top-4 right-[calc(100%+20px)] w-56 p-4 bg-white text-[#1A2F22] rounded-2xl shadow-2xl border-2 border-[#2D9E6B] z-[9999] animate-in fade-in slide-in-from-right-3 duration-300">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    markTooltipSeen("task_priority");
                  }}
                  className="absolute top-2 right-2 p-1 hover:bg-[#E8F4ED] text-[#5A7368] hover:text-[#1E5C36] rounded-full transition-all cursor-pointer"
                  title="Zamknij podpowiedź"
                >
                  <X size={13} />
                </button>
                <strong className="text-[#1E5C36] font-bold text-xs block mb-1">Ważność:</strong>
                <p className="text-[11px] leading-relaxed text-[#5A7368] pr-2">
                  Priorytet zadania. Decyduje o kolejności układania dnia – kluczowe zadania trafiają w godziny najwyższej energii.
                </p>
                {/* Strzałka w prawo-górę do przycisków */}
                <div className="absolute top-4 -right-2.5 w-0 h-0 border-y-[8px] border-y-transparent border-l-[10px] border-l-white"></div>
                <div className="absolute top-4 -right-3 w-0 h-0 border-y-[9px] border-y-transparent border-l-[11px] border-l-[#2D9E6B] -z-10"></div>
              </div>
            )}
            <div className="flex w-full gap-1.5 sm:gap-2">
              {PRIOS.map(pr => {
                const isActive = p === pr.id;
                let activeClass = "border-[#1E5C36] bg-[#E8F4ED] text-[#1E5C36]"; // Zielony (niski priorytet)

                if (pr.id === "sredni") {
                  activeClass = "border-amber-500 bg-amber-50 text-amber-600"; // Żółty/Pomarańczowy (średni priorytet)
                } else if (pr.id === "wysoki") {
                  activeClass = "border-red-500 bg-red-50 text-red-600"; // Czerwony (wysoki priorytet)
                }

                const shortLabel = pr.id === "niski" ? "Niski" : pr.id === "sredni" ? "Średni" : "Wysoki";

                return (
                  <button
                    key={pr.id}
                    onClick={() => setP(pr.id)}
                    className={`flex-1 py-2 sm:py-2.5 px-1 sm:px-2 rounded-xl text-[11px] sm:text-[10px] font-black uppercase transition-all border-2 text-center truncate ${isActive ? activeClass : "border-transparent bg-slate-50 text-slate-400 hover:border-[#E8DDD0]"}`}
                  >
                    <span className="sm:hidden">{shortLabel}</span>
                    <span className="hidden sm:inline">{pr.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-2.5 sm:gap-2 mt-8 sm:mt-10 relative w-full">

          {/* PANEL CYKLICZNOŚCI */}
          {activePanel === 'recurrence' && (
            <div className="absolute bottom-[105%] sm:bottom-[115%] left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 w-[calc(100vw-3.5rem)] max-w-xs sm:w-72 bg-white rounded-3xl shadow-2xl border border-[#E8DDD0] p-5 sm:p-6 z-50 animate-in slide-in-from-bottom-2">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-bold text-[#1A2F22]">Ustaw cykliczność</h4>
                <button onClick={() => setActivePanel(null)}><X size={16} className="text-[#9FB5AD] hover:text-red-500" /></button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-[#5A7368] mb-1 block">Początek cyklu (data i godzina)</label>
                  <input type="datetime-local" value={lockDateTime} onChange={e => setLockDateTime(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-[#E8DDD0] text-sm outline-none focus:border-[#2D9E6B]" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-[#5A7368] mb-1 block">Cykliczność (Google Style)</label>
                  <select value={recurrence} onChange={e => setRecurrence(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-[#E8DDD0] text-sm outline-none focus:border-[#2D9E6B] bg-white cursor-pointer">
                    <option value="jednorazowo">Tylko raz</option>
                    <option value="codziennie">Codziennie</option>
                    <option value="w dni robocze">W dni robocze (Pon-Pt)</option>
                    <option value="co tydzień">Co tydzień</option>
                  </select>
                </div>
                {recurrence !== "jednorazowo" && (
                  <div>
                    <label className="text-[10px] font-black uppercase text-[#5A7368] mb-1 block">Zakończ cykl (opcjonalnie)</label>
                    <input type="date" value={recurrenceEnd} onChange={e => setRecurrenceEnd(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-[#E8DDD0] text-sm outline-none focus:border-[#2D9E6B] bg-white" />
                  </div>
                )}
                <button
                  onClick={() => { setIsLocked(true); setActivePanel(null); }}
                  className="w-full py-2 bg-[#2D9E6B] text-white rounded-xl font-bold text-xs hover:bg-[#1E5C36] transition-all"
                >
                  Zastosuj cykliczność
                </button>
                {isRecurrenceActive && (
                  <button onClick={() => { setRecurrence("jednorazowo"); setRecurrenceEnd(""); setLockDateTime(""); setIsLocked(false); setActivePanel(null); }} className="w-full py-2 text-red-500 rounded-xl font-bold text-xs hover:bg-red-50 transition-all mt-1">
                    Usuń cykliczność
                  </button>
                )}
              </div>
            </div>
          )}

          {/* PANEL KŁÓDKI */}
          {activePanel === 'lock' && (
            <div className="absolute bottom-[105%] sm:bottom-[115%] left-1/2 -translate-x-1/2 w-[calc(100vw-3.5rem)] max-w-xs sm:w-72 bg-white rounded-3xl shadow-2xl border border-[#E8DDD0] p-5 sm:p-6 z-50 animate-in slide-in-from-bottom-2">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-bold text-[#1A2F22]">Zablokuj termin</h4>
                <button onClick={() => setActivePanel(null)}><X size={16} className="text-[#9FB5AD] hover:text-red-500" /></button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-[#5A7368] mb-1 block">Dokładna data i godzina</label>
                  <input type="datetime-local" value={lockDateTime} onChange={e => setLockDateTime(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-[#E8DDD0] text-sm outline-none focus:border-[#2D9E6B]" />
                </div>
                <button
                  onClick={() => { setIsLocked(true); setActivePanel(null); }}
                  className="w-full py-2 bg-[#2D9E6B] text-white rounded-xl font-bold text-xs hover:bg-[#1E5C36] transition-all"
                >
                  Zastosuj kłódkę
                </button>
                {isSingleLockActive && (
                  <button onClick={() => { setIsLocked(false); setLockDateTime(""); setActivePanel(null); }} className="w-full py-2 text-red-500 rounded-xl font-bold text-xs hover:bg-red-50 transition-all mt-1">
                    Usuń blokadę
                  </button>
                )}
              </div>
            </div>
          )}

          {/* PRZYCISKI GŁÓWNE Z OSOBNYMI DYMKAMI */}
          <div className="flex flex-row items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial sm:shrink-0">
              {showRecurrenceTutorial && (
                <div className="absolute top-full left-0 sm:-left-10 mt-3 w-44 p-3.5 bg-white text-[#1A2F22] rounded-2xl shadow-2xl z-[9999] animate-in fade-in slide-in-from-top-2 duration-300 border-2 border-[#2D9E6B]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markTooltipSeen("task_recurrence");
                    }}
                    className="absolute top-1.5 right-1.5 p-1 hover:bg-[#E8F4ED] text-[#5A7368] hover:text-[#1E5C36] rounded-full transition-all cursor-pointer"
                    title="Zamknij podpowiedź"
                  >
                    <X size={12} />
                  </button>
                  <strong className="text-[#1E5C36] font-bold text-xs block mb-0.5">Cykliczność:</strong>
                  <p className="text-[11px] leading-relaxed text-[#5A7368] pr-2">
                    Powtarzalność, np. co tydzień lub w dni robocze.
                  </p>
                  {/* Strzałka skierowana w górę na przycisk cykliczności */}
                  <div className="absolute -top-2.5 left-8 sm:right-10 sm:left-auto w-0 h-0 border-x-[8px] border-x-transparent border-b-[10px] border-b-white"></div>
                  <div className="absolute -top-3 left-8 sm:right-10 sm:left-auto w-0 h-0 border-x-[9px] border-x-transparent border-b-[11px] border-b-[#2D9E6B] -z-10"></div>
                </div>
              )}
              <button
                onClick={() => setActivePanel(activePanel === 'recurrence' ? null : 'recurrence')}
                disabled={isSingleLockActive}
                className={`flex flex-row justify-center items-center gap-1.5 sm:gap-2 w-full sm:w-[146px] h-[50px] sm:h-[56px] border-[1.6px] rounded-[16px] transition-all px-2 ${isSingleLockActive ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200' : (activePanel === 'recurrence' || isRecurrenceActive ? 'bg-[#E8F4ED] border-[#1E5C36] shadow-inner' : 'bg-white border-[#E8DDD0] hover:bg-gray-50')}`}
              >
                <img src="/ikonka_cykliczności.png" alt="Cykliczność" className={`w-[22px] h-[22px] sm:w-[29px] sm:h-[29px] shrink-0 transition-all ${isSingleLockActive ? 'opacity-40 grayscale' : ''}`} />
                <span className={`font-['Inter'] font-bold text-[12px] sm:text-[14px] leading-[14px] sm:leading-[16px] text-left transition-all ${isSingleLockActive ? 'text-gray-400 line-through' : 'text-black'}`}>
                  Ustaw<br />cykliczność
                </span>
              </button>
            </div>

            <div className="relative flex-1 sm:flex-initial sm:shrink-0">
              {showLockTutorial && (
                <div className="absolute top-full right-0 sm:-right-10 mt-3 w-44 p-3.5 bg-white text-[#1A2F22] rounded-2xl shadow-2xl z-[9999] animate-in fade-in slide-in-from-top-2 duration-300 delay-100 border-2 border-amber-500">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markTooltipSeen("task_lock");
                    }}
                    className="absolute top-1.5 right-1.5 p-1 hover:bg-amber-50 text-amber-700 rounded-full transition-all cursor-pointer"
                    title="Zamknij podpowiedź"
                  >
                    <X size={12} />
                  </button>
                  <strong className="text-amber-800 font-bold text-xs block mb-0.5">Kłódka:</strong>
                  <p className="text-[11px] leading-relaxed text-[#5A7368] pr-2">
                    Sztywno rezerwuje godziny w kalendarzu.
                  </p>
                  {/* Strzałka skierowana w górę na przycisk kłódki */}
                  <div className="absolute -top-2.5 right-8 sm:left-10 sm:right-auto w-0 h-0 border-x-[8px] border-x-transparent border-b-[10px] border-b-white"></div>
                  <div className="absolute -top-3 right-8 sm:left-10 sm:right-auto w-0 h-0 border-x-[9px] border-x-transparent border-b-[11px] border-b-amber-500 -z-10"></div>
                </div>
              )}
              <button
                onClick={() => setActivePanel(activePanel === 'lock' ? null : 'lock')}
                disabled={isRecurrenceActive}
                className={`flex flex-row justify-center items-center gap-1.5 sm:gap-2 w-full sm:w-[120px] h-[50px] sm:h-[56px] border-[1.6px] rounded-[16px] transition-all px-2 ${isRecurrenceActive ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200' : (activePanel === 'lock' || isSingleLockActive ? 'bg-[#E8F4ED] border-[#1E5C36] shadow-inner' : 'bg-white border-[#E8DDD0] hover:bg-gray-50')}`}
              >
                <img src="/ikonka_klodki.png" alt="Kłódka" className={`w-[18px] h-[22px] sm:w-[24px] sm:h-[29px] object-contain shrink-0 transition-all ${isRecurrenceActive ? 'opacity-40 grayscale' : ''}`} />
                <span className={`font-['Inter'] font-bold text-[12px] sm:text-[14px] leading-[14px] sm:leading-[16px] text-left transition-all ${isRecurrenceActive ? 'text-gray-400 line-through' : 'text-black'}`}>
                  Zablokuj<br />termin
                </span>
              </button>
            </div>
          </div>

          <button
            onClick={submit}
            className="flex flex-row justify-center items-center w-full sm:flex-1 h-[50px] sm:h-[56px] bg-[#1E5C36] shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)] rounded-[16px] hover:bg-[#164a2c] transition-all sm:min-w-[120px] cursor-pointer mt-1 sm:mt-0"
          >
            <span className="font-['Inter'] font-bold text-[15px] sm:text-[16px] leading-[24px] text-center text-white whitespace-nowrap">
              {taskToEdit ? "Zapisz" : "Dodaj zadanie"}
            </span>
          </button>

        </div>
      </div>
    </div>
  );
}
