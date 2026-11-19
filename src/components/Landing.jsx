import { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowRight,
  Sparkles,
  RefreshCw,
  Plus,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calendar,
  Smile,
  LifeBuoy,
  Phone,
  ExternalLink,
  X,
} from "lucide-react";
import NavigationMenu4 from "./ui/navigation-menu-4";

const SECTION_IDS = [
  "home",
  "produkt",
  "wypalenie",
  "o-nas",
  "kontakt",
];

const OFFER_TOP_ROW = [
  {
    icon: "/checklist.png",
    title: "Task planer",
    desc: "Układa zadania w harmonogram spersonalizowany pod Ciebie.",
    preview: (
      <div className="p-2.5 flex-1 flex flex-col justify-between text-left bg-[#FAFAFA]">
        {/* Header DashboardView */}
        <div className="flex items-start justify-between gap-1.5 mb-1.5">
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-[#1A2F22] tracking-tight leading-tight">
              Dzisiejsze zadania
            </p>
            <div className="flex items-center gap-0.5 text-[8px] font-bold text-[#1A2F22] mt-0.5">
              <ChevronLeft size={9} />
              <span className="truncate">czwartek, 19 listopada</span>
              <ChevronRight size={9} />
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span className="relative inline-flex items-center gap-0.5 px-1.5 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-md text-[8px] font-bold shadow-2xs">
              <Sparkles size={8} />
              AI
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-400 border border-white rounded-full" />
            </span>
            <span className="inline-flex items-center gap-0.5 px-1.5 py-1 bg-[#057E85] text-white rounded-md text-[8px] font-bold shadow-2xs">
              <RefreshCw size={8} />
              Generuj plan
            </span>
            <span className="inline-flex items-center gap-0.5 px-1.5 py-1 bg-white border border-[#E8DDD0] text-[#1A2F22] rounded-md text-[8px] font-bold">
              Dodaj <Plus size={8} />
            </span>
          </div>
        </div>

        {/* Oś czasu */}
        <div className="relative flex-1 flex flex-col justify-between pl-7">
          <div className="absolute left-6 top-1 bottom-1 border-l-2 border-dashed border-[#C4BBAF]" />

          {/* Linia "teraz" */}
          <div className="absolute left-6 right-0 top-[44%] flex items-center z-10 pointer-events-none">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E40D0D] -ml-[4px]" />
            <span className="flex-1 h-[1.5px] bg-[#E40D0D]" />
          </div>

          <span className="absolute left-0 top-1 text-[8px] font-bold text-[#9FB5AD]">8:00</span>
          <span className="absolute left-0 top-[41%] text-[8px] font-bold text-[#9FB5AD]">9:00</span>
          <span className="absolute left-0 bottom-1 text-[8px] font-bold text-[#9FB5AD]">10:00</span>

          {/* Karta zadania 1 */}
          <div className="bg-white rounded-[10px] border-2 border-[#E8DDD0] px-2.5 py-1.5 shadow-2xs">
            <div className="flex items-center justify-between gap-1.5">
              <span className="text-[9.5px] font-bold text-[#1A2F22] truncate">
                Przygotowanie prezentacji
              </span>
              <span className="text-[7px] px-1.5 py-0.5 rounded-full font-bold uppercase bg-red-100 text-red-700 shrink-0">
                WYSOKI PRIORYTET
              </span>
            </div>
            <p className="text-[8px] text-[#5A5A5A] mt-0.5">8:00 — 9:00</p>
          </div>

          {/* Przerwa regeneracyjna */}
          <div className="flex items-center justify-center gap-1 py-0.5">
            <Clock size={9} className="text-[#057E85]" />
            <span className="text-[8.5px] font-semibold text-[#057E85]">
              Czas na regenerację
            </span>
          </div>

          {/* Karta zadania 2 */}
          <div className="bg-white rounded-[10px] border-2 border-[#E8DDD0] px-2.5 py-1.5 shadow-2xs">
            <div className="flex items-center justify-between gap-1.5">
              <span className="text-[9.5px] font-bold text-[#1A2F22] truncate">
                Spotkanie projektowe
              </span>
              <span className="text-[7px] px-1.5 py-0.5 rounded-full font-bold uppercase bg-yellow-100 text-yellow-700 shrink-0">
                ŚREDNI PRIORYTET
              </span>
            </div>
            <p className="text-[8px] text-[#5A5A5A] mt-0.5">9:30 — 10:30</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: "/sentiment_satisfied.png",
    title: "Monitor nastroju",
    desc: "Krótka, codzienna skala 5 stopniowa, która zbiera to, jak się czujesz w pracy.",
    preview: (
      <div className="p-2.5 flex-1 flex items-center justify-center bg-[#1A2F22]/10 text-left">
        <div className="w-full bg-white rounded-2xl shadow-md p-3 border border-[#E8DDD0]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-bold text-[#1A2F22] text-[10.5px]">
              Zarejestruj swój nastrój
            </span>
            <X size={11} className="text-[#9FB5AD]" />
          </div>

          <p className="text-[8.5px] font-bold text-[#1A2F22] mb-1">Jak się czujesz?</p>

          <div className="grid grid-cols-2 gap-1.5 mb-2">
            <div className="opacity-55">
              <p className="text-[6.5px] font-bold text-[#5A7368] uppercase tracking-widest mb-0.5">
                W tym momencie
              </p>
              <div className="px-2 py-1 bg-gray-100 border border-gray-200 rounded-lg text-[8px] flex justify-between items-center text-gray-500">
                Dzisiaj <ChevronDown size={9} />
              </div>
            </div>
            <div>
              <p className="text-[6.5px] font-bold text-[#5A7368] uppercase tracking-widest mb-0.5">
                Godzina
              </p>
              <div className="px-2 py-1 bg-[#F5EFE6] border border-[#E8DDD0] rounded-lg text-[8px] font-bold text-[#1E5C36] flex items-center gap-1">
                <Clock size={9} /> 09:30
              </div>
            </div>
          </div>

          <p className="text-[6.5px] font-bold text-[#5A7368] uppercase tracking-widest mb-1">
            Twój nastrój
          </p>
          <div className="flex justify-between items-center mb-1">
            {["😫", "😟", "😐", "🙂", "😊", "😄", "🤩"].map((emoji, idx) => (
              <span
                key={emoji}
                className={`w-6 h-6 text-xs rounded-xl flex items-center justify-center ${
                  idx === 4
                    ? "ring-2 ring-[#1E5C36] bg-[#E8F4ED] scale-110 shadow-xs"
                    : "opacity-80"
                }`}
              >
                {emoji}
              </span>
            ))}
          </div>
          <p className="text-center text-[8px] font-bold text-[#1E5C36] mb-1.5">
            Bardzo dobrze
          </p>

          <div className="w-full py-1.5 bg-[#1E5C36] text-white rounded-xl font-bold text-[8.5px] text-center shadow-sm">
            Zapisz i kontynuuj
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: "/query_stats.png",
    title: "Analiza trendów",
    desc: "Czytelny obraz, co dzieje się z Twoim nastrojem i obciążeniem tydzień po tygodniu.",
    preview: (
      <div className="p-2.5 flex-1 flex flex-col justify-between text-left bg-[#FCFCFD]">
        {/* Action bar MoodView */}
        <div className="bg-white border-b border-[#E8E8E8] pb-1.5 mb-1.5 flex items-center justify-between gap-1">
          <span className="px-2 py-0.5 text-[8px] font-bold text-[#000000] bg-white border border-[#F4F4F4] rounded-md shadow-2xs">
            Średnia
          </span>
          <div className="flex items-center gap-1">
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-[#02848C] text-white rounded text-[7.5px] font-semibold">
              <Calendar size={8} /> Wybierz datę
            </span>
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-[#02848C] text-white rounded text-[7.5px] font-semibold">
              <Sparkles size={8} /> Analiza AI
            </span>
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-[#02848C] text-white rounded text-[7.5px] font-semibold">
              <Smile size={8} /> Zarejestruj
            </span>
          </div>
        </div>

        {/* Chart Card MoodView */}
        <div className="flex-1 bg-white border border-[#E8E8E8] rounded-[10px] p-2 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[9.5px] font-bold text-[#151515] truncate">
              Wykres nastroju w czasie
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="flex rounded border border-[#F4F4F4] overflow-hidden text-[7px]">
                {["Dzień", "Tydzień", "Miesiąc", "Kwartał", "Rok"].map((tab) => (
                  <span
                    key={tab}
                    className={`px-1 py-0.5 border-r last:border-r-0 border-[#F4F4F4] ${
                      tab === "Tydzień"
                        ? "bg-white font-bold text-[#000000]"
                        : "bg-white font-semibold text-[#707070]"
                    }`}
                  >
                    {tab}
                  </span>
                ))}
              </div>
              <div className="hidden sm:flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full border-[1.5px] border-[#1A949A]" />
                <span className="text-[7px] font-semibold text-[#5A5A5A]">Twój nastrój</span>
              </div>
            </div>
          </div>

          <div className="flex-1 flex border border-[#F4F4F4] rounded-lg bg-white overflow-hidden">
            {/* Y-axis Emojis */}
            <div className="w-6 shrink-0 border-r border-[#F4F4F4] flex flex-col justify-between items-center py-1 bg-white text-[9px]">
              <span>🤩</span>
              <span>😊</span>
              <span>😐</span>
              <span>😫</span>
            </div>
            {/* SVG Area Chart */}
            <div className="flex-1 flex flex-col justify-between px-1.5 pt-1 pb-0.5 relative">
              <svg viewBox="0 0 240 72" className="w-full h-[76px] overflow-visible" aria-hidden="true">
                <defs>
                  <linearGradient id="chartGradientPreview" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6ECCD2" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#6ECCD2" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[12, 28, 44, 60].map((y) => (
                  <line key={y} x1="4" y1={y} x2="236" y2={y} stroke="#F4F4F4" strokeWidth="1.2" />
                ))}
                <line x1="4" y1="34" x2="236" y2="34" stroke="#02848C" strokeWidth="1.4" strokeDasharray="5,4" />
                <path
                  d="M 12,52 L 48,44 L 84,26 L 120,34 L 156,22 L 192,28 L 228,16 L 228,64 L 12,64 Z"
                  fill="url(#chartGradientPreview)"
                />
                <path
                  d="M 12,52 L 48,44 L 84,26 L 120,34 L 156,22 L 192,28 L 228,16"
                  fill="none"
                  stroke="#1A949A"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {[
                  [12, 52],
                  [48, 44],
                  [84, 26],
                  [120, 34],
                  [156, 22],
                  [192, 28],
                  [228, 16],
                ].map(([cx, cy], idx) => (
                  <circle key={idx} cx={cx} cy={cy} r={idx === 4 ? 3.5 : 2.5} fill="#1A949A" />
                ))}
                <rect x="8" y="6" width="82" height="13" rx="3" fill="#02848C" />
                <text x="49" y="15" fill="white" fontSize="6.5" fontWeight="bold" textAnchor="middle">
                  Średnia: 4.5 / 6.0
                </text>
              </svg>
              <div className="flex justify-between px-0.5 text-[7px] font-semibold text-[#8B8692]">
                <span>Pon</span>
                <span>Wt</span>
                <span>Śr</span>
                <span>Czw</span>
                <span>Pt</span>
                <span>Sb</span>
                <span>Ndz</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
];

const OFFER_BOTTOM_ROW = [
  {
    icon: "/support.png",
    title: "System ostrzegania",
    desc: "Delikatny sygnał, gdy dane od dłuższego czasu wskazują możliwe symptomy wypalenia.",
    preview: (
      <div className="p-3 flex-1 flex flex-col justify-center text-left bg-white">
        <div className="w-full max-w-[260px] mx-auto">
          <div className="text-right mb-0.5 pr-1">
            <span className="text-[7.5px] font-bold text-[#A51A1A] tracking-[0.15em] uppercase">
              AKCJA WYMAGANA
            </span>
          </div>
          <div className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold bg-[#1e3a2b] text-white shadow-sm relative overflow-hidden mb-1.5">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#D32F2F]" />
            <LifeBuoy size={12} className="shrink-0 ml-1" />
            <span>Pomoc</span>
          </div>
          <div className="bg-[#fceeb5] p-3 rounded-2xl shadow-md border border-[#E8DDD0] relative">
            <span className="absolute top-2 right-2 text-[#1A432E] opacity-50 p-0.5">
              <X size={11} />
            </span>
            <h4 className="font-lora text-xs font-bold text-[#1A432E] leading-tight mb-1 pr-4">
              Zauważyliśmy coś ważnego
            </h4>
            <p className="text-[#1A432E] text-[9px] leading-relaxed mb-2">
              Widzę, że od kilku dni Twój poziom energii i nastroju jest bardzo niski. Każdy ma prawo do słabszego momentu...
            </p>
            <span className="text-[#1A432E] font-bold text-[9px] underline decoration-2 underline-offset-2">
              Zobacz dostępne telefony zaufania
            </span>
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: "/for_you.png",
    title: "Bezpieczne rekomendacje",
    desc: "Linki do rzetelnych źródeł i instytucji, jeśli uznasz, że potrzebujesz dodatkowego wsparcia.",
    preview: (
      <div className="p-2.5 flex-1 flex flex-col justify-center text-left bg-[#FAFAFA]">
        <div className="grid grid-cols-2 gap-1.5">
          {[
            {
              org: "Instytut Psychologii Zdrowia PTP",
              name: "Kryzysowy Telefon Zaufania",
              phone: "116 123",
              hours: "14:00–22:00",
            },
            {
              org: "Fundacja ITAKA (NFZ)",
              name: "Centrum Wsparcia",
              phone: "800 70 22 22",
              hours: "24/7",
            },
            {
              org: "Fundacja ITAKA",
              name: "Antydepresyjny Telefon",
              phone: "22 484 88 01",
              hours: "Dyżury",
            },
            {
              org: "Stowarzyszenie Niebieska Linia",
              name: "Niebieska Linia",
              phone: "800 120 002",
              hours: "24/7",
            },
          ].map((c) => (
            <div
              key={c.name}
              className="bg-white border border-[#E8DDD0] rounded-xl p-2 shadow-2xs flex flex-col justify-between min-w-0"
            >
              <div>
                <div className="flex items-start justify-between gap-1 mb-0.5">
                  <p className="text-[6.5px] font-black uppercase text-[#9FB5AD] tracking-[0.1em] truncate">
                    {c.org}
                  </p>
                  <ExternalLink size={8} className="text-[#9FB5AD] shrink-0" />
                </div>
                <h4 className="font-lora text-[10px] font-bold text-[#1A2F22] leading-tight line-clamp-2 mb-1.5">
                  {c.name}
                </h4>
              </div>
              <div className="flex items-center justify-between gap-1 pt-1 border-t border-[#F5EFE6]">
                <div className="flex items-center gap-1 min-w-0">
                  <Phone size={8} className="text-[#2D9E6B] shrink-0" />
                  <span className="text-[8.5px] font-black text-[#1A2F22] truncate">
                    {c.phone}
                  </span>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  <Clock size={7.5} className="text-[#9FB5AD]" />
                  <span className="text-[7px] font-bold text-[#5A7368]">{c.hours}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

function OfferCard({ item }) {
  return (
    <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-start text-left border border-[#0E6630]/10 group">
      <div className="w-full h-52 rounded-xl border border-[#E8DDD0] overflow-hidden mb-5 flex flex-col group-hover:border-[#0E6630]/35 transition-all">
        {item.preview}
      </div>
      <div className="flex items-center gap-2.5 mb-2">
        <img src={item.icon} alt={item.title} className="w-5 h-5 object-contain shrink-0" />
        <h3 className="font-bold text-[#151515] text-base md:text-lg">{item.title}</h3>
      </div>
      <p className="text-sm text-[#5A5A5A] leading-relaxed">{item.desc}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  LANDING PAGE
// ═══════════════════════════════════════════════════
export default function Landing({ onCTA }) {
  const fontInter = { fontFamily: "'Inter', sans-serif" };
  const fontDM = { fontFamily: "'DM Sans', sans-serif" };
  const [activeSection, setActiveSection] = useState("home");
  const isProgrammaticScroll = useRef(false);
  const scrollTimeoutRef = useRef(null);

  const scrollToSection = useCallback((sectionId) => {
    setActiveSection(sectionId);

    const el = document.getElementById(sectionId);
    if (!el) return;

    isProgrammaticScroll.current = true;
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    const top = Math.max(0, el.getBoundingClientRect().top + window.scrollY - 72);
    window.scrollTo({ top, behavior: "smooth" });

    scrollTimeoutRef.current = setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 750);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (isProgrammaticScroll.current) return;

      const scrollBottom = window.innerHeight + window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      if (docHeight - scrollBottom <= 60) {
        setActiveSection("kontakt");
        return;
      }

      const checkY = window.scrollY + 160;
      let current = "home";
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (!el) continue;
        const offsetTop = el.getBoundingClientRect().top + window.scrollY;
        if (checkY >= offsetTop) {
          current = id;
        }
      }
      setActiveSection(current);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div style={fontInter} className="min-h-screen bg-[#FCFCFD] text-[#151515] overflow-x-clip relative">
      {/* Navbar */}
      <NavigationMenu4
        onCTA={onCTA}
        activeSection={activeSection}
        onNavigate={scrollToSection}
      />

      {/* Hero */}
      <section id="home" className="scroll-mt-20 py-12 md:py-20 px-4 md:px-8 max-w-7xl mx-auto flex flex-col md:grid md:grid-cols-2 gap-10 md:gap-16 items-center">
        <div className="max-w-xl order-1 md:order-1 text-left">
          <h1 className="text-[32px] md:text-5xl font-bold text-[#151515] leading-[1.2] mb-6 md:mb-8">
            Zdrowa produktywność bez wypalenia – zorganizuj swój dzień z Wellbeing App
          </h1>
          <p className="text-[#151515] text-base md:text-xl leading-relaxed mb-8">
            Oferujemy prosty sposób, aby wspierać pracowników w radzeniu sobie ze stresem i wypaleniem zawodowym, zwiększać ich zaangażowanie i tworzyć zdrowszą, bardziej efektywną kulturę pracy.
          </p>
          <button onClick={() => onCTA("login")} className="w-full md:w-auto inline-flex justify-center items-center gap-2 px-6 py-3.5 bg-[#0E6630] text-white rounded-lg font-medium hover:bg-[#0b5025] transition-colors">
            Zrób pierwszy krok <ArrowRight size={20} />
          </button>
        </div>
        <div className="flex justify-center order-2 md:order-2 w-full">
          <img src="/Frame 256.png" alt="Hero ilustracja" width="502" height="502" className="w-full max-w-md h-auto object-contain" />
        </div>
      </section>

      {/* Benefits */}
      <section id="produkt" className="scroll-mt-20 py-12 md:py-20 px-4 md:px-8 bg-[#FFEDE6]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center md:items-center mb-10 md:mb-16">
            <span className="inline-block px-4 py-1 border border-[#F2733C] text-[#F2733C] rounded-full text-sm font-semibold mb-4 md:mb-6">Nasz produkt</span>
            <h2 className="text-[24px] md:text-4xl font-bold text-center text-[#151515]">Największe korzyści</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                image: "/benefit_planner.png",
                alt: "Ilustracja indywidualnego planera zadań",
                title: "Indywidualny planer, który pomaga organizować dzień i unikać przeciążenia"
              },
              {
                image: "/benefit_signals.png",
                alt: "Ilustracja automatycznych sygnałów stresu i wypalenia",
                title: "Automatyczne sygnały, gdy Twój poziom stresu lub wypalenia rośnie"
              },
              {
                image: "/benefit_tips.png",
                alt: "Ilustracja personalizowanych wskazówek dobrostanu",
                title: "Personalizowane wskazówki, jak zadbać o swój dobrostan i energię"
              }
            ].map((f, i) => (
              <div key={i} className="bg-white p-6 md:p-7 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-start text-left border border-[#F2733C]/10 group">
                <div className="w-full aspect-square bg-[#F8F4E9] rounded-xl overflow-hidden mb-5 md:mb-6 flex items-center justify-center border border-[#E8DDD0]/60">
                  <img
                    src={f.image}
                    alt={f.alt}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                  />
                </div>
                <p className="text-base md:text-xl font-medium text-[#151515] leading-relaxed">{f.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="opinie" className="scroll-mt-20 py-12 md:py-20 px-4 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-16">
          <div className="flex-1 flex flex-col items-start text-left">
            <span className="inline-block px-4 py-1 border border-[#0E6630] text-[#0E6630] rounded-full text-sm font-semibold mb-4 md:mb-6">Opinie</span>
            <h2 className="text-[24px] md:text-4xl font-bold text-[#151515] mb-6 md:mb-8 leading-tight">Co mówią nasi użytkownicy</h2>
            <p className="text-base md:text-lg text-[#151515] mb-6 md:mb-8 leading-relaxed max-w-lg">
              "Tydzień korzystania z Wellbeing app i nareszcie czuję się zorganizowana"
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                <img src="/avatarLP.png" alt="Anna Kowalska" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-medium text-sm md:text-base text-[#151515]">Anna Kowalska</p>
                <p className="text-xs md:text-sm text-[#5A5A5A]">Wykładowczyni na UW</p>
              </div>
            </div>
          </div>
          <div className="flex-1 flex justify-center w-full">
            <img src="/comowiaonas.png" alt="Opinie użytkowników" className="w-full max-w-lg aspect-[4/3] object-cover rounded-2xl md:rounded-3xl border border-[#E8DDD0]" />
          </div>
        </div>
      </section>

      {/* Wypalenie */}
      <section id="wypalenie" className="scroll-mt-20 py-12 md:py-20 px-4 md:px-8 bg-[#E8F5EC]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-16">
          <div className="flex-1 flex justify-center order-2 md:order-1 w-full">
            <img src="/kluczykwypalenie.png" alt="Problem wypalenia" className="w-full max-w-lg aspect-square object-contain rounded-2xl md:rounded-3xl" />
          </div>
          <div className="flex-1 order-1 md:order-2 flex flex-col items-start text-left">
            <span className="inline-block px-4 py-1 border border-[#0E6630] text-[#0E6630] rounded-full text-sm font-semibold mb-4 md:mb-6">Wypalenie</span>
            <h2 className="text-[24px] md:text-4xl font-bold text-[#151515] mb-6 md:mb-8 leading-tight">Problem, który chcemy rozwiązać</h2>
            <p className="text-[#151515] text-base md:text-lg leading-relaxed mb-4 md:mb-6">
              Wiele firm boryka się ze wzrostem wypalenia zawodowego wśród pracowników, co prowadzi do spadku efektywności, większej absencji i rotacji w zespole. Często brakuje narzędzi, które pozwalałyby w porę zauważyć przeciążenie i odpowiednio wspierać pracowników.
            </p>
            <p className="text-[#0E6630] font-semibold text-base md:text-lg leading-relaxed">
              Nasza aplikacja pomaga w tym wyzwaniu, oferując indywidualne planery, raporty i system ostrzegania przed wypaleniem. Dzięki temu HR może proaktywnie wspierać dobrostan zespołu i budować zdrowszą, bardziej efektywną kulturę pracy.
            </p>
          </div>
        </div>
      </section>

      {/* Co oferujemy */}
      <section id="co-oferujemy" className="scroll-mt-20 py-12 md:py-20 px-4 md:px-8 bg-[#E8F5EC] relative overflow-hidden">
        {/* Miejsce na grafikę w prawym dolnym rogu (np. niebieski ludzik) */}
        <div className="absolute bottom-0 right-0 w-32 h-32 md:w-[350px] md:h-[350px] pointer-events-none z-0 opacity-50 md:opacity-100">
          <img src="/blue_figure.png" alt="Ilustracja postaci" className="w-full h-full object-contain object-bottom right-0 bottom-0 absolute" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col items-center text-center mb-10 md:mb-16">
            <span className="inline-block px-4 py-1 border border-[#0E6630] text-[#0E6630] rounded-full text-sm font-semibold mb-4 md:mb-6">Co oferujemy</span>
            <h2 className="text-[24px] md:text-4xl font-bold text-[#151515] mb-4 md:mb-6">Nasza aplikacja</h2>
            <p className="text-base md:text-xl text-[#151515] max-w-3xl leading-relaxed">
              Jesteś pracownikiem, team leaderem czy menedżerem? Bez względu na rolę, nasza aplikacja wellbeing wspomoże Cię w efektywnym planowaniu dnia i zapobieganiu wypaleniu. Tylko 5-10 minut dziennie – spersonalizowana pod Ciebie, dla realnych rezultatów.
            </p>
          </div>
          <div className="flex flex-col gap-5 md:gap-6 relative z-10 w-full items-center">
            {/* Top row - 3 items */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 w-full">
              {OFFER_TOP_ROW.map((item) => (
                <OfferCard key={item.title} item={item} />
              ))}
            </div>
            {/* Bottom row - 2 items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 w-full max-w-4xl">
              {OFFER_BOTTOM_ROW.map((item) => (
                <OfferCard key={item.title} item={item} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Nasza wizja */}
      <section id="o-nas" className="scroll-mt-20 py-16 md:py-24 px-4 md:px-8 bg-[#0E6630] text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center">
          <span className="inline-block px-4 py-1 border border-white text-white rounded-full text-sm font-semibold mb-6 md:mb-8">Nasza wizja</span>
          <p className="text-lg md:text-3xl font-bold text-white leading-relaxed">
            Jeśli codziennie zmagasz się z natłokiem zadań, pomożemy Ci je zorganizować i wychwycić wczesne symptomy wypalenia. Aplikacja dostosowuje się do Ciebie na podstawie wywiadu i danych o nastroju, oferując spersonalizowany planer oraz monitorowanie. Dostarczamy rekomendacje do sprawdzonych źródeł pomocy – rządowych instytucji czy specjalistów – bo zależy nam na Twoim dobrostanie.
          </p>
        </div>
      </section>

      {/* Rozwiązanie problemu */}
      <section id="rozwiazanie" className="scroll-mt-20 py-12 md:py-20 px-4 md:px-8 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-10 md:gap-16">
          <div className="flex-1 flex flex-col items-start text-left">
            <span className="inline-block px-4 py-1 border border-[#2F7377] text-[#2F7377] rounded-full text-sm font-semibold mb-4 md:mb-6 w-max">Rozwiązanie problemu</span>
            <h2 className="text-[24px] md:text-4xl font-bold text-[#151515] leading-tight mb-4 md:mb-8">Zaprojektowaliśmy aplikację Dla Ciebie</h2>
          </div>
          <div className="flex-1 flex flex-col gap-4 md:gap-6 relative z-10">
            {[
              "Wpisujesz zadania z priorytetami, a AI tworzy zoptymalizowany harmonogram dopasowany do Twojego aktualnego samopoczucia – dostępne na mobile i desktop.",
              "Codziennie oceniasz nastrój w prostej skali, aplikacja analizuje emocje i czas pracy, sygnalizując ryzyka z indywidualnymi wskazówkami.",
              "To Twój osobisty asystent równowagi – wypróbuj i przekonaj się o zmianie."
            ].map((text, i) => (
              <div key={i} className="bg-[#E4F6F8] p-5 md:p-6 rounded-xl text-[#151515] text-sm md:text-lg leading-relaxed shadow-sm">
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Kontakt */}
      <section id="kontakt" className="scroll-mt-20 py-12 md:py-20 px-4 md:px-8 bg-[#F5EFE6] relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* Miejsce na grafikę tła */}
          <img src="/kontakt_tlo.png" alt="Tło kontaktowe" className="w-full h-full object-cover object-bottom" />
        </div>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-10 md:gap-16 relative z-10">
          <div className="flex-1 flex flex-col items-start text-left">
            <span className="inline-block px-4 py-1 border border-[#0E6630] text-[#0E6630] rounded-full text-sm font-semibold mb-4 md:mb-6">Kontakt</span>
            <h2 style={fontDM} className="text-[32px] md:text-5xl font-bold text-[#0D0D0D] tracking-tight mb-4 md:mb-6">Skontaktuj się z nami</h2>
            <p className="text-[#151515] text-base md:text-lg leading-relaxed max-w-md">
              Masz pytania? Napisz do nas – pokażemy demo, porozmawiamy o możliwym wdrożeniu i przedstawimy, jak realnie może to zwiększyć efektywność pracy zespołu. Skontaktuj się z nami, a wspólnie dopasujemy najlepsze podejście dla Twojej organizacji.
            </p>
          </div>
          <div className="flex-1 w-full">
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-100 w-full">
              <div className="space-y-5 md:space-y-6">
                <div>
                  <label className="block text-[#151515] text-sm md:text-base font-medium mb-1 md:mb-2">Imię</label>
                  <input type="text" placeholder="Twoje imię" className="w-full px-4 py-2.5 md:py-3 border border-[#D6D6D6] rounded-lg focus:outline-none focus:border-[#0E6630] text-sm md:text-base" />
                </div>
                <div>
                  <label className="block text-[#151515] text-sm md:text-base font-medium mb-1 md:mb-2">Email</label>
                  <input type="email" placeholder="Wpisz e-mail" className="w-full px-4 py-2.5 md:py-3 border border-[#D6D6D6] rounded-lg focus:outline-none focus:border-[#0E6630] text-sm md:text-base" />
                </div>
                <div>
                  <label className="block text-[#151515] text-sm md:text-base font-medium mb-1 md:mb-2">Twoja wiadomość</label>
                  <textarea placeholder="Napisz..." rows={4} className="w-full px-4 py-2.5 md:py-3 border border-[#D6D6D6] rounded-lg focus:outline-none focus:border-[#0E6630] resize-none text-sm md:text-base" />
                </div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" className="mt-1 w-4 h-4 md:w-5 md:h-5 border-[#DFDBDB] rounded accent-[#0E6630] shrink-0" />
                  <span className="text-[#151515] text-xs md:text-sm mt-0.5">Akceptuję <a href="/regulamin" className="underline">regulamin</a></span>
                </label>
                <button className="flex justify-center items-center gap-2 px-6 py-3 bg-[#0E6630] text-white font-medium rounded-lg hover:bg-[#0b5025] transition-colors w-full md:w-auto mt-2">
                  Wyślij <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-8 md:py-12 px-4 md:px-8 border-t border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-8 md:gap-12 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center justify-between w-full gap-6">
            <a href="#home" onClick={(e) => { e.preventDefault(); scrollToSection("home"); }} className="flex items-center hover:opacity-90 transition-opacity">
              <img src="/logo WBA.svg" alt="Wellbeing app" width="387" height="50" className="h-7 md:h-8 w-auto object-contain" />
            </a>
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
              <a href="#home" onClick={(e) => { e.preventDefault(); scrollToSection("home"); }} className="text-[#5A5A5A] text-sm md:text-base font-medium hover:text-[#0E6630]">Home</a>
              <a href="#produkt" onClick={(e) => { e.preventDefault(); scrollToSection("produkt"); }} className="text-[#5A5A5A] text-sm md:text-base font-medium hover:text-[#0E6630]">Produkt</a>
              <a href="#wypalenie" onClick={(e) => { e.preventDefault(); scrollToSection("wypalenie"); }} className="text-[#5A5A5A] text-sm md:text-base font-medium hover:text-[#0E6630]">Wypalenie</a>
              <a href="#o-nas" onClick={(e) => { e.preventDefault(); scrollToSection("o-nas"); }} className="text-[#5A5A5A] text-sm md:text-base font-medium hover:text-[#0E6630]">O nas</a>
              <a href="#kontakt" onClick={(e) => { e.preventDefault(); scrollToSection("kontakt"); }} className="text-[#5A5A5A] text-sm md:text-base font-medium hover:text-[#0E6630]">Kontakt</a>
            </div>
          </div>
          <div className="w-full h-px bg-[#F6F6F6]" />
          <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-xs md:text-sm text-[#121212] order-2 md:order-1">
              <a href="/polityka-prywatnosci" className="underline hover:text-[#0E6630]">Polityka prywatności</a>
              <a href="/regulamin" className="underline hover:text-[#0E6630]">Regulamin</a>
              <a href="#" className="underline hover:text-[#0E6630]">Pliki cookies</a>
            </div>
            <p className="text-[#121212] text-xs md:text-sm order-1 md:order-2">© 2026 Nasza Aplikacja Wellbeing</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
