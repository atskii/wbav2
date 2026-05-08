import { useState, useEffect, useRef } from "react";
import {
  Search, ChevronDown, ChevronLeft, ChevronRight, ArrowRight,
  Star, Trash2
} from "lucide-react";
import SkeletonScreen from "./ui/Skeleton";

export default function CalendarView({ tasks, selectedDate, onChangeDate, onToggle, onDelete, onFocusTask, onEditTask, loading }) {
  const H = { fontFamily: "'Lora', serif" };
  const [searchRight, setSearchRight] = useState("");
  const [searchCal, setSearchCal] = useState("");
  const [viewType, setViewType] = useState("Dzień");
  const calendarScrollRef = useRef(null);
  const [nowMinute, setNowMinute] = useState(new Date().getHours() * 60 + new Date().getMinutes());

  useEffect(() => {
    const interval = setInterval(() => {
      const d = new Date();
      setNowMinute(d.getHours() * 60 + d.getMinutes());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const hours = Array.from({ length: 17 }, (_, i) => i + 6);

  const isSameDate = (textString, targetDate = selectedDate) => {
    if (!textString) return false;
    const txt = textString.toLowerCase();
    const selYear = targetDate.getFullYear();
    const selMonth = targetDate.getMonth() + 1;
    const selDay = targetDate.getDate();
    const selDateOnly = new Date(selYear, targetDate.getMonth(), selDay);
    const endMatch = txt.match(/🛑 do (\d{4})-(\d{1,2})-(\d{1,2})/);
    if (endMatch) {
      const endDate = new Date(parseInt(endMatch[1]), parseInt(endMatch[2]) - 1, parseInt(endMatch[3]));
      if (selDateOnly > endDate) return false;
    }
    const startMatch = textString.match(/\((\d{1,2})[\./ -](\d{1,2})[\./ -](\d{4})\)/);
    if (startMatch && (txt.includes("codziennie") || txt.includes("co tydzień") || txt.includes("w dni robocze"))) {
      const startDate = new Date(parseInt(startMatch[3]), parseInt(startMatch[2]) - 1, parseInt(startMatch[1]));
      if (selDateOnly < startDate) return false;
    }
    const dayOfWeek = targetDate.getDay() === 0 ? 6 : targetDate.getDay() - 1;
    const daysArr = ["pon", "wt", "śr", "czw", "pt", "sob", "ndz"];
    if (txt.includes("codziennie") || txt.includes("każdego dnia")) return true;
    if (txt.includes("w dni robocze") && dayOfWeek >= 0 && dayOfWeek <= 4) return true;
    if (txt.includes("co tydzień") || txt.includes("co tydzien")) {
      if (txt.includes(daysArr[dayOfWeek])) return true;
      if (dayOfWeek === 5 && txt.includes("sb")) return true;
    }
    const ymd = textString.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (ymd && parseInt(ymd[1]) === selYear && parseInt(ymd[2]) === selMonth && parseInt(ymd[3]) === selDay) return true;
    const dmy = textString.match(/(\d{1,2})[\./ -](\d{1,2})[\./ -](\d{4})/);
    if (dmy && parseInt(dmy[3]) === selYear && parseInt(dmy[2]) === selMonth && parseInt(dmy[1]) === selDay) return true;
    return false;
  };

  const timelineTasks = tasks.filter(t => (isSameDate(t.t) || (!t.isLocked && isSameDate(t.deadline))));
  const queueTasks = tasks.filter(t => !searchRight || t.title.toLowerCase().includes(searchRight.toLowerCase()));

  useEffect(() => {
    if (searchCal && calendarScrollRef.current) {
      const matchedTask = timelineTasks.find(t => t.title.toLowerCase().includes(searchCal.toLowerCase()));
      if (matchedTask) {
        let taskHour = 6;
        if (isSameDate(matchedTask.t)) {
          const match = matchedTask.t ? matchedTask.t.match(/(\d{1,2}):\d{2}/) : null;
          taskHour = match ? parseInt(match[1]) : 8;
        } else if (isSameDate(matchedTask.deadline)) {
          const match = matchedTask.deadline.match(/o (\d{1,2}):\d{2}/);
          if (match) taskHour = parseInt(match[1]);
        }
        const scrollPosition = Math.max(0, (taskHour - 6) * 86.4 - 50);
        calendarScrollRef.current.scrollTo({ top: scrollPosition, behavior: 'smooth' });
      }
    }
  }, [searchCal, timelineTasks]);

  if (loading) return <SkeletonScreen />;
  const isToday = new Date().toDateString() === selectedDate.toDateString();
  const handleGoToToday = () => {
    const today = new Date(); today.setHours(0,0,0,0);
    const selected = new Date(selectedDate); selected.setHours(0,0,0,0);
    const diffDays = Math.round((today.getTime() - selected.getTime()) / (1000 * 3600 * 24));
    onChangeDate(diffDays);
  };

  return (
    <div className="flex h-full bg-[#FCFCFD] overflow-hidden">
      <div className="flex-1 flex flex-col p-6 pr-8 h-full">
        <header className="mb-6 flex flex-col gap-2 shrink-0">
          <h1 style={H} className="text-3xl font-bold text-[#303030]">Kalendarz</h1>
          <p className="text-[#1D1B20] text-base">Twój dzień czeka! Zapisz rzeczy, które chcesz dziś zrobić, i uporządkuj swoje zadania.<br />Pamiętaj, że każdy mały krok ma znaczenie.</p>
        </header>
        <div className="flex-1 bg-white border border-[#E8E8E8] rounded-[13px] flex flex-col overflow-hidden shadow-sm min-h-0 relative">
          <div className="h-[70px] border-b border-[#E8E8E8] flex items-center justify-between px-6 shrink-0 bg-white z-20">
            <div className="flex items-center gap-6">
              <span className="text-lg font-bold text-[#202021] capitalize w-48 truncate">{selectedDate.toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" })}</span>
              <div className="relative group">
                <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 rounded-lg text-[#202021] font-medium text-sm transition-colors border border-transparent hover:border-gray-200">{viewType} <ChevronDown size={16} className="text-gray-500" /></button>
                <div className="absolute top-full left-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  {["Dzień", "Tydzień", "Miesiąc"].map(v => (<button key={v} onClick={() => setViewType(v)} className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${viewType === v ? "font-bold text-[#057E85]" : "text-gray-700"}`}>{v}</button>))}
                </div>
              </div>
              <div className="relative w-[300px] ml-4">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9D9898]" />
                <input type="text" placeholder="Szukaj zadania w planie..." value={searchCal} onChange={(e) => setSearchCal(e.target.value)} className="w-full pl-9 pr-4 py-1.5 rounded-md border border-[#E8E8E8] text-sm focus:outline-none focus:border-[#057E85] bg-white transition-all shadow-sm placeholder:text-[#75757A]" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleGoToToday} className="px-4 py-1.5 bg-white border border-[#E8E8E8] rounded-md text-[#202021] font-semibold text-sm hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2">Dzisiaj <ArrowRight size={16} className="text-[#9D9898] -rotate-45" /></button>
              <div className="flex items-center gap-1 border border-[#E8E8E8] rounded-md overflow-hidden shadow-sm">
                <button onClick={() => onChangeDate(-1)} className="p-1.5 bg-white hover:bg-gray-50 text-gray-600 transition-colors"><ChevronLeft size={18} /></button>
                <div className="w-px h-5 bg-[#E8E8E8]"></div>
                <button onClick={() => onChangeDate(1)} className="p-1.5 bg-white hover:bg-gray-50 text-gray-600 transition-colors"><ChevronRight size={18} /></button>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto relative pb-10" ref={calendarScrollRef}>
            {isToday && nowMinute >= 6*60 && nowMinute <= 23*60 && (
              <div className="absolute left-[64px] right-0 z-40 pointer-events-none flex items-center transition-all duration-1000" style={{ top: `${(nowMinute - 6*60) * (86.4/60) + 16}px` }}>
                <div className="w-2.5 h-2.5 rounded-full bg-[#E40D0D] -ml-[5px] relative z-10" />
                <div className="flex-1 h-[2px] bg-[#E40D0D]" />
              </div>
            )}
            <div className="relative pt-4">
              {hours.map(h => {
                const tasksInThisHour = timelineTasks.filter(t => {
                  let taskHour = -1;
                  if (isSameDate(t.t)) { const match = t.t ? t.t.match(/(\d{1,2}):\d{2}/) : null; taskHour = match ? parseInt(match[1]) : t.hour; }
                  else if (isSameDate(t.deadline)) { const match = t.deadline.match(/o (\d{1,2}):\d{2}/); if (match) taskHour = parseInt(match[1]); }
                  return taskHour === h;
                });
                return (
                  <div key={h} className="flex border-t border-[#F0F0F0] h-[5.4rem] relative group">
                    <div className="w-16 -mt-2.5 text-[11px] font-medium text-[#909090] text-center bg-white z-10">{h.toString().padStart(2,"0")}:00</div>
                    {h === 6 && <div className="absolute left-16 top-0 bottom-[-100rem] w-[1px] bg-[#F0F0F0] pointer-events-none" />}
                    <div className="flex-1 relative ml-2 pr-4">
                      {tasksInThisHour.map((t, index) => {
                        const isDeadlineBlock = !isSameDate(t.t) && isSameDate(t.deadline);
                        const match = t.duration ? t.duration.match(/(\d+)/) : null;
                        const mins = match ? parseInt(match[1]) : 60;
                        const heightRem = (mins / 60) * 5.4;
                        return (
                          <div key={t.id} onClick={() => onEditTask(t)} style={{ height: `${heightRem}rem`, minHeight: "3.5rem", zIndex: 10+index, width: `calc(${100/tasksInThisHour.length}% - 8px)`, left: `calc(${(100/tasksInThisHour.length)*index}% + 4px)` }}
                            className={`absolute top-0 rounded-[16px] p-3 shadow-sm hover:shadow-md transition-all overflow-hidden cursor-pointer border-2 ${isDeadlineBlock ? "bg-[#FFDBDB]/40 border-red-200 hover:border-red-300" : "bg-white border-[#0A0291]/60 hover:border-[#0A0291]"}`}>
                            <div className="flex justify-between items-start mb-1">
                              <p className={`text-[12px] font-bold truncate ${isDeadlineBlock ? "text-[#D04F4F]" : "text-[#303030]"}`}>{t.title}</p>
                              {isDeadlineBlock ? (<span className="text-[10px] text-[#D04F4F] bg-[#FFDBDB] px-2 py-0.5 rounded-full hidden sm:block">deadline</span>) : (<span className="text-[10px] text-[#DC8A25] bg-[#FFE5C5] px-2 py-0.5 rounded-full hidden sm:block">zaplanowane</span>)}
                            </div>
                            <p className="text-[11px] text-[#BDBDBD] mt-0.5 font-medium">{h.toString().padStart(2,"0")}:00 - {((h+Math.floor(mins/60))%24).toString().padStart(2,"0")}:{(mins%60).toString().padStart(2,"0")}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <div className="w-[300px] bg-[#F5F7F5] border-l border-[#F0F0F0] rounded-l-[12px] flex flex-col hidden lg:flex shrink-0 h-full relative z-10 shadow-[-5px_0_15px_-5px_rgba(0,0,0,0.02)]">
        <div className="p-6 pb-4 pt-8 shrink-0 bg-[#F5F7F5] z-20">
          <h2 className="text-[26px] font-bold text-[#303030] mb-6">Zadania</h2>
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9FB5AD]" />
            <input type="text" placeholder="Szukaj..." value={searchRight} onChange={(e) => setSearchRight(e.target.value)} className="w-full pl-11 pr-4 py-2.5 rounded-[6px] border border-[#E8E8E8] text-[13px] focus:outline-none focus:border-[#057E85] bg-white transition-all shadow-sm placeholder:text-[#9FB5AD]" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 pb-8 relative">
          <div className="absolute left-[33px] top-0 bottom-0 w-px bg-[#BBBBBB] z-0 hidden"></div>
          <div className="space-y-4">
            {queueTasks.map((t, idx) => {
              const deadlineToday = isSameDate(t.deadline);
              return (
                <div key={t.id} className="relative z-10 pl-6">
                  <div className="absolute left-[3px] top-[26px] w-2 h-2 rounded-full bg-[#0A0291] border border-white shadow-sm z-20"></div>
                  {idx !== queueTasks.length-1 && (<div className="absolute left-[6px] top-[34px] bottom-[-24px] w-px bg-[#BBBBBB] z-0"></div>)}
                  <div onClick={() => onEditTask(t)} className={`bg-white p-4 rounded-[16px] border border-[#0A0291]/60 transition-all duration-300 cursor-pointer group hover:-translate-y-0.5 hover:shadow-md ${t.done ? "opacity-60 grayscale border-gray-200" : ""}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-1.5"><Star size={14} className={t.p === "wysoki" ? "text-red-400 fill-red-400" : (t.p === "sredni" ? "text-yellow-400 fill-yellow-400" : "text-green-400")} /></div>
                      {deadlineToday && !t.done && <span className="text-[10px] text-[#D04F4F] bg-[#FFDBDB] px-2 py-0.5 rounded-full font-medium">dzisiaj</span>}
                      {t.done && <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">zrobione</span>}
                    </div>
                    <h4 className={`text-[13px] font-bold mb-1 transition-colors leading-snug ${t.done ? "line-through text-gray-500" : "text-[#303030]"}`}>{t.title}</h4>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[11px] text-[#BDBDBD] font-medium">{t.duration || "60 min"}</span>
                      <div className="ml-auto flex gap-1">
                        <button onClick={(e) => { e.stopPropagation(); onDelete(t.id); }} className="w-6 h-6 rounded-full hover:bg-red-50 text-gray-300 hover:text-red-500 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"><Trash2 size={12} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {queueTasks.length === 0 && (<div className="text-center py-20 opacity-70 relative z-10 pl-6"><p className="text-[11px] font-medium text-[#9FB5AD]">{searchRight ? "Brak wyników" : "Wszystko zrobione!"}</p></div>)}
        </div>
      </div>
    </div>
  );
}
