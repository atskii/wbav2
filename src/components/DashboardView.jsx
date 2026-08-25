import { useState, useEffect } from "react";
import {
  ChevronLeft, ChevronRight, ChevronDown, Plus,
  RefreshCw, Play, Check, RotateCcw, Trash2, Lock, Star, BookOpen, Leaf, X, Pencil, HelpCircle
} from "lucide-react";
import { checkIsDate } from "../lib/dateHelpers";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import PBadge from "./ui/PBadge";
import StreakPlant from "./StreakPlant";
import { useTutorials } from "../hooks/useTutorials";

// Komponent dla pojedynczego zadania na osi czasu z obsługą Swipe
const TaskCard = ({
  t, pClass, minH, titleSize, btnClass, btnIconSize, showTime, actionsPosClass,
  isTapped, setTappedTaskId, draggedTaskId, setDraggedTaskId, setDashDragTarget,
  onEditTask, onFocusTask, onReturnToBacklog, onDelete, onToggle, widthPct, leftOffset, formatTime
}) => {
  const x = useMotionValue(0);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchStartY, setTouchStartY] = useState(null);
  
  // Zmiana koloru w zależności od przesunięcia
  const bg = useTransform(
    x,
    [-100, 0, 100],
    ["#FEE2E2", t.done ? "#F9FAFB" : "#FFFFFF", "#DCFCE7"] // Czerwony w lewo, Zielony w prawo
  );
  
  const borderColor = useTransform(
    x,
    [-100, 0, 100],
    ["#F87171", t.done ? "#E5E7EB" : "#E8DDD0", "#4ADE80"]
  );

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      whileHover={{ scale: 1.02, y: -3, zIndex: 50, transition: { type: "spring", stiffness: 400, damping: 25 } }}
      key={t.id} 
      draggable={!t.isLocked}
      onDragStart={(e) => { 
        if (e.dataTransfer) {
          e.dataTransfer.setData("text/plain", t.id.toString()); 
          if (e.dataTransfer.setDragImage) {
            e.dataTransfer.setDragImage(e.currentTarget, 0, 0);
          }
        }
        setDraggedTaskId(t.id.toString());
        setTappedTaskId(null);
      }}
      onDragEnd={() => {
        setDraggedTaskId(null);
        setDashDragTarget(null);
      }}
      onTouchStart={(e) => {
        setTouchStartX(e.touches[0].clientX);
        setTouchStartY(e.touches[0].clientY);
      }}
      onTouchMove={(e) => {
        if (touchStartX === null || touchStartY === null) return;
        if (draggedTaskId === t.id.toString() || draggedTaskId === t.id) return; // Prevent swipe if drag&drop is active
        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const deltaX = currentX - touchStartX;
        const deltaY = currentY - touchStartY;
        
        // Horizontal swipe only
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // Opor jeśli przesuwamy w prawo zadanie zakończone, itp. - ale tu po prostu elastycznie
          x.set(deltaX * 0.8); 
        }
      }}
      onTouchEnd={(e) => {
        if (touchStartX === null || touchStartY === null) return;
        const currentX = e.changedTouches[0].clientX;
        const deltaX = currentX - touchStartX;
        
        if (Math.abs(deltaX) > 75) {
          if (deltaX > 75) {
            onToggle(t.id, e);
          } else if (deltaX < -75) {
            if (t.done || t.isLocked) {
              onDelete(t.id);
            } else {
              onReturnToBacklog(t.id);
            }
          }
        }
        
        // Zawsze wracaj na pozycję zero (nawet przy usunięciu, żeby animacja layout się nie zepsuła)
        animate(x, 0, { type: "spring", stiffness: 400, damping: 25 });
        setTouchStartX(null);
        setTouchStartY(null);
      }}
      style={{ 
        x,
        backgroundColor: bg,
        borderColor: borderColor,
        top: `${t.topRem + 0.2}rem`, 
        height: `${t.heightRem - 0.4}rem`, 
        minHeight: minH, 
        width: `calc(${widthPct}% - 4px)`, 
        left: `calc(${leftOffset}% + 2px)`,
        touchAction: "pan-y"
      }}
      onClick={(e) => {
        if (isTapped) {
          setTappedTaskId(null);
        } else {
          setTappedTaskId(t.id);
        }
      }} 
      className={`absolute rounded-[14px] ${pClass} shadow-sm border-2 z-20 hover:z-50 cursor-pointer group flex flex-col justify-center ${draggedTaskId === t.id.toString() || draggedTaskId === t.id ? "opacity-30 border-dashed border-gray-400 scale-95" : ""} ${t.done ? 'opacity-60 grayscale hover:opacity-80' : 'hover:shadow-md hover:border-[#D4C9BC]'}`} 
    >
      <div className={`flex flex-col h-full relative`}>
        <div className="flex justify-between items-start">
          <h4 className={`${titleSize} font-bold transition-colors truncate pr-2 flex-1 ${t.done ? 'line-through text-gray-500' : 'text-[#1A2F22]'}`} title={t.title}>{t.title}</h4>
          <div className={`flex items-center gap-2 flex-shrink-0 relative z-30 transition-opacity duration-200 ${isTapped ? 'opacity-0' : 'group-hover:opacity-0'}`}>
            <PBadge p={t.p} />
            {t.isLocked && <Lock size={12} strokeWidth={2.5} className="text-[#909090]" />}
          </div>
        </div>
        <div className="mt-auto">
          {showTime && (
            <p className={`text-[13px] mt-1 ${t.done ? 'text-gray-400' : 'text-[#5A5A5A]'}`}>{formatTime(t.sMins)} — {formatTime(t.eMins)}</p>
          )}
        </div>

        <div className={`absolute ${actionsPosClass} flex items-center gap-1 sm:gap-1.5 transition-all z-40 bg-white/90 p-1 rounded-xl backdrop-blur-sm ${isTapped ? 'opacity-100 scale-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <button onClick={(e) => { e.stopPropagation(); onEditTask(t); setTappedTaskId(null); }} title="edytuj" className={`${btnClass} rounded-full bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white flex items-center justify-center shadow-sm transition-all`}><Pencil size={btnIconSize} /></button>
          {!t.done && <button onClick={(e) => { e.stopPropagation(); onFocusTask(t); setTappedTaskId(null); }} title="tryb skupienia" className={`${btnClass} rounded-full bg-[#E8F4ED] text-[#1E5C36] hover:bg-[#1E5C36] hover:text-white flex items-center justify-center shadow-sm transition-all`}><Play size={btnIconSize} className="ml-0.5" /></button>}
          {!t.isLocked && !t.done && (
            <button onClick={(e) => { e.stopPropagation(); onReturnToBacklog(t.id); setTappedTaskId(null); }} title="cofnij zadanie do listy zadań poza planem" className={`${btnClass} rounded-full bg-orange-50 text-orange-500 hover:bg-orange-500 hover:text-white flex items-center justify-center shadow-sm transition-all`}>
              <RotateCcw size={btnIconSize} />
            </button>
          )}
          <button onClick={(e) => { e.stopPropagation(); onDelete(t.id); setTappedTaskId(null); }} title="usuń zadanie" className={`${btnClass} rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center shadow-sm transition-all`}><Trash2 size={btnIconSize} /></button>
          <button onClick={(e) => { e.stopPropagation(); onToggle(t.id, e); setTappedTaskId(null); }} title="zaznacz zadanie jako wykonane" className={`${btnClass} rounded-full flex items-center justify-center shadow-sm transition-all ${t.done ? 'bg-[#5A7368] text-white' : 'bg-[#E8F4ED] text-[#1E5C36] border border-[#2D9E6B]'}`}><Check size={btnIconSize} /></button>
        </div>
      </div>
    </motion.div>
  );
};

// Komponent dla zadania w Backlogu
const BacklogCard = ({
  t, i, isTapped, setTappedTaskId, draggedTaskId, setDraggedTaskId, setDashDragTarget,
  onEditTask, onDelete
}) => {
  const x = useMotionValue(0);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchStartY, setTouchStartY] = useState(null);
  
  const bg = useTransform(x, [-100, 0], ["#FEE2E2", "#F9FAFB"]);
  const borderColor = useTransform(x, [-100, 0], ["#F87171", "#E8DDD0"]);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 25, delay: i * 0.05 }}
      key={t.id} 
      draggable={!t.isLocked}
      onDragStart={(e) => { 
        if (e.dataTransfer) {
          e.dataTransfer.setData("text/plain", t.id.toString()); 
          if (e.dataTransfer.setDragImage) {
            e.dataTransfer.setDragImage(e.currentTarget, 0, 0);
          }
        }
        setDraggedTaskId(t.id.toString());
        setTappedTaskId(null);
      }}
      onDragEnd={() => {
        setDraggedTaskId(null);
        setDashDragTarget(null);
      }}
      onTouchStart={(e) => {
        setTouchStartX(e.touches[0].clientX);
        setTouchStartY(e.touches[0].clientY);
      }}
      onTouchMove={(e) => {
        if (touchStartX === null || touchStartY === null) return;
        if (draggedTaskId === t.id.toString() || draggedTaskId === t.id) return; // Prevent swipe if drag&drop is active
        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const deltaX = currentX - touchStartX;
        const deltaY = currentY - touchStartY;
        
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          x.set(deltaX * 0.8); 
        }
      }}
      onTouchEnd={(e) => {
        if (touchStartX === null || touchStartY === null) return;
        const currentX = e.changedTouches[0].clientX;
        const deltaX = currentX - touchStartX;
        
        if (deltaX < -75) {
          onDelete(t.id); // Swipe left -> Delete
        }
        
        animate(x, 0, { type: "spring", stiffness: 400, damping: 25 });
        setTouchStartX(null);
        setTouchStartY(null);
      }}
      style={{ 
        x,
        backgroundColor: bg,
        borderColor: borderColor,
        minHeight: '4.8rem',
        touchAction: "pan-y"
      }}
      whileHover={{ scale: 1.02, transition: { type: "spring", stiffness: 400, damping: 25 } }}
      className={`p-4 rounded-2xl border-2 cursor-pointer group relative flex flex-col justify-between ${draggedTaskId === t.id.toString() || draggedTaskId === t.id ? "opacity-30 border-dashed border-gray-400 scale-95" : "hover:shadow-md"}`} 
      onClick={(e) => {
        if (isTapped) {
          setTappedTaskId(null);
        } else {
          setTappedTaskId(t.id);
        }
      }} 
    >
      <div className="flex items-start gap-3 pr-24">
        <div className={`mt-0.5 flex-shrink-0 flex items-center gap-1 ${t.p === 'wysoki' ? 'text-red-400' : t.p === 'sredni' ? 'text-amber-400' : 'text-emerald-400'}`}>
          <Star size={16} fill="currentColor" strokeWidth={1} />
          {t.isLocked && <span className="text-red-600 font-black text-[10px] animate-pulse">!</span>}
        </div>
        <div className="flex flex-col gap-1"><span className="text-[13px] font-bold text-[#1A2F22]">{t.title}</span><span className="text-[9px] font-bold text-[#5A7368]">{t.duration}</span></div>
      </div>
      <div className={`flex items-center gap-2 transition-all absolute top-1/2 -translate-y-1/2 right-6 z-30 bg-white/90 p-1 rounded-xl backdrop-blur-sm ${isTapped ? 'opacity-100 scale-100' : 'opacity-0 group-hover:opacity-100'}`}>
        <button onClick={(e) => { e.stopPropagation(); onEditTask(t); setTappedTaskId(null); }} title="edytuj" className="w-9 h-9 rounded-full bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white flex items-center justify-center shadow-sm transition-all"><Pencil size={16} /></button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(t.id); setTappedTaskId(null); }} title="usuń zadanie" className="w-9 h-9 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center shadow-sm transition-all"><Trash2 size={16} /></button>
      </div>
      {t.isLocked && <div title="Sztywny termin zablokowany w kalendarzu" className="absolute bottom-4 left-5 z-30 flex items-center justify-center w-[18px] h-[18px] rounded border border-[#E8DDD0] bg-white shadow-sm"><Lock size={10} strokeWidth={2.5} className="text-[#5A7368]" /></div>}
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════
//  DASHBOARD VIEW (ZAMROŻONY PLAN Z GUZIKIEM GENERUJ)
// ═══════════════════════════════════════════════════
export default function DashboardView({ tasks, moods, selectedDate, onChangeDate, onToggle, onOpenTaskModal, onEditTask, onDelete, onReturnToBacklog, onMoveTask, onAlert, onFocusTask, loading, onGeneratePlan, userPrefs, userEmail }) {

  const [showBacklog, setShowBacklog] = useState(false);

  // Samouczki
  const { isTooltipSeen, markTooltipSeen, resetTooltipGroup } = useTutorials(userEmail || userPrefs?.email);
  const [showDateNavTutorial, setShowDateNavTutorial] = useState(false);
  const [showGeneratePlanTutorial, setShowGeneratePlanTutorial] = useState(false);
  const [showAddTaskTutorial, setShowAddTaskTutorial] = useState(false);

  useEffect(() => {
    setShowDateNavTutorial(!isTooltipSeen("dashboard_date_nav"));
    setShowGeneratePlanTutorial(!isTooltipSeen("dashboard_generate_plan"));
    setShowAddTaskTutorial(!isTooltipSeen("dashboard_add_task"));
  }, [isTooltipSeen]);

  // Stany Drag & Drop z czytelnym podglądem godziny
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dashDragTarget, setDashDragTarget] = useState(null); // { type: 'timeline'|'backlog', startMins, durationMins, title }
  
  // Mobile interactions state
  const [tappedTaskId, setTappedTaskId] = useState(null);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchStartY, setTouchStartY] = useState(null);
  const [swipeOffsets, setSwipeOffsets] = useState({});

  const [nowMinute, setNowMinute] = useState(new Date().getHours() * 60 + new Date().getMinutes());
  useEffect(() => {
    const interval = setInterval(() => {
      const d = new Date();
      setNowMinute(d.getHours() * 60 + d.getMinutes());
    }, 60000);
    return () => clearInterval(interval);
  }, []);
  const isToday = new Date().toDateString() === selectedDate.toDateString();


  // Godzina startu z onboardingu (domyślnie 6)
  const parsedStart = userPrefs?.startTime ? userPrefs.startTime.split(':').map(Number) : [6, 0];
  let timelineStart = parsedStart[0] || 6;
  const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

  const flexScheduled = tasks.filter(t => !t.isLocked && t.sMins !== null && t.sMins !== undefined && t.pDate === dateStr);
  const lockedScheduled = tasks.filter(t => {
    if (!t.isLocked || !t.t) return false;
    // pDate jest głównym źródłem prawdy o przynależności do dnia
    if (t.pDate) return t.pDate === dateStr;
    // Fallback dla starych zadań bez pDate
    return checkIsDate(t.t, selectedDate);
  }).map(t => {
    const match = t.t.match(/(\d{1,2}):(\d{2})/);
    const startMins = match ? parseInt(match[1]) * 60 + parseInt(match[2]) : 0;
    const durMatch = t.duration ? t.duration.match(/(\d+)/) : null;
    const duration = durMatch ? parseInt(durMatch[1]) : 60;
    return { ...t, sMins: startMins, eMins: startMins + duration };
  });

  const scheduled = [...flexScheduled, ...lockedScheduled].sort((a, b) => a.sMins - b.sMins);

  if (scheduled.length > 0) {
    const earliestHour = Math.floor(scheduled[0].sMins / 60);
    if (earliestHour < timelineStart) {
      timelineStart = earliestHour;
    }
  }

  // Zabezpieczony Backlog (brak zaplanowanej daty i niezablokowane)
  const backlog = tasks.filter(t =>
    (!t.pDate) && (!t.isLocked)
  );

  const timelineWithGaps = [];
  scheduled.forEach((t, i) => {
    timelineWithGaps.push(t);
    if (i < scheduled.length - 1) {
      const currEnd = Math.max(t.eMins, t.sMins + (t.duration ? parseInt(t.duration) : 45));
      const nextStart = scheduled[i + 1].sMins;
      const gap = nextStart - currEnd;
      if (gap >= 15) {
        // Losowa propozycja przerwy z odpowiedzi z pytania 3 onboardingu
        const breakPicks = userPrefs?.picks || [];
        const breakTitle = breakPicks.length > 0
          ? breakPicks[Math.floor(Math.random() * breakPicks.length)]
          : "Czas na regenerację";
        timelineWithGaps.push({ id: `gap-${i}`, isVisualGap: true, title: breakTitle, duration: `${gap} min`, sMins: currEnd, eMins: nextStart });
      }
    }
  });

  // Długość dnia pracy z onboardingu (domyślnie 12h od startu)
  const workHours = userPrefs?.hours || 12;
  const lastTaskMins = scheduled.length > 0 ? scheduled[scheduled.length - 1].eMins : ((timelineStart + workHours) * 60);
  const timelineEndHour = Math.max(timelineStart + workHours, Math.ceil(lastTaskMins / 60) + 1);
  const hours = Array.from({ length: timelineEndHour - timelineStart + 1 }, (_, i) => timelineStart + i);
  const minsToRem = (mins) => (mins / 60) * 7.2;
  const formatTime = (mins) => `${Math.floor(mins / 60)}:${(mins % 60).toString().padStart(2, '0')}`;

  return (
    <div className="px-4 md:px-6 pt-2 pb-0 md:pb-6 max-w-6xl mx-auto w-full xl:h-[calc(100vh-88px)] flex flex-col overflow-y-auto xl:overflow-hidden">
      <div className="xl:grid xl:grid-cols-12 xl:gap-16 items-start flex-1 min-h-0">
        <div className="xl:col-span-8 relative max-w-4xl mx-auto w-full xl:h-full flex flex-col min-h-0">
          {/* NAGŁÓWEK DASHBOARDU PRZENIESIONY TUTAJ - NAD PLAN DNI */}
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5 lg:gap-0 mb-6 flex-shrink-0">
            <div className="flex flex-col items-start gap-1 w-full lg:w-auto">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#1A2F22] tracking-tight">Dzisiejsze zadania</h1>
                <button 
                  onClick={() => resetTooltipGroup(['dashboard_date_nav', 'dashboard_generate_plan', 'dashboard_add_task', 'dashboard_streak_plant'])}
                  className="p-1.5 sm:p-2 mt-1 hover:bg-[#E8F4ED] rounded-full transition-all text-[#5A7368] hover:text-[#1E5C36]"
                  title="Przywróć samouczki ekranu"
                >
                  <HelpCircle size={22} className="sm:w-6 sm:h-6" />
                </button>
              </div>
              
              <div className="flex gap-2 w-full lg:w-auto mt-4 mb-2 lg:hidden">
                <button onClick={onOpenTaskModal} className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-[#057E85] text-white rounded-xl text-sm font-bold hover:bg-[#04686e] transition-all shadow-md active:scale-95">
                  Dodaj zadanie <Plus size={16} />
                </button>
                <button onClick={onGeneratePlan} className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-[#E8DDD0] text-[#1A2F22] rounded-xl text-sm font-bold hover:bg-[#F5EFE6] transition-all shadow-sm active:scale-95">
                  <RefreshCw size={16} />
                </button>
              </div>

              <div className="relative flex items-center justify-between w-full lg:w-auto lg:justify-start gap-3 mt-2">
                {showDateNavTutorial && (
                  <div className="absolute top-[calc(100%+12px)] left-0 w-64 p-4 bg-white text-[#1A2F22] rounded-2xl shadow-2xl border-2 border-[#2D9E6B] z-[9999] animate-in fade-in slide-in-from-top-2 duration-300">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDateNavTutorial(false);
                        markTooltipSeen("dashboard_date_nav");
                      }}
                      className="absolute top-2 right-2 p-1 hover:bg-[#E8F4ED] text-[#5A7368] hover:text-[#1E5C36] rounded-full transition-all cursor-pointer"
                      title="Zamknij podpowiedź"
                    >
                      <X size={13} />
                    </button>
                    <strong className="text-[#1E5C36] font-bold text-xs block mb-1">Nawigacja po dniach:</strong>
                    <p className="text-[11px] leading-relaxed text-[#5A7368] pr-2">
                      Służy po to, aby dokładnie ustawić sobie plan i wprowadzić zmiany w poszczególne dni.
                    </p>
                    <div className="absolute -top-2.5 left-6 w-0 h-0 border-x-[8px] border-x-transparent border-b-[10px] border-b-white"></div>
                    <div className="absolute -top-3 left-6 w-0 h-0 border-x-[9px] border-x-transparent border-b-[11px] border-b-[#2D9E6B] -z-10"></div>
                  </div>
                )}
                <button onClick={() => onChangeDate(-1)} className="p-1 hover:bg-[#E8DDD0] rounded-full transition-all active:scale-95 text-[#1A2F22]">
                  <ChevronLeft size={20} strokeWidth={2.5} />
                </button>
                <span className="text-[16px] lg:text-[20px] font-bold text-[#1A2F22] capitalize text-center">
                  {selectedDate.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
                <button onClick={() => onChangeDate(1)} className="p-1 hover:bg-[#E8DDD0] rounded-full transition-all active:scale-95 text-[#1A2F22]">
                  <ChevronRight size={20} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            <div className="hidden lg:flex gap-2 w-full lg:w-auto mt-2">
              <div className="relative">
                {showGeneratePlanTutorial && (
                  <div className="absolute top-[calc(100%+12px)] right-0 w-52 p-3.5 bg-white text-[#1A2F22] rounded-2xl shadow-2xl border-2 border-[#2D9E6B] z-[9999] animate-in fade-in slide-in-from-top-2 duration-300">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowGeneratePlanTutorial(false);
                        markTooltipSeen("dashboard_generate_plan");
                      }}
                      className="absolute top-1.5 right-1.5 p-1 hover:bg-[#E8F4ED] text-[#5A7368] hover:text-[#1E5C36] rounded-full transition-all cursor-pointer"
                      title="Zamknij podpowiedź"
                    >
                      <X size={12} />
                    </button>
                    <strong className="text-[#1E5C36] font-bold text-xs block mb-0.5">Generuj plan:</strong>
                    <p className="text-[11px] leading-relaxed text-[#5A7368] pr-2">
                      Na podstawie zadań, które do niego dodaliśmy, utworzy się nam zoptymalizowany plan dnia.
                    </p>
                    <div className="absolute -top-2.5 right-10 w-0 h-0 border-x-[8px] border-x-transparent border-b-[10px] border-b-white"></div>
                    <div className="absolute -top-3 right-10 w-0 h-0 border-x-[9px] border-x-transparent border-b-[11px] border-b-[#2D9E6B] -z-10"></div>
                  </div>
                )}
                <button onClick={onGeneratePlan} title="Generuj plan" className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-[#057E85] text-white rounded-xl text-sm font-bold hover:bg-[#04686e] transition-all shadow-md active:scale-95">
                  <RefreshCw size={15} /> Generuj plan
                </button>
              </div>

              <div className="relative">
                {showAddTaskTutorial && (
                  <div className="absolute top-[calc(100%+12px)] left-0 w-48 p-3.5 bg-white text-[#1A2F22] rounded-2xl shadow-2xl border-2 border-[#2D9E6B] z-[9999] animate-in fade-in slide-in-from-top-2 duration-300">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAddTaskTutorial(false);
                        markTooltipSeen("dashboard_add_task");
                      }}
                      className="absolute top-1.5 right-1.5 p-1 hover:bg-[#E8F4ED] text-[#5A7368] hover:text-[#1E5C36] rounded-full transition-all cursor-pointer"
                      title="Zamknij podpowiedź"
                    >
                      <X size={12} />
                    </button>
                    <strong className="text-[#1E5C36] font-bold text-xs block mb-0.5">Dodaj zadanie:</strong>
                    <p className="text-[11px] leading-relaxed text-[#5A7368] pr-2">
                      Tutaj szybko dodasz nowe zadania do swojego planu.
                    </p>
                    <div className="absolute -top-2.5 left-8 w-0 h-0 border-x-[8px] border-x-transparent border-b-[10px] border-b-white"></div>
                    <div className="absolute -top-3 left-8 w-0 h-0 border-x-[9px] border-x-transparent border-b-[11px] border-b-[#2D9E6B] -z-10"></div>
                  </div>
                )}
                <button onClick={onOpenTaskModal} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-[#E8DDD0] text-[#1A2F22] rounded-xl text-sm font-bold hover:bg-[#F5EFE6] transition-all shadow-sm active:scale-95">
                  Dodaj <Plus size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* RESPANSYWNA LINIA OSI CZASU */}
          <div className="xl:flex-1 xl:overflow-y-auto relative pr-2 md:pr-4 custom-scrollbar -mr-2 md:-mr-4 min-h-0">
            <div className="relative mt-8" style={{ height: `${minsToRem((timelineEndHour - timelineStart) * 60)}rem` }}>
              <div className="absolute left-[2.5rem] md:left-[3.25rem] top-0 bottom-0 border-l-2 border-dashed border-[#C4BBAF] z-0"></div>
              {isToday && nowMinute >= timelineStart*60 && nowMinute <= timelineEndHour*60 && (
                <div className="absolute left-[2.5rem] md:left-[3.25rem] right-0 z-40 pointer-events-none flex items-center transition-all duration-1000" style={{ top: `${minsToRem(nowMinute - timelineStart*60)}rem` }}>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#E40D0D] -ml-[5px] relative z-10" />
                  <div className="flex-1 h-[2px] bg-[#E40D0D]" />
                </div>
              )}
              {hours.map((h, i) => (
                <div key={h} className="absolute left-0 flex items-center w-full" style={{ top: `${minsToRem(i * 60)}rem` }}>
                  <span className="text-[9px] md:text-[10px] font-bold text-[#9FB5AD] w-8 md:w-10 text-right py-1 relative z-10 bg-[#FAFAFA]">{h}:00</span>
                  <div className="w-2 md:w-4 h-[1px] bg-[#E8DDD0] ml-1 md:ml-2"></div>
                </div>
              ))}

              {/* KONTENER ZADAŃ - MNIEJSZY MARGINES NA MOBILE */}
              <div 
                className="absolute top-0 bottom-0 left-12 md:left-20 right-0 flex justify-center pointer-events-auto cursor-pointer"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  const rect = e.currentTarget.getBoundingClientRect();
                  const offsetY = e.clientY - rect.top;
                  const remSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
                  const offsetYRem = offsetY / remSize;
                  const minsFromStart = (offsetYRem / 7.2) * 60;
                  
                  let totalMins = (timelineStart * 60) + minsFromStart;
                  totalMins = Math.round(totalMins / 15) * 15;
                  totalMins = Math.max(timelineStart * 60, Math.min((timelineEndHour - 1) * 60, totalMins));

                  const taskObj = tasks.find(t => t.id === Number(draggedTaskId));
                  const durMatch = taskObj?.duration ? taskObj.duration.match(/(\d+)/) : null;
                  const durationMins = durMatch ? parseInt(durMatch[1]) : 45;

                  setDashDragTarget({
                    type: 'timeline',
                    startMins: totalMins,
                    durationMins: Math.max(30, durationMins),
                    title: taskObj ? taskObj.title : "Przenoszone zadanie"
                  });
                }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) {
                    setDashDragTarget(null);
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const taskId = e.dataTransfer.getData("text/plain");
                  if (taskId && dashDragTarget && onMoveTask) {
                    onMoveTask(parseInt(taskId), dateStr, dashDragTarget.startMins);
                  }
                  setDashDragTarget(null);
                  setDraggedTaskId(null);
                }}
              >
                <div className="w-full max-w-3xl relative h-full pointer-events-auto">
                  {/* GHOST BOX PODGLĄDU NA OSI CZASU DASHBOARDU */}
                  {dashDragTarget && dashDragTarget.type === 'timeline' && (
                    <div 
                      style={{ 
                        top: `${minsToRem(dashDragTarget.startMins - (timelineStart * 60))}rem`,
                        height: `${minsToRem(dashDragTarget.durationMins)}rem`,
                        minHeight: '3rem'
                      }}
                      className="absolute left-1 right-1 rounded-[16px] border-2 border-dashed border-[#057E85] bg-[#057E85]/20 backdrop-blur-[2px] z-50 pointer-events-none transition-all duration-75 flex flex-col justify-between p-3 shadow-lg animate-pulse"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[12px] font-bold text-[#057E85] truncate">{dashDragTarget.title}</span>
                        <span className="text-[10px] font-extrabold bg-[#057E85] text-white px-2.5 py-0.5 rounded-full shadow-sm">
                          {formatTime(dashDragTarget.startMins)} — {formatTime(dashDragTarget.startMins + dashDragTarget.durationMins)}
                        </span>
                      </div>
                      <div className="text-[10px] font-semibold text-[#057E85]">📍 Upuść tutaj, aby umieścić w planie</div>
                    </div>
                  )}
                  {(() => {
                    const renderItems = timelineWithGaps.map(t => {
                      const topRem = minsToRem(t.sMins - (timelineStart * 60));
                      const durMins = t.duration ? parseInt(t.duration) : 45;
                      const heightRem = minsToRem(Math.max(durMins, 15));
                      const actualHeight = t.isVisualGap ? minsToRem(t.eMins - t.sMins) : Math.max(heightRem, 2.2);
                      return { ...t, topRem, heightRem, actualHeight, durMins };
                    });

                    const tasksOnly = renderItems.filter(t => !t.isVisualGap);
                    let currentGroup = [];
                    let maxEnd = 0;
                    const groups = [];

                    tasksOnly.forEach(t => {
                      if (currentGroup.length === 0) {
                        currentGroup.push(t);
                        maxEnd = t.topRem + t.actualHeight;
                      } else {
                        if (t.topRem < maxEnd - 0.2) {
                          currentGroup.push(t);
                          maxEnd = Math.max(maxEnd, t.topRem + t.actualHeight);
                        } else {
                          groups.push(currentGroup);
                          currentGroup = [t];
                          maxEnd = t.topRem + t.actualHeight;
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
                          if (t.topRem >= lastInCol.topRem + lastInCol.actualHeight - 0.2) {
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
                      });
                    });

                    return (
                      <AnimatePresence>
                        {renderItems.map(t => {
                          if (t.isVisualGap) {
                            return (
                              <motion.div 
                                key={t.id} 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute left-0 right-0 flex items-center justify-center z-10 pointer-events-none" 
                                style={{ top: `${t.topRem}rem`, height: `${t.actualHeight}rem` }}
                              >
                                <div className="w-full flex items-center justify-center relative">
                                  <div className="absolute px-4 py-1.5 flex items-center gap-2">
                                    {t.title.toLowerCase().includes('spacer') || t.title.toLowerCase().includes('powietrze') ? <Leaf size={16} className="text-[#057E85]" /> : <BookOpen size={16} className="text-[#057E85]" />}
                                    <span className="text-sm font-semibold text-[#057E85]">{t.title}</span>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          }

                          const widthPct = 100 / t.colCount;
                          const leftOffset = t.colIndex * widthPct;

                          const isSmall = t.durMins <= 25;
                          const isMedium = t.durMins > 25 && t.durMins <= 45;

                          const pClass = isSmall ? 'p-1.5 px-2' : isMedium ? 'p-2' : 'p-4';
                          const minH = isSmall ? '2rem' : isMedium ? '3.1rem' : '4.8rem';
                          const titleSize = isSmall ? 'text-[11px]' : isMedium ? 'text-xs' : 'text-[13px]';
                          const btnClass = isSmall ? 'w-5 h-5' : isMedium ? 'w-6 h-6' : 'w-7 h-7';
                          const btnIconSize = isSmall ? 8 : isMedium ? 10 : 12;
                          const showTime = !isSmall;

                          const actionsPosClass = (isSmall || isMedium) ? 'top-1/2 -translate-y-1/2 right-0' : 'top-0 right-0';
                          const isTapped = tappedTaskId === t.id.toString() || tappedTaskId === t.id;

                          return (
                            <TaskCard
                              key={t.id}
                              t={t} pClass={pClass} minH={minH} titleSize={titleSize} btnClass={btnClass}
                              btnIconSize={btnIconSize} showTime={showTime} actionsPosClass={actionsPosClass}
                              isTapped={isTapped} setTappedTaskId={setTappedTaskId} draggedTaskId={draggedTaskId}
                              setDraggedTaskId={setDraggedTaskId} setDashDragTarget={setDashDragTarget}
                              onEditTask={onEditTask} onFocusTask={onFocusTask} onReturnToBacklog={onReturnToBacklog}
                              onDelete={onDelete} onToggle={onToggle} widthPct={widthPct} leftOffset={leftOffset}
                              formatTime={formatTime}
                            />
                          );
                        })}
                      </AnimatePresence>
                    );
                  })()}
                </div>
              </div>
            </div>
            {backlog.length > 0 && (
              <div className="sticky bottom-0 z-[100] mt-10 pl-12 md:pl-20 pointer-events-none flex justify-center">
                <div 
                  className={`w-full max-w-3xl pointer-events-auto transition-all ${dashDragTarget && dashDragTarget.type === 'backlog' ? "scale-105" : ""}`}
                  onDragOver={(e) => { 
                    e.preventDefault(); 
                    e.dataTransfer.dropEffect = "move"; 
                    setDashDragTarget({ type: 'backlog' });
                  }}
                  onDragLeave={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget)) {
                      setDashDragTarget(null);
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const taskId = e.dataTransfer.getData("text/plain");
                    if (taskId && onReturnToBacklog) onReturnToBacklog(parseInt(taskId));
                    setDashDragTarget(null);
                    setDraggedTaskId(null);
                  }}
                >
                  <div className={`bg-white border-2 border-b-0 ${dashDragTarget && dashDragTarget.type === 'backlog' ? 'border-[#057E85] bg-emerald-50/90 ring-4 ring-[#057E85]/20' : 'border-[#E8DDD0]'} shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.1)] rounded-t-[2.5rem] w-full p-5 pb-3 transition-all`}>
                    <button onClick={() => setShowBacklog(!showBacklog)} className="w-full flex items-center justify-between mb-4 group">
                      <div className="flex items-center gap-3">
                        <div className="bg-amber-50 text-amber-600 p-2 rounded-xl"><Plus size={18} /></div>
                        <div className="text-left">
                          <h3 className="font-bold text-[#1A2F22] text-[13px]">Zadania poza planem ({backlog.length})</h3>
                          <p className="text-[9px] text-[#5A7368]">Oczekują na kliknięcie "Generuj plan".</p>
                        </div>
                      </div>
                      <div className={`p-2 rounded-full bg-slate-50 transition-transform ${showBacklog ? 'rotate-180' : ''}`}><ChevronDown size={20} /></div>
                    </button>
                    <AnimatePresence>
                      {showBacklog && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ type: "spring", stiffness: 300, damping: 25 }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar pt-2">
                            <AnimatePresence>
                              {backlog.map((t, i) => {
                                const isTapped = tappedTaskId === t.id.toString() || tappedTaskId === t.id;
                                return (
                                  <BacklogCard
                                    key={t.id} t={t} i={i} isTapped={isTapped} setTappedTaskId={setTappedTaskId}
                                    draggedTaskId={draggedTaskId} setDraggedTaskId={setDraggedTaskId}
                                    setDashDragTarget={setDashDragTarget} onEditTask={onEditTask} onDelete={onDelete}
                                  />
                                );
                              })}
                            </AnimatePresence>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="hidden md:block xl:col-span-4 xl:h-full w-full mt-8 xl:mt-0">
          <StreakPlant tasks={scheduled} userEmail={userEmail} />
        </div>
      </div>
    </div>
  );
}
