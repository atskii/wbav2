import { useState } from "react";
import { X } from "lucide-react";
import { PRIOS } from "../lib/constants";

// ═══════════════════════════════════════════════════
//  MODALS
// ═══════════════════════════════════════════════════
export default function TaskModal({ onClose, onSave, taskToEdit }) {
  const [title, setTitle] = useState(taskToEdit?.title || "");
  const [showRecurrenceTutorial, setShowRecurrenceTutorial] = useState(true);
  const [showLockTutorial, setShowLockTutorial] = useState(true);

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
    <div className="fixed inset-0 z-[700] flex items-center justify-center bg-[#1A2F22]/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-[3rem] shadow-2xl p-10 w-full max-w-lg max-h-[90vh] overflow-y-auto border border-white/20" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-3xl font-bold text-[#1A2F22]">{taskToEdit ? "Edytuj zadanie" : "Nowe zadanie"}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-all"><X size={28} className="text-[#1A2F22]" /></button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-xs font-black uppercase text-[#5A7368] mb-2 block tracking-widest">Co masz do zrobienia?</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Wpisz nazwę zadania..." className="w-full px-6 py-4 rounded-2xl border-2 border-[#E8DDD0] outline-none focus:border-[#2D9E6B] transition-all text-lg font-medium" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-black uppercase text-[#5A7368] mb-2 block">Szacowany czas</label>
              <div className="relative">
                <input type="number" value={duration} onChange={e => setDuration(e.target.value)} placeholder="Np. 45" className="w-full px-4 py-3 rounded-xl border-2 border-[#E8DDD0] text-sm pr-12 outline-none focus:border-[#2D9E6B]" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#9FB5AD]">MIN</span>
              </div>
            </div>
            <div>
              <label className={`text-xs font-black uppercase mb-2 block tracking-widest transition-all ${isLocked ? 'text-gray-400 line-through' : 'text-red-500'}`}>Deadline</label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                disabled={isLocked}
                className={`w-full px-4 py-3 rounded-xl border-2 text-sm outline-none transition-all ${isLocked ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed line-through opacity-70' : 'border-red-100 focus:border-red-400 bg-white'}`}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-black uppercase text-[#5A7368] mb-2 block flex justify-between">
              Wysiłek umysłowy <span>{difficulty} / 5</span>
            </label>
            <input type="range" min="1" max="5" value={difficulty} onChange={e => setDifficulty(parseInt(e.target.value))} className="w-full h-2 bg-[#E8DDD0] rounded-lg appearance-none cursor-pointer accent-[#1E5C36]" />
            <div className="flex justify-between text-[9px] font-black text-[#9FB5AD] mt-2 px-1">
              <span>NISKI</span>
              <span>BARDZO WYSOKI</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-black uppercase text-[#5A7368] mb-3 block tracking-widest">Ważność</label>
            <div className="flex w-full gap-2">
              {PRIOS.map(pr => {
                const isActive = p === pr.id;
                let activeClass = "border-[#1E5C36] bg-[#E8F4ED] text-[#1E5C36]"; // Zielony (niski priorytet)

                if (pr.id === "sredni") {
                  activeClass = "border-amber-500 bg-amber-50 text-amber-600"; // Żółty/Pomarańczowy (średni priorytet)
                } else if (pr.id === "wysoki") {
                  activeClass = "border-red-500 bg-red-50 text-red-600"; // Czerwony (wysoki priorytet)
                }

                return (
                  <button
                    key={pr.id}
                    onClick={() => setP(pr.id)}
                    className={`flex-1 px-1 py-2 rounded-xl text-[9px] sm:text-[10px] font-black uppercase transition-all border-2 whitespace-nowrap overflow-hidden text-ellipsis ${isActive ? activeClass : "border-transparent bg-slate-50 text-slate-400 hover:border-[#E8DDD0]"}`}
                  >
                    {pr.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-row justify-center items-center gap-[5px] mt-10 relative w-full">

          {/* PANEL CYKLICZNOŚCI */}
          {activePanel === 'recurrence' && (
            <div className="absolute bottom-[115%] left-0 w-72 bg-white rounded-3xl shadow-2xl border border-[#E8DDD0] p-6 z-50 animate-in slide-in-from-bottom-2">
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
            <div className="absolute bottom-[115%] left-1/2 -translate-x-1/2 w-72 bg-white rounded-3xl shadow-2xl border border-[#E8DDD0] p-6 z-50 animate-in slide-in-from-bottom-2">
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
          
          <div className="relative shrink-0">
            {showRecurrenceTutorial && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-40 p-3 bg-[#1A2F22] text-white rounded-2xl shadow-2xl z-[9999] animate-in fade-in slide-in-from-bottom-4 duration-300 border-2 border-[#2D9E6B]">
                <button onClick={(e) => { e.stopPropagation(); setShowRecurrenceTutorial(false); }} className="absolute top-1 right-2 p-1 hover:bg-white/10 rounded-full transition-all cursor-pointer">
                  <X size={12} className="text-[#2D9E6B]" />
                </button>
                <p className="text-[10px] leading-relaxed pr-2">
                  <strong className="text-[#2D9E6B] block mb-0.5">Cykliczność:</strong>
                  Powtarzalność, np. co tydzień.
                </p>
                <div className="absolute top-[calc(100%-1px)] left-1/2 -translate-x-1/2 w-0 h-0 border-x-[8px] border-x-transparent border-t-[10px] border-t-[#1A2F22]"></div>
              </div>
            )}
            <button
              onClick={() => setActivePanel(activePanel === 'recurrence' ? null : 'recurrence')}
              disabled={isSingleLockActive}
              className={`flex flex-row justify-center items-center gap-2 w-[146px] h-[56px] border-[1.6px] rounded-[16px] transition-all ${isSingleLockActive ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200' : (activePanel === 'recurrence' || isRecurrenceActive ? 'bg-[#E8F4ED] border-[#1E5C36] shadow-inner' : 'bg-white border-[#E8DDD0] hover:bg-gray-50')}`}
            >
              <img src="/ikonka_cykliczności.png" alt="Cykliczność" className={`w-[29px] h-[29px] transition-all ${isSingleLockActive ? 'opacity-40 grayscale' : ''}`} />
              <span className={`font-['Inter'] font-bold text-[14px] leading-[16px] text-left transition-all ${isSingleLockActive ? 'text-gray-400 line-through' : 'text-black'}`}>
                Ustaw<br/>cykliczność
              </span>
            </button>
          </div>

          <div className="relative shrink-0">
            {showLockTutorial && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-40 p-3 bg-[#1A2F22] text-white rounded-2xl shadow-2xl z-[9999] animate-in fade-in slide-in-from-bottom-4 duration-300 delay-100 border-2 border-amber-400">
                <button onClick={(e) => { e.stopPropagation(); setShowLockTutorial(false); }} className="absolute top-1 right-2 p-1 hover:bg-white/10 rounded-full transition-all cursor-pointer">
                  <X size={12} className="text-amber-400" />
                </button>
                <p className="text-[10px] leading-relaxed pr-2">
                  <strong className="text-amber-400 block mb-0.5">Kłódka:</strong>
                  Sztywno rezerwuje godziny.
                </p>
                <div className="absolute top-[calc(100%-1px)] left-1/2 -translate-x-1/2 w-0 h-0 border-x-[8px] border-x-transparent border-t-[10px] border-t-[#1A2F22]"></div>
              </div>
            )}
            <button
              onClick={() => setActivePanel(activePanel === 'lock' ? null : 'lock')}
              disabled={isRecurrenceActive}
              className={`flex flex-row justify-center items-center gap-2 w-[120px] h-[56px] border-[1.6px] rounded-[16px] transition-all ${isRecurrenceActive ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200' : (activePanel === 'lock' || isSingleLockActive ? 'bg-[#E8F4ED] border-[#1E5C36] shadow-inner' : 'bg-white border-[#E8DDD0] hover:bg-gray-50')}`}
            >
              <img src="/ikonka_klodki.png" alt="Kłódka" className={`w-[24px] h-[29px] object-contain transition-all ${isRecurrenceActive ? 'opacity-40 grayscale' : ''}`} />
              <span className={`font-['Inter'] font-bold text-[14px] leading-[16px] text-left transition-all ${isRecurrenceActive ? 'text-gray-400 line-through' : 'text-black'}`}>
                Zablokuj<br/>termin
              </span>
            </button>
          </div>

          <button 
            onClick={submit} 
            className="flex flex-row justify-center items-center flex-1 h-[56px] bg-[#1E5C36] shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)] rounded-[16px] hover:bg-[#164a2c] transition-all min-w-[120px]"
          >
            <span className="font-['Inter'] font-bold text-[16px] leading-[24px] text-center text-white whitespace-nowrap">
              {taskToEdit ? "Zapisz" : "Dodaj zadanie"}
            </span>
          </button>

        </div>
      </div>
    </div>
  );
}
