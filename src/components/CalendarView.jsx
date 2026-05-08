import { useState, useEffect, useRef } from "react";
import {
  Search, ChevronDown, ChevronLeft, ChevronRight, ArrowRight,
  Star, Trash2, X
} from "lucide-react";
import SkeletonScreen from "./ui/Skeleton";
import { checkIsDate } from "../lib/dateHelpers";

export default function CalendarView({ tasks, selectedDate, onChangeDate, onToggle, onDelete, onFocusTask, onEditTask, loading }) {
  const [searchRight, setSearchRight] = useState("");
  const [searchCal, setSearchCal] = useState("");
  const [viewType, setViewType] = useState("Dzień");
  const [popoverDay, setPopoverDay] = useState(null);
  const calendarScrollRef = useRef(null);
  const popoverRef = useRef(null);
  const [nowMinute, setNowMinute] = useState(new Date().getHours() * 60 + new Date().getMinutes());
  const [popoverStyle, setPopoverStyle] = useState({});

  useEffect(() => {
    const interval = setInterval(() => {
      const d = new Date();
      setNowMinute(d.getHours() * 60 + d.getMinutes());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!popoverDay || !popoverRef.current) return;
    const el = popoverRef.current;
    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const style = {};
    if (rect.right > vw - 8) style.left = `${el.offsetLeft - (rect.right - vw) - 16}px`;
    if (rect.left < 8) style.left = `${el.offsetLeft + (8 - rect.left)}px`;
    if (rect.bottom > vh - 8) style.top = `${el.offsetTop - (rect.bottom - vh) - 16}px`;
    if (rect.top < 8) style.top = `${el.offsetTop + (8 - rect.top)}px`;
    if (Object.keys(style).length > 0) setPopoverStyle(style);
  }, [popoverDay]);

  const hours = Array.from({ length: 17 }, (_, i) => i + 6);

  const isSameDate = (textString, targetDate = selectedDate) => checkIsDate(textString, targetDate);

  const timelineTasks = tasks.filter(t => (isSameDate(t.t, selectedDate) || (!t.isLocked && isSameDate(t.deadline, selectedDate))));
  const queueTasks = tasks.filter(t => !searchRight || t.title.toLowerCase().includes(searchRight.toLowerCase()));

  useEffect(() => {
    if (searchCal && calendarScrollRef.current && viewType === "Dzień") {
      const matchedTask = timelineTasks.find(t => t.title.toLowerCase().includes(searchCal.toLowerCase()));
      if (matchedTask) {
        let taskHour = 6;
        if (isSameDate(matchedTask.t, selectedDate)) {
          const match = matchedTask.t ? matchedTask.t.match(/(\d{1,2}):\d{2}/) : null;
          taskHour = match ? parseInt(match[1]) : 8;
        } else if (isSameDate(matchedTask.deadline, selectedDate)) {
          const match = matchedTask.deadline.match(/o (\d{1,2}):\d{2}/);
          if (match) taskHour = parseInt(match[1]);
        }
        const scrollPosition = Math.max(0, (taskHour - 6) * 86.4 - 50);
        calendarScrollRef.current.scrollTo({ top: scrollPosition, behavior: 'smooth' });
      }
    }
  }, [searchCal, timelineTasks, selectedDate, viewType]);

  if (loading) return <SkeletonScreen />;
  const isToday = new Date().toDateString() === selectedDate.toDateString();
  
  const handleGoToToday = () => {
    const today = new Date(); today.setHours(0,0,0,0);
    const selected = new Date(selectedDate); selected.setHours(0,0,0,0);
    const diffDays = Math.round((today.getTime() - selected.getTime()) / (1000 * 3600 * 24));
    onChangeDate(diffDays);
  };

  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay() === 0 ? 6 : d.getDay() - 1;
    d.setDate(d.getDate() - day);
    d.setHours(0,0,0,0);
    return d;
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(getStartOfWeek(selectedDate));
    d.setDate(d.getDate() + i);
    return d;
  });

  const getDaysOfMonth = (date) => {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const firstDayIndex = (startOfMonth.getDay() + 6) % 7;
    const days = [];
    
    const prevMonthEnd = new Date(date.getFullYear(), date.getMonth(), 0);
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(prevMonthEnd);
      d.setDate(prevMonthEnd.getDate() - i);
      days.push({ date: d, isCurrentMonth: false });
    }
    
    for (let i = 1; i <= endOfMonth.getDate(); i++) {
      days.push({ date: new Date(date.getFullYear(), date.getMonth(), i), isCurrentMonth: true });
    }
    
    const totalCells = days.length <= 35 ? 35 : 42;
    let nextMonthDay = 1;
    while (days.length < totalCells) {
      days.push({ date: new Date(date.getFullYear(), date.getMonth() + 1, nextMonthDay++), isCurrentMonth: false });
    }
    return days;
  };

  const renderDailyView = () => (
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
            if (isSameDate(t.t, selectedDate)) { const match = t.t ? t.t.match(/(\d{1,2}):\d{2}/) : null; taskHour = match ? parseInt(match[1]) : t.hour; }
            else if (isSameDate(t.deadline, selectedDate)) { const match = t.deadline.match(/o (\d{1,2}):\d{2}/); if (match) taskHour = parseInt(match[1]); }
            return taskHour === h;
          });
          return (
            <div key={h} className="flex border-t border-[#F0F0F0] h-[5.4rem] relative group">
              <div className="w-16 -mt-2.5 text-[11px] font-medium text-[#909090] text-center bg-white z-10">{h.toString().padStart(2,"0")}:00</div>
              {h === 6 && <div className="absolute left-16 top-0 bottom-[-100rem] w-[1px] bg-[#F0F0F0] pointer-events-none" />}
              <div className="flex-1 relative ml-2 pr-4">
                {tasksInThisHour.map((t, index) => {
                  const isDeadlineBlock = !isSameDate(t.t, selectedDate) && isSameDate(t.deadline, selectedDate);
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
  );

  const renderWeeklyView = () => (
    <div className="flex-1 flex flex-col min-h-0 bg-white">
      <div className="flex border-b border-[#E8E8E8] pl-16 overflow-hidden">
        {weekDays.map((date, i) => {
          const isTodayWeek = new Date().toDateString() === date.toDateString();
          return (
            <div key={i} className="flex-1 text-center py-3 border-l border-[#F0F0F0] min-w-[60px] md:min-w-[100px]">
              <div className={`text-[10px] md:text-[11px] font-medium uppercase mb-1 ${isTodayWeek ? "text-[#057E85]" : "text-[#75757A]"}`}>{date.toLocaleDateString("pl-PL", { weekday: 'short' })}</div>
              <div className={`w-8 h-8 md:w-10 md:h-10 mx-auto rounded-full flex items-center justify-center text-sm md:text-lg font-bold ${isTodayWeek ? "bg-[#057E85] text-white shadow-sm" : "text-[#303030] hover:bg-gray-100 cursor-pointer transition-colors"}`} onClick={() => { onChangeDate(Math.round((date - selectedDate) / (1000 * 3600 * 24))); setViewType("Dzień"); }}>
                {date.getDate()}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-auto relative pb-10 flex" ref={calendarScrollRef}>
        <div className="w-16 flex-shrink-0 pt-4 bg-white z-10 relative">
          {hours.map(h => (
            <div key={h} className="h-[5.4rem] relative">
              <div className="absolute -top-2.5 right-2 text-[10px] font-medium text-[#909090] bg-white px-1">{h.toString().padStart(2,"0")}:00</div>
            </div>
          ))}
        </div>
        <div className="flex-1 flex pt-4 relative min-w-[420px] md:min-w-[700px]">
          {hours.map(h => (
            <div key={h} className="absolute left-0 right-0 border-t border-[#F0F0F0] pointer-events-none" style={{ top: `${(h-6)*5.4 + 1}rem` }} />
          ))}
          {weekDays.map((date, i) => {
            const dayTasks = tasks.filter(t => (isSameDate(t.t, date) || (!t.isLocked && isSameDate(t.deadline, date))));
            const isTodayWeek = new Date().toDateString() === date.toDateString();
            
            return (
              <div key={i} className="flex-1 border-l border-[#F0F0F0] relative min-w-[60px] md:min-w-[100px]">
                {isTodayWeek && nowMinute >= 6*60 && nowMinute <= 23*60 && (
                  <div className="absolute left-0 right-0 z-40 pointer-events-none flex items-center" style={{ top: `${(nowMinute - 6*60) * (5.4/60) + 1}rem` }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#E40D0D] -ml-[3px]" />
                    <div className="w-full h-[2px] bg-[#E40D0D]" />
                  </div>
                )}
                {dayTasks.map((t, index) => {
                  let taskHour = 6;
                  if (isSameDate(t.t, date)) { const match = t.t ? t.t.match(/(\d{1,2}):\d{2}/) : null; taskHour = match ? parseInt(match[1]) : t.hour || 8; }
                  else if (isSameDate(t.deadline, date)) { const match = t.deadline.match(/o (\d{1,2}):\d{2}/); if (match) taskHour = parseInt(match[1]); }
                  if(taskHour < 6 || taskHour > 22) return null;
                  
                  const isDeadlineBlock = !isSameDate(t.t, date) && isSameDate(t.deadline, date);
                  const matchDuration = t.duration ? t.duration.match(/(\d+)/) : null;
                  const mins = matchDuration ? parseInt(matchDuration[1]) : 60;
                  const heightRem = (mins / 60) * 5.4;
                  const topRem = (taskHour - 6) * 5.4 + 1;
                  
                  return (
                    <div key={t.id} onClick={() => onEditTask(t)} style={{ top: `${topRem}rem`, height: `${heightRem}rem`, minHeight: "2.5rem", zIndex: 10+index }}
                      className={`absolute left-0.5 right-0.5 md:left-1 md:right-1 rounded-md p-1 shadow-sm hover:shadow-md transition-all overflow-hidden cursor-pointer border-l-4 ${isDeadlineBlock ? "bg-[#FFDBDB]/80 border-l-[#D04F4F]" : "bg-[#E8F0FE] border-l-[#0A0291]"}`}>
                      <p className={`text-[9px] md:text-[10px] font-bold leading-tight ${isDeadlineBlock ? "text-[#D04F4F]" : "text-[#0A0291]"}`}>{t.title}</p>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );


  const renderMonthlyView = () => {
    const days = getDaysOfMonth(selectedDate);
    const dayNames = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Ndz'];
    const popoverItem = popoverDay ? days.find(d => d.date.toDateString() === popoverDay.toDateString()) : null;
    const popoverTasks = popoverItem ? tasks.filter(t => (isSameDate(t.t, popoverItem.date) || (!t.isLocked && isSameDate(t.deadline, popoverItem.date)))) : [];
    
    return (
      <div className="flex-1 flex flex-col min-h-0 bg-white relative">
        <div className="grid grid-cols-7 border-b border-[#E8E8E8] shrink-0">
          {dayNames.map(d => (
            <div key={d} className="text-center py-2 md:py-3 text-[10px] md:text-[11px] font-bold text-[#75757A] uppercase tracking-wider border-r border-[#F0F0F0] last:border-0">
              {d}
            </div>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-7 auto-rows-[minmax(6rem,1fr)] relative">
            {days.map((item, idx) => {
              const isTodayMonth = new Date().toDateString() === item.date.toDateString();
              const dayTasks = tasks.filter(t => (isSameDate(t.t, item.date) || (!t.isLocked && isSameDate(t.deadline, item.date))));
              
              return (
                <div key={idx} className={`border-r border-b border-[#F0F0F0] p-1 flex flex-col transition-colors ${item.isCurrentMonth ? "bg-white" : "bg-gray-50/50"}`}>
                  <div className="flex justify-center mb-0.5 md:mb-1">
                    <div 
                      onClick={() => { onChangeDate(Math.round((item.date - selectedDate) / (1000 * 3600 * 24))); setViewType("Dzień"); }} 
                      className={`w-5 h-5 md:w-7 md:h-7 flex items-center justify-center rounded-full text-[10px] md:text-xs font-bold hover:bg-gray-200 cursor-pointer transition-colors ${isTodayMonth ? "bg-[#057E85] text-white hover:bg-[#04666d] shadow-sm" : item.isCurrentMonth ? "text-[#303030]" : "text-[#C0C0C0]"}`}>
                      {item.date.getDate()}
                    </div>
                  </div>
                  <div className="flex-1 overflow-hidden flex flex-col gap-0.5" onClick={() => { if(dayTasks.length > 0) { setPopoverStyle({}); setPopoverDay(item.date); } }}>
                    {dayTasks.slice(0, 3).map(t => {
                      const isDeadlineBlock = !isSameDate(t.t, item.date) && isSameDate(t.deadline, item.date);
                      let timeStr = "";
                      if (isDeadlineBlock) {
                        const m = t.deadline.match(/o (\d{1,2}:\d{2})/);
                        if (m) timeStr = m[1];
                      } else if (t.t) {
                        const m = t.t.match(/(\d{1,2}:\d{2})/);
                        if (m) timeStr = m[1];
                        else if (t.hour) timeStr = `${t.hour}:00`;
                      }
                      return (
                        <div key={t.id} onClick={(e) => { e.stopPropagation(); onEditTask(t); }} className="flex items-center gap-1.5 px-1 py-0.5 rounded text-[10px] hover:bg-gray-100 truncate cursor-pointer transition-colors">
                          <div className={`w-2 h-2 rounded-full shrink-0 ${isDeadlineBlock ? "bg-[#D04F4F]" : "bg-[#057E85]"}`} />
                          {timeStr && <span className="font-medium text-[#5A7368] text-[9px]">{timeStr}</span>}
                          <span className={`font-bold truncate ${isDeadlineBlock ? "text-[#303030]" : "text-[#303030]"}`}>{t.title}</span>
                        </div>
                      )
                    })}
                    {dayTasks.length > 3 && (
                      <div onClick={(e) => { e.stopPropagation(); setPopoverStyle({}); setPopoverDay(item.date); }} className="text-[10px] font-bold text-[#303030] pl-1 hover:text-[#057E85] cursor-pointer mt-0.5 transition-colors">
                        +{dayTasks.length - 3} więcej
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* POPOVER — rendered outside the grid, uses fixed positioning to stay on screen */}
        {popoverDay && popoverItem && (
          <>
            <div className="fixed inset-0 z-[998]" onClick={() => setPopoverDay(null)} />
            <div ref={popoverRef} style={popoverStyle} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 md:w-72 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.25)] border border-[#E8DDD0] z-[999] overflow-hidden cursor-default" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#F0F0F0]">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase text-[#75757A]">{dayNames[(popoverDay.getDay()+6)%7]}</span>
                  <span className="text-xl font-bold text-[#303030] leading-none">{popoverDay.getDate()}</span>
                </div>
                <button onClick={() => setPopoverDay(null)} className="p-1 hover:bg-gray-100 rounded-full text-[#75757A] transition-colors"><X size={16}/></button>
              </div>
              <div className="p-2 max-h-72 overflow-y-auto space-y-0.5">
                {popoverTasks.map(t => {
                  const isDeadlineBlock = !isSameDate(t.t, popoverItem.date) && isSameDate(t.deadline, popoverItem.date);
                  let timeStr = "";
                  if (isDeadlineBlock) {
                    const m = t.deadline.match(/o (\d{1,2}:\d{2})/);
                    if (m) timeStr = m[1];
                  } else if (t.t) {
                    const m = t.t.match(/(\d{1,2}:\d{2})/);
                    if (m) timeStr = m[1];
                    else if (t.hour) timeStr = `${t.hour}:00`;
                  }
                  return (
                    <div key={t.id} onClick={() => { setPopoverDay(null); onEditTask(t); }} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${isDeadlineBlock ? "bg-[#D04F4F]" : "bg-[#057E85]"}`} />
                      {timeStr && <span className="font-medium text-[#5A7368] text-[10px] w-8 shrink-0">{timeStr}</span>}
                      <span className={`text-[11px] font-bold truncate group-hover:text-[#057E85] transition-colors ${isDeadlineBlock ? "text-[#303030]" : "text-[#303030]"}`}>{t.title}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-full bg-[#FCFCFD] overflow-hidden">
      <div className="flex-1 flex flex-col p-6 pr-8 h-full">
        <header className="mb-6 flex flex-col gap-2 shrink-0">
          <h1 className="font-lora text-3xl font-bold text-[#303030]">Kalendarz</h1>
          <p className="text-[#1D1B20] text-base">Twój czas, twoje zasady! Zaplanuj dzień, tydzień lub cały miesiąc.<br />Pamiętaj, że każdy mały krok ma znaczenie.</p>
        </header>
        <div className="flex-1 bg-white border border-[#E8E8E8] rounded-[13px] flex flex-col overflow-hidden shadow-sm min-h-0 relative">
          <div className="h-[70px] border-b border-[#E8E8E8] flex items-center justify-between px-6 shrink-0 bg-white z-20">
            <div className="flex items-center gap-6">
              <span className="text-lg font-bold text-[#202021] capitalize w-48 truncate">
                {viewType === "Dzień" && selectedDate.toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" })}
                {viewType === "Tydzień" && `${weekDays[0].getDate()} ${weekDays[0].toLocaleDateString("pl-PL",{month:"short"})} - ${weekDays[6].getDate()} ${weekDays[6].toLocaleDateString("pl-PL",{month:"short"})}`}
                {viewType === "Miesiąc" && selectedDate.toLocaleDateString("pl-PL", { month: "long", year: "numeric" })}
              </span>
              <div className="relative group z-[100]">
                <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 rounded-lg text-[#202021] font-medium text-sm transition-colors border border-transparent hover:border-gray-200">{viewType} <ChevronDown size={16} className="text-gray-500" /></button>
                <div className="absolute top-full left-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  {["Dzień", "Tydzień", "Miesiąc"].map(v => (<button key={v} onClick={() => setViewType(v)} className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${viewType === v ? "font-bold text-[#057E85]" : "text-gray-700"}`}>{v}</button>))}
                </div>
              </div>
              <div className="relative w-[300px] ml-4 hidden md:block">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9D9898]" />
                <input type="text" placeholder="Szukaj w planie..." value={searchCal} onChange={(e) => setSearchCal(e.target.value)} className="w-full pl-9 pr-4 py-1.5 rounded-md border border-[#E8E8E8] text-sm focus:outline-none focus:border-[#057E85] bg-white transition-all shadow-sm placeholder:text-[#75757A]" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleGoToToday} className="px-4 py-1.5 bg-white border border-[#E8E8E8] rounded-md text-[#202021] font-semibold text-sm hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2">Dzisiaj <ArrowRight size={16} className="text-[#9D9898] -rotate-45" /></button>
              <div className="flex items-center gap-1 border border-[#E8E8E8] rounded-md overflow-hidden shadow-sm">
                <button onClick={() => {
                  if (viewType === "Tydzień") onChangeDate(-7);
                  else if (viewType === "Miesiąc") {
                    const d = new Date(selectedDate);
                    d.setMonth(d.getMonth() - 1);
                    onChangeDate(Math.round((d - selectedDate) / (1000 * 3600 * 24)));
                  }
                  else onChangeDate(-1);
                }} className="p-1.5 bg-white hover:bg-gray-50 text-gray-600 transition-colors"><ChevronLeft size={18} /></button>
                <div className="w-px h-5 bg-[#E8E8E8]"></div>
                <button onClick={() => {
                  if (viewType === "Tydzień") onChangeDate(7);
                  else if (viewType === "Miesiąc") {
                    const d = new Date(selectedDate);
                    d.setMonth(d.getMonth() + 1);
                    onChangeDate(Math.round((d - selectedDate) / (1000 * 3600 * 24)));
                  }
                  else onChangeDate(1);
                }} className="p-1.5 bg-white hover:bg-gray-50 text-gray-600 transition-colors"><ChevronRight size={18} /></button>
              </div>
            </div>
          </div>
          {viewType === "Dzień" && renderDailyView()}
          {viewType === "Tydzień" && renderWeeklyView()}
          {viewType === "Miesiąc" && renderMonthlyView()}
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
              const deadlineToday = isSameDate(t.deadline, selectedDate);
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
