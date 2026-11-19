import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import NavigationMenu4 from "./ui/navigation-menu-4";
import { EMOJIS, MOOD_L } from "../lib/constants";

const SECTION_IDS = [
  "home",
  "produkt",
  "wypalenie",
  "o-nas",
  "kontakt",
];

const TESTIMONIALS = [
  {
    quote:
      "Tydzień korzystania z Wellbeing app i nareszcie czuję się zorganizowana. Planer AI układa mój dzień tak, że kończę pracę bez poczucia przytłoczenia.",
    name: "Anna Kowalska",
    role: "Wykładowczyni na UW",
    avatar: "/avatarLP.png",
  },
  {
    quote:
      "Jako lider zespołu często gubiłem się w spotkaniach i zadaniach na wczoraj. Automatyczne przerwy regeneracyjne i szybki check-in nastroju realnie poprawiły mój fokus.",
    name: "Michał Nowak",
    role: "Team Leader IT",
    initials: "MN",
  },
  {
    quote:
      "Najbardziej cenię pełną prywatność danych i delikatny system ostrzegania. Pracownicy chętnie korzystają z aplikacji, bo wiedzą, że wspiera ich dobrostan bez żadnego nadzoru.",
    name: "Karolina Wiśniewska",
    role: "HR Business Partner",
    initials: "KW",
  },
];

const FAQ_ITEMS = [
  {
    q: "Jak działa system XP i roślinka (Streak Plant)?",
    a: "Twoja wirtualna roślina to wskaźnik codziennej konsekwencji. Za każde wykonane zadanie zyskujesz punkty doświadczenia (XP), dzięki którym roślinka rośnie. Gdy wykonasz 100% zaplanowanego na dany dzień zestawu zadań, roślinka w pełni rozkwita.",
  },
  {
    q: "Czy moje dane i wpisy o nastroju są bezpieczne?",
    a: "Tak, w 100%. Twoje zadania i notatki o nastroju są bezpiecznie przechowywane i chronione. Żaden wpis nie jest udostępniany przełożonemu, działowi HR ani uczelni. Dodatkowo wpisy są automatycznie usuwane z serwera po 60 dniach braku aktywności.",
  },
  {
    q: "Co oznaczają kolory przy zadaniach?",
    a: "Kolory określają priorytet: czerwony to Priorytet Wysoki (najważniejsze na dziś), żółty to Priorytet Średni, a zielony to Priorytet Niski. Aplikacja automatycznie układa harmonogram tak, aby zadania o najwyższym priorytecie znalazły się na czele planu.",
  },
  {
    q: "Jak zintegrować aplikację z Kalendarzem Google?",
    a: "Wejdź w Ustawienia (ikona koła zębatego), kliknij „Synchronizuj Kalendarz” w sekcji Integracja z Google i zaloguj się na swoje konto. Twoje spotkania i wykłady pojawią się jako zablokowane czasowo zadania z ikoną kłódki.",
  },
  {
    q: "Co się stanie, jeśli usunę konto?",
    a: "Usunięcie konta w Ustawieniach powoduje natychmiastowe i bezpowrotne skasowanie wszystkich Twoich zadań, statystyk i historii nastrojów z serwera.",
  },
  {
    q: "Gdzie znajdę profesjonalną pomoc psychologiczną?",
    a: "W zakładce Pomoc (ikona koła ratunkowego) znajdziesz listę zweryfikowanych, bezpłatnych numerów wsparcia działających całą dobę (m.in. Kryzysowy Telefon Zaufania 116 123). Aplikacja sama delikatnie zasugeruje tę zakładkę, jeśli wykryje długotrwały spadek nastroju.",
  },
];

function InteractiveTaskPlanerPreview() {
  const [aiOptimized, setAiOptimized] = useState(true);

  return (
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
          <button
            type="button"
            onClick={() => setAiOptimized((prev) => !prev)}
            title="Kliknij, aby zobaczyć efekt AI"
            className="relative inline-flex items-center gap-0.5 px-1.5 py-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-md text-[8px] font-bold shadow-2xs cursor-pointer active:scale-95 transition-all"
          >
            <Sparkles size={8} />
            AI
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-400 border border-white rounded-full animate-pulse" />
          </button>
          <button
            type="button"
            onClick={() => setAiOptimized((prev) => !prev)}
            className="inline-flex items-center gap-0.5 px-1.5 py-1 bg-[#057E85] hover:bg-[#04686e] text-white rounded-md text-[8px] font-bold shadow-2xs cursor-pointer active:scale-95 transition-all"
          >
            <RefreshCw size={8} />
            {aiOptimized ? "Zbalansowany" : "Generuj plan"}
          </button>
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

        {aiOptimized ? (
          <>
            <div className="bg-white rounded-[10px] border-2 border-[#E8DDD0] px-2.5 py-1.5 shadow-2xs transition-all">
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

            <div className="flex items-center justify-center gap-1 py-0.5">
              <Clock size={9} className="text-[#057E85]" />
              <span className="text-[8.5px] font-semibold text-[#057E85]">
                Czas na regenerację
              </span>
            </div>

            <div className="bg-white rounded-[10px] border-2 border-[#E8DDD0] px-2.5 py-1.5 shadow-2xs transition-all">
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
          </>
        ) : (
          <div className="flex-1 flex flex-col justify-center gap-1.5">
            <div className="bg-white/90 rounded-[10px] border border-dashed border-[#C4BBAF] px-2.5 py-1.5">
              <div className="flex items-center justify-between gap-1.5">
                <span className="text-[9.5px] font-bold text-[#5A5A5A] truncate">
                  Spotkanie projektowe (bez godziny)
                </span>
                <span className="text-[7px] px-1.5 py-0.5 rounded-full font-bold uppercase bg-yellow-100 text-yellow-700 shrink-0">
                  ŚREDNI
                </span>
              </div>
            </div>
            <div className="bg-white/90 rounded-[10px] border border-dashed border-[#C4BBAF] px-2.5 py-1.5">
              <div className="flex items-center justify-between gap-1.5">
                <span className="text-[9.5px] font-bold text-[#5A5A5A] truncate">
                  Przygotowanie prezentacji (bez godziny)
                </span>
                <span className="text-[7px] px-1.5 py-0.5 rounded-full font-bold uppercase bg-red-100 text-red-700 shrink-0">
                  WYSOKI
                </span>
              </div>
            </div>
            <p className="text-[8px] font-semibold text-[#057E85] text-center">
              Kliknij „AI”, aby ułożyć dzień z przerwą ✨
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function InteractiveMoodMonitorPreview() {
  const [selectedIdx, setSelectedIdx] = useState(4);

  return (
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
          Twój nastrój (kliknij emotkę)
        </p>
        <div className="flex justify-between items-center mb-1">
          {EMOJIS.map((emoji, idx) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setSelectedIdx(idx)}
              className={`w-6 h-6 text-xs rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                idx === selectedIdx
                  ? "ring-2 ring-[#1E5C36] bg-[#E8F4ED] scale-110 shadow-xs"
                  : "opacity-75 hover:opacity-100 hover:bg-[#F5EFE6]"
              }`}
              title={MOOD_L[idx]}
            >
              {emoji}
            </button>
          ))}
        </div>
        <p className="text-center text-[8.5px] font-bold text-[#1E5C36] mb-1.5">
          {MOOD_L[selectedIdx]}
        </p>

        <div className="w-full py-1.5 bg-[#1E5C36] text-white rounded-xl font-bold text-[8.5px] text-center shadow-sm">
          Zapisz i kontynuuj
        </div>
      </div>
    </div>
  );
}

const OFFER_TOP_ROW = [
  {
    icon: "/checklist.png",
    title: "Task planer",
    desc: "Układa zadania w harmonogram spersonalizowany pod Ciebie.",
    preview: <InteractiveTaskPlanerPreview />,
  },
  {
    icon: "/sentiment_satisfied.png",
    title: "Monitor nastroju",
    desc: "Krótka, codzienna skala 7-stopniowa, która zbiera to, jak się czujesz w pracy.",
    preview: <InteractiveMoodMonitorPreview />,
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

function OfferCard({ item, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      className="bg-white p-5 md:p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-start text-left border border-[#0E6630]/10 group"
    >
      <div className="w-full h-52 rounded-xl border border-[#E8DDD0] overflow-hidden mb-5 flex flex-col group-hover:border-[#0E6630]/35 transition-all">
        {item.preview}
      </div>
      <div className="flex items-center gap-2.5 mb-2">
        <img src={item.icon} alt={item.title} className="w-5 h-5 object-contain shrink-0" />
        <h3 className="font-bold text-[#151515] text-base md:text-lg">{item.title}</h3>
      </div>
      <p className="text-sm text-[#5A5A5A] leading-relaxed">{item.desc}</p>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════
//  LANDING PAGE
// ═══════════════════════════════════════════════════
export default function Landing({ onCTA }) {
  const fontInter = { fontFamily: "'Inter', sans-serif" };
  const fontDM = { fontFamily: "'DM Sans', sans-serif" };
  const [activeSection, setActiveSection] = useState("home");
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [openFaqIdx, setOpenFaqIdx] = useState(0);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: "",
    acceptedTerms: false,
    website: "",
  });
  const [contactLoading, setContactLoading] = useState(false);
  const [contactStatus, setContactStatus] = useState(null);
  const isProgrammaticScroll = useRef(false);
  const scrollTimeoutRef = useRef(null);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactStatus(null);

    if (contactForm.name.trim().length < 2) {
      setContactStatus({ type: "error", text: "Wpisz swoje imię (min. 2 znaki)." });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactForm.email.trim())) {
      setContactStatus({ type: "error", text: "Podaj poprawny adres e-mail." });
      return;
    }
    if (contactForm.message.trim().length < 10) {
      setContactStatus({ type: "error", text: "Wiadomość powinna mieć co najmniej 10 znaków." });
      return;
    }
    if (!contactForm.acceptedTerms) {
      setContactStatus({ type: "error", text: "Zaakceptuj regulamin przed wysłaniem wiadomości." });
      return;
    }

    setContactLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || "Nie udało się wysłać wiadomości.");
      }
      setContactStatus({
        type: "success",
        text: "Dziękujemy! Twoja wiadomość została wysłana — odezwiemy się wkrótce.",
      });
      setContactForm({
        name: "",
        email: "",
        message: "",
        acceptedTerms: false,
        website: "",
      });
    } catch (err) {
      setContactStatus({ type: "error", text: err.message });
    } finally {
      setContactLoading(false);
    }
  };

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
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => onCTA("register")} className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-6 py-3.5 bg-[#0E6630] text-white rounded-lg font-medium hover:bg-[#0b5025] transition-colors cursor-pointer">
              Zrób pierwszy krok <ArrowRight size={20} />
            </button>
            <button onClick={() => scrollToSection("co-oferujemy")} className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-6 py-3.5 bg-[#D0EBDA] text-[#0E6630] rounded-lg font-medium hover:bg-[#bce0ca] transition-colors cursor-pointer">
              Zobacz, jak działa
            </button>
          </div>
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
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                className="bg-white p-6 md:p-7 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-start text-left border border-[#F2733C]/10 group"
              >
                <div className="w-full aspect-square bg-[#F8F4E9] rounded-xl overflow-hidden mb-5 md:mb-6 flex items-center justify-center border border-[#E8DDD0]/60">
                  <img
                    src={f.image}
                    alt={f.alt}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                  />
                </div>
                <p className="text-base md:text-xl font-medium text-[#151515] leading-relaxed">{f.title}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="opinie" className="scroll-mt-20 py-12 md:py-20 px-4 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-16">
          <div className="flex-1 flex flex-col items-start text-left w-full">
            <span className="inline-block px-4 py-1 border border-[#0E6630] text-[#0E6630] rounded-full text-sm font-semibold mb-4 md:mb-6">Opinie</span>
            <h2 className="text-[24px] md:text-4xl font-bold text-[#151515] mb-6 md:mb-8 leading-tight">Co mówią nasi użytkownicy</h2>
            <div className="min-h-[168px] w-full max-w-lg flex flex-col justify-between">
              <AnimatePresence mode="wait">
                <motion.div
                  key={testimonialIdx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  <p className="text-base md:text-lg text-[#151515] mb-6 leading-relaxed">
                    „{TESTIMONIALS[testimonialIdx].quote}”
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-[#E8F5EC] text-[#0E6630] font-bold rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                      {TESTIMONIALS[testimonialIdx].avatar ? (
                        <img
                          src={TESTIMONIALS[testimonialIdx].avatar}
                          alt={TESTIMONIALS[testimonialIdx].name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{TESTIMONIALS[testimonialIdx].initials}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-sm md:text-base text-[#151515]">
                        {TESTIMONIALS[testimonialIdx].name}
                      </p>
                      <p className="text-xs md:text-sm text-[#5A5A5A]">
                        {TESTIMONIALS[testimonialIdx].role}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <button
                type="button"
                onClick={() =>
                  setTestimonialIdx((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)
                }
                aria-label="Poprzednia opinia"
                className="p-2 rounded-full border border-[#E5E7EB] text-[#151515] hover:border-[#0E6630] hover:text-[#0E6630] transition-colors cursor-pointer"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="flex items-center gap-1.5">
                {TESTIMONIALS.map((t, idx) => (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => setTestimonialIdx(idx)}
                    aria-label={`Opinia ${idx + 1}`}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      idx === testimonialIdx ? "w-6 bg-[#0E6630]" : "w-2 bg-[#D0EBDA] hover:bg-[#0E6630]/50"
                    }`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => setTestimonialIdx((prev) => (prev + 1) % TESTIMONIALS.length)}
                aria-label="Następna opinia"
                className="p-2 rounded-full border border-[#E5E7EB] text-[#151515] hover:border-[#0E6630] hover:text-[#0E6630] transition-colors cursor-pointer"
              >
                <ChevronRight size={18} />
              </button>
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
              {OFFER_TOP_ROW.map((item, idx) => (
                <OfferCard key={item.title} item={item} index={idx} />
              ))}
            </div>
            {/* Bottom row - 2 items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 w-full max-w-4xl">
              {OFFER_BOTTOM_ROW.map((item, idx) => (
                <OfferCard key={item.title} item={item} index={idx} />
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
          <div className="flex-1 flex flex-col items-start justify-between text-left">
            <div>
              <span className="inline-block px-4 py-1 border border-[#2F7377] text-[#2F7377] rounded-full text-sm font-semibold mb-4 md:mb-6 w-max">Rozwiązanie problemu</span>
              <h2 className="text-[24px] md:text-4xl font-bold text-[#151515] leading-tight mb-4 md:mb-8">Zaprojektowaliśmy aplikację Dla Ciebie</h2>
            </div>
            <img
              src="/rozwiazanie_figure.png"
              alt="Ilustracja równowagi i dobrostanu"
              className="w-full max-w-[460px] md:max-w-[520px] h-auto object-contain mt-2"
            />
          </div>
          <div className="flex-1 flex flex-col gap-4 md:gap-6 relative z-10">
            {[
              "Wpisujesz zadania z priorytetami, a AI tworzy zoptymalizowany harmonogram dopasowany do Twojego aktualnego samopoczucia – dostępne na mobile i desktop.",
              "Codziennie oceniasz nastrój w prostej skali, aplikacja analizuje emocje i czas pracy, sygnalizując ryzyka z indywidualnymi wskazówkami.",
              "To Twój osobisty asystent równowagi – wypróbuj i przekonaj się o zmianie."
            ].map((text, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-[#E4F6F8] p-5 md:p-6 rounded-xl text-[#151515] text-sm md:text-lg leading-relaxed shadow-sm"
              >
                {text}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-20 py-12 md:py-20 px-4 md:px-8 bg-[#FCFCFD] border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center text-center mb-10 md:mb-12">
            <span className="inline-block px-4 py-1 border border-[#0E6630] text-[#0E6630] rounded-full text-sm font-semibold mb-4">
              FAQ
            </span>
            <h2 className="text-[24px] md:text-4xl font-bold text-[#151515]">
              Najczęściej zadawane pytania
            </h2>
          </div>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <motion.div
                  key={item.q}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.35, delay: idx * 0.04 }}
                  className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden shadow-2xs"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIdx(isOpen ? -1 : idx)}
                    className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left hover:bg-[#E8F5EC]/40 transition-colors cursor-pointer"
                  >
                    <span className="font-semibold text-[#151515] text-sm md:text-base">
                      {item.q}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`text-[#0E6630] shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-4 pt-1 text-sm md:text-base text-[#5A5A5A] leading-relaxed border-t border-gray-100">
                          {item.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
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
            <form onSubmit={handleContactSubmit} className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-100 w-full">
              {/* Ukryty honeypot przeciwko botom */}
              <input
                type="text"
                name="website"
                value={contactForm.website}
                onChange={(e) => setContactForm((prev) => ({ ...prev, website: e.target.value }))}
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
              />
              <div className="space-y-5 md:space-y-6">
                <div>
                  <label className="block text-[#151515] text-sm md:text-base font-medium mb-1 md:mb-2">Imię</label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Twoje imię"
                    className="w-full px-4 py-2.5 md:py-3 border border-[#D6D6D6] rounded-lg focus:outline-none focus:border-[#0E6630] text-sm md:text-base"
                  />
                </div>
                <div>
                  <label className="block text-[#151515] text-sm md:text-base font-medium mb-1 md:mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="Wpisz e-mail"
                    className="w-full px-4 py-2.5 md:py-3 border border-[#D6D6D6] rounded-lg focus:outline-none focus:border-[#0E6630] text-sm md:text-base"
                  />
                </div>
                <div>
                  <label className="block text-[#151515] text-sm md:text-base font-medium mb-1 md:mb-2">Twoja wiadomość</label>
                  <textarea
                    required
                    value={contactForm.message}
                    onChange={(e) => setContactForm((prev) => ({ ...prev, message: e.target.value }))}
                    placeholder="Napisz..."
                    rows={4}
                    className="w-full px-4 py-2.5 md:py-3 border border-[#D6D6D6] rounded-lg focus:outline-none focus:border-[#0E6630] resize-none text-sm md:text-base"
                  />
                </div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contactForm.acceptedTerms}
                    onChange={(e) => setContactForm((prev) => ({ ...prev, acceptedTerms: e.target.checked }))}
                    className="mt-1 w-4 h-4 md:w-5 md:h-5 border-[#DFDBDB] rounded accent-[#0E6630] shrink-0"
                  />
                  <span className="text-[#151515] text-xs md:text-sm mt-0.5">Akceptuję <a href="/regulamin" className="underline">regulamin</a></span>
                </label>

                {contactStatus && (
                  <div
                    className={`flex items-start gap-2.5 p-3.5 rounded-lg text-sm font-medium ${
                      contactStatus.type === "success"
                        ? "bg-[#E8F5EC] text-[#0E6630] border border-[#0E6630]/20"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {contactStatus.type === "success" ? (
                      <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    )}
                    <span>{contactStatus.text}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={contactLoading}
                  className="flex justify-center items-center gap-2 px-6 py-3 bg-[#0E6630] text-white font-medium rounded-lg hover:bg-[#0b5025] transition-colors w-full md:w-auto mt-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {contactLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Wysyłanie...
                    </>
                  ) : (
                    <>
                      Wyślij <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </form>
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
              <span className="text-[#121212]">Pliki cookies – nie bierzemy żadnych :)</span>
            </div>
            <p className="text-[#121212] text-xs md:text-sm order-1 md:order-2">© 2026 Nasza Aplikacja Wellbeing</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
