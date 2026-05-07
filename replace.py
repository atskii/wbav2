import re

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

new_mood_view = """function MoodView({ moods, onOpenModal, onEditMood, todayDate }) {
  const [filter, setFilter] = useState("Tydzień");
  const [hovered, setHovered] = useState(null);
  const [showAvg, setShowAvg] = useState(true);
  const [editingMood, setEditingMood] = useState(null);
  const [editingNote, setEditingNote] = useState("");

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
    if (filter === "Tydzień") {
      label = daysLabels[d.getDay()];
    } else if (filter === "Miesiąc" && i % 5 === 0) {
      label = `${d.getDate()}.${d.getMonth() + 1}`;
    } else if (filter === "Kwartał" && i % 15 === 0) {
      label = `${d.getDate()}.${d.getMonth() + 1}`;
    } else if (filter !== "Tydzień") {
      label = "";
    }

    if (m) {
      sumV += m.v;
      countV++;
    }
    data.push({ d: dStr, label, v: m ? m.v : null, note: m?.note });
  }

  const avgV = countV > 0 ? sumV / countV : 0;

  const width = 1000;
  const height = 300; 
  const paddingX = 40; 
  
  const points = data.map((d, i) => {
    if (d.v === null) return null;
    const x = paddingX + (i / (daysToShow - 1)) * (width - paddingX - 40);
    const yPos = 20 + (d.v / 6) * (height - 40);
    return { x, y: yPos, data: d };
  }).filter(Boolean);

  const avgY = 20 + (avgV / 6) * (height - 40);

  const linePath = points.map((p, i) => (i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`)).join(" ");
  const firstX = points.length > 0 ? points[0].x : paddingX;
  const lastX = points.length > 0 ? points[points.length - 1].x : width - 40;
  const areaPath = points.length > 0 ? `${linePath} L ${lastX},${height} L ${firstX},${height} Z` : "";

  const hitRadius = Math.min(25, Math.max(6, (width / daysToShow) / 2));

  return (
    <div className="w-full h-full p-4 lg:p-6 flex flex-col items-center bg-[#FCFCFD] overflow-hidden min-h-0 relative">
      
      {/* NAGŁÓWEK */}
      <div className="w-full max-w-6xl flex flex-col mb-4 shrink-0">
        <h1 className="text-[24px] font-bold text-[#303030] leading-[130%] mb-1">Monitor nastroju</h1>
        <p className="text-sm text-[#1D1B20] max-w-3xl">Poświęć chwilę, aby zaznaczyć, jak się czujesz. To pomoże Ci lepiej zrozumieć siebie i śledzić swoje samopoczucie.</p>
      </div>

      {/* ACTION BAR */}
      <div className="w-full max-w-6xl flex flex-col md:flex-row justify-between items-center bg-white border-b border-[#E8E8E8] pb-4 mb-4 gap-4 shrink-0">
        {/* LEWA: Filtry trendów */}
        <div className="flex bg-white rounded-xl overflow-hidden self-start md:self-auto">
          <button 
            onClick={() => setShowAvg(!showAvg)}
            className={`px-4 py-2 text-sm transition-all border border-[#F4F4F4] rounded-l-xl z-10 relative ${showAvg ? "font-bold text-[#000000] bg-white shadow-sm" : "font-semibold text-[#707070] bg-[#FAFAFA]"}`}
          >
            Średnia
          </button>
          <button className="px-4 py-2 text-sm font-semibold text-[#707070] border border-[#F4F4F4] bg-white -ml-[1px]">Wzrost</button>
          <button className="px-4 py-2 text-sm font-semibold text-[#707070] border border-[#F4F4F4] rounded-r-xl bg-white -ml-[1px]">Spadek</button>
        </div>

        {/* PRAWA: Główne akcje */}
        <div className="flex flex-wrap items-center gap-3 self-end md:self-auto">
          <button className="flex items-center gap-2 px-3 py-2 bg-[#02848C] text-white rounded-md shadow-sm hover:bg-[#02747b] transition-all">
            <Calendar size={14} />
            <span className="text-xs font-semibold">Wybierz datę</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-[#02848C] text-white rounded-md shadow-sm hover:bg-[#02747b] transition-all">
            <Search size={14} />
            <span className="text-xs font-semibold">Analiza AI</span>
          </button>
          <button onClick={onOpenModal} className="flex items-center gap-2 px-3 py-2 bg-[#02848C] text-white rounded-md shadow-sm hover:bg-[#02747b] transition-all">
            <Smile size={14} />
            <span className="text-xs font-semibold">Zarejestruj swój nastrój</span>
          </button>
        </div>
      </div>

      {/* KARTA WYKRESU */}
      <div className="w-full max-w-6xl bg-white rounded-[10px] p-4 lg:p-6 shadow-sm border border-[#E8E8E8] flex-1 min-h-0 flex flex-col">
        {/* Header Karty */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4 shrink-0">
          <h2 className="text-xl font-bold text-[#151515]">Wykres Twojego nastroju w czasie</h2>
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 w-full md:w-auto">
            {/* Zakresy czasu */}
            <div className="flex rounded-lg overflow-hidden self-stretch md:self-auto">
              {["Dzień", "Tydzień", "Miesiąc", "Kwartał", "Rok"].map((f, i) => {
                const isDisabled = f === "Rok" || f === "Dzień";
                const isFirst = i === 0;
                const isLast = i === 4;
                const roundedClass = isFirst ? "rounded-l-lg" : isLast ? "rounded-r-lg" : "";
                
                return (
                  <button key={f} onClick={() => !isDisabled && setFilter(f)} disabled={isDisabled}
                    className={`px-3 lg:px-4 py-2 text-xs transition-all border border-[#F4F4F4] -ml-[1px] first:ml-0 ${roundedClass} ${isDisabled ? "text-[#707070] cursor-not-allowed bg-white" : filter === f ? "bg-white font-bold text-[#000000] shadow-sm relative z-10" : "bg-white font-semibold text-[#707070] hover:text-[#151515]"}`}>
                    {f}
                  </button>
                )
              })}
            </div>

            {/* Legenda */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-2.5 h-2.5 rounded-full border-2 border-[#1A949A]" />
              <span className="text-xs font-semibold text-[#5A5A5A]">Twój nastrój</span>
            </div>
          </div>
        </div>

        {/* Główny obszar wykresu */}
        <div className="relative w-full flex-1 min-h-0 mt-2 mb-6">
          
          {/* Oś Y - 7 MINEK PO LEWEJ STRONIE */}
          {[0, 1, 2, 3, 4, 5, 6].map(level => {
            const yPos = 20 + (level / 6) * (height - 40);
            return (
              <div key={`html-emoji-${level}`} className="absolute text-xl flex items-center justify-center bg-transparent text-[#5A5A5A] w-6 h-6 rounded-full" style={{ left: 0, top: `${(yPos / height) * 100}%`, transform: 'translateY(-50%)' }}>
                <span className="opacity-90">{EMOJIS[level]}</span>
              </div>
            );
          })}

          {/* Oś X - ETYKIETY */}
          <div className="absolute left-[40px] right-[40px] bottom-[-25px] flex justify-between">
            {data.map((d, i) => {
              if (!d.label) return null;
              return (
                <div key={i} className="text-xs font-semibold text-[#8B8692] -ml-3 text-center w-8">
                  {d.label}
                </div>
              );
            })}
          </div>

          {/* SVG CHART */}
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible absolute top-0 left-0" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGradientNew" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6ECCD2" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#6ECCD2" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* POZIOME LINIE SIATKI */}
            {[0, 1, 2, 3, 4, 5, 6].map(level => {
              const yPos = 20 + (level / 6) * (height - 40);
              return (
                <g key={`grid-${level}`}>
                  <line x1={paddingX} y1={yPos} x2={width} y2={yPos} stroke="#F4F4F4" strokeWidth="1.5" />
                </g>
              );
            })}

            {/* OBSZAR I LINIA WYKRESU */}
            {points.length > 0 && (
              <>
                <path d={areaPath} fill="url(#chartGradientNew)" />
                <path d={linePath} fill="none" stroke="#1A949A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </>
            )}

            {/* LINIA ŚREDNIEJ */}
            {showAvg && countV > 0 && (
              <g className="animate-in fade-in duration-500">
                <line x1={paddingX} y1={avgY} x2={width} y2={avgY} stroke="#02848C" strokeWidth="2" strokeDasharray="8,6" strokeLinecap="round" />
                <rect x={width - 120} y={avgY - 24} width="110" height="20" rx="4" fill="#02848C" />
                <text x={width - 65} y={avgY - 10} fill="white" fontSize="10" fontWeight="bold" textAnchor="middle">
                  Średnia: {avgV.toFixed(1)} / 6.0
                </text>
              </g>
            )}

            {/* INTERAKTYWNE PUNKTY */}
            {points.map((p, i) => {
              const isHovered = hovered?.d === p.data.d;
              return (
                <g key={i}>
                  {isHovered && (
                    <line x1={p.x} y1={p.y} x2={p.x} y2={height} stroke="#1A949A" strokeWidth="1" strokeDasharray="4,4" />
                  )}
                  <circle cx={p.x} cy={p.y} r={isHovered ? 6 : 4} fill="#1A949A" className="transition-all" />
                  {isHovered && <circle cx={p.x} cy={p.y} r={12} fill="#1A949A" className="opacity-20" />}
                  <circle cx={p.x} cy={p.y} r={hitRadius} fill="transparent" className="cursor-pointer" onMouseEnter={() => !editingMood && setHovered(p.data)} onMouseLeave={() => !editingMood && setHovered(null)} onClick={() => { setHovered(null); setEditingMood(p.data); setEditingNote(p.data.note || ""); }} />
                </g>
              );
            })}
          </svg>

          {/* DYMEK INFORMACYJNY (HOVER) */}
          {hovered && !editingMood && (
            <div className={`absolute z-50 bg-white border border-[#E8E8E8] shadow-lg rounded-xl p-3 w-56 pointer-events-none transform -translate-y-[115%] ${((points.find(p => p.data.d === hovered.d)?.x / width) * 100) > 80 ? '-translate-x-[90%]' :
              ((points.find(p => p.data.d === hovered.d)?.x / width) * 100) < 20 ? '-translate-x-[10%]' :
                '-translate-x-1/2'
              }`}
              style={{ left: `${(points.find(p => p.data.d === hovered.d)?.x / width) * 100}%`, top: `${(points.find(p => p.data.d === hovered.d)?.y / height) * 100}%` }}>
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{EMOJIS[hovered.v]}</span>
                  <span className="text-[10px] font-bold text-[#02848C] bg-[#E5F2F3] px-2 py-0.5 rounded-md">{MOOD_L[hovered.v]}</span>
                </div>
                <span className="text-[9px] font-black text-[#8B8692]">{hovered.d}</span>
              </div>
              <p className="text-[11px] text-[#5A5A5A] mt-1 leading-relaxed italic border-l-2 border-[#F4F4F4] pl-2">"{hovered.note || "Brak notatki."}"</p>
              <p className="text-[9px] text-[#8B8692] mt-2 font-bold uppercase tracking-wider text-center">Kliknij kropkę, aby edytować</p>
            </div>
          )}

          {/* DYMEK EDYCJI (CLICK) */}
          {editingMood && (
            <div className={`absolute z-50 bg-white border-2 border-[#02848C] shadow-2xl rounded-2xl p-4 w-72 transform -translate-y-[105%] ${((points.find(p => p.data.d === editingMood.d)?.x / width) * 100) > 80 ? '-translate-x-[95%]' :
              ((points.find(p => p.data.d === editingMood.d)?.x / width) * 100) < 20 ? '-translate-x-[5%]' :
                '-translate-x-1/2'
              }`}
              style={{ left: `${(points.find(p => p.data.d === editingMood.d)?.x / width) * 100}%`, top: `${(points.find(p => p.data.d === editingMood.d)?.y / height) * 100}%` }}>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-[#151515]">Edytuj dzień: <span className="text-[#02848C]">{editingMood.d}</span></span>
                <button onClick={() => setEditingMood(null)} className="text-[#8B8692] hover:text-red-500 transition-colors bg-red-50 p-1 rounded-full"><X size={14} /></button>
              </div>

              <div className="mb-3">
                <p className="text-[10px] font-bold text-[#5A5A5A] mb-1 uppercase tracking-wide">Notatka:</p>
                <textarea
                  value={editingNote}
                  onChange={(e) => setEditingNote(e.target.value)}
                  placeholder="Jak minął dzień?"
                  className="w-full bg-[#FAFAFA] border border-[#F4F4F4] rounded-lg p-2 text-xs focus:outline-none focus:border-[#02848C] resize-none h-16 transition-all placeholder:text-[#8B8692]"
                />
              </div>

              <div className="mb-1">
                <p className="text-[10px] font-bold text-[#5A5A5A] mb-1 uppercase tracking-wide">Nastrój:</p>
                <div className="flex gap-1 justify-between">
                  {EMOJIS.map((emoji, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        onEditMood(editingMood.d, index, editingNote);
                        setEditingMood(null);
                      }}
                      className={`text-xl p-1 rounded-lg hover:bg-[#FAFAFA] transition-all hover:scale-125 ${editingMood.v === index ? 'bg-[#E5F2F3] scale-110 shadow-sm border border-[#02848C]/30' : ''}`}
                      title={MOOD_L[index]}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
"""

pattern = re.compile(r'function MoodView.*?function WarningView', re.DOTALL)
new_content = pattern.sub(new_mood_view + '\nfunction WarningView', content)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Replacement done via script.")
