import React, { useState, useEffect, useRef } from "react";
import {
  ChevronDown, ChevronLeft, ChevronRight, ArrowRight,
  Star, Trash2, X, Calendar as CalendarIcon, Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SkeletonScreen from "./ui/Skeleton";
import { checkIsDate } from "../lib/dateHelpers";

const MONTH_NAMES = [
  "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec",
  "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"
];

export default function CalendarView({
  tasks,
  selectedDate,
  setSelectedDate,
  onChangeDate,
  onToggle,
  onDelete,
  onFocusTask,
  onEditTask,
  onMoveTask,
  onReturnToBacklog,
  loading,
  onNav
}) {
  const [viewType, setViewType] = useState("Miesiąc");
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [slideDirection, setSlideDirection] = useState(1);
  const calendarScrollRef = useRef(null);
  const [nowMinute, setNowMinute] = useState(new Date().getHours() * 60 + new Date().getMinutes());

  // Stan wspierający czytelny podgląd Drag and Drop (Google Calendar Style)
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragTarget, setDragTarget] = useState(null); // { type: 'grid'|'weekly'|'month'|'backlog', dateStr, startMins, durationMins, title }

  // Obsługa gestów swipe (przesuwanie w lewo / prawo na telefonie)
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });

  const formatMinsToTime = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const d = new Date();
      setNowMinute(d.getHours() * 60 + d.getMinutes());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const hours = Array.from({ length: 17 }, (_, i) => i + 6);

  const isSameDate = (textString, targetDate = selectedDate) => checkIsDate(textString, targetDate);

  // Pomocnicza: formatuj Date na 'YYYY-MM-DD' do porównania z pDate
  const formatYMD = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const selectedYMD = formatYMD(selectedDate);

  // Główne źródło prawdy o przynależności do dnia = pDate.
  const isTaskForDate = (t, targetDate) => {
    const targetYMD = formatYMD(targetDate);
    if (t.pDate) return t.pDate === targetYMD;
    return (isSameDate(t.t, targetDate) || (!t.isLocked && isSameDate(t.deadline, targetDate)));
  };

  const timelineTasks = tasks.filter(t => isTaskForDate(t, selectedDate));
  const queueTasks = tasks.filter(t => !t.pDate || t.pDate === selectedYMD);

  if (loading) return <SkeletonScreen />;
  const isToday = new Date().toDateString() === selectedDate.toDateString();

  const handleSelectDay = (targetDate) => {
    if (setSelectedDate) {
      setSelectedDate(new Date(targetDate));
    } else if (onChangeDate) {
      const diffDays = Math.round((targetDate.getTime() - selectedDate.getTime()) / (1000 * 3600 * 24));
      onChangeDate(diffDays);
    }
    setViewType("Dzień");
  };

  const handleGoToToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (setSelectedDate) {
      setSelectedDate(today);
    } else if (onChangeDate) {
      const selected = new Date(selectedDate);
      selected.setHours(0, 0, 0, 0);
      const diffDays = Math.round((today.getTime() - selected.getTime()) / (1000 * 3600 * 24));
      onChangeDate(diffDays);
    }
  };

  const handlePickMonthYear = (monthIndex, year) => {
    const d = new Date(selectedDate);
    d.setFullYear(year);
    d.setMonth(monthIndex);
    if (setSelectedDate) {
      setSelectedDate(d);
    } else if (onChangeDate) {
      onChangeDate(Math.round((d - selectedDate) / (1000 * 3600 * 24)));
    }
    setIsMonthPickerOpen(false);
  };

  // Obsługa gestów swipe (przesuwanie w lewo / prawo na telefonie)

  const handleTouchStart = (e) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    });
  };

  const handleTouchEnd = (e) => {
    if (!e.changedTouches || e.changedTouches.length === 0) return;
    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
    };

    const deltaX = touchEnd.x - touchStart.x;
    const deltaY = touchEnd.y - touchStart.y;

    // Wykrycie przesunięcia w poziomie o co najmniej 45 pikseli
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 45) {
      if (deltaX < 0) {
        // Przesunięcie w lewo -> Następny dzień lub miesiąc (slide w prawo do lewej)
        setSlideDirection(1);
        if (viewType === "Miesiąc") {
          const d = new Date(selectedDate);
          d.setMonth(d.getMonth() + 1);
          if (setSelectedDate) setSelectedDate(d);
          else onChangeDate(Math.round((d - selectedDate) / (1000 * 3600 * 24)));
        } else if (viewType === "Dzień") {
          onChangeDate(1);
        } else if (viewType === "Tydzień") {
          onChangeDate(7);
        }
      } else {
        // Przesunięcie w prawo -> Poprzedni dzień lub miesiąc (slide w lewo do prawej)
        setSlideDirection(-1);
        if (viewType === "Miesiąc") {
          const d = new Date(selectedDate);
          d.setMonth(d.getMonth() - 1);
          if (setSelectedDate) setSelectedDate(d);
          else onChangeDate(Math.round((d - selectedDate) / (1000 * 3600 * 24)));
        } else if (viewType === "Dzień") {
          onChangeDate(-1);
        } else if (viewType === "Tydzień") {
          onChangeDate(-7);
        }
      }
    }
  };

  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay() === 0 ? 6 : d.getDay() - 1;
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
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

    // Always 42 days (6 full rows)
    const totalCells = 42;
    let nextMonthDay = 1;
    while (days.length < totalCells) {
      days.push({ date: new Date(date.getFullYear(), date.getMonth() + 1, nextMonthDay++), isCurrentMonth: false });
    }
    return days;
  };

  const computeOverlapLayout = (taskList, targetDate, minCardHeightRem = 2.5) => {
    if (!taskList || taskList.length === 0) return [];

    const items = taskList.map(t => {
      let taskHour = 8;
      let taskMinute = 0;
      let mins = 60;

      if (t.sMins !== undefined && t.sMins !== null) {
        taskHour = Math.floor(t.sMins / 60);
        taskMinute = t.sMins % 60;
        if (t.eMins !== undefined && t.eMins !== null) {
          mins = Math.max(15, t.eMins - t.sMins);
        }
      } else if (t.t) {
        const match = t.t.match(/(\d{1,2}):(\d{2})/);
        if (match) {
          taskHour = parseInt(match[1], 10);
          taskMinute = parseInt(match[2], 10);
        } else if (t.hour !== undefined && t.hour !== null) {
          taskHour = parseInt(t.hour, 10);
        }
      } else if (t.deadline) {
        const match = t.deadline.match(/o (\d{1,2}):(\d{2})/);
        if (match) {
          taskHour = parseInt(match[1], 10);
          taskMinute = parseInt(match[2], 10);
        }
      }

      if ((t.sMins === undefined || t.sMins === null) || (t.eMins === undefined || t.eMins === null)) {
        const matchDuration = t.duration ? t.duration.match(/(\d+)/) : null;
        if (matchDuration) mins = parseInt(matchDuration[1], 10);
      }

      const startMins = taskHour * 60 + taskMinute;
      const startOffsetMins = Math.max(0, startMins - 6 * 60);
      const topRem = (startOffsetMins / 60) * 5.4;
      const heightRem = (mins / 60) * 5.4;
      const actualHeight = Math.max(heightRem, minCardHeightRem);

      const isDeadlineBlock = !t.isLocked && t.deadline && isSameDate(t.deadline, targetDate) && !(t.t && t.t.includes('🔒'));

      const startStr = `${taskHour.toString().padStart(2, "0")}:${taskMinute.toString().padStart(2, "0")}`;
      const endTotalMins = startMins + mins;
      const endHour = Math.floor(endTotalMins / 60) % 24;
      const endMin = endTotalMins % 60;
      const endStr = `${endHour.toString().padStart(2, "0")}:${endMin.toString().padStart(2, "0")}`;

      return {
        ...t,
        startMins,
        mins,
        topRem,
        heightRem,
        actualHeight,
        isDeadlineBlock,
        startStr,
        endStr
      };
    });

    items.sort((a, b) => a.topRem - b.topRem || b.actualHeight - a.actualHeight);

    const groups = [];
    let currentGroup = [];
    let maxGroupEnd = 0;

    items.forEach(item => {
      if (currentGroup.length === 0) {
        currentGroup.push(item);
        maxGroupEnd = item.topRem + item.actualHeight;
      } else {
        if (item.topRem < maxGroupEnd - 0.05) {
          currentGroup.push(item);
          maxGroupEnd = Math.max(maxGroupEnd, item.topRem + item.actualHeight);
        } else {
          groups.push(currentGroup);
          currentGroup = [item];
          maxGroupEnd = item.topRem + item.actualHeight;
        }
      }
    });
    if (currentGroup.length > 0) groups.push(currentGroup);

    groups.forEach(group => {
      const cols = [];
      group.forEach(t => {
        let placed = false;
        for (let i = 0; i < cols.length; i++) {
          const lastInCol = cols[i][cols[i].length - 1];
          if (t.topRem >= lastInCol.topRem + lastInCol.actualHeight - 0.05) {
            cols[i].push(t);
            t.colIndex = i;
            placed = true;
            break;
          }
        }
        if (!placed) {
          t.colIndex = cols.length;
          cols.push([t]);
        }
      });
      const colCount = cols.length;
      group.forEach(t => {
        t.colCount = colCount;
        t.widthPct = 100 / colCount;
        t.leftOffsetPct = t.colIndex * t.widthPct;
      });
    });

    return items;
  };

  const renderDailyView = () => {
    const positionedTasks = computeOverlapLayout(timelineTasks, selectedDate, 3.5);

    return (
      <div className="flex-1 overflow-y-auto relative pb-10 custom-scrollbar" ref={calendarScrollRef}>
        {isToday && nowMinute >= 6*60 && nowMinute <= 23*60 && (
          <div className="absolute left-[64px] right-0 z-40 pointer-events-none flex items-center transition-all duration-1000" style={{ top: `${(nowMinute - 6*60) * (86.4/60) + 16}px` }}>
            <div className="w-2.5 h-2.5 rounded-full bg-[#E40D0D] -ml-[5px] relative z-10" />
            <div className="flex-1 h-[2px] bg-[#E40D0D]" />
          </div>
        )}
        <div 
          className="relative pt-4 min-h-[55rem] cursor-pointer"
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
            const rect = e.currentTarget.getBoundingClientRect();
            const offsetY = e.clientY - rect.top;
            const remSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
            const hourPx = 5.4 * remSize;
            const minsFrom6 = ((offsetY - 1 * remSize) / hourPx) * 60;
            let startMins = Math.round((6 * 60 + minsFrom6) / 15) * 15;
            startMins = Math.max(6 * 60, Math.min(22 * 60, startMins));

            const taskObj = tasks.find(t => t.id === Number(draggedTaskId));
            const durMatch = taskObj?.duration ? taskObj.duration.match(/(\d+)/) : null;
            const durationMins = durMatch ? parseInt(durMatch[1]) : 45;

            setDragTarget({
              type: 'grid',
              dateStr: selectedYMD,
              startMins,
              durationMins: Math.max(30, durationMins),
              title: taskObj ? taskObj.title : "Przenoszone zadanie"
            });
          }}
          onDragLeave={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) {
              setDragTarget(null);
            }
          }}
          onDrop={(e) => {
            e.preventDefault();
            const taskId = e.dataTransfer.getData("text/plain");
            if (taskId && dragTarget && onMoveTask) {
              onMoveTask(parseInt(taskId), dragTarget.dateStr, dragTarget.startMins);
            }
            setDragTarget(null);
            setDraggedTaskId(null);
          }}
        >
          {hours.map(h => (
            <div 
              key={h} 
              className="flex border-t border-[#F0F0F0] h-[5.4rem] relative group"
            >
              <div className="w-16 -mt-2.5 text-[11px] font-medium text-[#909090] text-center bg-white z-10 pointer-events-none">{h.toString().padStart(2,"0")}:00</div>
              {h === 6 && <div className="absolute left-16 top-0 bottom-[-100rem] w-[1px] bg-[#F0F0F0] pointer-events-none" />}
            </div>
          ))}

          {/* DYNAMICZNA RAMKA PODGLĄDU DRAG & DROP (GHOST BOX) */}
          {dragTarget && dragTarget.type === 'grid' && dragTarget.dateStr === selectedYMD && (
            <div 
              style={{ 
                top: `${((dragTarget.startMins - 6*60) / 60) * 5.4 + 1}rem`,
                height: `${(dragTarget.durationMins / 60) * 5.4}rem`,
                minHeight: '3rem'
              }}
              className="absolute left-16 right-4 rounded-[16px] border-2 border-dashed border-[#057E85] bg-[#057E85]/20 backdrop-blur-[2px] z-50 pointer-events-none transition-all duration-75 flex flex-col justify-between p-3 shadow-lg animate-pulse"
            >
              <div className="flex justify-between items-center">
                <span className="text-[12px] font-bold text-[#057E85] truncate">{dragTarget.title}</span>
                <span className="text-[10px] font-extrabold bg-[#057E85] text-white px-2.5 py-0.5 rounded-full shadow-sm">
                  {formatMinsToTime(dragTarget.startMins)} - {formatMinsToTime(dragTarget.startMins + dragTarget.durationMins)}
                </span>
              </div>
              <div className="text-[10px] font-semibold text-[#057E85]">📍 Upuść tutaj, aby zaplanować</div>
            </div>
          )}

          <div className="absolute top-4 left-16 right-4 bottom-0 pointer-events-none">
            {positionedTasks.map((t) => {
              const { isDeadlineBlock, topRem, heightRem, widthPct, leftOffsetPct, startStr, endStr, colIndex } = t;
              const isBeingDragged = draggedTaskId === t.id.toString() || draggedTaskId === t.id;
              return (
                <div 
                  key={t.id} 
                  draggable={!t.isLocked}
                  onDragStart={(e) => { 
                    e.dataTransfer.setData("text/plain", t.id.toString()); 
                    setDraggedTaskId(t.id.toString());
                  }}
                  onDragEnd={() => {
                    setDraggedTaskId(null);
                    setDragTarget(null);
                  }}
                  onClick={() => onEditTask(t)} 
                  style={{ 
                    top: `${topRem}rem`, 
                    height: `${heightRem}rem`, 
                    minHeight: "3.5rem", 
                    width: `calc(${widthPct}% - 6px)`, 
                    left: `calc(${leftOffsetPct}% + 3px)`,
                    zIndex: 10 + (colIndex || 0)
                  }}
                  className={`absolute rounded-[16px] p-3 shadow-sm hover:shadow-md hover:z-50 transition-all overflow-hidden cursor-pointer pointer-events-auto border-2 ${isBeingDragged ? "opacity-30 border-dashed border-gray-400 scale-95" : ""} ${!t.isLocked ? "active:opacity-80 active:scale-95" : ""} ${isDeadlineBlock ? "bg-[#FFDBDB]/60 border-red-300 hover:border-red-400" : "bg-white border-[#0A0291]/60 hover:border-[#0A0291]"}`}
                >
                  <div className="flex justify-between items-start mb-1 gap-1 pointer-events-none">
                    <p className={`text-[12px] font-bold truncate ${isDeadlineBlock ? "text-[#D04F4F]" : "text-[#303030]"}`}>{t.title}</p>
                    {isDeadlineBlock ? (<span className="text-[10px] text-[#D04F4F] bg-[#FFDBDB] px-2 py-0.5 rounded-full shrink-0 hidden sm:block">deadline</span>) : (<span className="text-[10px] text-[#DC8A25] bg-[#FFE5C5] px-2 py-0.5 rounded-full shrink-0 hidden sm:block">zaplanowane</span>)}
                  </div>
                  <p className="text-[11px] text-[#BDBDBD] mt-0.5 font-medium pointer-events-none">{startStr} - {endStr}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

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
            const dayTasks = tasks.filter(t => isTaskForDate(t, date));
            const positionedTasks = computeOverlapLayout(dayTasks, date, 2.2);
            const isTodayWeek = new Date().toDateString() === date.toDateString();
            const dateStr = formatYMD(date);
            
            return (
              <div 
                key={i} 
                className="flex-1 border-l border-[#F0F0F0] relative min-w-[60px] md:min-w-[100px] hover:bg-[#F5F9F7]/50 transition-colors"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  const rect = e.currentTarget.getBoundingClientRect();
                  const offsetY = e.clientY - rect.top;
                  const remSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
                  const hourPx = 5.4 * remSize;
                  const minsFrom6 = ((offsetY - 1 * remSize) / hourPx) * 60;
                  let startMins = Math.round((6 * 60 + minsFrom6) / 15) * 15;
                  startMins = Math.max(6 * 60, Math.min(22 * 60, startMins));

                  const taskObj = tasks.find(t => t.id === Number(draggedTaskId));
                  const durMatch = taskObj?.duration ? taskObj.duration.match(/(\d+)/) : null;
                  const durationMins = durMatch ? parseInt(durMatch[1]) : 45;

                  setDragTarget({
                    type: 'weekly',
                    dateStr,
                    startMins,
                    durationMins: Math.max(30, durationMins),
                    title: taskObj ? taskObj.title : "Przenoszone zadanie"
                  });
                }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) {
                    setDragTarget(null);
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const taskId = e.dataTransfer.getData("text/plain");
                  if (taskId && dragTarget && onMoveTask) {
                    onMoveTask(parseInt(taskId), dragTarget.dateStr, dragTarget.startMins);
                  }
                  setDragTarget(null);
                  setDraggedTaskId(null);
                }}
              >
                {/* GHOST BOX DLA WIDOKU TYGODNIOWEGO */}
                {dragTarget && dragTarget.type === 'weekly' && dragTarget.dateStr === dateStr && (
                  <div 
                    style={{ 
                      top: `${((dragTarget.startMins - 6*60) / 60) * 5.4 + 1}rem`,
                      height: `${(dragTarget.durationMins / 60) * 5.4}rem`,
                      minHeight: '2.2rem'
                    }}
                    className="absolute left-1 right-1 rounded-md border-2 border-dashed border-[#057E85] bg-[#057E85]/20 backdrop-blur-[2px] z-50 pointer-events-none transition-all duration-75 flex flex-col justify-center p-1 shadow-md animate-pulse"
                  >
                    <span className="text-[9px] font-extrabold text-[#057E85] truncate leading-none">{dragTarget.title}</span>
                    <span className="text-[8px] font-bold text-[#057E85] mt-0.5">
                      {formatMinsToTime(dragTarget.startMins)} - {formatMinsToTime(dragTarget.startMins + dragTarget.durationMins)}
                    </span>
                  </div>
                )}
                {isTodayWeek && nowMinute >= 6*60 && nowMinute <= 23*60 && (
                  <div className="absolute left-0 right-0 z-40 pointer-events-none flex items-center" style={{ top: `${(nowMinute - 6*60) * (5.4/60) + 1}rem` }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#E40D0D] -ml-[3px]" />
                    <div className="w-full h-[2px] bg-[#E40D0D]" />
                  </div>
                )}
                {positionedTasks.map((t) => {
                  const { isDeadlineBlock, topRem, heightRem, widthPct, leftOffsetPct, colIndex } = t;
                  return (
                    <div 
                      key={t.id} 
                      draggable={!t.isLocked}
                      onDragStart={(e) => { e.dataTransfer.setData("text/plain", t.id); e.stopPropagation(); }}
                      onClick={() => onEditTask(t)} 
                      style={{ 
                        top: `${topRem + 1}rem`, 
                        height: `${heightRem}rem`, 
                        minHeight: "2.2rem", 
                        width: `calc(${widthPct}% - 4px)`, 
                        left: `calc(${leftOffsetPct}% + 2px)`,
                        zIndex: 10 + (colIndex || 0)
                      }}
                      className={`absolute rounded-md p-1 shadow-sm hover:shadow-md hover:z-50 transition-all overflow-hidden cursor-pointer border-l-4 ${!t.isLocked ? "active:opacity-80 active:scale-95" : ""} ${isDeadlineBlock ? "bg-[#FFDBDB]/90 border-l-[#D04F4F]" : "bg-[#E8F0FE] border-l-[#0A0291]"}`}
                    >
                      <p className={`text-[9px] md:text-[10px] font-bold leading-tight truncate pointer-events-none ${isDeadlineBlock ? "text-[#D04F4F]" : "text-[#0A0291]"}`}>{t.title}</p>
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
    const dayNames = ['Pn', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nd'];
    
    return (
      <div className="flex-1 flex flex-col h-full min-h-0 bg-white relative">
        <div className="grid grid-cols-7 shrink-0 bg-[#FAFAFA]">
          {dayNames.map(d => (
            <div key={d} className="text-center py-2 text-[10px] md:text-[11px] font-black text-[#5A7368] uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>
        <div className="flex-1 h-full min-h-0">
          <div className="grid grid-cols-7 grid-rows-6 h-full w-full">
            {days.map((item, idx) => {
              const isTodayMonth = new Date().toDateString() === item.date.toDateString();
              const isSelectedDay = selectedDate.toDateString() === item.date.toDateString();
              const dayTasks = tasks.filter(t => isTaskForDate(t, item.date));
              
              return (
                <div 
                  key={idx} 
                  onClick={() => handleSelectDay(item.date)}
                  className={`p-1 md:p-1.5 flex flex-col justify-between transition-all cursor-pointer hover:bg-[#E8F4ED]/60 active:scale-[0.98] select-none ${
                    isSelectedDay 
                      ? "bg-[#E8F4ED]/80 ring-2 ring-inset ring-[#1E5C36]/30" 
                      : item.isCurrentMonth 
                      ? "bg-white" 
                      : "bg-gray-50/60"
                  }`}
                  onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const taskId = e.dataTransfer.getData("text/plain");
                    const dateStr = formatYMD(item.date);
                    if(taskId && onMoveTask) onMoveTask(parseInt(taskId), dateStr, 8 * 60);
                  }}
                >
                  <div className="flex justify-between items-center px-0.5 mb-1">
                    <div 
                      className={`w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-full text-[11px] md:text-xs font-black transition-all ${
                        isTodayMonth 
                          ? "bg-[#1E5C36] text-white shadow-sm" 
                          : isSelectedDay
                          ? "bg-[#2D9E6B] text-white shadow-sm"
                          : item.isCurrentMonth 
                          ? "text-[#1A2F22]" 
                          : "text-[#B0B0B0]"
                      }`}
                    >
                      {item.date.getDate()}
                    </div>

                    {/* Licznik zadań na mobile */}
                    {dayTasks.length > 0 && (
                      <span className="text-[9px] font-extrabold text-[#1E5C36] bg-[#1E5C36]/10 px-1.5 py-0.2 rounded-full">
                        {dayTasks.length}
                      </span>
                    )}
                  </div>

                  {/* Bezpośrednie tytuły zadań w komórce */}
                  <div className="flex-1 overflow-hidden flex flex-col justify-start gap-1 px-0.5">
                    {dayTasks.slice(0, 2).map(t => {
                      const isDeadline = !isSameDate(t.t, item.date) && isSameDate(t.deadline, item.date);
                      return (
                        <div 
                          key={t.id} 
                          className={`flex items-center gap-1 px-1 py-0.5 rounded text-[9px] md:text-[10px] font-bold truncate leading-tight border transition-colors ${
                            t.done
                              ? "bg-gray-100 text-gray-400 border-gray-200 line-through"
                              : isDeadline
                              ? "bg-red-50 text-red-700 border-red-200"
                              : t.p === "wysoki"
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : "bg-[#E8F4ED] text-[#1E5C36] border-[#2D9E6B]/30"
                          }`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            t.done ? "bg-gray-300" : isDeadline ? "bg-red-500" : t.p === "wysoki" ? "bg-amber-500" : "bg-[#2D9E6B]"
                          }`} />
                          <span className="truncate">{t.title}</span>
                        </div>
                      );
                    })}
                    {dayTasks.length > 2 && (
                      <div className="text-[8px] md:text-[9px] font-extrabold text-[#1E5C36] pl-0.5 leading-none mt-0.5">
                        +{dayTasks.length - 2} więcej
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const currentYear = selectedDate.getFullYear();
  const yearsList = [currentYear - 1, currentYear, currentYear + 1];

  return (
    <div className="flex h-full bg-[#FAFAFA] overflow-hidden">
      <div className="flex-1 flex flex-col p-0 md:p-6 md:pr-8 h-full min-h-0">
        <header className="mb-4 hidden md:flex md:flex-col gap-1 shrink-0">
          <h1 className="text-2xl md:text-3xl font-bold text-[#1A2F22]">Kalendarz</h1>
          <p className="text-[#5A7368] text-sm md:text-base hidden md:block">Twój czas, twoje zasady! Zaplanuj dzień, tydzień lub cały miesiąc.</p>
        </header>

        <div className="flex-1 bg-white border-none md:border md:border-[#E8DDD0] rounded-none md:rounded-2xl flex flex-col overflow-hidden shadow-none md:shadow-sm min-h-0 relative h-full">
          {/* PASEK NAWIGACJI KALENDARZA */}
          <div className="h-12 md:h-[70px] border-b border-[#E8DDD0] flex items-center justify-between px-3 md:px-6 shrink-0 bg-white z-[60]">
            {/* Widok Dzienny: Tytuł dnia po lewej, Przycisk X w prawym rogu */}
            {viewType === "Dzień" ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center min-w-0 pr-2">
                  <span className="text-base md:text-lg font-black text-[#1A2F22] capitalize truncate">
                    {selectedDate.toLocaleDateString("pl-PL", { weekday: "short", day: "numeric", month: "long" })}
                  </span>
                </div>

                {/* Przycisk X w prawym rogu zamiast strzałek */}
                <button 
                  onClick={() => setViewType("Miesiąc")}
                  className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gray-100 hover:bg-[#E8F4ED] text-[#1A2F22] hover:text-[#1E5C36] flex items-center justify-center transition-colors cursor-pointer active:scale-95 shrink-0"
                  title="Zamknij widok dnia (wróć do miesiąca)"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              /* Widok Miesięczny / Tygodniowy */
              <>
                <div className="flex items-center gap-2 md:gap-6 min-w-0 relative">
                  {/* Tytuł miesiąca z rozwijaną strzałką */}
                  <div className="relative">
                    <button
                      onClick={() => setIsMonthPickerOpen(!isMonthPickerOpen)}
                      className="flex items-center gap-1.5 hover:bg-[#F5EFE6] px-2 py-1 -ml-1 rounded-xl text-base md:text-lg font-black text-[#1A2F22] capitalize transition-colors cursor-pointer active:scale-95"
                    >
                      <span>{selectedDate.toLocaleDateString("pl-PL", { month: "long", year: "numeric" })}</span>
                      <ChevronDown size={18} className={`text-[#5A7368] transition-transform duration-200 ${isMonthPickerOpen ? "rotate-180 text-[#1E5C36]" : ""}`} />
                    </button>

                    {/* Menu rozwijane wyboru miesiąca */}
                    {isMonthPickerOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-[110]" 
                          onClick={() => setIsMonthPickerOpen(false)} 
                        />
                        <div className="absolute left-0 top-full mt-2 w-64 max-h-80 overflow-y-auto bg-white border border-[#E8DDD0] rounded-2xl shadow-2xl p-2 z-[120] animate-in fade-in zoom-in-95 duration-150 custom-scrollbar">
                          {yearsList.map(year => (
                            <div key={year} className="mb-2 last:mb-0">
                              {/* Nieklikalny nagłówek roku */}
                              <div className="px-3 py-1.5 bg-[#F5EFE6] rounded-xl text-center text-xs font-black text-[#1E5C36] uppercase tracking-widest my-1 select-none pointer-events-none">
                                {year}
                              </div>
                              <div className="grid grid-cols-3 gap-1">
                                {MONTH_NAMES.map((mName, mIdx) => {
                                  const isSelected = selectedDate.getFullYear() === year && selectedDate.getMonth() === mIdx;
                                  return (
                                    <button
                                      key={mIdx}
                                      onClick={() => handlePickMonthYear(mIdx, year)}
                                      className={`py-2 px-1 rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
                                        isSelected 
                                          ? "bg-[#1E5C36] text-white shadow-sm" 
                                          : "text-[#1A2F22] hover:bg-[#E8F4ED] hover:text-[#1E5C36]"
                                      }`}
                                    >
                                      {mName.slice(0, 3)}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Wybór widoku na desktopie */}
                  <div className="relative group z-[100] hidden md:block">
                    <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 rounded-lg text-[#1A2F22] font-semibold text-sm transition-colors border border-transparent hover:border-gray-200">
                      {viewType} <ChevronDown size={16} className="text-gray-500" />
                    </button>
                    <div className="absolute top-full left-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[110]">
                      {["Dzień", "Tydzień", "Miesiąc"].map(v => (
                        <button key={v} onClick={() => setViewType(v)} className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${viewType === v ? "font-bold text-[#1E5C36]" : "text-gray-700"}`}>
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 md:gap-3">
                  {/* Przycisk Dzisiaj na desktopie */}
                  <button 
                    onClick={handleGoToToday} 
                    className="hidden md:flex px-4 py-1.5 bg-white border border-[#E8DDD0] rounded-xl text-[#1A2F22] font-bold text-sm hover:bg-[#F5EFE6] transition-colors shadow-sm items-center gap-2 cursor-pointer"
                  >
                    Dzisiaj <ArrowRight size={16} className="text-[#5A7368] -rotate-45" />
                  </button>

                  {/* Przyciski przewijania miesięcy */}
                  <div className="flex items-center gap-1 border border-[#E8DDD0] rounded-xl overflow-hidden shadow-sm bg-white">
                    <button 
                      onClick={() => {
                        setSlideDirection(-1);
                        const d = new Date(selectedDate);
                        if (viewType === "Tydzień") {
                          onChangeDate(-7);
                        } else if (viewType === "Dzień") {
                          onChangeDate(-1);
                        } else {
                          d.setMonth(d.getMonth() - 1);
                          if (setSelectedDate) setSelectedDate(d);
                          else onChangeDate(Math.round((d - selectedDate) / (1000 * 3600 * 24)));
                        }
                      }} 
                      className="p-1.5 md:p-2 hover:bg-[#F5EFE6] text-[#1A2F22] transition-colors cursor-pointer"
                      title="Poprzedni"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <div className="w-px h-5 bg-[#E8DDD0]"></div>
                    <button 
                      onClick={() => {
                        setSlideDirection(1);
                        const d = new Date(selectedDate);
                        if (viewType === "Tydzień") {
                          onChangeDate(7);
                        } else if (viewType === "Dzień") {
                          onChangeDate(1);
                        } else {
                          d.setMonth(d.getMonth() + 1);
                          if (setSelectedDate) setSelectedDate(d);
                          else onChangeDate(Math.round((d - selectedDate) / (1000 * 3600 * 24)));
                        }
                      }} 
                      className="p-1.5 md:p-2 hover:bg-[#F5EFE6] text-[#1A2F22] transition-colors cursor-pointer"
                      title="Następny"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Renderowanie widoków z obsługą gestów Swipe i animacją slajdu (Google Calendar style) */}
          <div 
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="flex-1 flex flex-col min-h-0 h-full touch-pan-y relative overflow-hidden"
          >
            <AnimatePresence mode="popLayout" custom={slideDirection}>
              <motion.div
                key={viewType === "Miesiąc" ? `month-${selectedDate.getFullYear()}-${selectedDate.getMonth()}` : `day-${selectedYMD}`}
                custom={slideDirection}
                variants={{
                  enter: (dir) => ({
                    x: dir > 0 ? "100%" : "-100%",
                    opacity: 1,
                  }),
                  center: {
                    x: 0,
                    opacity: 1,
                  },
                  exit: (dir) => ({
                    x: dir > 0 ? "-100%" : "100%",
                    opacity: 1,
                  }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 }
                }}
                className="flex-1 flex flex-col min-h-0 h-full w-full bg-white"
              >
                {viewType === "Dzień" && renderDailyView()}
                {viewType === "Tydzień" && renderWeeklyView()}
                {viewType === "Miesiąc" && renderMonthlyView()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Prawa kolumna (Backlog / Zadania) na dużych ekranach */}
      <div className="w-[300px] bg-[#FAFAFA] border-l border-[#E8DDD0] flex flex-col hidden lg:flex shrink-0 h-full relative z-10">
        <div className="p-6 pb-4 pt-6 shrink-0 bg-[#FAFAFA] z-20">
          <h2 className="text-xl font-bold text-[#1A2F22] mb-2">Zadania na ten dzień</h2>
          <p className="text-xs text-[#5A7368]">Kliknij zadanie, aby je edytować.</p>
        </div>
        <div 
          className={`flex-1 overflow-y-auto px-6 pb-8 relative transition-all duration-200 ${dragTarget && dragTarget.type === 'backlog' ? "bg-emerald-50/70 border-2 border-dashed border-[#057E85] rounded-2xl shadow-inner" : ""}`}
          onDragOver={(e) => { 
            e.preventDefault(); 
            e.dataTransfer.dropEffect = "move"; 
            setDragTarget({ type: 'backlog' });
          }}
          onDragLeave={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) {
              setDragTarget(null);
            }
          }}
          onDrop={(e) => {
            e.preventDefault();
            const taskId = e.dataTransfer.getData("text/plain");
            if(taskId && onReturnToBacklog) onReturnToBacklog(parseInt(taskId));
            setDragTarget(null);
            setDraggedTaskId(null);
          }}
        >
          {dragTarget && dragTarget.type === 'backlog' && (
            <div className="my-4 p-3 rounded-xl border-2 border-dashed border-[#057E85] bg-[#057E85]/10 text-center animate-bounce">
              <span className="text-[12px] font-bold text-[#057E85]">📥 Upuść tutaj, aby cofnąć zadanie do Backlogu</span>
            </div>
          )}
          <div className="space-y-3">
            {queueTasks.map((t) => {
              const deadlineToday = isSameDate(t.deadline, selectedDate);
              return (
                <div 
                  key={t.id}
                  onClick={() => onEditTask(t)} 
                  draggable={!t.isLocked}
                  onDragStart={(e) => { e.dataTransfer.setData("text/plain", t.id); }}
                  className={`bg-white p-3.5 rounded-2xl border border-[#E8DDD0] transition-all duration-200 cursor-pointer group hover:-translate-y-0.5 hover:shadow-md ${!t.isLocked ? "active:opacity-80 active:scale-95" : ""} ${t.done ? "opacity-60 grayscale border-gray-200" : ""}`}
                >
                  <div className="flex justify-between items-start mb-1.5 pointer-events-none">
                    <div className="flex items-center gap-1.5">
                      <Star size={14} className={t.p === "wysoki" ? "text-red-500 fill-red-500" : (t.p === "sredni" ? "text-amber-500 fill-amber-500" : "text-emerald-500 fill-emerald-500")} />
                    </div>
                    {deadlineToday && !t.done && <span className="text-[10px] text-red-700 bg-red-50 px-2 py-0.5 rounded-full font-bold">dzisiaj</span>}
                    {t.done && <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">zrobione</span>}
                  </div>
                  <h4 className={`text-xs font-bold mb-1 transition-colors leading-snug pointer-events-none ${t.done ? "line-through text-gray-400" : "text-[#1A2F22]"}`}>{t.title}</h4>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-[#5A7368] font-semibold pointer-events-none">{t.duration || "60 min"}</span>
                    <div className="ml-auto flex gap-1">
                      <button onClick={(e) => { e.stopPropagation(); onDelete(t.id); }} title="usuń zadanie" className="w-6 h-6 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"><Trash2 size={12} /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {queueTasks.length === 0 && (
            <div className="text-center py-16 opacity-70">
              <p className="text-xs font-medium text-[#5A7368]">Brak zadań na ten dzień</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
