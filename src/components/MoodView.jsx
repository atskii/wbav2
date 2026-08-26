import { useState, useRef, useEffect } from "react";
import { Calendar, Search, Smile, X, Sparkles, Loader2 } from "lucide-react";
import { EMOJIS, MOOD_L } from "../lib/constants";
import { analyzeMoodWithAI } from "../lib/gemini";

export default function MoodView({ moods, onOpenModal, onEditMood, todayDate, userEmail, aiTokens = 10, onSpendTokens, addToast }) {
  const [filter, setFilter] = useState("Tydzień");
  const [hovered, setHovered] = useState(null);
  const [showAvg, setShowAvg] = useState(false);
  const [editingMood, setEditingMood] = useState(null);
  const [editingNote, setEditingNote] = useState("");
  const [aiState, setAiState] = useState({ isOpen: false, loading: false, result: "", error: "" });
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
        }
      }, 0);
    }
  }, [filter, moods, aiState.isOpen]);

  const handleAIAnalysis = async () => {
    if (aiTokens < 1) {
      setAiState({ 
        isOpen: true, 
        loading: false, 
        result: "", 
        error: "Brak monet AI! Wykorzystałeś wszystkie darmowe monety (0/10). Potrzebujesz 1 monety, aby wygenerować nową analizę." 
      });
      if (addToast) addToast("Brak monet AI do wykonania analizy.", "warn");
      return;
    }

    setAiState({ isOpen: true, loading: true, result: "", error: "" });
    try {
      const validMoods = moods.filter(m => m.v !== null);
      if (validMoods.length === 0) throw new Error("Brak danych nastrojowych do analizy.");
      
      const dataHash = JSON.stringify(validMoods);
      const cacheKey = `ai_analysis_cache_${userEmail}`;
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed.hash === dataHash) {
            // Jeśli dane nastroju się nie zmieniły, używamy zapisanego wyniku
            setAiState({ isOpen: true, loading: false, result: parsed.result, error: "" });
            return;
          }
        } catch (e) {
          console.warn("Błąd odczytu cache AI", e);
        }
      }

      const result = await analyzeMoodWithAI(validMoods, "Użytkownik", userEmail);
      localStorage.setItem(cacheKey, JSON.stringify({ hash: dataHash, result }));

      // Pobierz 1 monetę po pomyślnej analizie (operacja asynchroniczna w tle, nie blokuje UI)
      if (onSpendTokens) {
        onSpendTokens(1).catch(e => console.error("Błąd pobierania monet:", e));
      }
      if (addToast) {
        addToast("Wygenerowano analizę AI (-1 moneta AI)", "info");
      }

      setAiState({ isOpen: true, loading: false, result, error: "" });
    } catch (err) {
      setAiState({ isOpen: true, loading: false, result: "", error: err.message });
    }
  };

  const daysToShow = filter === "Tydzień" ? 7 : filter === "Miesiąc" ? 30 : filter === "Kwartał" ? 90 : 7;
  const targetDate = new Date(todayDate);
  targetDate.setHours(0, 0, 0, 0);

  const data = [];
  const daysLabels = ["Ndz", "Pon", "Wt", "Śr", "Czw", "Pt", "Sb"];
  let sumV = 0, countV = 0;

  for (let i = daysToShow - 1; i >= 0; i--) {
    const d = new Date(targetDate);
    d.setDate(d.getDate() - i);
    const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const m = moods.find(x => x.d === dStr);
    let label = dStr;
    if (filter === "Tydzień") { label = daysLabels[d.getDay()]; }
    else if (filter === "Miesiąc" && i % 5 === 0) { label = `${d.getDate()}.${d.getMonth() + 1}`; }
    else if (filter === "Kwartał" && i % 15 === 0) { label = `${d.getDate()}.${d.getMonth() + 1}`; }
    else if (filter !== "Tydzień") { label = ""; }
    if (m) { sumV += m.v; countV++; }
    data.push({ d: dStr, label, v: m ? m.v : null, note: m?.note });
  }

  const avgV = countV > 0 ? sumV / countV : 0;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const width = Math.max(isMobile ? window.innerWidth - 40 : 1000, daysToShow * (isMobile ? 22 : 40));
  const height = isMobile ? 260 : 380;
  const paddingX = 20;

  const points = data.map((d, i) => {
    if (d.v === null) return null;
    const x = paddingX + (i / (daysToShow - 1)) * (width - paddingX * 2);
    const yPos = 20 + (1 - d.v / 6) * (height - 60);
    return { x, y: yPos, data: d };
  }).filter(Boolean);

  const avgY = 20 + (1 - avgV / 6) * (height - 60);
  const linePath = points.map((p, i) => (i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`)).join(" ");
  const firstX = points.length > 0 ? points[0].x : paddingX;
  const lastX = points.length > 0 ? points[points.length - 1].x : width - paddingX;
  const areaPath = points.length > 0 ? `${linePath} L ${lastX},${height} L ${firstX},${height} Z` : "";
  const hitRadius = Math.min(25, Math.max(6, (width / daysToShow) / 2));

  return (
    <div className="w-full h-full p-0 md:p-4 lg:p-6 flex flex-col items-center bg-[#FCFCFD] overflow-y-auto relative pb-20 md:pb-4">
      {/* TITLE (Desktop only) */}
      <div className="hidden md:flex w-full max-w-6xl flex-col mb-4 shrink-0 mt-4 md:mt-0">
        <h1 className="text-[24px] font-bold text-[#303030] leading-[130%] mb-1">Monitor nastroju</h1>
        <p className="text-sm text-[#1D1B20] max-w-3xl">Poświęć chwilę, aby zaznaczyć, jak się czujesz. To pomoże Ci lepiej zrozumieć siebie i śledzić swoje samopoczucie.</p>
      </div>

      {/* DESKTOP ACTION BAR (Hidden on mobile) */}
      <div className="hidden md:flex w-full max-w-6xl justify-between items-center bg-white border-b border-[#E8E8E8] pb-4 mb-4 gap-4 shrink-0">
        <div className="flex bg-white rounded-xl overflow-hidden self-start md:self-auto">
          <button onClick={() => setShowAvg(!showAvg)} className={`px-4 py-2 text-sm transition-all border border-[#F4F4F4] rounded-xl z-10 relative ${showAvg ? "font-bold text-[#000000] bg-white shadow-sm" : "font-semibold text-[#707070] bg-[#FAFAFA]"}`}>Średnia</button>
        </div>
        <div className="flex flex-wrap items-center gap-3 self-end md:self-auto">
          <button className="flex items-center gap-2 px-3 py-2 bg-[#02848C] text-white rounded-md shadow-sm hover:bg-[#02747b] transition-all"><Calendar size={14} /><span className="text-xs font-semibold">Wybierz datę</span></button>
          <button 
            onClick={handleAIAnalysis} 
            disabled={aiState.loading} 
            className={`flex items-center gap-2 px-3 py-2 rounded-md shadow-sm transition-all ${
              aiTokens < 1 
                ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed hover:bg-gray-100" 
                : "bg-[#02848C] text-white hover:bg-[#02747b]"
            } disabled:opacity-50`}
            title={aiTokens < 1 ? "Brak monet AI" : "Wykonaj analizę nastroju za pomocą AI"}
          >
            <Sparkles size={14} />
            <span className="text-xs font-semibold">Analiza AI</span>
          </button>
          <button onClick={onOpenModal} className="flex items-center gap-2 px-3 py-2 bg-[#02848C] text-white rounded-md shadow-sm hover:bg-[#02747b] transition-all"><Smile size={14} /><span className="text-xs font-semibold">Zarejestruj swój nastrój</span></button>
        </div>
      </div>

      {/* MOBILE TOP ACTION BAR */}
      <div className="md:hidden w-full px-4 pt-4 pb-2 shrink-0">
        <div className="grid grid-cols-2 gap-3">
          <button className="flex justify-center items-center gap-2 px-3 py-3 bg-white text-[#02848C] border-2 border-[#02848C] rounded-xl shadow-sm transition-all active:scale-[0.98]">
            <Calendar size={16} />
            <span className="text-sm font-bold">Wybierz datę</span>
          </button>
          <button 
            onClick={handleAIAnalysis} 
            disabled={aiState.loading} 
            className={`flex justify-center items-center gap-2 px-3 py-3 rounded-xl shadow-sm transition-all active:scale-[0.98] ${
              aiTokens < 1 
                ? "bg-gray-100 text-gray-400 border-2 border-gray-200" 
                : "bg-[#F3E8FF] text-[#7E22CE] border-2 border-[#D8B4FE]"
            }`}
          >
            <Sparkles size={16} />
            <span className="text-sm font-bold">Analiza AI</span>
          </button>
        </div>
      </div>

      <div className="w-full max-w-6xl bg-white md:rounded-[10px] p-4 lg:p-6 md:shadow-sm border-b md:border border-[#E8E8E8] shrink-0 flex flex-col mt-2 md:mt-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4 shrink-0">
          <div className="flex items-center justify-between w-full md:w-auto">
            <h2 className="text-lg md:text-xl font-bold text-[#151515]">Wykres nastroju w czasie</h2>
            <button onClick={() => setShowAvg(!showAvg)} className={`md:hidden px-3 py-1.5 text-xs transition-all border rounded-lg ${showAvg ? "font-bold text-[#02848C] border-[#02848C] bg-[#E5F2F3]" : "font-semibold text-[#707070] border-[#E8E8E8] bg-white"}`}>Średnia</button>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 w-full md:w-auto">
            <div className="flex w-full md:w-auto overflow-x-auto hide-scrollbar rounded-lg border border-[#F4F4F4]">
              {["Dzień", "Tydzień", "Miesiąc", "Kwartał", "Rok"].map((f, i) => {
                const isDisabled = f === "Rok" || f === "Dzień";
                const isFirst = i === 0; const isLast = i === 4;
                const roundedClass = isFirst ? "rounded-l-lg" : isLast ? "rounded-r-lg" : "";
                return (<button key={f} onClick={() => !isDisabled && setFilter(f)} disabled={isDisabled} className={`px-3 lg:px-4 py-2 text-[11px] md:text-xs transition-all border border-[#F4F4F4] -ml-[1px] first:ml-0 whitespace-nowrap ${roundedClass} ${isDisabled ? "text-[#707070] cursor-not-allowed bg-white" : filter === f ? "bg-white font-bold text-[#000000] shadow-sm relative z-10" : "bg-white font-semibold text-[#707070] hover:text-[#151515]"}`}>{f}</button>);
              })}
            </div>
            <div className="hidden md:flex items-center gap-2 shrink-0">
              <div className="w-2.5 h-2.5 rounded-full border-2 border-[#1A949A]" />
              <span className="text-xs font-semibold text-[#5A5A5A]">Twój nastrój</span>
            </div>
          </div>
        </div>

        {/* AI Analysis Modal */}
        {aiState.isOpen && (
          <div className="w-full mb-6 bg-[#FAFAFA] border border-[#E8E8E8] shadow-sm rounded-2xl p-6 relative animate-in slide-in-from-top-4 fade-in duration-300">
            <button onClick={() => setAiState({ ...aiState, isOpen: false })} className="absolute top-4 right-4 text-[#8B8692] hover:text-[#151515] transition-colors"><X size={18} /></button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#E5F2F3] flex items-center justify-center text-[#02848C]">
                <Sparkles size={20} />
              </div>
              <h3 className="text-lg font-bold text-[#151515]">Analiza AI Twojego nastroju</h3>
            </div>
            
            {aiState.loading ? (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <Loader2 size={28} className="animate-spin text-[#02848C]" />
                <p className="text-sm font-medium text-[#5A5A5A]">Gemini analizuje Twoje dane...</p>
              </div>
            ) : aiState.error ? (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                {aiState.error}
              </div>
            ) : (
              <div className="text-[#303030] text-sm leading-relaxed space-y-3">
                {aiState.result.split('\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="relative w-full shrink-0 mt-4 mb-2 flex border border-[#F4F4F4] rounded-xl bg-white shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)]" style={{ height: `${height}px` }}>
          {/* Y-AXIS (EMOJIS) - FIXED */}
          <div className="w-10 shrink-0 relative h-full bg-white z-20 border-r border-[#F4F4F4] rounded-l-xl">
            {[0,1,2,3,4,5,6].map(level => {
              const yPos = 20 + (1 - level / 6) * (height - 60);
              return (
                <div key={`html-emoji-${level}`} className="absolute text-[16px] md:text-xl flex items-center justify-center bg-white text-[#5A5A5A] w-6 h-6 rounded-full" style={{ right: '8px', top: `${(yPos / height) * 100}%`, transform: 'translateY(-50%)' }}>
                  <span className="opacity-100">{EMOJIS[level]}</span>
                </div>
              );
            })}
          </div>

          {/* SCROLLABLE X-AXIS CHART */}
          <div ref={scrollRef} className="flex-1 overflow-x-auto hide-scrollbar relative h-full bg-white rounded-r-xl" style={{ WebkitOverflowScrolling: 'touch' }}>
            <div className="relative h-full" style={{ width: `${width}px` }}>
              <div className="absolute left-0 right-0 bottom-4 flex justify-between px-[20px]">
                {data.map((d, i) => { if (!d.label) return null; return (<div key={i} className="text-[10px] md:text-[11px] font-semibold text-[#8B8692] text-center w-12 -ml-6">{d.label}</div>); })}
              </div>
              <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible absolute top-0 left-0" preserveAspectRatio="none">
            <defs><linearGradient id="chartGradientNew" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6ECCD2" stopOpacity="0.4" /><stop offset="100%" stopColor="#6ECCD2" stopOpacity="0.0" /></linearGradient></defs>
            {[0,1,2,3,4,5,6].map(level => { const yPos = 20 + (1 - level / 6) * (height - 60); return (<g key={`grid-${level}`}><line x1={paddingX} y1={yPos} x2={width} y2={yPos} stroke="#F4F4F4" strokeWidth="1.5" /></g>); })}
            {points.length > 0 && (<><path d={areaPath} fill="url(#chartGradientNew)" /><path d={linePath} fill="none" stroke="#1A949A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></>)}
            {showAvg && countV > 0 && (<g className="animate-in fade-in duration-500"><line x1={paddingX} y1={avgY} x2={width} y2={avgY} stroke="#02848C" strokeWidth="2" strokeDasharray="8,6" strokeLinecap="round" /><rect x={width - 120} y={avgY - 24} width="110" height="20" rx="4" fill="#02848C" /><text x={width - 65} y={avgY - 10} fill="white" fontSize="10" fontWeight="bold" textAnchor="middle">Średnia: {avgV.toFixed(1)} / 6.0</text></g>)}
            {points.map((p, i) => { const isHovered = hovered?.d === p.data.d; return (<g key={i}>{isHovered && (<line x1={p.x} y1={p.y} x2={p.x} y2={height} stroke="#1A949A" strokeWidth="1" strokeDasharray="4,4" />)}<circle cx={p.x} cy={p.y} r={isHovered ? 6 : 4} fill="#1A949A" className="transition-all" />{isHovered && <circle cx={p.x} cy={p.y} r={12} fill="#1A949A" className="opacity-20" />}<circle cx={p.x} cy={p.y} r={hitRadius} fill="transparent" className="cursor-pointer" onMouseEnter={() => !editingMood && setHovered(p.data)} onMouseLeave={() => !editingMood && setHovered(null)} onClick={() => { setHovered(null); setEditingMood(p.data); setEditingNote(p.data.note || ""); }} /></g>); })}
          </svg>
          {hovered && !editingMood && (
            <div className={`absolute z-50 bg-white border border-[#E8E8E8] shadow-lg rounded-xl p-3 w-56 pointer-events-none transform -translate-y-[115%] ${((points.find(p => p.data.d === hovered.d)?.x / width) * 100) > 80 ? '-translate-x-[90%]' : ((points.find(p => p.data.d === hovered.d)?.x / width) * 100) < 20 ? '-translate-x-[10%]' : '-translate-x-1/2'}`} style={{ left: `${(points.find(p => p.data.d === hovered.d)?.x / width) * 100}%`, top: `${(points.find(p => p.data.d === hovered.d)?.y / height) * 100}%` }}>
              <div className="flex justify-between items-start mb-1"><div className="flex items-center gap-2"><span className="text-xl">{EMOJIS[hovered.v]}</span><span className="text-[10px] font-bold text-[#02848C] bg-[#E5F2F3] px-2 py-0.5 rounded-md">{MOOD_L[hovered.v]}</span></div><span className="text-[9px] font-black text-[#8B8692]">{hovered.d}</span></div>
              <p className="text-[11px] text-[#5A5A5A] mt-1 leading-relaxed italic border-l-2 border-[#F4F4F4] pl-2">"{hovered.note || "Brak notatki."}"</p>
              <p className="text-[9px] text-[#8B8692] mt-2 font-bold uppercase tracking-wider text-center">Kliknij kropkę, aby edytować</p>
            </div>
          )}
          {editingMood && (
            <div className={`absolute z-50 bg-white border-2 border-[#02848C] shadow-2xl rounded-2xl p-4 w-72 transform -translate-y-[105%] ${((points.find(p => p.data.d === editingMood.d)?.x / width) * 100) > 80 ? '-translate-x-[95%]' : ((points.find(p => p.data.d === editingMood.d)?.x / width) * 100) < 20 ? '-translate-x-[5%]' : '-translate-x-1/2'}`} style={{ left: `${(points.find(p => p.data.d === editingMood.d)?.x / width) * 100}%`, top: `${(points.find(p => p.data.d === editingMood.d)?.y / height) * 100}%` }}>
              <div className="flex justify-between items-center mb-3"><span className="text-xs font-bold text-[#151515]">Edytuj dzień: <span className="text-[#02848C]">{editingMood.d}</span></span><button onClick={() => setEditingMood(null)} className="text-[#8B8692] hover:text-red-500 transition-colors bg-red-50 p-1 rounded-full"><X size={14} /></button></div>
              <div className="mb-3"><p className="text-[10px] font-bold text-[#5A5A5A] mb-1 uppercase tracking-wide">Notatka:</p><textarea value={editingNote} onChange={(e) => setEditingNote(e.target.value)} placeholder="Jak minął dzień?" className="w-full bg-[#FAFAFA] border border-[#F4F4F4] rounded-lg p-2 text-xs focus:outline-none focus:border-[#02848C] resize-none h-16 transition-all placeholder:text-[#8B8692]" /></div>
              <div className="mb-1"><p className="text-[10px] font-bold text-[#5A5A5A] mb-1 uppercase tracking-wide">Nastrój:</p><div className="flex gap-1 justify-between">{EMOJIS.map((emoji, index) => (<button key={index} onClick={() => { onEditMood(editingMood.d, index, editingNote); setEditingMood(null); }} className={`text-xl p-1 rounded-lg hover:bg-[#FAFAFA] transition-all hover:scale-125 ${editingMood.v === index ? 'bg-[#E5F2F3] scale-110 shadow-sm border border-[#02848C]/30' : ''}`} title={MOOD_L[index]}>{emoji}</button>))}</div></div>
            </div>
          )}
        </div>
        </div>
      </div>
      </div>

      {/* MOBILE BOTTOM ACTION BAR */}
      <div className="md:hidden w-full max-w-6xl mt-2 px-4 pb-8 flex flex-col gap-3 shrink-0">
        <button onClick={onOpenModal} className="w-full flex justify-center items-center gap-2 px-4 py-3.5 bg-[#02848C] text-white rounded-xl shadow-sm hover:bg-[#02747b] transition-all active:scale-[0.98]">
          <Smile size={18} />
          <span className="text-[15px] font-bold">Zarejestruj swój nastrój</span>
        </button>
      </div>
    </div>
  );
}
