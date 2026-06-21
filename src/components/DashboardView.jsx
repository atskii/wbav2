import { useState } from "react";
import {
  ChevronLeft, ChevronRight, ChevronDown, Plus,
  RefreshCw, Play, Check, RotateCcw, Trash2, Lock, Star, BookOpen, Leaf
} from "lucide-react";
import { checkIsDate } from "../lib/dateHelpers";
import PBadge from "./ui/PBadge";
import StreakPlant from "./StreakPlant";

// ═══════════════════════════════════════════════════
//  DASHBOARD VIEW (ZAMROŻONY PLAN Z GUZIKIEM GENERUJ)
// ═══════════════════════════════════════════════════
export default function DashboardView({ tasks, moods, selectedDate, onChangeDate, onToggle, onOpenTaskModal, onEditTask, onDelete, onReturnToBacklog, onAlert, onFocusTask, loading, onGeneratePlan, userPrefs }) {

  const [showBacklog, setShowBacklog] = useState(false);


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
    <div className="px-4 md:px-6 pt-2 pb-6 max-w-6xl mx-auto w-full xl:h-[calc(100vh-88px)] flex flex-col overflow-y-auto xl:overflow-hidden">
      <div className="xl:grid xl:grid-cols-12 xl:gap-16 items-start flex-1 min-h-0">
        <div className="xl:col-span-8 relative max-w-4xl mx-auto w-full xl:h-full flex flex-col min-h-0">
          {/* NAGŁÓWEK DASHBOARDU PRZENIESIONY TUTAJ - NAD PLAN DNI */}
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5 lg:gap-0 mb-6 flex-shrink-0">
            <div className="flex flex-col items-start gap-1 w-full lg:w-auto">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#1A2F22] tracking-tight">Dzisiejsze zadania</h1>
              
              <div className="flex gap-2 w-full lg:w-auto mt-4 mb-2 lg:hidden">
                <button onClick={onOpenTaskModal} className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-[#057E85] text-white rounded-xl text-sm font-bold hover:bg-[#04686e] transition-all shadow-md active:scale-95">
                  Dodaj zadanie <Plus size={16} />
                </button>
                <button onClick={onGeneratePlan} className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-[#E8DDD0] text-[#1A2F22] rounded-xl text-sm font-bold hover:bg-[#F5EFE6] transition-all shadow-sm active:scale-95">
                  <RefreshCw size={16} />
                </button>
              </div>

              <div className="flex items-center justify-between w-full lg:w-auto lg:justify-start gap-3 mt-2">
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
              <button onClick={onGeneratePlan} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-[#057E85] text-white rounded-xl text-sm font-bold hover:bg-[#04686e] transition-all shadow-md active:scale-95">
                <RefreshCw size={15} /> Generuj
              </button>
              <button onClick={onOpenTaskModal} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-[#E8DDD0] text-[#1A2F22] rounded-xl text-sm font-bold hover:bg-[#F5EFE6] transition-all shadow-sm active:scale-95">
                Dodaj <Plus size={15} />
              </button>
            </div>
          </div>

          {/* RESPANSYWNA LINIA OSI CZASU */}
          <div className="xl:flex-1 xl:overflow-y-auto relative pr-2 md:pr-4 custom-scrollbar -mr-2 md:-mr-4 min-h-0">
            <div className="relative mt-8" style={{ height: `${minsToRem((timelineEndHour - timelineStart) * 60)}rem` }}>
              <div className="absolute left-[2.5rem] md:left-[3.25rem] top-0 bottom-0 border-l-2 border-dashed border-[#C4BBAF] z-0"></div>
              {hours.map((h, i) => (
                <div key={h} className="absolute left-0 flex items-center w-full" style={{ top: `${minsToRem(i * 60)}rem` }}>
                  <span className="text-[9px] md:text-[10px] font-bold text-[#9FB5AD] w-8 md:w-10 text-right py-1 relative z-10 bg-[#FAFAFA]">{h}:00</span>
                  <div className="w-2 md:w-4 h-[1px] bg-[#E8DDD0] ml-1 md:ml-2"></div>
                </div>
              ))}

              {/* KONTENER ZADAŃ - MNIEJSZY MARGINES NA MOBILE */}
              <div className="absolute top-0 bottom-0 left-12 md:left-20 right-0 flex justify-center pointer-events-none">
                <div className="w-full max-w-3xl relative h-full pointer-events-auto">
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

                    return renderItems.map(t => {
                      if (t.isVisualGap) {
                        return (
                          <div key={t.id} className="absolute left-0 right-0 flex items-center justify-center z-10 pointer-events-none" style={{ top: `${t.topRem}rem`, height: `${t.actualHeight}rem` }}>
                            <div className="w-full flex items-center justify-center relative">
                              <div className="absolute px-4 py-1.5 flex items-center gap-2">
                                {t.title.toLowerCase().includes('spacer') || t.title.toLowerCase().includes('powietrze') ? <Leaf size={16} className="text-[#057E85]" /> : <BookOpen size={16} className="text-[#057E85]" />}
                                <span className="text-sm font-semibold text-[#057E85]">{t.title}</span>
                              </div>
                            </div>
                          </div>
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

                      return (
                        <div key={t.id} onClick={() => onEditTask(t)} className={`absolute rounded-[14px] ${pClass} shadow-sm border z-20 hover:z-50 transition-all cursor-pointer group flex flex-col justify-center ${t.done ? 'bg-gray-50 border-gray-200 opacity-60 grayscale hover:opacity-80' : 'bg-white border-[#E8DDD0] hover:shadow-md hover:border-[#D4C9BC]'}`} style={{ top: `${t.topRem + 0.2}rem`, height: `${t.heightRem - 0.4}rem`, minHeight: minH, width: `calc(${widthPct}% - 4px)`, left: `calc(${leftOffset}% + 2px)` }}>
                          <div className={`flex flex-col h-full relative`}>
                            <div className="flex justify-between items-start">
                              <h4 className={`${titleSize} font-bold transition-colors truncate pr-2 flex-1 ${t.done ? 'line-through text-gray-500' : 'text-[#1A2F22]'}`} title={t.title}>{t.title}</h4>
                              <div className="flex items-center gap-2 flex-shrink-0 relative z-30 transition-opacity duration-200 group-hover:opacity-0">
                                <PBadge p={t.p} />
                                {t.isLocked && <Lock size={12} strokeWidth={2.5} className="text-[#909090]" />}
                              </div>
                            </div>
                            <div className="mt-auto">
                              {showTime && (
                                <p className={`text-[13px] mt-1 ${t.done ? 'text-gray-400' : 'text-[#5A5A5A]'}`}>{formatTime(t.sMins)} — {formatTime(t.sMins + t.durMins)}</p>
                              )}
                            </div>

                            <div className={`absolute ${actionsPosClass} flex items-center gap-1 sm:gap-1.5 transition-all z-40 opacity-0 group-hover:opacity-100 bg-white/90 p-1 rounded-xl backdrop-blur-sm`}>
                              {!t.done && <button onClick={(e) => { e.stopPropagation(); onFocusTask(t); }} className={`${btnClass} rounded-full bg-[#E8F4ED] text-[#1E5C36] hover:bg-[#1E5C36] hover:text-white flex items-center justify-center shadow-sm hover:scale-110 transition-all`}><Play size={btnIconSize} className="ml-0.5" /></button>}
                              {!t.isLocked && !t.done && (
                                <button onClick={(e) => { e.stopPropagation(); onReturnToBacklog(t.id); }} title="Cofnij do backlogu" className={`${btnClass} rounded-full bg-orange-50 text-orange-500 hover:bg-orange-500 hover:text-white flex items-center justify-center shadow-sm hover:scale-110 transition-all`}>
                                  <RotateCcw size={btnIconSize} />
                                </button>
                              )}
                              <button onClick={(e) => { e.stopPropagation(); onDelete(t.id); }} className={`${btnClass} rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center shadow-sm hover:scale-110 transition-all`}><Trash2 size={btnIconSize} /></button>
                              <button onClick={(e) => { e.stopPropagation(); onToggle(t.id); }} className={`${btnClass} rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-all ${t.done ? 'bg-[#5A7368] text-white' : 'bg-[#E8F4ED] text-[#1E5C36] border border-[#2D9E6B]'}`}><Check size={btnIconSize} /></button>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
            {backlog.length > 0 && (
              <div className="sticky bottom-0 z-[100] mt-10 pl-12 md:pl-20 pointer-events-none flex justify-center">
                <div className="w-full max-w-3xl pointer-events-auto">
                  <div className="bg-white border-2 border-b-0 border-[#E8DDD0] shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.1)] rounded-t-[2.5rem] w-full p-5 pb-3 transition-all">
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
                    {showBacklog && (
                      <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        {backlog.map(t => (
                          <div key={t.id} className="p-4 rounded-2xl border bg-[#F9FAFB] border-[#E8DDD0] hover:border-[#2D9E6B] transition-all cursor-pointer group relative flex flex-col justify-between" onClick={() => onEditTask(t)} style={{ minHeight: '4.8rem' }}>
                            <div className="flex items-start gap-3 pr-24">
                              <div className={`mt-0.5 flex-shrink-0 flex items-center gap-1 ${t.p === 'wysoki' ? 'text-red-400' : t.p === 'sredni' ? 'text-amber-400' : 'text-emerald-400'}`}>
                                <Star size={16} fill="currentColor" strokeWidth={1} />
                                {t.isLocked && <span className="text-red-600 font-black text-[10px] animate-pulse">!</span>}
                              </div>
                              <div className="flex flex-col gap-1"><span className="text-[13px] font-bold text-[#1A2F22]">{t.title}</span><span className="text-[9px] font-bold text-[#5A7368]">{t.duration}</span></div>
                            </div>
                            <div className="flex transition-all absolute top-1/2 -translate-y-1/2 right-6 z-30 opacity-0 group-hover:opacity-100">
                              <button onClick={(e) => { e.stopPropagation(); onDelete(t.id); }} className="w-9 h-9 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center shadow-sm"><Trash2 size={16} /></button>
                            </div>
                            {t.isLocked && <div title="Sztywny termin zablokowany w kalendarzu" className="absolute bottom-4 left-5 z-30 flex items-center justify-center w-[18px] h-[18px] rounded border border-[#E8DDD0] bg-white shadow-sm"><Lock size={10} strokeWidth={2.5} className="text-[#5A7368]" /></div>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="xl:col-span-4 xl:h-full w-full mt-8 xl:mt-0">
          <StreakPlant tasks={scheduled} />
        </div>
      </div>
    </div>
  );
}
