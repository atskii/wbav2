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

  // Inicjalizacja lockDateTime: z taskToEdit.lockDateTime lub z parsowania pola `t` (np. 🔒 10:48 (16.08.2026))
  const getInitialLockDateTime = () => {
    if (taskToEdit?.lockDateTime) return taskToEdit.lockDateTime;
    if (taskToEdit?.t) {
      const matchTime = taskToEdit.t.match(/(\d{1,2}):(\d{2})/);
      const matchDate = taskToEdit.t.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
      if (matchTime && matchDate) {
        const hh = matchTime[1].padStart(2, '0');
        const mm = matchTime[2].padStart(2, '0');
        const d = matchDate[1].padStart(2, '0');
        const m = matchDate[2].padStart(2, '0');
        const y = matchDate[3];
        return `${y}-${m}-${d}T${hh}:${mm}`;
      }
    }
    return "";
  };

  const [lockDateTime, setLockDateTime] = useState(getInitialLockDateTime());
  const [recurrence, setRecurrence] = useState(taskToEdit?.recurrence || "jednorazowo");
  const [recurrenceEnd, setRecurrenceEnd] = useState(taskToEdit?.recurrenceEnd || "");

  const isRecurrenceActive = isLocked && recurrence !== "jednorazowo";
  const isSingleLockActive = isLocked && recurrence === "jednorazowo";

  const buildTaskPayload = (overrides = {}) => {
    const currentTitle = overrides.title !== undefined ? overrides.title : title;
    const currentDuration = overrides.duration !== undefined ? overrides.duration : duration;
    const currentDifficulty = overrides.difficulty !== undefined ? overrides.difficulty : difficulty;
    const currentP = overrides.p !== undefined ? overrides.p : p;
    const currentDeadline = overrides.deadline !== undefined ? overrides.deadline : deadline;
    const currentDesc = overrides.desc !== undefined ? overrides.desc : desc;
    const currentIsLocked = overrides.isLocked !== undefined ? overrides.isLocked : isLocked;
    const currentLockDateTime = overrides.lockDateTime !== undefined ? overrides.lockDateTime : lockDateTime;
    const currentRecurrence = overrides.recurrence !== undefined ? overrides.recurrence : recurrence;
    const currentRecurrenceEnd = overrides.recurrenceEnd !== undefined ? overrides.recurrenceEnd : recurrenceEnd;

    const weight = Math.min(10, Math.round((currentDifficulty * 1.5) + (parseInt(currentDuration || 0) / 60)));

    let timeString = "";
    let sMins = overrides.sMins !== undefined ? overrides.sMins : (taskToEdit?.sMins ?? null);
    let eMins = overrides.eMins !== undefined ? overrides.eMins : (taskToEdit?.eMins ?? null);
    let pDate = overrides.pDate !== undefined ? overrides.pDate : (taskToEdit?.pDate ?? null);

    const durInt = parseInt(currentDuration || 0) || 45;

    if (currentIsLocked && currentLockDateTime) {
      const d = new Date(currentLockDateTime);
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      const timeStr = `${hh}:${mm}`;
      const dateStr = d.toLocaleDateString('pl-PL');
      timeString = `🔒 ${timeStr} (${dateStr})`;

      const startM = d.getHours() * 60 + d.getMinutes();
      sMins = startM;
      eMins = startM + durInt;
      pDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

      if (currentRecurrence !== "jednorazowo") {
        if (currentRecurrence === "co tydzień") {
          const dayOfWeek = d.getDay() === 0 ? 6 : d.getDay() - 1;
          const daysArr = ["pon", "wt", "śr", "czw", "pt", "sob", "ndz"];
          timeString += ` 🔁 co tydzień ${daysArr[dayOfWeek]}`;
        } else {
          timeString += ` 🔁 ${currentRecurrence}`;
        }

        if (currentRecurrenceEnd) {
          timeString += ` 🛑 do ${currentRecurrenceEnd}`;
        }
      }
    } else if (!currentIsLocked) {
      timeString = "";
      // Jeśli zadanie miało datę i godzinę z kłódki (np. w lockDateTime), zachowaj ją jako elastyczny termin (sMins, pDate)
      const sourceDateTime = currentLockDateTime || getInitialLockDateTime();
      if (sourceDateTime) {
        const d = new Date(sourceDateTime);
        if (!isNaN(d.getTime())) {
          const startM = d.getHours() * 60 + d.getMinutes();
          sMins = startM;
          eMins = startM + durInt;
          pDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        }
      }
    }

    return {
      id: taskToEdit?.id,
      title: currentTitle,
      p: currentP,
      cat: "praca",
      w: weight,
      t: timeString,
      duration: currentDuration ? `${currentDuration} min` : "",
      deadline: currentDeadline ? currentDeadline.replace("T", " o ") : "",
      difficulty: currentDifficulty,
      desc: currentDesc,
      isLocked: currentIsLocked,
      lockDateTime: currentIsLocked ? currentLockDateTime : "",
      recurrence: currentRecurrence,
      recurrenceEnd: currentRecurrenceEnd,
      sMins,
      eMins,
      pDate
    };
  };

  const handleApplyLock = () => {
    setIsLocked(true);
    setActivePanel(null);
  };

  const handleRemoveLock = () => {
    setIsLocked(false);
    setLockDateTime("");
    setActivePanel(null);
  };

  const handleApplyRecurrence = () => {
    setIsLocked(true);
    setActivePanel(null);
  };

  const handleRemoveRecurrence = () => {
    setRecurrence("jednorazowo");
    setRecurrenceEnd("");
    setLockDateTime("");
    setIsLocked(false);
    setActivePanel(null);
  };

  const submit = () => {
    if (!title) return;
    onSave(buildTaskPayload());
  };

  return (
    <div className="fixed inset-0 z-[700] flex items-center justify-center bg-[#1A2F22]/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-[2.5rem] shadow-2xl p-6 sm:p-8 w-full max-w-lg border border-white/20 relative overflow-visible" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-2xl sm:text-3xl font-bold text-[#1A2F22]">{taskToEdit ? "Edytuj zadanie" : "Nowe zadanie"}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-all cursor-pointer"><X size={24} className="text-[#1A2F22]" /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-black uppercase text-[#5A7368] mb-1.5 block tracking-widest">Co masz do zrobienia?</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Wpisz nazwę zadania..." className="w-full px-5 py-3.5 rounded-2xl border-2 border-[#E8DDD0] outline-none focus:border-[#2D9E6B] transition-all text-base font-medium" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-black uppercase text-[#5A7368] mb-1.5 block">Szacowany czas</label>
              <div className="relative">
                <input type="number" value={duration} onChange={e => setDuration(e.target.value)} placeholder="Np. 45" className="w-full px-4 py-2.5 rounded-xl border-2 border-[#E8DDD0] text-sm pr-12 outline-none focus:border-[#2D9E6B]" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#9FB5AD]">MIN</span>
              </div>
            </div>
            <div>
              <label className={`text-xs font-black uppercase mb-1.5 block tracking-widest transition-all ${isLocked ? 'text-gray-400 line-through' : 'text-[#1A2F22]'}`}>Deadline</label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                disabled={isLocked}
                className={`w-full px-4 py-2.5 rounded-xl border-2 text-sm outline-none transition-all ${isLocked ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed line-through opacity-70' : 'border-[#E8DDD0] focus:border-[#2D9E6B] text-[#1A2F22] bg-white'}`}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-black uppercase text-[#5A7368] mb-1.5 flex justify-between">
              Wysiłek umysłowy <span>{difficulty} / 5</span>
            </label>
            <input type="range" min="1" max="5" value={difficulty} onChange={e => setDifficulty(parseInt(e.target.value))} className="w-full h-2 bg-[#E8DDD0] rounded-lg appearance-none cursor-pointer accent-[#1E5C36]" />
            <div className="flex justify-between text-[9px] font-black text-[#9FB5AD] mt-1.5 px-1">
              <span>NISKI</span>
              <span>BARDZO WYSOKI</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-black uppercase text-[#5A7368] mb-2 block tracking-widest">Ważność</label>
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
                    className={`flex-1 px-1 py-2 rounded-xl text-[9px] sm:text-[10px] font-black uppercase transition-all border-2 whitespace-nowrap overflow-hidden text-ellipsis cursor-pointer ${isActive ? activeClass : "border-transparent bg-slate-50 text-slate-400 hover:border-[#E8DDD0]"}`}
                  >
                    {pr.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-row justify-center items-center gap-2 mt-8 relative w-full overflow-visible">

          {/* PANEL CYKLICZNOŚCI */}
          {activePanel === 'recurrence' && (
            <div className="absolute bottom-[115%] left-0 w-72 bg-white rounded-3xl shadow-2xl border border-[#E8DDD0] p-6 z-[9999] animate-in slide-in-from-bottom-2">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-bold text-[#1A2F22]">Ustaw cykliczność</h4>
                <button onClick={() => setActivePanel(null)} className="cursor-pointer"><X size={16} className="text-[#9FB5AD] hover:text-red-500" /></button>
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
                  onClick={handleApplyRecurrence}
                  className="w-full py-2 bg-[#2D9E6B] text-white rounded-xl font-bold text-xs hover:bg-[#1E5C36] transition-all cursor-pointer"
                >
                  Zastosuj cykliczność
                </button>
                {isRecurrenceActive && (
                  <button onClick={handleRemoveRecurrence} className="w-full py-2 text-red-500 rounded-xl font-bold text-xs hover:bg-red-50 transition-all mt-1 cursor-pointer">
                    Usuń cykliczność
                  </button>
                )}
              </div>
            </div>
          )}

          {/* PANEL KŁÓDKI */}
          {activePanel === 'lock' && (
            <div className="absolute bottom-[115%] left-1/2 -translate-x-1/2 w-72 bg-white rounded-3xl shadow-2xl border border-[#E8DDD0] p-6 z-[9999] animate-in slide-in-from-bottom-2">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-bold text-[#1A2F22]">Zablokuj termin</h4>
                <button onClick={() => setActivePanel(null)} className="cursor-pointer"><X size={16} className="text-[#9FB5AD] hover:text-red-500" /></button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-[#5A7368] mb-1 block">Dokładna data i godzina</label>
                  <input type="datetime-local" value={lockDateTime} onChange={e => setLockDateTime(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-[#E8DDD0] text-sm outline-none focus:border-[#2D9E6B]" />
                </div>
                <button
                  onClick={handleApplyLock}
                  className="w-full py-2 bg-[#2D9E6B] text-white rounded-xl font-bold text-xs hover:bg-[#1E5C36] transition-all cursor-pointer"
                >
                  Zastosuj kłódkę
                </button>
                {isLocked && (
                  <button onClick={handleRemoveLock} className="w-full py-2 text-red-500 rounded-xl font-bold text-xs hover:bg-red-50 transition-all mt-1 cursor-pointer">
                    Usuń blokadę
                  </button>
                )}
              </div>
            </div>
          )}

          {/* PRZYCISKI GŁÓWNE Z OSOBNYMI DYMKAMI */}

          <div className="relative shrink-0">
            {showRecurrenceTutorial && (
              <div className="absolute top-[calc(100%+12px)] left-1/2 -translate-x-1/2 w-44 p-3.5 bg-[#1A2F22] text-white rounded-2xl shadow-2xl z-[99999] animate-in fade-in slide-in-from-top-2 duration-300 border-2 border-[#2D9E6B]">
                <button onClick={(e) => { e.stopPropagation(); setShowRecurrenceTutorial(false); }} className="absolute top-1.5 right-2 p-1 hover:bg-white/10 rounded-full transition-all cursor-pointer">
                  <X size={12} className="text-[#2D9E6B]" />
                </button>
                <p className="text-[11px] leading-relaxed pr-2">
                  <strong className="text-[#2D9E6B] block mb-0.5">Cykliczność:</strong>
                  Powtarzalność, np. co tydzień.
                </p>
                <div className="absolute bottom-[calc(100%-1px)] left-1/2 -translate-x-1/2 w-0 h-0 border-x-[8px] border-x-transparent border-b-[10px] border-b-[#1A2F22]"></div>
              </div>
            )}
            <button
              onClick={() => setActivePanel(activePanel === 'recurrence' ? null : 'recurrence')}
              disabled={isSingleLockActive}
              className={`flex flex-row justify-center items-center gap-2 w-[138px] h-[52px] border-[1.6px] rounded-[16px] transition-all cursor-pointer ${isSingleLockActive ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200' : (activePanel === 'recurrence' || isRecurrenceActive ? 'bg-[#E8F4ED] border-[#1E5C36] shadow-inner' : 'bg-white border-[#E8DDD0] hover:bg-gray-50')}`}
            >
              <img src="/ikonka_cykliczności.png" alt="Cykliczność" className={`w-[26px] h-[26px] transition-all ${isSingleLockActive ? 'opacity-40 grayscale' : ''}`} />
              <span className={`font-['Inter'] font-bold text-[13px] leading-[15px] text-left transition-all ${isSingleLockActive ? 'text-gray-400 line-through' : 'text-black'}`}>
                Ustaw<br />cykliczność
              </span>
            </button>
          </div>

          <div className="relative shrink-0">
            {showLockTutorial && (
              <div className="absolute top-[calc(100%+12px)] left-1/2 -translate-x-1/2 w-44 p-3.5 bg-[#1A2F22] text-white rounded-2xl shadow-2xl z-[99999] animate-in fade-in slide-in-from-top-2 duration-300 delay-100 border-2 border-amber-400">
                <button onClick={(e) => { e.stopPropagation(); setShowLockTutorial(false); }} className="absolute top-1.5 right-2 p-1 hover:bg-white/10 rounded-full transition-all cursor-pointer">
                  <X size={12} className="text-amber-400" />
                </button>
                <p className="text-[11px] leading-relaxed pr-2">
                  <strong className="text-amber-400 block mb-0.5">Kłódka:</strong>
                  Sztywno rezerwuje godziny.
                </p>
                <div className="absolute bottom-[calc(100%-1px)] left-1/2 -translate-x-1/2 w-0 h-0 border-x-[8px] border-x-transparent border-b-[10px] border-b-[#1A2F22]"></div>
              </div>
            )}
            <button
              onClick={() => setActivePanel(activePanel === 'lock' ? null : 'lock')}
              disabled={isRecurrenceActive}
              className={`flex flex-row justify-center items-center gap-2 w-[116px] h-[52px] border-[1.6px] rounded-[16px] transition-all cursor-pointer ${isRecurrenceActive ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200' : (activePanel === 'lock' || isSingleLockActive ? 'bg-[#E8F4ED] border-[#1E5C36] shadow-inner' : 'bg-white border-[#E8DDD0] hover:bg-gray-50')}`}
            >
              <img src="/ikonka_klodki.png" alt="Kłódka" className={`w-[22px] h-[26px] object-contain transition-all ${isRecurrenceActive ? 'opacity-40 grayscale' : ''}`} />
              <span className={`font-['Inter'] font-bold text-[13px] leading-[15px] text-left transition-all ${isRecurrenceActive ? 'text-gray-400 line-through' : 'text-black'}`}>
                Zablokuj<br />termin
              </span>
            </button>
          </div>

          <button
            onClick={submit}
            className="flex flex-row justify-center items-center flex-1 h-[52px] bg-[#1E5C36] shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)] rounded-[16px] hover:bg-[#164a2c] transition-all min-w-[110px] cursor-pointer"
          >
            <span className="font-['Inter'] font-bold text-[15px] leading-[22px] text-center text-white whitespace-nowrap">
              {taskToEdit ? "Zapisz" : "Dodaj zadanie"}
            </span>
          </button>

        </div>
      </div>
    </div>
  );
}
