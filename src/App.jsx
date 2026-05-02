import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Home, Calendar, Smile, AlertTriangle, Plus, Search, Check, X,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Phone, Clock, ArrowRight,
  BookOpen, Brain, RefreshCw, Eye, EyeOff, LogOut, ExternalLink,
  Filter, Flame, Menu, Bell, Settings, TrendingUp, TrendingDown,
  Minus, MessageSquare, Leaf, Star, AlertCircle, CheckCircle,
  Play, Pause, RotateCcw, Target, Sparkles, Trash2, Pencil, Lock
} from "lucide-react";

// ═══════════════════════════════════════════════════
//  SUPABASE CONFIG
// ═══════════════════════════════════════════════════
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ═══════════════════════════════════════════════════
//  CONSTANTS & CONFIG
// ═══════════════════════════════════════════════════
const BURNOUT_KW = [
  "nie mam siły", "przytłacza", "koniec z tym", "dość", "nie mogę",
  "wypalenie", "rezygnuję", "za dużo", "zmęczony", "zmęczona",
  "załamanie", "beznadziejna", "desperacja", "płaczę", "nie daję rady"
];

const PRIOS = [
  { id: "niski", label: "niski priorytet", tw: "bg-green-100 text-green-700", dot: "bg-green-400" },
  { id: "sredni", label: "średni priorytet", tw: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-400" },
  { id: "wysoki", label: "wysoki priorytet", tw: "bg-red-100 text-red-700", dot: "bg-red-400" },
];
const CONTACTS = [
  {
    org: "Instytut Psychologii Zdrowia PTP",
    name: "Kryzysowy Telefon Zaufania",
    phone: "116 123",
    hours: "14:00–22:00",
    url: "https://psychologia.edu.pl",
    desc: "Wsparcie dla osób dorosłych w kryzysie emocjonalnym, zmagających się z samotnością lub trudną sytuacją życiową."
  },
  {
    org: "Fundacja ITAKA (na zlecenie NFZ)",
    name: "Centrum Wsparcia",
    phone: "800 70 22 22",
    hours: "24/7 Całodobowo",
    url: "https://liniawsparcia.pl",
    desc: "Najbardziej ogólny punkt wsparcia, dostępny zawsze. Oferują pomoc telefoniczną, czat oraz dedykowaną aplikację."
  },
  {
    org: "Fundacja ITAKA",
    name: "Antydepresyjny Telefon Zaufania",
    phone: "22 484 88 01",
    hours: "Różne dyżury",
    url: "https://stopdepresji.pl",
    desc: "Specjalistyczna pomoc skierowana bezpośrednio do osób zmagających się z depresją oraz ich bliskich."
  },
  {
    org: "Stowarzyszenie Niebieska Linia",
    name: "Niebieska Linia",
    phone: "800 120 002",
    hours: "24/7 Całodobowo",
    url: "https://niebieskalinia.info",
    desc: "Pogotowie dla ofiar i świadków przemocy w rodzinie. Możesz tu uzyskać wsparcie psychologiczne i prawne."
  },
  {
    org: "Fundacja Dajemy Dzieciom Siłę",
    name: "Telefon dla Dzieci i Młodzieży",
    phone: "116 111",
    hours: "24/7 Całodobowo",
    url: "https://116111.pl",
    desc: "Bezpłatna i anonimowa pomoc dla osób niepełnoletnich oraz młodych dorosłych w każdej trudnej sytuacji."
  },
  {
    org: "Państwowe Ratownictwo Medyczne",
    name: "Numer Alarmowy",
    phone: "112",
    hours: "24/7 Całodobowo",
    url: "https://gov.pl/web/numer-alarmowy-112",
    desc: "Wyłącznie w sytuacjach bezpośredniego zagrożenia życia lub zdrowia wymagających natychmiastowej interwencji służb."
  },
];
const EMOJIS = ["😫", "😟", "😐", "🙂", "😊", "😄", "🤩"];
const MOOD_L = [
  "Tragedia", "Źle", "Neutralnie", "Dobrze", "Bardzo dobrze", "Świetnie", "Fantastycznie"
];

const generateHistoricalMoods = () => {
  const moods = [];
  const notes = [
    "Sesja poprawkowa – 200 maili w skrzynce, przytłaczające.",
    "Wpisane oceny do USOS – system o dziwo nie padł, ogromna ulga.",
    "Dzień rektorski – nareszcie chwila na własne badania naukowe.",
    "Seminarium magisterskie – studenci mają świetne tematy, to buduje!",
    "Kolejne zebranie instytutu, nic konkretnego nie ustalono.",
    "Udało się wysłać artykuł do recenzji, trzymam kciuki.",
    "Znowu problem z rzutnikiem w sali 104...",
    "Świetna dyskusja na dzisiejszym wykładzie z 3 rokiem.",
    "Niespodziewane zastępstwo za kolegę. Brak czasu na obiadową przerwę.",
    "Udało się zamknąć grant badawczy na ten rok! Ogromna satysfakcja."
  ];

  const now = new Date();
  let currentNoteIndex = 0;

  for (let i = 89; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];

    // Trend dostosowany do nowej, 7-stopniowej skali
    let trend = i > 60 ? 1 : i > 30 ? 3 : 5;
    let wave = Math.sin(i / 3) * 1.5;
    let randomVariation = (Math.random() * 2) - 1;

    let val = Math.round(trend + wave + randomVariation);
    val = Math.max(0, Math.min(6, val)); // Skala 0-6

    let note = "";
    if (i % 4 === 0 || i === 2 || i === 5) {
      note = notes[currentNoteIndex % notes.length];
      currentNoteIndex++;
    }

    moods.push({ id: Date.now() - i * 10000, d: dateStr, v: val, note: note });
  }
  return moods;
};

const INIT_MOODS = generateHistoricalMoods();





const DAYS = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sb", "Ndz"];

// --- ROZSZERZONE DYNAMICZNE DATY ---
const getLocalYMD = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const now = new Date();
const todayYMD = getLocalYMD(now);
const todayPL = now.toLocaleDateString("pl-PL");

const day2 = new Date(now); day2.setDate(now.getDate() + 1);
const day2YMD = getLocalYMD(day2);
const day2PL = day2.toLocaleDateString("pl-PL");

const day3 = new Date(now); day3.setDate(now.getDate() + 2);
const day3YMD = getLocalYMD(day3);
const day3PL = day3.toLocaleDateString("pl-PL");

const day4 = new Date(now); day4.setDate(now.getDate() + 3);
const day4YMD = getLocalYMD(day4);
const day4PL = day4.toLocaleDateString("pl-PL");

const day5 = new Date(now); day5.setDate(now.getDate() + 4);
const day5YMD = getLocalYMD(day5);
const day5PL = day5.toLocaleDateString("pl-PL");

// Pomocnicze godziny
const in3Hours = new Date(now.getTime() + 3 * 60 * 60 * 1000);
const in3HoursTime = in3Hours.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const INIT_TASKS = [
  // --- DZIEŃ 1 (DZISIAJ) ---
  { id: 1, title: "Zaplanowanie pierwszego tygodnia 🌿", w: 2, p: "niski", done: false, duration: "15 min", deadline: "", difficulty: 1, desc: "Przegląd funkcji aplikacji.", isLocked: false, t: "" },
  { id: 2, title: "Wysłanie raportu do szefa 📧", w: 7, p: "wysoki", done: false, duration: "45 min", deadline: `${todayYMD} o ${in3HoursTime}`, difficulty: 4, desc: "Zestawienie danych.", isLocked: false, t: "" },
  { id: 3, title: "Konsultacje projektowe 👥", w: 6, p: "sredni", done: false, duration: "60 min", deadline: "", difficulty: 3, desc: "Postępy w projekcie.", isLocked: true, t: `🔒 11:00 (${todayPL})` },
  { id: 4, title: "Projektowanie architektury 🧠", w: 10, p: "wysoki", done: false, duration: "180 min", deadline: `${day2YMD} o 12:00`, difficulty: 5, desc: "Tryb Focus Mode.", isLocked: false, t: "" },
  { id: 5, title: "Mindfulness 🧘", w: 2, p: "niski", done: false, duration: "20 min", deadline: "", difficulty: 1, desc: "Chwila dla siebie.", isLocked: true, t: `🔒 08:30 (${todayPL}) 🔁 codziennie` },
  { id: 6, title: "Pilny telefon do klienta 📞", w: 5, p: "wysoki", done: false, duration: "10 min", deadline: `${todayYMD} o 16:00`, difficulty: 3, desc: "Wyjaśnienie uwag do faktury.", isLocked: false, t: "" },
  { id: 7, title: "Zakupy spożywcze 🛒", w: 3, p: "niski", done: false, duration: "40 min", deadline: "", difficulty: 2, desc: "Lista na lodówce.", isLocked: false, t: "" },
  { id: 8, title: "Podlewanie roślin 💧", w: 1, p: "niski", done: false, duration: "10 min", deadline: "", difficulty: 1, desc: "Nie zapomnij o paprotce.", isLocked: false, t: "" },

  // --- DZIEŃ 2 ---
  { id: 9, title: "Analiza konkurencji 📊", w: 6, p: "sredni", done: false, duration: "90 min", deadline: `${day2YMD} o 17:00`, difficulty: 4, desc: "Przygotowanie tabeli porównawczej.", isLocked: false, t: "" },
  { id: 10, title: "Joga wieczorna 🧘‍♀️", w: 2, p: "niski", done: false, duration: "30 min", deadline: "", difficulty: 1, desc: "Rozciąganie po pracy.", isLocked: true, t: `🔒 20:00 (${day2PL})` },
  { id: 11, title: "Sprzątanie biurka ✨", w: 2, p: "niski", done: false, duration: "15 min", deadline: "", difficulty: 1, desc: "Organizacja przestrzeni pracy.", isLocked: false, t: "" },
  { id: 12, title: "Testowanie modułu logowania 🧪", w: 8, p: "wysoki", done: false, duration: "45 min", deadline: `${day2YMD} o 10:00`, difficulty: 4, desc: "Sprawdzenie błędów walidacji.", isLocked: false, t: "" },

  // --- DZIEŃ 3 ---
  { id: 13, title: "Briefing poranny ☕", w: 4, p: "sredni", done: false, duration: "15 min", deadline: "", difficulty: 2, desc: "Szybkie statusy.", isLocked: true, t: `🔒 07:00 (${day3PL})` },
  { id: 14, title: "Nauka nowego frameworka 📚", w: 7, p: "sredni", done: false, duration: "120 min", deadline: "", difficulty: 4, desc: "Kurs na Udemy.", isLocked: false, t: "" },
  { id: 15, title: "Czytanie książki 📖", w: 2, p: "niski", done: false, duration: "45 min", deadline: "", difficulty: 1, desc: "Dobrostan psychiczny.", isLocked: false, t: "" },
  { id: 16, title: "Webinar o AI 🤖", w: 5, p: "niski", done: false, duration: "60 min", deadline: `${day3YMD} o 15:00`, difficulty: 3, desc: "Nowości w GPT-5.", isLocked: false, t: "" },

  // --- DZIEŃ 4 ---
  { id: 17, title: "Wizyta u dentysty 🦷", w: 5, p: "wysoki", done: false, duration: "60 min", deadline: "", difficulty: 3, desc: "Kontrola okresowa.", isLocked: true, t: `🔒 14:30 (${day4PL})` },
  { id: 18, title: "Przygotowanie prezentacji 💻", w: 9, p: "wysoki", done: false, duration: "120 min", deadline: `${day5YMD} o 09:00`, difficulty: 4, desc: "Slajdy na zarząd.", isLocked: false, t: "" },
  { id: 19, title: "Przegląd finansów 💰", w: 4, p: "sredni", done: false, duration: "40 min", deadline: "", difficulty: 3, desc: "Budżet domowy.", isLocked: false, t: "" },
  { id: 20, title: "Odpowiedź na feedback 📝", w: 3, p: "sredni", done: false, duration: "20 min", deadline: `${day4YMD} o 18:00`, difficulty: 2, desc: "Maile od zespołu HR.", isLocked: false, t: "" },

  // --- DZIEŃ 5 ---
  { id: 21, title: "Spacer w lesie 🌳", w: 1, p: "niski", done: false, duration: "60 min", deadline: "", difficulty: 1, desc: "Pełny reset.", isLocked: false, t: "" },
  { id: 22, title: "Naprawa kranu 🔧", w: 5, p: "niski", done: false, duration: "30 min", deadline: "", difficulty: 3, desc: "Cieknie w kuchni.", isLocked: false, t: "" },
  { id: 23, title: "Obiad z rodziną 🍽️", w: 2, p: "niski", done: false, duration: "90 min", deadline: "", difficulty: 1, desc: "Wspólny czas.", isLocked: true, t: `🔒 13:00 (${day5PL})` },
  { id: 24, title: "Planowanie kolejnego sprintu 🏃‍♂️", w: 6, p: "sredni", done: false, duration: "60 min", deadline: `${day5YMD} o 16:00`, difficulty: 3, desc: "Zaległości z backlogu.", isLocked: false, t: "" },
  { id: 25, title: "Trening cardio 🏃", w: 4, p: "sredni", done: false, duration: "45 min", deadline: "", difficulty: 4, desc: "Poprawa kondycji.", isLocked: false, t: "" },

  // --- DZIEŃ 6 i DALSZE ORAZ BACKLOG (MIX PARAMETRÓW) ---
  { id: 26, title: "Zrobienie prania 🧺", w: 2, p: "niski", done: false, duration: "15 min", deadline: "", difficulty: 1, desc: "Szybki program na 30 stopni. Nie zapomnij o ciemnych kolorach.", isLocked: false, t: "" },
  { id: 27, title: "Raport kwartalny Q3 📈", w: 9, p: "wysoki", done: false, duration: "120 min", deadline: `${day3YMD} o 15:00`, difficulty: 5, desc: "Wymaga pełnego skupienia. Zebrać dane z Excela i spiąć w prezentację.", isLocked: false, t: "" },
  { id: 28, title: "Wieczorna medytacja 🌙", w: 2, p: "niski", done: false, duration: "20 min", deadline: "", difficulty: 1, desc: "Wyciszenie przed snem. Aplikacja Headspace.", isLocked: true, t: `🔒 21:30 (${todayPL}) 🔁 codziennie` },
  { id: 29, title: "Spotkanie 1:1 z szefem 🤝", w: 7, p: "wysoki", done: false, duration: "30 min", deadline: "", difficulty: 3, desc: "Rozmowa o podwyżce i celach na kolejny kwartał.", isLocked: true, t: `🔒 10:00 (${day2PL})` },
  { id: 30, title: "Przegląd subskrypcji i opłaty 💳", w: 4, p: "sredni", done: true, duration: "45 min", deadline: "", difficulty: 2, desc: "Anulować Netflixa, opłacić rachunek za prąd.", isLocked: false, t: "" },
  { id: 31, title: "Trening siłowy 🏋️‍♂️", w: 6, p: "sredni", done: false, duration: "60 min", deadline: "", difficulty: 4, desc: "Dzień nóg. Pamiętać o rozgrzewce!", isLocked: true, t: `🔒 18:00 (${todayPL}) 🔁 co tydzień` },
  { id: 32, title: "Aktualizacja CV 📄", w: 5, p: "sredni", done: false, duration: "90 min", deadline: `${day4YMD} o 23:59`, difficulty: 3, desc: "Dopisać nowy projekt i zaktualizować technologie.", isLocked: false, t: "" },
  { id: 33, title: "Telefon do babci 👵", w: 8, p: "wysoki", done: true, duration: "20 min", deadline: "", difficulty: 1, desc: "Zapytać o zdrowie i opowiedzieć o nowej pracy.", isLocked: false, t: "" },
  { id: 34, title: "Odpisywanie na zaległe maile 📩", w: 4, p: "niski", done: false, duration: "30 min", deadline: "", difficulty: 2, desc: "Cel: Skrzynka odbiorcza (Inbox) Zero.", isLocked: false, t: "" },
  { id: 35, title: "Głęboka praca nad kodem 👨‍💻", w: 10, p: "wysoki", done: false, duration: "180 min", deadline: "", difficulty: 5, desc: "Implementacja nowego algorytmu. Tylko muzyka lo-fi, brak rozpraszaczy.", isLocked: true, t: `🔒 10:30 (${day3PL})` },
  { id: 36, title: "Rozpisanie diety 🥗", w: 3, p: "sredni", done: false, duration: "40 min", deadline: "", difficulty: 2, desc: "Lista posiłków na najbliższe dni i zrobienie listy zakupów.", isLocked: false, t: "" },
  { id: 37, title: "Posprzątanie pulpitu 💻", w: 1, p: "niski", done: false, duration: "10 min", deadline: "", difficulty: 1, desc: "Usunięcie starych screenów do kosza.", isLocked: false, t: "" },
  { id: 38, title: "Wymiana żarówek w przedpokoju 💡", w: 2, p: "niski", done: false, duration: "15 min", deadline: "", difficulty: 1, desc: "Kupić ciepłe światło w markecie budowlanym.", isLocked: false, t: "" },
  { id: 39, title: "Obejrzenie wykładu z psychologii 🧠", w: 5, p: "sredni", done: false, duration: "90 min", deadline: `${day5YMD} o 12:00`, difficulty: 4, desc: "Zrobić dokładne notatki w Notion.", isLocked: false, t: "" },
  { id: 40, title: "Wyjście z psem do parku 🐕", w: 3, p: "wysoki", done: false, duration: "45 min", deadline: "", difficulty: 1, desc: "Zwierzak potrzebuje więcej ruchu na świeżym powietrzu.", isLocked: true, t: `🔒 16:30 (${todayPL})` },
  { id: 41, title: "Analiza błędów w aplikacji 🐛", w: 8, p: "wysoki", done: false, duration: "120 min", deadline: `${todayYMD} o 18:00`, difficulty: 5, desc: "Przejrzeć logi z Sentry i namierzyć wycieki pamięci.", isLocked: false, t: "" },
  { id: 42, title: "Wizyta w urzędzie 🏢", w: 7, p: "wysoki", done: false, duration: "90 min", deadline: "", difficulty: 3, desc: "Odbiór dokumentów. Pamiętać o dowodzie osobistym!", isLocked: true, t: `🔒 11:30 (${day4PL})` },
  { id: 43, title: "Przesadzenie Monstery 🪴", w: 2, p: "niski", done: false, duration: "40 min", deadline: "", difficulty: 2, desc: "Kupić nową ziemię i większą doniczkę ceramiczną.", isLocked: false, t: "" },
  { id: 44, title: "Burza mózgów - marketing 🎯", w: 6, p: "sredni", done: false, duration: "60 min", deadline: "", difficulty: 4, desc: "Wymyślenie 5 nowych kampanii reklamowych.", isLocked: false, t: "" },
  { id: 45, title: "Wieczorny spacer (Odcięcie) 🚶‍♀️", w: 2, p: "niski", done: false, duration: "30 min", deadline: "", difficulty: 1, desc: "Wyjście całkowicie bez telefonu i słuchawek.", isLocked: true, t: `🔒 20:30 (${day2PL})` },
  { id: 46, title: "Zaplanowanie wyjazdu na weekend 🗺️", w: 3, p: "niski", done: false, duration: "60 min", deadline: "", difficulty: 2, desc: "Zarezerwować nocleg, sprawdzić trasę i koszty.", isLocked: false, t: "" },
  { id: 47, title: "Szybki power nap 😴", w: 1, p: "niski", done: true, duration: "20 min", deadline: "", difficulty: 1, desc: "Regeneracja mózgu w środku ciężkiego dnia.", isLocked: false, t: "" },
  { id: 48, title: "Przejrzenie rachunków 🧾", w: 4, p: "sredni", done: false, duration: "25 min", deadline: `${day2YMD} o 10:00`, difficulty: 3, desc: "Wpisać wszystkie kwoty do domowego budżetu w Excelu.", isLocked: false, t: "" },
  { id: 49, title: "Składanie mebli z IKEA 🪑", w: 5, p: "sredni", done: false, duration: "120 min", deadline: "", difficulty: 4, desc: "Nowa komoda do sypialni. Oby nie zabrakło śrubek.", isLocked: false, t: "" },
  { id: 50, title: "Wdrożenie zmian na produkcję ⚠️", w: 9, p: "wysoki", done: false, duration: "45 min", deadline: "", difficulty: 5, desc: "Bardzo krytyczny proces, wymaga podwójnego sprawdzenia wszystkiego.", isLocked: true, t: `🔒 06:00 (${day5PL})` }
];



// --- GLOBAL HELPER ---
const checkIsDate = (textString, targetDate) => {
  if (!textString) return false;
  const txt = textString.toLowerCase();
  const d = targetDate || new Date();
  const selYear = d.getFullYear();
  const selMonth = d.getMonth() + 1;
  const selDay = d.getDate();
  const selDateOnly = new Date(selYear, d.getMonth(), selDay);

  const endMatch = txt.match(/🛑 do (\d{4})-(\d{1,2})-(\d{1,2})/);
  if (endMatch) {
    const endDate = new Date(parseInt(endMatch[1]), parseInt(endMatch[2]) - 1, parseInt(endMatch[3]));
    if (selDateOnly > endDate) return false;
  }

  const startMatch = textString.match(/\((\d{1,2})[\.\/ -](\d{1,2})[\.\/ -](\d{4})\)/);
  if (startMatch && (txt.includes("codziennie") || txt.includes("co tydzień") || txt.includes("w dni robocze"))) {
    const startDate = new Date(parseInt(startMatch[3]), parseInt(startMatch[2]) - 1, parseInt(startMatch[1]));
    if (selDateOnly < startDate) return false;
  }

  const dayOfWeek = d.getDay() === 0 ? 6 : d.getDay() - 1;
  const daysArr = ["pon", "wt", "śr", "czw", "pt", "sob", "ndz"];

  if (txt.includes("codziennie") || txt.includes("każdego dnia")) return true;
  if (txt.includes("w dni robocze") && dayOfWeek >= 0 && dayOfWeek <= 4) return true;
  if (txt.includes("co tydzień") || txt.includes("co tydzien")) {
    if (txt.includes(daysArr[dayOfWeek])) return true;
    if (dayOfWeek === 5 && txt.includes("sb")) return true;
  }

  const ymd = textString.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (ymd && parseInt(ymd[1]) === selYear && parseInt(ymd[2]) === selMonth && parseInt(ymd[3]) === selDay) return true;

  const dmy = textString.match(/(\d{1,2})[\.\/ -](\d{1,2})[\.\/ -](\d{4})/);
  if (dmy && parseInt(dmy[3]) === selYear && parseInt(dmy[2]) === selMonth && parseInt(dmy[1]) === selDay) return true;

  return false;
};
// ═══════════════════════════════════════════════════
//  STORAGE & TOASTS
// ═══════════════════════════════════════════════════
const ls = {
  get: (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { } }
};
function usePersist(key, init) {
  const [s, set] = useState(() => ls.get(key, init));
  const save = useCallback(v => set(p => { const n = typeof v === "function" ? v(p) : v; ls.set(key, n); return n; }), [key]);
  return [s, save];
}
function useToasts() {
  const [ts, setTs] = useState([]);
  const add = useCallback((msg, type = "ok") => {
    const id = Date.now() + Math.random();
    setTs(p => [...p, { id, msg, type }]);
    setTimeout(() => setTs(p => p.filter(t => t.id !== id)), 4000);
  }, []);
  const rm = useCallback(id => setTs(p => p.filter(t => t.id !== id)), []);
  return { ts, add, rm };
}

// ═══════════════════════════════════════════════════
//  UI ELEMENTS
// ═══════════════════════════════════════════════════
function Font() {
  useEffect(() => {
    const el = Object.assign(document.createElement("link"), {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,500;0,600;0,700;1,500&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap"
    });
    document.head.appendChild(el);
    return () => { try { document.head.removeChild(el); } catch { } };
  }, []);
  return null;
}
function Toasts({ ts, rm }) {
  return (
    <div className="fixed top-5 right-5 z-[9999] space-y-2 max-w-xs pointer-events-none">
      {ts.map(t => (
        <div key={t.id} className={`flex items-start gap-3 px-5 py-4 rounded-2xl shadow-2xl text-sm font-medium pointer-events-auto border ${t.type === "warn" ? "bg-red-600 text-white border-red-500" : "bg-[#1E5C36] text-white border-[#164a2c]"
          } transition-all duration-300 animate-in slide-in-from-right`}>
          <span className="flex-1 leading-relaxed">{t.msg}</span>
          <button onClick={() => rm(t.id)} className="opacity-60 hover:opacity-100 flex-shrink-0 mt-0.5"><X size={14} /></button>
        </div>
      ))}
    </div>
  );
}
function Sk({ cls = "" }) {
  return <div className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite] rounded-2xl ${cls}`} />;
}
function SkeletonScreen() {
  return (
    <div className="p-6 space-y-4 pt-14">
      <Sk cls="h-7 w-44" />
      <Sk cls="h-4 w-64" />
      <div className="space-y-3 mt-4">
        {[80, 72, 72, 72].map((h, i) => <Sk key={i} cls={`h-${h === 80 ? "20" : "16"} w-full`} />)}
      </div>
      <Sk cls="h-48 w-full mt-2" />
    </div>
  );
}
function PBadge({ p }) {
  const pr = PRIOS.find(x => x.id === p) || PRIOS[0];
  return <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${pr.tw}`}>{pr.label}</span>;
}

// ═══════════════════════════════════════════════════
//  LANDING PAGE
// ═══════════════════════════════════════════════════
function Landing({ onCTA }) {
  const fontInter = { fontFamily: "'Inter', sans-serif" };
  const fontDM = { fontFamily: "'DM Sans', sans-serif" };

  return (
    <div style={fontInter} className="min-h-screen bg-[#FCFCFD] text-[#151515] overflow-x-hidden">
      {/* Navbar */}
      <nav className="bg-[#FCFCFD] px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-12">
            <span className="text-[#03421C] font-bold text-2xl tracking-tight">Wellbeing app</span>
            <div className="hidden md:flex items-center gap-6">
              <a href="#" className="text-[#0E6630] font-bold text-lg">Home</a>
              <a href="#" className="text-[#5A5A5A] font-medium text-lg hover:text-[#0E6630]">Produkt</a>
              <a href="#" className="text-[#5A5A5A] font-medium text-lg hover:text-[#0E6630]">Wypalenie</a>
              <a href="#" className="text-[#5A5A5A] font-medium text-lg hover:text-[#0E6630]">O nas</a>
              <a href="#" className="text-[#5A5A5A] font-medium text-lg hover:text-[#0E6630]">Kontakt</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => onCTA("login")} className="px-5 py-2.5 bg-[#D0EBDA] text-[#0E6630] font-medium rounded-lg hover:bg-[#bce0ca] transition-colors">Zaloguj się</button>
            <button disabled className="px-5 py-2.5 bg-[#0E6630] text-white font-medium rounded-lg opacity-50 cursor-not-allowed line-through">Zarejestruj się</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 px-8 max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        <div className="max-w-xl">
          <h1 className="text-5xl font-bold text-[#151515] leading-[1.2] mb-8">
            Zdobądź kontrolę nad swoim dniem i zadbaj o swój dobrostan!
          </h1>
          <p className="text-[#151515] text-xl leading-relaxed mb-8">
            Oferujemy prosty sposób, aby wspierać pracowników w radzeniu sobie ze stresem i wypaleniem zawodowym, zwiększać ich zaangażowanie i tworzyć zdrowszą, bardziej efektywną kulturę pracy.
          </p>
          <button onClick={() => onCTA("login")} className="inline-flex items-center gap-2 px-6 py-3 bg-[#0E6630] text-white rounded-lg font-medium hover:bg-[#0b5025] transition-colors">
            Zrób pierwszy krok <ArrowRight size={20} />
          </button>
        </div>
        <div className="flex justify-center">
          <img src="/Frame 256.png" alt="Hero ilustracja" className="w-full max-w-md object-contain" />
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-8 bg-[#FFEDE6]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center mb-16">
            <span className="inline-block px-4 py-1.5 border border-[#F2733C] text-[#F2733C] rounded-full font-semibold mb-6">Nasz produkt</span>
            <h2 className="text-4xl font-bold text-center text-[#151515]">Największe korzyści</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Calendar size={28} className="text-[#F2733C]" />, title: "Indywidualny planer, który pomaga organizować dzień i unikać przeciążenia" },
              { icon: <AlertTriangle size={28} className="text-[#F2733C]" />, title: "Automatyczne sygnały, gdy Twój poziom stresu lub wypalenia rośnie" },
              { icon: <Bell size={28} className="text-[#F2733C]" />, title: "Personalizowane wskazówki, jak zadbać o swój dobrostan i energię" }
            ].map((f, i) => (
              <div key={i} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all">
                <div className="w-16 h-16 bg-[#FFEDE6] rounded-xl flex items-center justify-center mb-6">
                  {f.icon}
                </div>
                <p className="text-xl font-medium text-[#151515] leading-relaxed">{f.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-8 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1">
            <span className="inline-block px-4 py-1.5 border border-[#0E6630] text-[#0E6630] rounded-full font-semibold mb-6">Opinie</span>
            <h2 className="text-4xl font-bold text-[#151515] mb-8 leading-tight">Co mówią nasi użytkownicy</h2>
            <p className="text-lg text-[#151515] mb-8 leading-relaxed max-w-lg">
              "Tydzień korzystania z Wellbeing app i nareszcie czuję się zorganizowana"
            </p>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                <img src="/avatarLP.png" alt="Anna Kowalska" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-medium text-[#151515]">Anna Kowalska</p>
                <p className="text-sm text-[#5A5A5A]">Wykładowczyni na UW</p>
              </div>
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <img src="/comowiaonas.png" alt="Opinie użytkowników" className="w-full max-w-lg aspect-[4/3] object-cover rounded-3xl border border-[#E8DDD0]" />
          </div>
        </div>
      </section>

      {/* Wypalenie */}
      <section className="py-20 px-8 bg-[#E8F5EC]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 flex justify-center order-2 md:order-1">
            <img src="/kluczykwypalenie.png" alt="Problem wypalenia" className="w-full max-w-lg aspect-square object-contain rounded-3xl" />
          </div>
          <div className="flex-1 order-1 md:order-2">
            <span className="inline-block px-4 py-1.5 border border-[#0E6630] text-[#0E6630] rounded-full font-semibold mb-6">Wypalenie</span>
            <h2 className="text-4xl font-bold text-[#151515] mb-8 leading-tight">Problem, który chcemy rozwiązać</h2>
            <p className="text-[#151515] text-lg leading-relaxed mb-6">
              Wiele firm boryka się ze wzrostem wypalenia zawodowego wśród pracowników, co prowadzi do spadku efektywności, większej absencji i rotacji w zespole. Często brakuje narzędzi, które pozwalałyby w porę zauważyć przeciążenie i odpowiednio wspierać pracowników.
            </p>
            <p className="text-[#0E6630] font-semibold text-lg leading-relaxed">
              Nasza aplikacja pomaga w tym wyzwaniu, oferując indywidualne planery, raporty i system ostrzegania przed wypaleniem. Dzięki temu HR może proaktywnie wspierać dobrostan zespołu i budować zdrowszą, bardziej efektywną kulturę pracy.
            </p>
          </div>
        </div>
      </section>

      {/* Co oferujemy */}
      <section className="py-20 px-8 bg-[#E8F5EC]">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col items-center text-center mb-16">
            <span className="inline-block px-4 py-1.5 border border-[#0E6630] text-[#0E6630] rounded-full font-semibold mb-6">Co oferujemy</span>
            <h2 className="text-4xl font-bold text-[#151515] mb-6">Nasza aplikacja</h2>
            <p className="text-xl text-[#151515] max-w-3xl leading-relaxed">
              Jesteś pracownikiem, team leaderem czy menedżerem? Bez względu na rolę, nasza aplikacja wellbeing wspomoże Cię w efektywnym planowaniu dnia i zapobieganiu wypaleniu. Tylko 5-10 minut dziennie – spersonalizowana pod Ciebie, dla realnych rezultatów.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-6 relative z-10">
            {[
              { icon: <CheckCircle size={24} />, title: "Task planer", desc: "Układa zadania w harmonogram spersonalizowany pod Ciebie" },
              { icon: <Smile size={24} />, title: "Monitor nastroju", desc: "Krótka, codzienna skala 5-stopniowa, która zbiera to, jak się czujesz w pracy" },
              { icon: <AlertTriangle size={24} />, title: "System ostrzegania", desc: "Delikatny sygnał, gdy dane od dłuższego czasu wskazują możliwe symptomy wypalenia" },
              { icon: <Lock size={24} />, title: "Bezpieczne rekomendacje", desc: "Linki do rzetelnych źródeł i instytucji, jeśli uznasz, że potrzebujesz dodatkowego wsparcia" }
            ].map((c, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl text-center shadow-sm flex flex-col items-center">
                <div className="text-[#0E6630] mb-3">{c.icon}</div>
                <h3 className="font-bold text-[#151515] text-lg mb-2">{c.title}</h3>
                <p className="text-sm text-[#151515] leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nasza wizja */}
      <section className="py-24 px-8 bg-[#0E6630] text-center">
        <div className="max-w-4xl mx-auto">
          <span className="inline-block px-4 py-1.5 border border-white text-white rounded-full font-semibold mb-8">Nasza wizja</span>
          <p className="text-2xl md:text-3xl font-bold text-white leading-relaxed">
            Jeśli codziennie zmagasz się z natłokiem zadań, pomożemy Ci je zorganizować i wychwycić wczesne symptomy wypalenia. Aplikacja dostosowuje się do Ciebie na podstawie wywiadu i danych o nastroju, oferując spersonalizowany planer oraz monitorowanie. Dostarczamy rekomendacje do sprawdzonych źródeł pomocy – rządowych instytucji czy specjalistów – bo zależy nam na Twoim dobrostanie.
          </p>
        </div>
      </section>

      {/* Rozwiązanie problemu */}
      <section className="py-20 px-8 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-16">
          <div className="flex-1">
            <span className="inline-block px-4 py-1.5 border border-[#2F7377] text-[#2F7377] rounded-full font-semibold mb-6">Rozwiązanie problemu</span>
            <h2 className="text-4xl font-bold text-[#151515] leading-tight">Zaprojektowaliśmy aplikację Dla Ciebie</h2>
          </div>
          <div className="flex-1 flex flex-col gap-6">
            {[
              "Wpisujesz zadania z priorytetami, a AI tworzy zoptymalizowany harmonogram dopasowany do Twojego aktualnego samopoczucia – dostępne na mobile i desktop.",
              "Codziennie oceniasz nastrój w prostej skali, aplikacja analizuje emocje i czas pracy, sygnalizując ryzyka z indywidualnymi wskazówkami.",
              "To Twój osobisty asystent równowagi – wypróbuj i przekonaj się o zmianie."
            ].map((text, i) => (
              <div key={i} className="bg-[#E4F6F8] p-6 rounded-xl text-[#000000] text-lg leading-relaxed shadow-sm">
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Kontakt */}
      <section className="py-20 px-8 bg-[#F5EFE6] relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-[#E8B94F] opacity-40" style={{ clipPath: 'polygon(0 40%, 100% 0%, 100% 100%, 0% 100%)' }} />
        </div>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-16 relative z-10">
          <div className="flex-1">
            <span className="inline-block px-4 py-1.5 border border-[#0E6630] text-[#0E6630] rounded-full font-semibold mb-6">Kontakt</span>
            <h2 style={fontDM} className="text-5xl font-bold text-[#0D0D0D] tracking-tight mb-6">Skontaktuj się z nami</h2>
            <p className="text-[#151515] text-lg leading-relaxed max-w-md">
              Masz pytania? Napisz do nas – pokażemy demo, porozmawiamy o możliwym wdrożeniu i przedstawimy, jak realnie może to zwiększyć efektywność pracy zespołu. Skontaktuj się z nami, a wspólnie dopasujemy najlepsze podejście dla Twojej organizacji.
            </p>
          </div>
          <div className="flex-1">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
              <div className="space-y-6">
                <div>
                  <label className="block text-[#151515] font-medium mb-2">Imię</label>
                  <input type="text" placeholder="Twoje imię" className="w-full px-4 py-3 border border-[#D6D6D6] rounded-lg focus:outline-none focus:border-[#0E6630]" />
                </div>
                <div>
                  <label className="block text-[#151515] font-medium mb-2">Email</label>
                  <input type="email" placeholder="Wpisz e-mail" className="w-full px-4 py-3 border border-[#D6D6D6] rounded-lg focus:outline-none focus:border-[#0E6630]" />
                </div>
                <div>
                  <label className="block text-[#151515] font-medium mb-2">Twoja wiadomość</label>
                  <textarea placeholder="Napisz..." rows={4} className="w-full px-4 py-3 border border-[#D6D6D6] rounded-lg focus:outline-none focus:border-[#0E6630] resize-none" />
                </div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" className="mt-1 w-5 h-5 border-[#DFDBDB] rounded accent-[#0E6630]" />
                  <span className="text-[#151515] text-sm mt-0.5">Akceptuję <a href="#" className="underline">regulamin</a></span>
                </label>
                <button className="flex items-center gap-2 px-6 py-3 bg-[#0E6630] text-white font-medium rounded-lg hover:bg-[#0b5025] transition-colors">
                  Wyślij <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 px-8 border-t border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-12">
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24 w-full">
            <span className="text-[#03421C] font-bold text-2xl tracking-tight">Wellbeing app</span>
            <div className="flex flex-wrap justify-center gap-8">
              <a href="#" className="text-[#5A5A5A] font-medium hover:text-[#0E6630]">Home</a>
              <a href="#" className="text-[#5A5A5A] font-medium hover:text-[#0E6630]">Produkt</a>
              <a href="#" className="text-[#5A5A5A] font-medium hover:text-[#0E6630]">Wypalenie</a>
              <a href="#" className="text-[#5A5A5A] font-medium hover:text-[#0E6630]">O nas</a>
              <a href="#" className="text-[#5A5A5A] font-medium hover:text-[#0E6630]">Kontakt</a>
            </div>
          </div>
          <div className="w-full h-px bg-[#F6F6F6]" />
          <div className="w-full flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[#000000] text-sm">© 2026 Wellbeing app. Wszelkie prawa zastrzeżone.</p>
            <div className="flex gap-6 text-sm text-[#000000]">
              <a href="#" className="underline hover:text-[#0E6630]">Polityka prywatności</a>
              <a href="#" className="underline hover:text-[#0E6630]">Regulamin</a>
              <a href="#" className="hover:text-[#0E6630]">Ustawienia cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  AUTH VIEW & ONBOARDING
// ═══════════════════════════════════════════════════
function AuthView({ mode, onAuth, onSwitch, onBack }) {
  const [loginInput, setLoginInput] = useState("");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const S = { fontFamily: "'DM Sans',sans-serif" };
  const H = { fontFamily: "'Lora',serif" };

  // Hardcoded accounts for closed MVP
  const ACCOUNTS = {
    "Michał Jeska": "UP4444",
    "Aleksander Igłowski": "UP7777",
    "Marcin Klinowski": "UP5432",
    "Agnieszka Wojtasiak-Terech": "UP7890",
    "testuser": "testuser",
    "Kamila Łuczak": "UP2345",
  };

  const submit = () => {
    setErr("");
    if (!loginInput || !pw) { setErr("Uzupełnij login i hasło."); return; }
    const expectedPw = ACCOUNTS[loginInput];
    if (expectedPw && expectedPw === pw) {
      onAuth({ name: loginInput, email: loginInput });
    } else {
      setErr("Błędny login lub hasło. Brak dostępu.");
    }
  };
  return (
    <div style={S} className="min-h-screen bg-[#F5EFE6] flex flex-col">
      <nav className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-[#E8DDD0] px-6 py-4 flex items-center justify-between">
        <button onClick={onBack}><span style={H} className="text-[#1E5C36] font-bold text-xl">Wellbeing app</span></button>
        <div className="flex gap-2">
          <button onClick={() => onSwitch("login")} className="px-5 py-2 text-sm font-semibold rounded-full border-2 transition-all bg-[#1E5C36] text-white border-[#1E5C36]">Zaloguj się</button>
          <button disabled className="px-5 py-2 text-sm font-semibold rounded-full border-2 bg-gray-400 text-gray-500 border-gray-400 cursor-not-allowed opacity-50 line-through">Zarejestruj się</button>
        </div>
      </nav>
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative overflow-hidden">
        <div className="relative z-10 bg-white rounded-3xl shadow-2xl shadow-green-900/10 p-8 w-full max-w-sm border border-[#E8DDD0]">
          <h2 style={H} className="text-2xl font-bold text-[#1A2F22] text-center mb-1">
            Zaloguj się
          </h2>
          <p className="text-center text-[#5A7368] text-sm mb-6">
            Cześć, dobrze Cię widzieć!
          </p>
          {err && <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-600">{err}</div>}
          <div className="space-y-3">
            <input value={loginInput} onChange={e => setLoginInput(e.target.value)} placeholder="Wprowadź swój login" type="text" className="w-full px-4 py-3 rounded-2xl border border-[#E8DDD0] text-sm focus:outline-none focus:border-[#2D9E6B] transition-all" />
            <div className="relative">
              <input value={pw} onChange={e => setPw(e.target.value)} placeholder="Wprowadź hasło" type={show ? "text" : "password"} className="w-full px-4 py-3 pr-10 rounded-2xl border border-[#E8DDD0] text-sm focus:outline-none focus:border-[#2D9E6B] transition-all" onKeyDown={e => { if (e.key === 'Enter') submit(); }} />
              <button onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9FB5AD] hover:text-[#5A7368]">{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
            </div>
            <button onClick={submit} className="w-full py-3.5 bg-[#1E5C36] text-white rounded-2xl font-semibold text-sm hover:bg-[#164a2c] transition-all shadow-lg mt-1">
              Zaloguj się
            </button>
            <p className="text-center text-sm text-gray-400 mt-4 line-through opacity-60">
              Funkcja rejestracji została zablokowana
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [hours, setHours] = useState(8);

  const [startHour, setStartHour] = useState("08");
  const [startMinute, setStartMinute] = useState("00");

  const [picks, setPicks] = useState([]);
  const S = { fontFamily: "'DM Sans',sans-serif" };
  const H = { fontFamily: "'Lora',serif" };
  const OPTS = ["Wyjście na słońce", "Kilka minut przerwy", "Dobra kawa", "Krótki spacer", "Rozmowa z bliskim", "Mała przekąska", "Przerwa od pracy", "Muzyka", "Zmiana otoczenia"];

  const toggle = b => setPicks(p => p.includes(b) ? p.filter(x => x !== b) : [...p, b]);

  const handleHourChange = (delta) => {
    let newH = parseInt(startHour, 10) + delta;
    if (isNaN(newH)) newH = 8 + delta;
    if (newH < 0) newH = 23;
    if (newH > 23) newH = 0;
    setStartHour(String(newH).padStart(2, "0"));
  };

  const handleMinuteChange = (delta) => {
    let newM = parseInt(startMinute, 10) + delta;
    if (isNaN(newM)) newM = delta;
    if (newM < 0) newM = 59;
    if (newM > 59) newM = 0;
    setStartMinute(String(newM).padStart(2, "0"));
  };

  const handleHourInputBlur = () => {
    let val = parseInt(startHour, 10);
    if (isNaN(val)) val = 8;
    if (val < 0) val = 0;
    if (val > 23) val = 23;
    setStartHour(String(val).padStart(2, "0"));
  };

  const handleMinuteInputBlur = () => {
    let val = parseInt(startMinute, 10);
    if (isNaN(val)) val = 0;
    if (val < 0) val = 0;
    if (val > 59) val = 59;
    setStartMinute(String(val).padStart(2, "0"));
  };

  return (
    <div style={S} className="min-h-screen bg-[#F5EFE6] flex flex-col">
      <nav className="bg-white/85 backdrop-blur-xl border-b border-[#E8DDD0] px-6 py-4"><span style={H} className="text-[#1E5C36] font-bold text-xl">Wellbeing app</span></nav>
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative overflow-hidden">
        <div className="relative z-10 bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg border border-[#E8DDD0]">
          <div className="flex justify-center gap-2 mb-7">
            {[0, 1, 2].map(i => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-400 ${i <= step ? "w-10 bg-[#1E5C36]" : "w-5 bg-[#E8DDD0]"}`} />
            ))}
          </div>
          {step === 0 && <>
            <h2 style={H} className="text-2xl font-bold text-center text-[#1A2F22] mb-2">Pytanie 1 z 3</h2>
            <p className="text-center text-[#5A7368] mb-8 text-sm">Ile godzin dziennie spędzasz w pracy?</p>
            <div className="flex items-center justify-center gap-6">
              <button onClick={() => setHours(h => Math.max(1, h - 1))} className="w-12 h-12 rounded-2xl border-2 border-[#E8DDD0] flex items-center justify-center text-xl font-bold text-[#5A7368] transition-all">−</button>
              <span className="text-6xl font-bold text-[#1A2F22] w-20 text-center">{hours}</span>
              <button onClick={() => setHours(h => Math.min(24, h + 1))} className="w-12 h-12 rounded-2xl border-2 border-[#E8DDD0] flex items-center justify-center text-xl font-bold text-[#5A7368] transition-all">+</button>
            </div>
          </>}
          {step === 1 && <>
            <h2 style={H} className="text-2xl font-bold text-center text-[#1A2F22] mb-2">Pytanie 2 z 3</h2>
            <p className="text-center text-[#5A7368] mb-4 text-sm">Od której godziny chcesz rozpoczynać swoje zadania?</p>

            <div className="flex items-center justify-center gap-4 my-6">
              <div className="flex flex-col items-center">
                <button onClick={() => handleHourChange(1)} className="p-2 text-[#5A7368] hover:text-[#1E5C36] transition-colors hover:-translate-y-1"><ChevronUp size={36} strokeWidth={2.5} /></button>
                <input
                  type="text"
                  value={startHour}
                  onChange={e => setStartHour(e.target.value.replace(/\D/g, ''))}
                  onBlur={handleHourInputBlur}
                  className="w-24 text-center text-6xl font-bold text-[#1A2F22] bg-transparent outline-none focus:text-[#2D9E6B] transition-colors"
                  maxLength={2}
                />
                <button onClick={() => handleHourChange(-1)} className="p-2 text-[#5A7368] hover:text-[#1E5C36] transition-colors hover:translate-y-1"><ChevronDown size={36} strokeWidth={2.5} /></button>
              </div>
              <div className="text-5xl font-bold text-[#1A2F22] pb-2">:</div>
              <div className="flex flex-col items-center">
                <button onClick={() => handleMinuteChange(1)} className="p-2 text-[#5A7368] hover:text-[#1E5C36] transition-colors hover:-translate-y-1"><ChevronUp size={36} strokeWidth={2.5} /></button>
                <input
                  type="text"
                  value={startMinute}
                  onChange={e => setStartMinute(e.target.value.replace(/\D/g, ''))}
                  onBlur={handleMinuteInputBlur}
                  className="w-24 text-center text-6xl font-bold text-[#1A2F22] bg-transparent outline-none focus:text-[#2D9E6B] transition-colors"
                  maxLength={2}
                />
                <button onClick={() => handleMinuteChange(-1)} className="p-2 text-[#5A7368] hover:text-[#1E5C36] transition-colors hover:translate-y-1"><ChevronDown size={36} strokeWidth={2.5} /></button>
              </div>
            </div>
            <p className="text-center text-[11px] font-bold text-[#9FB5AD] uppercase tracking-widest mt-2">Możesz też wpisać godzinę z klawiatury</p>
          </>}
          {step === 2 && <>
            <h2 style={H} className="text-2xl font-bold text-center text-[#1A2F22] mb-1">Pytanie 3 z 3</h2>
            <p className="text-center text-[#5A7368] text-sm mb-1">Co najszybciej poprawia Ci nastrój kiedy masz kryzys w ciągu dnia?</p>
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1 mt-4">
              {OPTS.map(b => (
                <label key={b} className={`flex items-start gap-2 p-3 rounded-2xl cursor-pointer transition-all text-xs leading-relaxed ${picks.includes(b) ? "bg-[#E8F4ED] border-2 border-[#2D9E6B] text-[#1E5C36]" : "bg-[#F5EFE6] border-2 border-transparent text-[#1A2F22] hover:border-[#E8DDD0]"}`}>
                  <input type="checkbox" checked={picks.includes(b)} onChange={() => toggle(b)} className="mt-0.5 rounded accent-[#1E5C36] flex-shrink-0" />
                  <span>{b}</span>
                </label>
              ))}
            </div>
          </>}
          <button onClick={() => { if (step < 2) setStep(s => s + 1); else onComplete({ hours, startTime: `${startHour}:${startMinute}`, picks }); }} className="w-full py-3.5 mt-6 bg-[#1E5C36] text-white rounded-2xl font-semibold hover:bg-[#164a2c] transition-all shadow-lg">
            Kontynuuj
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  APP: SIDEBAR / LAYOUT
// ═══════════════════════════════════════════════════
function Sidebar({ active, onNav, user, onLogout, collapsed, setCollapsed, selectedDate, setSelectedDate, todayDate, activeAlert, onDismissAlert }) {
  const H = { fontFamily: "'Lora', serif" };

  // Logika generowania dni w mini-kalendarzu
  const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);

  // Obliczamy przesunięcie dla pierwszego dnia miesiąca (0 = Pon, 6 = Ndz)
  const firstDayIndex = (startOfMonth.getDay() + 6) % 7;
  // Tworzymy tablicę z pustymi elementami do wypełnienia luk w siatce
  const emptyDays = Array.from({ length: firstDayIndex }, (_, i) => i);

  const daysInMonth = [];
  for (let i = 1; i <= endOfMonth.getDate(); i++) {
    daysInMonth.push(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i));
  }

  const changeMonth = (offset) => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + offset, 1));
  };

  const navItems = [
    { id: "dashboard", icon: <Home size={16} />, label: "Strona główna" },
    { id: "calendar", icon: <Calendar size={16} />, label: "Kalendarz" },
    { id: "mood", icon: <Smile size={16} />, label: "Monitor nastroju" },
    { id: "warning", icon: <AlertTriangle size={16} />, label: "System ostrzegania" },
  ];

  return (
    <aside className={`${collapsed ? "w-20" : "w-56"} flex-shrink-0 bg-white border-r border-[#E8DDD0] flex flex-col transition-all duration-300 h-screen sticky top-0 z-50`}>
      <div className={`px-5 py-5 border-b border-[#E8DDD0] flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
        {!collapsed && <span style={H} className="text-[#1E5C36] font-bold text-lg tracking-tight">Wellbeing app</span>}
        <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 hover:bg-[#F5EFE6] rounded-xl text-[#5A7368] transition-all">
          <Menu size={18} />
        </button>
      </div>

      <nav className="px-3 py-3 space-y-1">
        {navItems.map(n => {
          const isWarning = n.id === "warning";
          const hasAlert = isWarning && activeAlert !== null;

          return (
            <div key={n.id} className="relative flex flex-col items-end">
              {hasAlert && !collapsed && (
                <div className="text-right mb-0.5 pr-2 w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <span className="text-[8px] font-bold text-[#A51A1A] tracking-[0.15em] uppercase">AKCJA WYMAGANA</span>
                </div>
              )}

              <button onClick={() => { if (hasAlert) onDismissAlert(); onNav(n.id); }} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-[13px] font-bold transition-all relative overflow-hidden ${active === n.id ? (hasAlert ? "bg-[#1e3a2b] text-white shadow-md" : "bg-[#1E5C36] text-white shadow-lg shadow-green-900/20") : (hasAlert ? "bg-[#1e3a2b] text-white shadow-md hover:bg-[#162c20]" : "text-[#5A7368] hover:bg-[#F5EFE6]")}`}>

                {hasAlert && (
                  <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#D32F2F]"></div>
                )}

                <span className={`flex-shrink-0 ${hasAlert ? "animate-ring text-white" : ""}`}>
                  {n.icon}
                </span>
                {!collapsed && <span>{n.label}</span>}
              </button>

              {hasAlert && !collapsed && (
                <div className="absolute top-full left-0 right-0 mt-2 z-[100] animate-in fade-in zoom-in-95 duration-300">
                  <div className="bg-[#fceeb5] p-4 rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.2)] mx-1 relative border border-[#E8DDD0]">
                    <button onClick={(e) => { e.stopPropagation(); onDismissAlert(); }} className="absolute top-2 right-2 text-[#1A432E] opacity-50 hover:opacity-100 transition-opacity p-1 bg-[#fceeb5] rounded-full hover:bg-yellow-200" title="Zamknij ostrzeżenie">
                      <X size={14} />
                    </button>
                    <h2 style={H} className="text-base font-bold text-[#1A432E] leading-tight mb-2 pr-6">Zauważyliśmy coś ważnego</h2>
                    <p className="text-[#1A432E] text-[11px] leading-relaxed mb-4">
                      {activeAlert.text}
                    </p>
                    <button onClick={() => { onDismissAlert(); onNav("warning"); }} className="text-[#1A432E] font-bold text-[11px] underline decoration-2 underline-offset-4 hover:opacity-80 transition-opacity text-left">
                      {activeAlert.btnText}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="flex-1" />

      {/* MINI KALENDARZ W LEWYM DOLNYM ROGU */}
      {!collapsed && (
        <div className="px-3 py-5 border-t border-[#E8DDD0] bg-[#FAFAFA]">
          <div className="flex items-center justify-center gap-2 mb-4">
            <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-[#E8DDD0] rounded-md transition-colors"><ChevronLeft size={12} className="text-[#1A2F22]" /></button>
            <span className="text-[9px] font-black uppercase tracking-widest text-[#1A2F22]">
              {selectedDate.toLocaleString('pl-PL', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={() => changeMonth(1)} className="p-1 hover:bg-[#E8DDD0] rounded-md transition-colors"><ChevronRight size={12} className="text-[#1A2F22]" /></button>
          </div>
          <div className="grid grid-cols-7 gap-0.5 text-center text-[8px] font-black text-[#9FB5AD] mb-2 uppercase tracking-tighter">
            {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'].map((d, i) => (
              <div key={i} className="whitespace-nowrap">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {/* Najpierw mapujemy puste divy, aby przesunąć pierwszy dzień pod właściwą literę */}
            {emptyDays.map((_, idx) => (
              <div key={`empty-${idx}`} className="aspect-square"></div>
            ))}

            {/* Następnie mapujemy właściwe dni */}
            {daysInMonth.map((date, idx) => {
              const isToday = date.toDateString() === todayDate.toDateString();
              const isSelected = date.toDateString() === selectedDate.toDateString();
              return (
                <button
                  key={`day-${idx}`}
                  onClick={() => { setSelectedDate(date); onNav("calendar"); }}
                  className={`aspect-square flex items-center justify-center rounded-md text-[11px] font-bold transition-all ${isSelected ? "bg-[#1E5C36] text-white" : isToday ? "text-[#1E5C36] border border-[#1E5C36]" : "text-[#5A7368] hover:bg-[#E8DDD0]"}`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Profil użytkownika przeniesiony do prawego górnego rogu aplikacji */}
    </aside>
  );
}
// ═══════════════════════════════════════════════════
//  FOCUS MODE & TASK CARD
// ═══════════════════════════════════════════════════
function FocusModeView({ task, onClose, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const H = { fontFamily: "'Lora',serif" };

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => { setIsActive(false); setTimeLeft(25 * 60); };

  const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const secs = (timeLeft % 60).toString().padStart(2, '0');

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#1A2F22] text-white p-6 animate-fade-in-up">
      <button onClick={onClose} className="absolute top-8 left-8 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all flex items-center gap-2">
        <X size={18} /> Zakończ skupienie
      </button>
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2D9E6B]/20 text-[#2D9E6B] font-bold text-xs uppercase tracking-widest mb-8 border border-[#2D9E6B]/30">
          <Target size={14} /> Tryb Głębokiej Pracy
        </div>
        <h1 style={H} className="text-3xl font-bold mb-4">{task.title}</h1>
        {task.desc && <p className="text-[#9FB5AD] text-sm mb-12 max-w-sm mx-auto">{task.desc}</p>}
        <div className="relative flex items-center justify-center mb-12">
          <div className={`absolute w-64 h-64 rounded-full border-[6px] transition-all duration-1000 ${isActive ? 'border-[#2D9E6B] scale-105 opacity-100 animate-pulse' : 'border-white/10 scale-100 opacity-50'}`} />
          <div className="text-7xl font-mono font-light tracking-tighter">{mins}:{secs}</div>
        </div>
        <div className="flex items-center justify-center gap-6">
          <button onClick={resetTimer} className="p-4 rounded-full bg-white/5 hover:bg-white/10 text-[#9FB5AD] hover:text-white transition-all"><RotateCcw size={24} /></button>
          <button onClick={toggleTimer} className={`p-6 rounded-full flex items-center justify-center transition-all transform hover:scale-105 shadow-xl ${isActive ? 'bg-amber-500 hover:bg-amber-400 text-white' : 'bg-[#2D9E6B] hover:bg-emerald-400 text-white'}`}>
            {isActive ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
          </button>
          <button onClick={() => { onComplete(task.id); onClose(); }} className="p-4 rounded-full bg-white/5 hover:bg-white/10 text-[#9FB5AD] hover:text-[#2D9E6B] transition-all"><Check size={24} /></button>
        </div>
      </div>
    </div>
  );
}

function TaskCard({ task, onToggle, onFocus, onDelete, onEdit }) {
  const pr = PRIOS.find(x => x.id === task.p) || PRIOS[0];

  return (
    <div className={`bg-white rounded-2xl border border-[#E8DDD0] p-4 transition-all duration-200 hover:shadow-md hover:border-[#D4C9BC] group ${task.done ? "opacity-55" : ""}`}>
      <div className="flex items-start gap-3">
        <button onClick={() => onToggle(task.id)} className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-150 ${task.done ? "bg-[#1E5C36] border-[#1E5C36]" : "border-[#C4BBAF] hover:border-[#1E5C36] group-hover:border-[#2D9E6B]"}`}>
          {task.done && <Check size={11} className="text-white" />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`text-sm font-semibold text-[#1A2F22] leading-snug ${task.done ? "line-through opacity-60" : ""}`}>{task.title}</p>
          </div>
          {task.t && <p className="text-[10px] text-[#9FB5AD] mt-0.5 font-medium">{task.t}</p>}
          {task.desc && <p className="text-xs text-[#5A7368] mt-1 leading-relaxed">{task.desc}</p>}
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <span className="flex items-center gap-1 text-[10px] font-bold text-[#5A7368] bg-[#F5EFE6] px-2 py-1 rounded-lg border border-[#E8DDD0]">
              <Clock size={12} /> {task.duration || "Brak"}
            </span>
            {task.deadline && (
              <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg border border-red-100">
                Deadline: {task.deadline}
              </span>
            )}
            <span className="text-[10px] font-bold text-[#1E5C36] bg-[#E8F4ED] px-2 py-1 rounded-lg border border-[#2D9E6B]/20">
              Trudność: {task.difficulty || 1}/5
            </span>
            <PBadge p={task.p} />
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
          {!task.done && (
            <button onClick={() => onFocus(task)} title="Rozpocznij Głębokie Skupienie" className="w-8 h-8 rounded-full bg-[#E8F4ED] text-[#1E5C36] hover:bg-[#1E5C36] hover:text-white flex items-center justify-center shadow-sm">
              <Play size={14} className="ml-0.5" />
            </button>
          )}
          {/* NOWY PRZYCISK EDYCJI */}
          <button onClick={() => onEdit(task)} title="Edytuj zadanie" className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white flex items-center justify-center shadow-sm">
            <Pencil size={14} />
          </button>
          <button onClick={() => onDelete(task.id)} title="Usuń zadanie" className="w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center shadow-sm">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  MODALS & JOURNAL
// ═══════════════════════════════════════════════════
function TaskModal({ onClose, onSave, taskToEdit }) {
  const [title, setTitle] = useState(taskToEdit?.title || "");
  const [showTutorial, setShowTutorial] = useState(true);

  const [duration, setDuration] = useState(taskToEdit?.duration ? taskToEdit.duration.replace(" min", "") : "60");
  const [deadline, setDeadline] = useState(taskToEdit?.deadline ? taskToEdit.deadline.replace(" o ", "T") : "");
  const [difficulty, setDifficulty] = useState(taskToEdit?.difficulty || 3);
  const [p, setP] = useState(taskToEdit?.p || "niski");
  const [desc, setDesc] = useState(taskToEdit?.desc || "");

  const [isLocked, setIsLocked] = useState(taskToEdit?.isLocked || false);
  const [showLockPanel, setShowLockPanel] = useState(false);
  const [lockDateTime, setLockDateTime] = useState(taskToEdit?.lockDateTime || "");
  const [recurrence, setRecurrence] = useState(taskToEdit?.recurrence || "jednorazowo");
  const [recurrenceEnd, setRecurrenceEnd] = useState(taskToEdit?.recurrenceEnd || "");

  const submit = () => {
    if (!title) return;

    const weight = Math.min(10, Math.round((difficulty * 1.5) + (parseInt(duration || 0) / 60)));

    let timeString = "";
    if (isLocked && lockDateTime) {
      const d = new Date(lockDateTime);
      const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateStr = d.toLocaleDateString();
      timeString = `🔒 ${timeStr} (${dateStr})`;

      if (recurrence !== "jednorazowo") {
        if (recurrence === "co tydzień") {
          const dayOfWeek = d.getDay() === 0 ? 6 : d.getDay() - 1;
          const daysArr = ["pon", "wt", "śr", "czw", "pt", "sob", "ndz"];
          timeString += ` 🔁 co tydzień ${daysArr[dayOfWeek]}`;
        } else {
          timeString += ` 🔁 ${recurrence}`;
        }

        if (recurrenceEnd) {
          timeString += ` 🛑 do ${recurrenceEnd}`;
        }
      }
    }

    onSave({
      id: taskToEdit?.id,
      title,
      p,
      cat: "praca",
      w: weight,
      t: timeString,
      duration: duration ? `${duration} min` : "",
      deadline: deadline ? deadline.replace("T", " o ") : "",
      difficulty,
      desc,
      isLocked,
      lockDateTime, recurrence, recurrenceEnd
    });
  };

  return (
    <div className="fixed inset-0 z-[700] flex items-center justify-center bg-[#1A2F22]/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-[3rem] shadow-2xl p-10 w-full max-w-lg max-h-[90vh] overflow-y-auto border border-white/20" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-3xl font-bold text-[#1A2F22]">{taskToEdit ? "Edytuj zadanie" : "Nowe zadanie"}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-all"><X size={28} className="text-[#1A2F22]" /></button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-xs font-black uppercase text-[#5A7368] mb-2 block tracking-widest">Co masz do zrobienia?</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Wpisz nazwę zadania..." className="w-full px-6 py-4 rounded-2xl border-2 border-[#E8DDD0] outline-none focus:border-[#2D9E6B] transition-all text-lg font-medium" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-black uppercase text-[#5A7368] mb-2 block">Szacowany czas</label>
              <div className="relative">
                <input type="number" value={duration} onChange={e => setDuration(e.target.value)} placeholder="Np. 45" className="w-full px-4 py-3 rounded-xl border-2 border-[#E8DDD0] text-sm pr-12 outline-none focus:border-[#2D9E6B]" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#9FB5AD]">MIN</span>
              </div>
            </div>
            <div>
              <label className={`text-xs font-black uppercase mb-2 block tracking-widest transition-all ${isLocked ? 'text-gray-400 line-through' : 'text-red-500'}`}>Deadline</label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                disabled={isLocked}
                className={`w-full px-4 py-3 rounded-xl border-2 text-sm outline-none transition-all ${isLocked ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed line-through opacity-70' : 'border-red-100 focus:border-red-400 bg-white'}`}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-black uppercase text-[#5A7368] mb-2 block flex justify-between">
              Wysiłek umysłowy <span>{difficulty} / 5</span>
            </label>
            <input type="range" min="1" max="5" value={difficulty} onChange={e => setDifficulty(parseInt(e.target.value))} className="w-full h-2 bg-[#E8DDD0] rounded-lg appearance-none cursor-pointer accent-[#1E5C36]" />
            <div className="flex justify-between text-[9px] font-black text-[#9FB5AD] mt-2 px-1">
              <span>NISKI</span>
              <span>BARDZO WYSOKI</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-black uppercase text-[#5A7368] mb-3 block tracking-widest">Ważność</label>
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
                    className={`flex-1 px-1 py-2 rounded-xl text-[9px] sm:text-[10px] font-black uppercase transition-all border-2 whitespace-nowrap overflow-hidden text-ellipsis ${isActive ? activeClass : "border-transparent bg-slate-50 text-slate-400 hover:border-[#E8DDD0]"}`}
                  >
                    {pr.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-end justify-between gap-4 mt-10 relative">

          {/* NOWY KONTENER NA KŁÓDKĘ I DYMEK TUTORIALOWY */}
          <div className="flex items-center gap-3">
            <div className="relative">
              {/* 1. PRZYCISK KŁÓDKI */}
              <button
                onClick={() => setShowLockPanel(!showLockPanel)}
                className={`flex items-center gap-2 px-4 py-4 rounded-2xl font-bold transition-all text-sm border-2 relative z-10 ${isLocked ? 'bg-[#E8F4ED] text-[#1E5C36] border-[#1E5C36] shadow-md' : 'bg-white text-[#9FB5AD] border-[#E8DDD0] hover:border-[#9FB5AD]'}`}
              >
                <span className="text-xl leading-none">{isLocked ? "🔒" : "🔓"}</span>
              </button>

              {/* 2. DYMEK KOMIKSOWY - Pojawia się NAD kłódką, aby okno go nie ucinało */}
              {showTutorial && (
                <div className="absolute bottom-full left-0 mb-4 w-72 p-5 bg-[#1A2F22] text-white rounded-[2rem] shadow-2xl z-[9999] animate-in fade-in slide-in-from-bottom-4 duration-300">
                  {/* Przycisk X do zamknięcia dymka */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowTutorial(false); }}
                    className="absolute top-3 right-4 p-1 hover:bg-white/10 rounded-full transition-all cursor-pointer"
                  >
                    <X size={14} className="text-[#2D9E6B]" />
                  </button>

                  <div className="pr-4">
                    <p className="text-[11px] leading-relaxed mb-2">
                      <strong className="text-[#2D9E6B] block mb-0.5">Deadline:</strong>
                      To informacja, do kiedy musisz skończyć. Aplikacja sama ułoży plan.
                    </p>
                    <p className="text-[11px] leading-relaxed">
                      <strong className="text-amber-400 block mb-0.5">Kłódka (Blokada):</strong>
                      Sztywno rezerwuje godziny. Nic innego się w ten czas nie wciśnie.
                    </p>
                  </div>

                  {/* Trójkątny ogon dymka skierowany w DÓŁ, prosto na kłódkę */}
                  <div className="absolute top-full left-6 w-0 h-0 border-x-[10px] border-x-transparent border-t-[12px] border-t-[#1A2F22]"></div>
                </div>
              )}

              {/* 3. ORYGINALNY PANEL USTAWIANIA CZASU */}
              {showLockPanel && (
                <div className="absolute bottom-[115%] left-0 w-72 bg-white rounded-3xl shadow-2xl border border-[#E8DDD0] p-6 z-50 animate-in slide-in-from-bottom-2">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-bold text-[#1A2F22]">Zablokuj w kalendarzu</h4>
                    <button onClick={() => setShowLockPanel(false)}><X size={16} className="text-[#9FB5AD] hover:text-red-500" /></button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black uppercase text-[#5A7368] mb-1 block">Dokładna data i godzina</label>
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
                      onClick={() => { setIsLocked(true); setShowLockPanel(false); }}
                      className="w-full py-2 bg-[#2D9E6B] text-white rounded-xl font-bold text-xs hover:bg-[#1E5C36] transition-all"
                    >
                      Zastosuj kłódkę
                    </button>
                    {isLocked && (
                      <button onClick={() => { setIsLocked(false); setLockDateTime(""); setShowLockPanel(false); }} className="w-full py-2 text-red-500 rounded-xl font-bold text-xs hover:bg-red-50 transition-all mt-1">
                        Usuń blokadę
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-1 gap-2">
            <button onClick={onClose} className="flex-1 py-4 font-bold text-[#5A7368] hover:bg-slate-50 rounded-2xl transition-all">Anuluj</button>
            <button onClick={submit} className="flex-[2] py-4 bg-[#1E5C36] text-white rounded-2xl font-bold text-base shadow-xl hover:bg-[#164a2c] transition-all">
              {taskToEdit ? "Zapisz zmiany" : "Dodaj zadanie"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


function MoodModal({ onClose, onAdd, defaultNote = "", forced = false }) {
  const [sel, setSel] = useState(3); // <--- Zmiana domyślnego indeksu na 3
  const [note, setNote] = useState(defaultNote);
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const timeStr = today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-[#1A2F22]/60 backdrop-blur-sm p-4" onClick={!forced ? onClose : undefined}>
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md border border-white/20 animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-[#1A2F22] text-xl">Zarejestruj swój nastrój</h3>
          {!forced && <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-all"><X size={20} className="text-[#9FB5AD]" /></button>}
        </div>

        <p className="text-sm font-bold text-[#1A2F22] mb-3">Jak się czujesz?</p>

        <div className="flex gap-3 mb-6">
          <div className="flex-1 opacity-50 cursor-not-allowed" title="Opcja zablokowana w tej wersji">
            <p className="text-[10px] font-bold text-[#5A7368] uppercase tracking-widest mb-1">W tym momencie</p>
            <div className="px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-sm flex justify-between items-center text-gray-500">
              Dzisiaj <ChevronDown size={14} />
            </div>
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold text-[#5A7368] uppercase tracking-widest mb-1">Godzina</p>
            <div className="px-4 py-3 bg-[#F5EFE6] border border-[#E8DDD0] rounded-xl text-sm font-bold text-[#1E5C36] flex items-center gap-2">
              <Clock size={14} /> {timeStr}
            </div>
          </div>
        </div>

        <p className="text-[10px] font-bold text-[#5A7368] uppercase tracking-widest mb-3">Twój nastrój</p>
        <div className="flex justify-between mb-2">
          {EMOJIS.map((e, i) => (
            <button key={i} onClick={() => setSel(i)} className={`w-12 h-12 text-2xl rounded-2xl transition-all duration-150 ${sel === i ? "ring-2 ring-[#1E5C36] bg-[#E8F4ED] scale-110 shadow-md" : "hover:bg-[#F5EFE6] hover:scale-105"}`}>{e}</button>
          ))}
        </div>
        <p className="text-center text-xs font-bold text-[#1E5C36] mb-6">{MOOD_L[sel]}</p>

        <p className="text-[10px] font-bold text-[#5A7368] uppercase tracking-widest mb-2">Notatka z dnia (opcjonalnie)</p>
        <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Zapisz, co wpłynęło na Twój nastrój (np. ciężki wykład, sukces)..." rows={2} className="w-full px-4 py-3 rounded-xl border border-[#E8DDD0] text-sm focus:outline-none focus:border-[#2D9E6B] bg-white resize-none mb-6 text-[#1A2F22] leading-relaxed" />

        <button onClick={() => { onAdd({ id: Date.now(), d: dateStr, v: sel, note }); if (!forced) onClose(); }} className="w-full py-4 bg-[#1E5C36] text-white rounded-2xl font-bold text-sm hover:bg-[#164a2c] transition-all shadow-xl shadow-green-900/20 active:scale-[0.98]">
          Zapisz i kontynuuj
        </button>
      </div>
    </div>
  );
}

/* Usunięto komponent Journal zgodnie z założeniami odchudzonego MVP */

// ═══════════════════════════════════════════════════
//  STREAK PLANT (OBLICZENIA NA ŻYWO - NAPRAWIONE)
// ═══════════════════════════════════════════════════
function StreakPlant({ tasks }) {
  const total = tasks.length;
  const done = tasks.filter(t => t.done).length;
  const progress = total === 0 ? 0 : Math.round((done / total) * 100);

  const H = { fontFamily: "'Lora',serif" };
  const plantHeight = Math.max(15, progress);

  return (
    <div className="bg-white rounded-3xl border border-[#E8DDD0] p-6 sticky top-24 shadow-sm">
      <h3 style={H} className="text-xl font-bold text-[#1A2F22] mb-2">Twoja roślinka streaku</h3>
      <p className="text-xs text-[#5A7368] mb-6 leading-relaxed">
        Twoja roślinka rośnie razem z Twoją konsekwencją. Każde ukończone zadanie zasila roślinę.
      </p>

      <div className="relative h-64 bg-[#F5EFE6]/50 rounded-[2rem] flex items-end justify-center pb-6 mb-6 overflow-hidden border border-[#E8DDD0]">
        <div className="absolute bottom-0 w-28 h-14 bg-[#5A7368] rounded-b-2xl rounded-t-sm z-20 flex flex-col items-center">
          <div className="w-32 h-4 bg-[#3E5249] rounded-sm -mt-1 shadow-md" />
        </div>
        <div
          className="w-14 bg-[#2D9E6B] rounded-t-[2rem] transition-all duration-1000 ease-out relative z-10 flex flex-col items-center shadow-inner"
          style={{ height: `${plantHeight}%`, maxHeight: '80%', bottom: '30px' }}
        >
          <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(90deg,transparent,transparent_4px,#1A2F22_4px,#1A2F22_6px)] rounded-t-[2rem]" />
        </div>
        <div className={`absolute top-8 text-4xl transition-all duration-700 z-30 ${progress === 100 ? 'opacity-100 scale-100 animate-bounce' : 'opacity-0 scale-50'}`}>
          🌸
        </div>
      </div>

      <div>
        <div className="flex justify-between mb-2">
          <span className="text-xs font-semibold text-[#5A7368]">Postęp dnia</span>
          <span translate="no" className="text-xs font-bold text-[#1E5C36]">{progress}% ({done}/{total})</span>
        </div>
        <div className="h-2.5 bg-[#F5EFE6] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#2D9E6B] to-[#1E5C36] rounded-full transition-all duration-1000 ease-out" style={{ width: `${progress}%` }} />
        </div>
        {progress === 100 && (
          <div className="bg-[#E8F4ED] rounded-2xl px-3 py-2 mt-4 flex items-start gap-2 animate-fade-in-up">
            <CheckCircle size={14} className="text-[#2D9E6B] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[#1E5C36] font-medium leading-relaxed">
              Świetna robota! Roślinka zakwitła. Odpocznij!
            </p>
          </div>
        )}
      </div>

      <button className="mt-4 w-full py-2 text-xs font-bold text-[#5A7368] border-2 border-[#E8DDD0] rounded-xl flex items-center justify-center gap-2 hover:bg-[#F5EFE6] transition-all">
        <RefreshCw size={12} /> Zmień roślinkę
      </button>
    </div>
  );
}



// ═══════════════════════════════════════════════════
//  DASHBOARD VIEW (ZAMROŻONY PLAN Z GUZIKIEM GENERUJ)
// ═══════════════════════════════════════════════════
function DashboardView({ tasks, moods, selectedDate, onChangeDate, onToggle, onOpenTaskModal, onEditTask, onDelete, onReturnToBacklog, onAlert, onFocusTask, loading, onGeneratePlan, userPrefs }) {
  const H = { fontFamily: "'Lora', serif" };
  const [showBacklog, setShowBacklog] = useState(false);

  if (loading) return <SkeletonScreen />;

  // Godzina startu z onboardingu (domyślnie 6)
  const parsedStart = userPrefs?.startTime ? userPrefs.startTime.split(':').map(Number) : [6, 0];
  let timelineStart = parsedStart[0] || 6;
  const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

  const flexScheduled = tasks.filter(t => !t.isLocked && t.sMins !== null && t.sMins !== undefined && t.pDate === dateStr);
  const lockedScheduled = tasks.filter(t => t.isLocked && t.t && checkIsDate(t.t, selectedDate)).map(t => {
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
    <div className="p-6 max-w-6xl mx-auto w-full pb-10">
      {/* NAGŁÓWEK DASHBOARDU - RESPANSYWNY */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 lg:gap-0 mb-8 lg:mb-10">
        <h1 style={H} className="text-2xl lg:text-3xl font-bold text-[#1A2F22] tracking-tight">Dzisiejsze zadania</h1>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6">
          <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-2 bg-[#F5EFE6] px-2.5 py-1.5 rounded-2xl border border-[#E8DDD0]">
            <button onClick={() => onChangeDate(-1)} className="p-1.5 hover:bg-white rounded-xl transition-all shadow-sm active:scale-95 text-[#5A7368] hover:text-[#1E5C36]">
              <ChevronLeft size={16} />
            </button>
            <span className="text-[12px] lg:text-[13px] font-bold text-[#1E5C36] capitalize min-w-[120px] text-center" style={{ fontFamily: "'Lora', serif" }}>
              {selectedDate.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
            <button onClick={() => onChangeDate(1)} className="p-1.5 hover:bg-white rounded-xl transition-all shadow-sm active:scale-95 text-[#5A7368] hover:text-[#1E5C36]">
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button onClick={onGeneratePlan} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 lg:py-1.5 bg-[#E8F4ED] text-[#1E5C36] border border-[#2D9E6B]/30 rounded-xl text-xs font-bold hover:bg-[#2D9E6B] hover:text-white transition-all shadow-sm active:scale-95">
              <RefreshCw size={15} /> Generuj
            </button>
            <button onClick={onOpenTaskModal} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 lg:py-1.5 bg-white border border-[#E8DDD0] text-[#1A2F22] rounded-xl text-xs font-bold hover:bg-[#F5EFE6] hover:border-[#2D9E6B] transition-all shadow-sm active:scale-95">
              Dodaj <Plus size={15} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 xl:gap-20 items-start">
        <div className="xl:col-span-8 relative max-w-4xl mx-auto w-full">
          {/* RESPANSYWNA LINIA OSI CZASU */}
          <div className="absolute left-[2.5rem] md:left-[3.25rem] top-2 bottom-0 border-l-2 border-dashed border-[#C4BBAF] z-0"></div>
          <div className="relative" style={{ height: `${minsToRem((timelineEndHour - timelineStart) * 60)}rem` }}>
            {hours.map((h, i) => (
              <div key={h} className="absolute left-0 flex items-center w-full" style={{ top: `${minsToRem(i * 60)}rem` }}>
                <span className="text-[9px] md:text-[10px] font-bold text-[#9FB5AD] w-8 md:w-10 text-right bg-[#FAFAFA] py-1">{h}:00</span>
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
                          <div className="w-full border-t-2 border-dashed border-[#2D9E6B]/30 flex items-center justify-center relative">
                            <div className="absolute bg-[#FAFAFA] px-4 py-1.5 rounded-full border border-[#2D9E6B]/20 flex items-center gap-2 shadow-sm">
                              <Leaf size={12} className="text-[#2D9E6B]" />
                              <span className="text-[9px] font-black uppercase tracking-widest text-[#5A7368]">{t.title} ({t.duration})</span>
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
                    const starSize = isSmall ? 12 : isMedium ? 16 : 18;
                    const btnClass = isSmall ? 'w-5 h-5' : isMedium ? 'w-6 h-6' : 'w-7 h-7';
                    const btnIconSize = isSmall ? 8 : isMedium ? 10 : 12;
                    const showTime = !isSmall;

                    const showLockInFlex = isSmall || isMedium;
                    const lockFlexClass = isSmall ? 'w-[14px] h-[14px]' : 'w-[16px] h-[16px]';
                    const lockIconSize = isSmall ? 6 : isMedium ? 8 : 10;
                    const actionsPosClass = (isSmall || isMedium) ? 'top-1/2 -translate-y-1/2 right-0' : 'top-0 right-0';

                    return (
                      <div key={t.id} onClick={() => onEditTask(t)} className={`absolute rounded-2xl ${pClass} shadow-sm border z-20 hover:z-50 transition-all cursor-pointer group flex flex-col justify-center ${t.done ? 'bg-gray-50 border-gray-200 opacity-60 grayscale hover:opacity-80' : 'bg-white border-[#E8DDD0] hover:shadow-xl hover:border-[#2D9E6B] hover:bg-[#FBFFF1] hover:-translate-y-0.5 active:scale-[0.99]'}`} style={{ top: `${t.topRem + 0.2}rem`, height: `${t.heightRem - 0.4}rem`, minHeight: minH, width: `calc(${widthPct}% - 4px)`, left: `calc(${leftOffset}% + 2px)` }}>
                        <div className={`flex justify-between h-full relative ${(isSmall || isMedium) ? 'items-center' : 'items-start'}`}>
                          <div className="flex gap-2 sm:gap-4 min-w-0 flex-1">
                            <div className={`${isSmall ? 'mt-0' : 'mt-1'} flex-shrink-0 flex items-center gap-1.5 ${t.done ? 'text-gray-400' : t.p === 'wysoki' ? 'text-red-400' : t.p === 'sredni' ? 'text-amber-400' : 'text-emerald-400'}`}>
                              <Star size={starSize} fill="currentColor" strokeWidth={1} />
                              {t.isLocked && showLockInFlex && (
                                <div className={`flex items-center justify-center rounded border border-[#E8DDD0] bg-white shadow-sm z-30 ${lockFlexClass} ${t.done ? 'opacity-50' : ''}`}>
                                  <Lock size={lockIconSize} strokeWidth={2.5} className="text-[#5A7368]" />
                                </div>
                              )}
                            </div>
                            <div className={`min-w-0 flex-1 ${isSmall ? 'pr-16 lg:pr-20' : 'pr-20 lg:pr-32'}`}>
                              <h4 className={`${titleSize} font-bold transition-colors truncate ${t.done ? 'line-through text-gray-500' : 'text-[#1A2F22] group-hover:text-[#1E5C36]'}`} title={t.title}>{t.title}</h4>
                              {showTime && (
                                <p className={`text-xs font-bold mt-1 ${t.done ? 'text-gray-400' : 'text-[#5A7368]'}`}>{formatTime(t.sMins)} — {formatTime(t.sMins + t.durMins)}</p>
                              )}
                            </div>
                          </div>
                          <div className={`absolute ${actionsPosClass} flex items-center gap-1 sm:gap-1.5 transition-all z-30 ${t.done ? 'opacity-100' : 'opacity-100 lg:opacity-0 lg:group-hover:opacity-100'}`}>
                            {!t.done && <button onClick={(e) => { e.stopPropagation(); onFocusTask(t); }} className={`${btnClass} rounded-full bg-[#E8F4ED] text-[#1E5C36] hover:bg-[#1E5C36] hover:text-white flex items-center justify-center shadow-sm hover:scale-110 transition-all`}><Play size={btnIconSize} className="ml-0.5" /></button>}
                            {!t.isLocked && !t.done && (
                              <button onClick={(e) => { e.stopPropagation(); onReturnToBacklog(t.id); }} title="Cofnij do backlogu" className={`${btnClass} rounded-full bg-orange-50 text-orange-500 hover:bg-orange-500 hover:text-white flex items-center justify-center shadow-sm hover:scale-110 transition-all`}>
                                <RotateCcw size={btnIconSize} />
                              </button>
                            )}
                            <button onClick={(e) => { e.stopPropagation(); onDelete(t.id); }} className={`${btnClass} rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center shadow-sm hover:scale-110 transition-all`}><Trash2 size={btnIconSize} /></button>
                            <button onClick={(e) => { e.stopPropagation(); onToggle(t.id); }} className={`${btnClass} rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-all ${t.done ? 'bg-[#5A7368] text-white' : 'bg-[#E8F4ED] text-[#1E5C36] border border-[#2D9E6B]'}`}><Check size={btnIconSize} /></button>
                          </div>
                          {t.isLocked && !showLockInFlex && <div className={`absolute bottom-0 left-0 flex items-center justify-center rounded border border-[#E8DDD0] bg-white shadow-sm z-30 w-[22px] h-[22px] ${t.done ? 'opacity-50' : ''}`}><Lock size={12} strokeWidth={2.5} className="text-[#5A7368]" /></div>}
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
        <div className="xl:col-span-4 space-y-6 pt-16">
          <StreakPlant tasks={scheduled} />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  CALENDAR VIEW (ZADANIA ZOSTAJĄ NA MIEJSCU PO PRAWEJ)
// ═══════════════════════════════════════════════════
function CalendarView({ tasks, selectedDate, onChangeDate, onToggle, onDelete, onFocusTask, onEditTask, loading }) {
  const H = { fontFamily: "'Lora', serif" };
  const [search, setSearch] = useState("");

  if (loading) return <SkeletonScreen />;

  const hours = Array.from({ length: 16 }, (_, i) => i + 7);

  const isSameDate = (textString) => {
    if (!textString) return false;
    const txt = textString.toLowerCase();

    const selYear = selectedDate.getFullYear();
    const selMonth = selectedDate.getMonth() + 1;
    const selDay = selectedDate.getDate();
    const selDateOnly = new Date(selYear, selectedDate.getMonth(), selDay);

    const endMatch = txt.match(/🛑 do (\d{4})-(\d{1,2})-(\d{1,2})/);
    if (endMatch) {
      const endDate = new Date(parseInt(endMatch[1]), parseInt(endMatch[2]) - 1, parseInt(endMatch[3]));
      if (selDateOnly > endDate) return false;
    }

    const startMatch = textString.match(/\((\d{1,2})[\.\/ -](\d{1,2})[\.\/ -](\d{4})\)/);
    if (startMatch && (txt.includes("codziennie") || txt.includes("co tydzień") || txt.includes("w dni robocze"))) {
      const startDate = new Date(parseInt(startMatch[3]), parseInt(startMatch[2]) - 1, parseInt(startMatch[1]));
      if (selDateOnly < startDate) return false;
    }

    const dayOfWeek = selectedDate.getDay() === 0 ? 6 : selectedDate.getDay() - 1;
    const daysArr = ["pon", "wt", "śr", "czw", "pt", "sob", "ndz"];

    if (txt.includes("codziennie") || txt.includes("każdego dnia")) return true;
    if (txt.includes("w dni robocze") && dayOfWeek >= 0 && dayOfWeek <= 4) return true;
    if (txt.includes("co tydzień") || txt.includes("co tydzien")) {
      if (txt.includes(daysArr[dayOfWeek])) return true;
      if (dayOfWeek === 5 && txt.includes("sb")) return true;
    }

    const ymd = textString.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (ymd && parseInt(ymd[1]) === selYear && parseInt(ymd[2]) === selMonth && parseInt(ymd[3]) === selDay) return true;

    const dmy = textString.match(/(\d{1,2})[\.\/ -](\d{1,2})[\.\/ -](\d{4})/);
    if (dmy && parseInt(dmy[3]) === selYear && parseInt(dmy[2]) === selMonth && parseInt(dmy[1]) === selDay) return true;

    return false;
  };

  const timelineTasks = tasks.filter(t => (isSameDate(t.t) || (!t.isLocked && isSameDate(t.deadline))));

  const queueTasks = tasks
    .filter(t => !search || t.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex h-screen bg-white">
      {/* LEWA KOLUMNA: Oś czasu */}
      <div className="flex-1 overflow-y-auto p-6 border-r border-[#E8DDD0] pb-24">
        <header className="mb-8 flex flex-col gap-1">
          <div className="flex items-center gap-2 ml-[-0.5rem]">
            <button onClick={() => onChangeDate(-1)} className="p-2 hover:bg-[#F5EFE6] rounded-full transition-all active:scale-95 text-[#1A2F22]">
              <ChevronLeft size={20} />
            </button>
            <h1 style={H} className="text-[26px] font-bold text-[#1A2F22] capitalize">
              {selectedDate.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h1>
            <button onClick={() => onChangeDate(1)} className="p-2 hover:bg-[#F5EFE6] rounded-full transition-all active:scale-95 text-[#1A2F22]">
              <ChevronRight size={20} />
            </button>
          </div>
          <p className="text-[#5A7368] text-[13px] ml-2 mt-1">Siatka godzinowa: Twoje zablokowane terminy i ostateczne deadline'y.</p>
        </header>

        <div className="relative">
          {hours.map(h => {
            const tasksInThisHour = timelineTasks.filter(t => {
              let taskHour = -1;
              if (isSameDate(t.t)) {
                const match = t.t ? t.t.match(/(\d{1,2}):\d{2}/) : null;
                taskHour = match ? parseInt(match[1]) : t.hour;
              } else if (isSameDate(t.deadline)) {
                const match = t.deadline.match(/o (\d{1,2}):\d{2}/);
                if (match) taskHour = parseInt(match[1]);
              }
              return taskHour === h;
            });

            return (
              <div key={h} className="flex border-t border-[#F5EFE6] h-[5.4rem] group">
                <div className="w-16 -mt-2.5 text-[10px] font-black text-[#9FB5AD] uppercase tracking-tighter z-10">
                  <span className="bg-white pr-2">{h.toString().padStart(2, '0')}:00</span>
                </div>
                <div className="flex-1 relative pr-2">
                  {tasksInThisHour.map((t, index) => {
                    const isDeadlineBlock = !isSameDate(t.t) && isSameDate(t.deadline);
                    const match = t.duration ? t.duration.match(/(\d+)/) : null;
                    const mins = match ? parseInt(match[1]) : 60;
                    const heightRem = (mins / 60) * 6;

                    return (
                      <div
                        key={t.id}
                        onClick={() => onEditTask(t)}
                        style={{
                          height: `${heightRem}rem`,
                          minHeight: '3.5rem',
                          zIndex: 10 + index,
                          width: `calc(${100 / tasksInThisHour.length}% - 4px)`,
                          left: `calc(${(100 / tasksInThisHour.length) * index}% + 2px)`
                        }}
                        className={`absolute top-0 border-l-4 rounded-xl p-2.5 shadow-md hover:shadow-lg transition-all overflow-hidden cursor-pointer ${isDeadlineBlock ? 'bg-red-50/95 border-red-400' : 'bg-[#E8F4ED]/95 border-[#2D9E6B]'}`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <p className={`text-[13px] font-bold truncate ${isDeadlineBlock ? 'text-red-700' : 'text-[#1E5C36]'}`}>{t.title}</p>
                          {isDeadlineBlock ? (
                            <span className="text-[8px] font-black text-red-500 uppercase tracking-widest hidden sm:block">⚠️ Deadline</span>
                          ) : (
                            <span className="text-[8px] font-black text-[#2D9E6B] uppercase tracking-widest hidden sm:block">🔒 Zablokowane</span>
                          )}
                        </div>
                        <p className={`text-[9px] font-bold uppercase tracking-wider mt-1 ${isDeadlineBlock ? 'text-red-600/70' : 'text-[#5A7368]'}`}>
                          {t.duration || "60 min"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PRAWA KOLUMNA: Pełna baza zadań z wyszukiwarką */}
      <div className="w-80 bg-[#FAFAFA] p-6 overflow-y-auto hidden lg:block pb-24 border-l border-[#E8DDD0]/50">
        <h3 style={H} className="text-lg font-bold text-[#1A2F22] mb-6 flex items-center gap-2">
          <Target size={18} className="text-[#2D9E6B]" /> Wszystkie zadania
        </h3>

        {/* WYSZUKIWARKA */}
        <div className="relative mb-6">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9FB5AD]" />
          <input
            type="text"
            placeholder="Szukaj zadania..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8DDD0] text-[13px] focus:outline-none focus:border-[#2D9E6B] bg-white transition-all shadow-sm placeholder:text-[#9FB5AD]"
          />
        </div>

        <div className="space-y-4">
          {queueTasks.map(t => {
            const deadlineToday = isSameDate(t.deadline);
            return (
              <div
                key={t.id}
                onClick={() => onEditTask(t)}
                className={`bg-white p-4 rounded-3xl border shadow-sm transition-all duration-300 cursor-pointer group hover:-translate-y-1 hover:shadow-lg ${t.done ? 'opacity-60 grayscale border-gray-200' : (deadlineToday ? 'border-red-200 hover:border-red-400' : 'border-[#E8DDD0] hover:border-[#2D9E6B]')}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <PBadge p={t.p} />
                    {t.isLocked && <Lock size={10} className="text-[#5A7368]" title="Zablokowane w kalendarzu" />}
                  </div>
                  {deadlineToday && !t.done && <span className="text-[9px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-md border border-red-100">W tym dniu!</span>}
                  {!deadlineToday && t.deadline && !t.done && <span className="text-[9px] font-bold text-[#5A7368] bg-[#F5EFE6] px-1.5 py-0.5 rounded-md">Dl: {t.deadline.split(' o ')[0]}</span>}
                  {t.done && <span className="text-[9px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-md border border-gray-200">Zrobione</span>}
                </div>

                <h4 className={`text-[13px] font-bold mb-2.5 pr-2 transition-colors ${t.done ? 'line-through text-gray-500' : 'text-[#1A2F22] group-hover:text-[#1E5C36]'}`}>{t.title}</h4>

                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-bold text-[#5A7368] flex items-center gap-1 bg-[#F5EFE6] px-1.5 py-0.5 rounded-md">
                    <Clock size={10} /> {t.duration || "Brak info"}
                  </span>

                  <div className="ml-auto flex gap-1.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(t.id); }}
                      title="Usuń zadanie"
                      className="w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center shadow-sm hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
          {queueTasks.length === 0 && (
            <div className="text-center py-20 opacity-70">
              <div className="w-16 h-16 bg-[#E8DDD0] rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">{search ? "🔍" : "✨"}</div>
              <p className="text-[10px] font-black text-[#9FB5AD] uppercase tracking-widest">
                {search ? "Brak wyników wyszukiwania" : "Wszystko zrobione!"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  MOOD VIEW (ZAAWANSOWANA ANALITYKA NASTROJU)
// ═══════════════════════════════════════════════════
function MoodView({ moods, onOpenModal, onEditMood, todayDate }) {
  const H = { fontFamily: "'Lora', serif" };
  const [filter, setFilter] = useState("Kwartał");
  const [hovered, setHovered] = useState(null);
  const [editingMood, setEditingMood] = useState(null);
  const [editingNote, setEditingNote] = useState("");
  const [showAvg, setShowAvg] = useState(false);

  let daysToShow = 90;
  if (filter === "Tydzień") daysToShow = 7;
  if (filter === "Miesiąc") daysToShow = 30;

  const today = new Date(todayDate || new Date());
  today.setHours(0, 0, 0, 0);

  const width = 1200;
  const height = 250;
  const paddingX = 60; // Zwiększony margines, aby zmieścić minki po lewej
  const innerWidth = width - 2 * paddingX;

  const points = [];
  let sumV = 0;
  let countV = 0;

  moods.forEach(m => {
    // Bezpieczne parsowanie daty bez przesunięć UTC
    const [y, mo, da] = m.d.split('-');
    const d = new Date(parseInt(y), parseInt(mo) - 1, parseInt(da));
    d.setHours(0, 0, 0, 0);

    const diffDays = Math.round((today - d) / (1000 * 60 * 60 * 24));

    if (diffDays >= 0 && diffDays < daysToShow) {
      const x = paddingX + (1 - diffDays / (daysToShow - 1)) * innerWidth;
      const y = height - 20 - (m.v / 6) * (height - 60); // Podział przez 6 (skala 0-6)
      points.push({ x, y, data: m, diffDays });

      // Dodajemy do średniej
      sumV += m.v;
      countV++;
    }
  });

  points.sort((a, b) => b.diffDays - a.diffDays);

  // Obliczanie dynamicznej średniej
  const avgV = countV > 0 ? sumV / countV : 0;
  const avgY = countV > 0 ? height - 20 - (avgV / 6) * (height - 60) : 0;

  const linePath = points.length > 0 ? `M ${points.map(p => `${p.x},${p.y}`).join(" L ")}` : "";
  const firstX = points.length > 0 ? points[0].x : paddingX;
  const lastX = points.length > 0 ? points[points.length - 1].x : width - paddingX;
  const areaPath = points.length > 0 ? `${linePath} L ${lastX},${height} L ${firstX},${height} Z` : "";

  const hitRadius = Math.min(25, Math.max(6, (width / daysToShow) / 2));

  return (
    <div className="p-8 max-w-6xl mx-auto w-full pb-32 animate-in fade-in duration-500">

      {/* ODDZIELONY NAGŁÓWEK OPISOWY */}
      <header className="mb-6">
        <h1 style={H} className="text-3xl font-bold text-[#1A2F22] mb-4">Monitor nastroju</h1>
        <p className="text-[#5A7368] text-[13px] max-w-xl">Śledź swoje samopoczucie w relacji do obowiązków akademickich.</p>
      </header>

      {/* NOWE BIAŁE MENU (ŚREDNIA I REJESTRACJA) */}
      <div className="flex justify-between items-center bg-white p-2.5 rounded-2xl border border-[#E8DDD0] shadow-sm mb-8">
        <div className="flex items-center gap-2 pl-2">
          <button
            onClick={() => setShowAvg(!showAvg)}
            className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all border-2 ${showAvg ? "bg-[#1e3a8a] text-white border-[#1e3a8a] shadow-md" : "bg-transparent text-[#5A7368] border-transparent hover:bg-[#F5EFE6]"}`}
          >
            Średnia
          </button>
          {/* Puste miejsce na przyszłe funkcje np. Wzrost/Spadek */}
        </div>
        <button onClick={onOpenModal} className="px-5 py-2.5 bg-[#1E5C36] text-white rounded-xl text-[13px] font-bold shadow-md hover:bg-[#164a2c] active:scale-95 transition-all flex items-center gap-2">
          <Smile size={16} /> Zarejestruj swój nastrój
        </button>
      </div>

      {/* GŁÓWNY KONTENER WYKRESU */}
      <div className="bg-white rounded-[2.5rem] border border-[#E8DDD0] p-8 shadow-sm relative">
        <div className="flex justify-between items-center mb-12 pl-12">
          <h3 className="font-bold text-[#1A2F22] text-[13px]">Wykres Twojego nastroju w czasie</h3>
          <div className="flex items-center gap-1 bg-[#F5EFE6] p-1 rounded-xl">
            {["Dzień", "Tydzień", "Miesiąc", "Kwartał", "Rok"].map(f => {
              const isDisabled = f === "Rok" || f === "Dzień";
              return (
                <button key={f} onClick={() => !isDisabled && setFilter(f)} disabled={isDisabled}
                  className={`px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all ${isDisabled ? "text-gray-400 cursor-not-allowed opacity-40" : filter === f ? "bg-white text-[#1A2F22] shadow-sm" : "text-[#5A7368] hover:text-[#1A2F22]"}`}>
                  {f}
                </button>
              )
            })}
          </div>
        </div>

        <div className="relative w-full h-[250px]">
          {/* OŚ Y - 7 MINEK PO LEWEJ STRONIE (Renderowane jako HTML poza SVG) */}
          {[0, 1, 2, 3, 4, 5, 6].map(level => {
            const yPos = height - 20 - (level / 6) * (height - 60);
            return (
              <div key={`html-emoji-${level}`} className="absolute text-xl" style={{ left: 0, top: `${(yPos / height) * 100}%`, transform: 'translateY(-50%)' }}>
                {EMOJIS[level]}
              </div>
            );
          })}

          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible absolute top-0 left-0" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2D9E6B" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#2D9E6B" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* OŚ Y - LINIE SIATKI */}
            {[0, 1, 2, 3, 4, 5, 6].map(level => {
              const yPos = height - 20 - (level / 6) * (height - 60);
              return (
                <g key={`grid-${level}`}>
                  <line x1={paddingX} y1={yPos} x2={width} y2={yPos} stroke="#F5EFE6" strokeWidth="2" strokeDasharray="5,5" />
                </g>
              );
            })}

            {points.length > 0 && (
              <>
                <path d={areaPath} fill="url(#chartGradient)" />
                <path d={linePath} fill="none" stroke="#2D9E6B" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              </>
            )}

            {/* POGRUBIONA, GRANATOWA LINIA ŚREDNIEJ */}
            {showAvg && countV > 0 && (
              <g className="animate-in fade-in duration-500">
                <line x1={paddingX} y1={avgY} x2={width} y2={avgY} stroke="#1e3a8a" strokeWidth="4" strokeDasharray="12,8" strokeLinecap="round" />
                <rect x={width - 150} y={avgY - 30} width="150" height="28" rx="8" fill="#1e3a8a" />
                <text x={width - 75} y={avgY - 11} fill="white" fontSize="13" fontWeight="bold" textAnchor="middle">
                  Średnia: {avgV.toFixed(1)} / 6.0
                </text>
              </g>
            )}

            {/* INTERAKTYWNE PUNKTY */}
            {points.map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r={4} fill="#2D9E6B" />
                {hovered?.d === p.data.d && <circle cx={p.x} cy={p.y} r={8} fill="#1E5C36" className="animate-ping opacity-30" />}
                <circle cx={p.x} cy={p.y} r={hitRadius} fill="transparent" className="cursor-pointer" onMouseEnter={() => !editingMood && setHovered(p.data)} onMouseLeave={() => !editingMood && setHovered(null)} onClick={() => { setHovered(null); setEditingMood(p.data); setEditingNote(p.data.note || ""); }} />
              </g>
            ))}
          </svg>

          {/* DYMEK INFORMACYJNY (HOVER) */}
          {hovered && !editingMood && (
            <div className={`absolute z-50 bg-white border border-[#2D9E6B]/30 shadow-2xl rounded-2xl p-4 w-72 pointer-events-none transform -translate-y-[115%] ${((points.find(p => p.data.d === hovered.d)?.x / width) * 100) > 80 ? '-translate-x-[90%]' :
              ((points.find(p => p.data.d === hovered.d)?.x / width) * 100) < 20 ? '-translate-x-[10%]' :
                '-translate-x-1/2'
              }`}
              style={{ left: `${(points.find(p => p.data.d === hovered.d)?.x / width) * 100}%`, top: `${(points.find(p => p.data.d === hovered.d)?.y / height) * 100}%` }}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">{EMOJIS[hovered.v]}</span>
                  <span className="text-xs font-bold text-[#1E5C36] bg-[#E8F4ED] px-2 py-1 rounded-md">{MOOD_L[hovered.v]}</span>
                </div>
                <span className="text-[10px] font-black text-[#9FB5AD]">{hovered.d}</span>
              </div>
              <p className="text-xs text-[#5A7368] mt-2 leading-relaxed italic border-l-2 border-[#E8DDD0] pl-2">"{hovered.note || "Brak notatki."}"</p>
              <p className="text-[10px] text-[#9FB5AD] mt-3 font-bold uppercase tracking-wider text-center">Kliknij kropkę, aby edytować</p>
            </div>
          )}

          {/* DYMEK EDYCJI (CLICK) */}
          {editingMood && (
            <div className={`absolute z-50 bg-white border-2 border-[#2D9E6B] shadow-2xl rounded-3xl p-5 w-96 transform -translate-y-[105%] ${((points.find(p => p.data.d === editingMood.d)?.x / width) * 100) > 80 ? '-translate-x-[95%]' :
              ((points.find(p => p.data.d === editingMood.d)?.x / width) * 100) < 20 ? '-translate-x-[5%]' :
                '-translate-x-1/2'
              }`}
              style={{ left: `${(points.find(p => p.data.d === editingMood.d)?.x / width) * 100}%`, top: `${(points.find(p => p.data.d === editingMood.d)?.y / height) * 100}%` }}>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-bold text-[#1A2F22]">Edytuj dzień: <span className="text-[#2D9E6B]">{editingMood.d}</span></span>
                <button onClick={() => setEditingMood(null)} className="text-[#9FB5AD] hover:text-red-500 transition-colors bg-red-50 p-1.5 rounded-full"><X size={16} /></button>
              </div>

              <div className="mb-4">
                <p className="text-xs font-bold text-[#5A7368] mb-2 uppercase tracking-wide">Notatka:</p>
                <textarea
                  value={editingNote}
                  onChange={(e) => setEditingNote(e.target.value)}
                  placeholder="Jak minął dzień?"
                  className="w-full bg-[#F5EFE6] border border-[#E8DDD0] rounded-xl p-3 text-sm focus:outline-none focus:border-[#2D9E6B] resize-none h-20 transition-all placeholder:text-[#9FB5AD]"
                />
              </div>

              <div className="mb-2">
                <p className="text-xs font-bold text-[#5A7368] mb-2 uppercase tracking-wide">Nastrój:</p>
                <div className="flex gap-1 justify-between">
                  {EMOJIS.map((emoji, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        onEditMood(editingMood.d, index, editingNote);
                        setEditingMood(null);
                      }}
                      className={`text-2xl p-1.5 rounded-xl hover:bg-[#F5EFE6] transition-all hover:scale-125 ${editingMood.v === index ? 'bg-[#E8F4ED] scale-110 shadow-sm border border-[#2D9E6B]/30' : ''}`}
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

function WarningView({ loading, user }) {
  const H = { fontFamily: "'Lora',serif" };
  if (loading) return <SkeletonScreen />;

  return (
    <div className="p-10 max-w-6xl mx-auto w-full pb-32">
      {/* NAGŁÓWEK PERSONALIZOWANY */}
      <header className="mb-10">
        <p className="text-[#5A7368] font-bold text-sm mb-1">Cześć {user?.name || "Natalia"}!</p>
        <h1 style={H} className="text-4xl font-bold text-[#1A2F22] mb-4">System ostrzegania</h1>
        <p className="text-[#5A7368] text-sm max-w-3xl leading-relaxed">
          Wsparcie jest bliżej, niż myślisz. Jeśli czujesz, że potrzebujesz wsparcia, skontaktuj się z osobami, które są gotowe Ci pomóc. Poniżej znajdziesz listę organizacji oferujących bezpłatną pomoc.
        </p>
      </header>

      {/* ŻÓŁTY BANER INFORMACYJNY */}
      <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl flex gap-4 items-start mb-12 shadow-sm">
        <div className="bg-white p-2 rounded-xl shadow-sm">
          <Settings size={20} className="text-amber-500 animate-pulse" />
        </div>
        <p className="text-[11px] font-medium text-amber-800 leading-relaxed">
          <span className="font-black uppercase tracking-wider block mb-1">Ważna informacja</span>
          Ta informacja nie jest diagnozą, ale ważnym sygnałem ostrzegawczym. Warto przyjrzeć się swojemu planowi dnia, wprowadzić drobne zmiany i jeśli czujesz, że sytuacja się utrzymuje — rozważyć rozmowę ze specjalistą.
        </p>
      </div>

      {/* SIATKA KART KONTAKTOWYCH */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {CONTACTS.map((c, i) => (
          <div key={i} className="bg-white border border-[#E8DDD0] rounded-[2.5rem] p-8 shadow-sm hover:shadow-md transition-all group">
            <p className="text-[10px] font-black uppercase text-[#9FB5AD] tracking-[0.15em] mb-1">{c.org}</p>
            <h3 style={H} className="text-xl font-bold text-[#1A2F22] mb-4 group-hover:text-[#2D9E6B] transition-colors">{c.name}</h3>

            <p className="text-xs text-[#5A7368] leading-[1.7] mb-8 min-h-[4rem]">
              {c.desc}
            </p>

            <div className="flex items-center justify-between pt-6 border-t border-[#F5EFE6]">
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-[#2D9E6B]" />
                <span className="text-sm font-black text-[#1A2F22]">{c.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-[#9FB5AD]" />
                <span className="text-[11px] font-bold text-[#5A7368]">{c.hours}</span>
              </div>
              {/* Link do strony jako działający odnośnik */}
              <a
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#9FB5AD] hover:text-[#2D9E6B] transition-colors"
              >
                <ExternalLink size={14} />
                <span className="text-[11px] font-bold">{c.url.replace("https://", "")}</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  ANALIZA NASTROJÓW (SYSTEM OSTRZEGANIA)
// ═══════════════════════════════════════════════════
export const analyzeMoodAlerts = (moods, todayDate) => {
  if (!moods || moods.length === 0) return null;

  const moodMap = {};
  moods.forEach(m => {
    moodMap[m.d] = m.v;
  });

  const getMoodValueForDaysAgo = (daysAgo) => {
    const d = new Date(todayDate);
    d.setDate(d.getDate() - daysAgo);
    const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return moodMap[dStr];
  };

  const getRecentMoods = (daysCount) => {
    const values = [];
    for (let i = 0; i < daysCount; i++) {
      const val = getMoodValueForDaysAgo(i);
      if (val !== undefined) values.push(val);
    }
    return values;
  };

  const calcMean = (arr) => arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length;
  const calcVariance = (arr, mean) => arr.length === 0 ? 0 : arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length;

  // 1. Ostre wyczerpanie emocjonalne (Reguła 3 dni) -> średnia < 2.0 (czyli 0, 1)
  const last3 = getRecentMoods(3);
  if (last3.length === 3) {
    const mean3 = calcMean(last3);
    if (mean3 < 2.0) {
      return {
        id: 1,
        title: "Ostre wyczerpanie emocjonalne",
        text: "Widzę, że od kilku dni Twój poziom energii i nastroju jest bardzo niski. Każdy ma prawo do słabszego momentu, ale jeśli czujesz, że przytłacza Cię stres, nie musisz z tym walczyć sam. Porozmawiaj o tym z kimś zaufanym lub skorzystaj z darmowego, anonimowego wsparcia specjalisty.",
        btnText: "Zobacz dostępne telefony zaufania",
        color: "#D32F2F"
      };
    }
  }

  // 3. Brak regeneracji po weekendzie
  if (todayDate.getDay() === 1) { // 1 = Poniedziałek
    const mondayVal = getMoodValueForDaysAgo(0);
    const fridayVal = getMoodValueForDaysAgo(3);
    if (mondayVal !== undefined && fridayVal !== undefined) {
      if (mondayVal <= fridayVal && mondayVal <= 3) {
        return {
          id: 3,
          title: "Brak regeneracji po weekendzie",
          text: "Wygląda na to, że miniony weekend nie przyniósł Ci upragnionego odpoczynku i resetu. Jeśli obowiązki nie pozwalają Ci złapać tchu, może to prowadzić do poważnego wyczerpania. Może warto porozmawiać o tym, jak skutecznie stawiać granice? Jesteśmy tu, by pomóc.",
          btnText: "Skontaktuj się z infolinią wsparcia",
          color: "#E65100"
        };
      }
    }
  }

  // 2. Spłaszczenie emocjonalne (7 dni)
  const last7 = getRecentMoods(7);
  if (last7.length >= 5) {
    const mean7 = calcMean(last7);
    const var7 = calcVariance(last7, mean7);
    if (var7 < 0.3 && mean7 <= 3.0) {
      return {
        id: 2,
        title: "Spłaszczenie emocjonalne",
        text: "Zauważyłem, że Twój nastrój od dłuższego czasu utrzymuje się na tym samym, płaskim poziomie. Taka monotonia emocjonalna to często sygnał, że Twój organizm włączył 'tryb przetrwania' z powodu przebodźcowania. Pamiętaj, że rozmowa może pomóc Ci odzyskać równowagę. Zobacz, gdzie możesz uzyskać bezpieczną pomoc.",
        btnText: "Znajdź wsparcie psychologiczne",
        color: "#F57C00"
      };
    }
  }

  // 4. Inercja emocjonalna (Pętla nastroju - 5 dni)
  const last5 = getRecentMoods(5);
  if (last5.length >= 4) {
    const mean5 = calcMean(last5);
    const var5 = calcVariance(last5, mean5);
    const max5 = Math.max(...last5);
    if (max5 <= 3 && var5 >= 0.3 && var5 <= 1.5) {
      return {
        id: 4,
        title: "Inercja emocjonalna",
        text: "Twój nastrój wydaje się ostatnio tkwić w martwym punkcie, brakuje w nim naturalnych, pozytywnych wahań. Kiedy wpadamy w taką pętlę, czasem najtrudniejszy jest ten pierwszy krok, by poprosić o pomoc. Specjaliści z bezpłatnej infolinii chętnie Cię wysłuchają, bez oceniania. Chcesz spróbować?",
        btnText: "Połącz mnie z ekspertem",
        color: "#1976D2"
      };
    }
  }

  return null;
};

// ═══════════════════════════════════════════════════
//  DEBUG MODAL (SKRÓT: SHIFT+D)
// ═══════════════════════════════════════════════════
function DebugModal({ onClose, actions }) {
  const [activeTab, setActiveTab] = useState("scenarios");

  const tabs = [
    { id: "scenarios", label: "Ostrzeżenia" },
    { id: "tasks", label: "Zadania" },
    { id: "moods", label: "Nastroje" },
    { id: "time", label: "Czas" }
  ];

  const scenarios = [
    {
      id: 1,
      name: "1. Ostre wyczerpanie emocjonalne",
      desc: "Symuluje 3 dni z rzędu z krytycznie niskim nastrojem (np. 😫). Średnia z 3 dni spada poniżej 2.0."
    },
    {
      id: 2,
      name: "2. Spłaszczenie emocjonalne",
      desc: "Symuluje 7 dni monotonii, gdzie nastrój to ciągłe 😐. Bardzo niska wariancja i brak lepszych dni."
    },
    {
      id: 3,
      name: "3. Brak regeneracji po weekendzie",
      desc: "Cofa czas do poniedziałku i ustawia nastrój poniedziałkowy gorszy/równy nastrojowi z piątku."
    },
    {
      id: 4,
      name: "4. Inercja emocjonalna",
      desc: "Symuluje 5 dni tkwiących w martwym punkcie (wahania między 😟 a 😐, brak dobrych dni)."
    }
  ];

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-[#1A2F22]/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl border border-white/20 animate-in zoom-in-95 duration-300 flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="font-bold text-[#1A2F22] text-xl">Panel Debug (Shift+D)</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-all">
            <X size={20} className="text-[#9FB5AD]" />
          </button>
        </div>

        <div className="flex px-6 pt-4 border-b border-gray-100 gap-6 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`pb-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${activeTab === t.id ? 'border-[#2D9E6B] text-[#1E5C36]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-6 overflow-y-auto">
          {activeTab === "scenarios" && (
            <div className="space-y-4">
              <p className="text-sm text-[#5A7368] mb-4">Wybierz jeden ze scenariuszy, aby automatycznie spreparować historię i wyzwolić powiadomienie.</p>
              {scenarios.map(s => (
                <div key={s.id} className="flex flex-col gap-2 p-4 bg-[#F5EFE6] rounded-xl border border-[#E8DDD0]">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-[#1E5C36]">{s.name}</h4>
                    <button onClick={() => actions.triggerScenario(s.id)} className="px-4 py-2 bg-[#2D9E6B] text-white text-xs font-bold rounded-lg hover:bg-[#1E5C36] transition-colors whitespace-nowrap ml-4 shadow-sm">
                      Odpal
                    </button>
                  </div>
                  <p className="text-xs text-[#5A7368] leading-relaxed pr-16">{s.desc}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "tasks" && (
            <div className="space-y-4">
              <div className="p-4 border border-gray-100 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[#1A2F22] mb-1">Dodaj zadania z bazy</h4>
                  <p className="text-xs text-gray-500">Dodaje losowe, niewykorzystane zadania do backlogu.</p>
                </div>
                <button onClick={actions.addRandomTasks} className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-200">Uruchom</button>
              </div>
              <div className="p-4 border border-gray-100 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-red-600 mb-1">Wyczyść wszystkie zadania</h4>
                  <p className="text-xs text-gray-500">Usuwa całkowicie listę zadań i harmonogramu w aplikacji.</p>
                </div>
                <button onClick={actions.clearTasks} className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 text-xs font-bold rounded-lg hover:bg-red-100">Uruchom</button>
              </div>
            </div>
          )}

          {activeTab === "moods" && (
            <div className="space-y-4">
              <div className="p-4 border border-gray-100 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[#1A2F22] mb-1">Generuj losową historię</h4>
                  <p className="text-xs text-gray-500">Zapełnia 15 dni wstecz losowymi nastrojami.</p>
                </div>
                <button onClick={actions.generateFakeMoods} className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-200">Uruchom</button>
              </div>
              <div className="p-4 border border-gray-100 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-red-600 mb-1">Wyczyść nastroje</h4>
                  <p className="text-xs text-gray-500">Usuwa całą zarejestrowaną dotąd historię nastrojów z bazy.</p>
                </div>
                <button onClick={actions.clearMoods} className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 text-xs font-bold rounded-lg hover:bg-red-100">Uruchom</button>
              </div>
            </div>
          )}

          {activeTab === "time" && (
            <div className="space-y-4">
              <div className="p-4 border border-gray-100 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[#1A2F22] mb-1">Cofnij o 1 dzień</h4>
                  <p className="text-xs text-gray-500">Oszukuje zegar aplikacji, cofając go o równe 24 godziny.</p>
                </div>
                <button onClick={actions.timeTravelBack} className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-200">Cofnij</button>
              </div>
              <div className="p-4 border border-gray-100 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[#1A2F22] mb-1">Przewiń o 1 dzień do przodu</h4>
                  <p className="text-xs text-gray-500">Oszukuje zegar aplikacji, przyspieszając go o 24 godziny.</p>
                </div>
                <button onClick={actions.timeTravelForward} className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-200">Przyspiesz</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  MAIN APP ROUTER & LOGIC
// ═══════════════════════════════════════════════════
export default function App() {
  const [view, setView] = useState("landing");
  const [authMode, setAuthMode] = useState("login");
  const [user, setUser] = usePersist("wba_user", null);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [focusedTask, setFocusedTask] = useState(null);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const [tasks, setTasks] = useState([]);
  const [moods, setMoods] = useState([]);
  const { ts, add, rm } = useToasts();
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Pobieranie danych z Supabase oraz sprawdzanie statusu onboardingu
  useEffect(() => {
    if (user && user.email) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          // 1. Pobierz zadania
          const { data: tasksData } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_email', user.email);
          setTasks(tasksData || []);

          // 2. Pobierz nastroje
          const { data: moodsData } = await supabase
            .from('moods')
            .select('*')
            .eq('user_email', user.email)
            .order('d', { ascending: true });
          setMoods(moodsData || []);

          // 3. Pobierz preferencje (status onboardingu)
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('prefs')
            .eq('email', user.email)
            .single();

          if (!profileError && profileData) {
            // Użytkownik ma już profil - pomiń onboarding i wejdź do apki
            setUser(prev => ({ ...prev, prefs: profileData.prefs }));
            setView("app");
          } else {
            // Brak profilu w bazie - wymuś onboarding
            setView("onboarding");
          }
        } catch (err) {
          console.error("Błąd synchronizacji:", err);
          add("Błąd połączenia z bazą preferencji.", "warn");
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [user?.email]);

  const [offsetDays, setOffsetDays] = useState(0);
  const getNow = useCallback(() => {
    const d = new Date();
    if (offsetDays !== 0) d.setDate(d.getDate() + offsetDays);
    return d;
  }, [offsetDays]);

  const [hasPromptedToday, setHasPromptedToday] = useState(false);

  const [dismissedAlertKey, setDismissedAlertKey] = useState(null);
  const rawActiveAlert = useMemo(() => analyzeMoodAlerts(moods, getNow()), [moods, getNow]);
  const currentAlertKey = rawActiveAlert ? `${rawActiveAlert.id}-${getNow().toDateString()}` : null;
  const activeAlert = (rawActiveAlert && currentAlertKey !== dismissedAlertKey) ? rawActiveAlert : null;

  const [showDebugModal, setShowDebugModal] = useState(false);

  const handleTriggerScenario = async (scenarioId) => {
    setDismissedAlertKey(null);
    const nowL = new Date();
    nowL.setHours(0, 0, 0, 0);
    setOffsetDays(0);

    const generateFakeMood = (daysAgo, v) => {
      const d = new Date(nowL);
      d.setDate(d.getDate() - daysAgo);
      return {
        // Usunięto generowanie ID. Zostawiamy to chmurze Supabase.
        d: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
        v: v,
        note: "Symulacja",
        user_email: user.email
      };
    };

    let newMoods = [];
    if (scenarioId === 1) {
      newMoods.push(generateFakeMood(0, 0));
      newMoods.push(generateFakeMood(1, 0));
      newMoods.push(generateFakeMood(2, 1));
    } else if (scenarioId === 2) {
      for (let i = 0; i < 7; i++) newMoods.push(generateFakeMood(i, 3));
    } else if (scenarioId === 3) {
      const day = nowL.getDay();
      let diffToMonday = day === 0 ? -6 : 1 - day;
      if (diffToMonday > 0) diffToMonday -= 7;
      setOffsetDays(diffToMonday);
      const monDaysAgo = Math.abs(diffToMonday);
      newMoods.push(generateFakeMood(monDaysAgo, 2));
      newMoods.push(generateFakeMood(monDaysAgo + 3, 4));
    } else if (scenarioId === 4) {
      newMoods.push(generateFakeMood(0, 2));
      newMoods.push(generateFakeMood(1, 3));
      newMoods.push(generateFakeMood(2, 2));
      newMoods.push(generateFakeMood(3, 3));
      newMoods.push(generateFakeMood(4, 2));
    }

    try {
      // Wyciągamy tylko daty, które chcemy nadpisać w bazie
      const datesToReplace = newMoods.map(m => m.d);

      // Kasujemy z bazy TYLKO dni nadpisywane, zachowując prawdziwą historię
      await supabase
        .from('moods')
        .delete()
        .eq('user_email', user.email)
        .in('d', datesToReplace);

      // Wrzucamy nową symulację (tym razem przejdzie, bo nie ma wymuszonego ID)
      const { data, error } = await supabase.from('moods').insert(newMoods).select();
      if (error) throw error;

      // Aktualizujemy poprawnie UI bez utraty starych danych
      setMoods(prev => {
        const filtered = prev.filter(m => !datesToReplace.includes(m.d));
        return [...filtered, ...(data || [])].sort((a, b) => a.d.localeCompare(b.d));
      });

      setShowDebugModal(false);
      add("Zasymulowano scenariusz " + scenarioId);
    } catch (err) {
      console.error(err);
      add("Błąd symulacji.", "warn");
    }
  };

  const debugActions = {
    triggerScenario: handleTriggerScenario,

    clearTasks: async () => {
      await supabase.from('tasks').delete().eq('user_email', user.email);
      setTasks([]);
      add('Usunięto wszystkie zadania (Test)');
      setShowDebugModal(false);
    },

    addRandomTasks: async () => {
      const existingTitles = new Set(tasks.map(t => t.title));
      const available = INIT_TASKS.filter(t => !existingTitles.has(t.title));
      if (available.length === 0) {
        add(`Zadania w obiegu: ${tasks.length}/${INIT_TASKS.length} (Test)`);
        setShowDebugModal(false);
        return;
      }
      const shuffled = [...available].sort(() => Math.random() - 0.5);
      const picked = shuffled.slice(0, Math.min(20, available.length));
      const newTasks = picked.map(t => {
        const { id, ...rest } = t; // Usuwamy ID z INIT_TASKS
        return { ...rest, user_email: user.email, done: t.done, sMins: null, eMins: null, pDate: null };
      });

      const { data, error } = await supabase.from('tasks').insert(newTasks).select();
      if (!error) {
        setTasks(prev => sortSmartQueue([...prev, ...data]));
        add(`Zadania w obiegu: ${tasks.length + data.length}/${INIT_TASKS.length} (Test)`);
      }
      setShowDebugModal(false);
    },

    clearMoods: async () => {
      await supabase.from('moods').delete().eq('user_email', user.email);
      setMoods([]);
      add('Historia nastrojów wyczyszczona (Test)', 'info');
      setShowDebugModal(false);
    },

    generateFakeMoods: async () => {
      const fakeMoods = [];
      const datesToReplace = [];

      for (let i = 14; i >= 0; i--) {
        const d = getNow();
        d.setDate(d.getDate() - i);
        const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        fakeMoods.push({ d: ds, v: Math.floor(Math.random() * 5) + 1, note: "Testowa notatka", user_email: user.email });
        datesToReplace.push(ds);
      }

      try {
        // Usuwamy tylko te kilkanaście dni w tył, nie tykając reszty danych
        await supabase
          .from('moods')
          .delete()
          .eq('user_email', user.email)
          .in('d', datesToReplace);

        const { data, error } = await supabase.from('moods').insert(fakeMoods).select();
        if (error) throw error;

        setMoods(prev => {
          const filtered = prev.filter(m => !datesToReplace.includes(m.d));
          return [...filtered, ...(data || [])].sort((a, b) => a.d.localeCompare(b.d));
        });

        add('Sztuczna historia nastrojów wygenerowana (Test)', 'success');
      } catch (err) {
        console.error(err);
        add('Błąd generowania nastrojów.', 'warn');
      }
      setShowDebugModal(false);
    },

    timeTravelBack: () => {
      setOffsetDays(prev => prev - 1);
      setSelectedDate(d => { const nd = new Date(d); nd.setDate(nd.getDate() - 1); return nd; });
      add('Aplikacja: Przesunięto w czasie o 1 dzień wstecz (Test)', 'info');
    },

    timeTravelForward: () => {
      setOffsetDays(prev => prev + 1);
      setSelectedDate(d => { const nd = new Date(d); nd.setDate(nd.getDate() + 1); return nd; });
      add('Aplikacja: Przesunięto w czasie o 1 dzień do przodu (Test)', 'info');
    }
  };

  useEffect(() => {
    if (view === "landing" && user) setView("app");
  }, [user, view]);

  // --- SKRÓTY KLAWISZOWE: Debug Modal (Shift+D) ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignoruj, gdy użytkownik pisze w polu tekstowym lub nie jest w widoku apki
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
      if (view !== 'app') return;

      // Skrót SHIFT + D (Debug Modal)
      if (e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setShowDebugModal(true);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view]);

  useEffect(() => {
    const nowLocal = getNow();
    const todayStr = `${nowLocal.getFullYear()}-${String(nowLocal.getMonth() + 1).padStart(2, '0')}-${String(nowLocal.getDate()).padStart(2, '0')}`;

    // 1. Sprawdzamy, czy użytkownik zapisał już dziś nastrój
    const moodToday = moods.find(m => m.d === todayStr);

    // 2. Sprawdzamy w pamięci przeglądarki, czy popup już dzisiaj wyskoczył
    const lastPromptDate = localStorage.getItem('wba_last_mood_prompt');

    if (!moodToday && lastPromptDate !== todayStr && !hasPromptedToday) {
      setTimeout(() => {
        setShowMoodModal(true);
        setHasPromptedToday(true);
        // Zapisujemy dzisiejszą datę do localStorage, aby F5 tego nie zresetowało
        localStorage.setItem('wba_last_mood_prompt', todayStr);
      }, 2000);
    }

    // Usunięto kod odpowiedzialny za wyskakiwanie popupu po 5 godzinach, 
    // aby aplikacja pytała o nastrój bezwzględnie raz dziennie.
  }, [moods, hasPromptedToday, getNow]);
  const handleNav = (tab) => {
    // Usunęliśmy stąd blokadę, która otwierała Modal zamiast widoku
    setIsLoading(true);
    setActiveTab(tab);
    setTimeout(() => setIsLoading(false), 800);
  };

  const sortSmartQueue = (tasksList) => {
    const nowLocal = getNow();
    const todayStr = `${nowLocal.getFullYear()}-${String(nowLocal.getMonth() + 1).padStart(2, '0')}-${String(nowLocal.getDate()).padStart(2, '0')}`;
    const lastMood = moods.length > 0 ? moods[moods.length - 1].v : 2;

    const getScore = (task) => {
      // USUNIĘTO: Zrzucanie zrobionych zadań na dno. Teraz wynik zawsze jest taki sam!
      let score = 0;

      if (task.p === "wysoki") score += 30;
      if (task.p === "sredni") score += 20;
      if (task.p === "niski") score += 10;

      if (task.deadline && task.deadline.startsWith(todayStr)) score += 100;

      const match = task.duration ? task.duration.match(/(\d+)/) : null;
      const mins = match ? parseInt(match[1]) : 60;
      if (mins <= 30) score += 5;

      if (lastMood <= 1) {
        score -= (task.difficulty || 0) * 15;
      } else {
        score += (task.difficulty || 0) * 6;
      }
      return score;
    };

    return [...tasksList].sort((a, b) => {
      const diff = getScore(b) - getScore(a);
      if (diff !== 0) return diff;
      return a.id - b.id; // Zapewnia absolutną stabilność kolejności przy remisach
    });
  };

  // --- NOWA LOGIKA: RĘCZNE GENEROWANIE PLANU Z ZAPISEM DO BAZY ---
  const generatePlan = async () => {
    // Godzina startu i długość dnia z preferencji onboardingu
    const parsedStart = user?.prefs?.startTime ? user.prefs.startTime.split(':').map(Number) : [6, 0];
    const timelineStart = parsedStart[0] || 6;
    const workHours = user?.prefs?.hours || 15;
    const dayLimitMins = (timelineStart + workHours) * 60;
    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

    let currentTasks = [...tasks];

    // 1. Wyodrębniamy sztywne bloki (dla selectedDate)
    const lockedBlocks = currentTasks
      .filter(t => t.isLocked && t.t && checkIsDate(t.t, selectedDate))
      .map(t => {
        const match = t.t.match(/(\d{1,2}):(\d{2})/);
        const startMins = match ? parseInt(match[1]) * 60 + parseInt(match[2]) : 0;
        const durMatch = t.duration ? t.duration.match(/(\d+)/) : null;
        const duration = durMatch ? parseInt(durMatch[1]) : 60;
        return { ...t, sMins: startMins, eMins: startMins + duration };
      })
      .sort((a, b) => a.sMins - b.sMins);

    // 2. Resetujemy zadania flex dla bieżącego dnia lub z backlogu
    let updatedTasks = currentTasks.map(t => {
      if (!t.isLocked && (t.pDate === dateStr || !t.pDate)) {
        return { ...t, sMins: null, eMins: null };
      }
      return t;
    });

    // 3. Wypełniamy luki zadaniami z kolejki (flex)
    const flexTasks = updatedTasks
      .filter(t => (t.pDate === dateStr || (!t.pDate && !t.isLocked)) && !t.sMins)
      .sort((a, b) => {
        if (a.p === "wysoki" && b.p !== "wysoki") return -1;
        if (a.p !== "wysoki" && b.p === "wysoki") return 1;
        return 0;
      });

    // Przygotowujemy dane dla każdego elastycznego zadania
    const flexData = flexTasks.map(t => {
      const durMatch = t.duration ? t.duration.match(/(\d+)/) : null;
      const duration = durMatch ? parseInt(durMatch[1]) : 45;
      const visualDuration = Math.max(duration, 45);
      let breakTime = 0;
      if (duration >= 50) {
        breakTime = 17;
      } else if (duration >= 25) {
        breakTime = Math.round((duration / 52) * 17);
      } else {
        breakTime = 3;
      }
      return { ...t, duration, visualDuration, breakTime };
    });

    const placed = new Set(); // ID zadań już umieszczonych w planie

    // Budujemy listę slotów (luk) między zablokowanymi blokami
    const gaps = [];
    let gapStart = timelineStart * 60;
    for (const block of lockedBlocks) {
      if (gapStart < block.sMins) {
        gaps.push({ start: gapStart, end: block.sMins });
      }
      gapStart = Math.max(gapStart, block.eMins);
    }
    // Ostatnia luka po ostatnim zablokowanym bloku do końca dnia
    if (gapStart < dayLimitMins) {
      gaps.push({ start: gapStart, end: dayLimitMins });
    }

    // Dla każdej luki próbujemy wypełnić ją zadaniami z kolejki
    for (const gap of gaps) {
      let pointer = gap.start;
      // Iterujemy po zadaniach w kolejności priorytetu
      for (const ft of flexData) {
        if (placed.has(ft.id)) continue; // już umieszczone

        const neededSpace = ft.visualDuration;
        // Sprawdź czy zadanie mieści się w pozostałej części luki
        if (pointer + neededSpace <= gap.end) {
          const idx = updatedTasks.findIndex(ut => ut.id === ft.id);
          if (idx !== -1) {
            updatedTasks[idx] = { ...updatedTasks[idx], sMins: pointer, eMins: pointer + ft.duration, pDate: dateStr };
          }
          placed.add(ft.id);
          pointer += neededSpace + ft.breakTime;
          // Jeśli pointer po przerwie wykroczył poza lukę, przerywamy tę lukę
          if (pointer >= gap.end) break;
        }
        // Jeśli zadanie się nie mieści, sprawdzamy kolejne (mniejsze) zadania
      }
    }

    // ZAPIS DO SUPABASE I DO STANU LOKALNEGO
    try {
      // Wszystkie zadania w tym momencie pochodzą już z bazy (mają poprawne ID).
      // Zamiast problematycznego 'upsert' na tabeli z 'GENERATED ALWAYS', wykonujemy bezpieczny 'update'.
      const tasksToSync = updatedTasks.filter(t => t.pDate === dateStr || (!t.pDate && !t.isLocked));

      if (tasksToSync.length > 0) {
        await Promise.all(
          tasksToSync.map(async (task) => {
            // Wyciągamy id, a resztę danych wysyłamy do aktualizacji
            const { id, ...taskDataWithoutId } = task;

            const { error } = await supabase
              .from('tasks')
              .update(taskDataWithoutId)
              .eq('id', id);

            if (error) throw error;
          })
        );
      }

      setTasks(updatedTasks);
      add(`Plan dnia (${selectedDate.toLocaleDateString('pl-PL')}) został wygenerowany! ✨`);
    } catch (err) {
      console.error(err);
      add("Nie udało się zapisać planu w bazie danych.", "warn");
    }
  };

  const returnToBacklog = async (id) => {
    try {
      // Resetowanie położenia zadania w Supabase
      const { error } = await supabase
        .from('tasks')
        .update({ sMins: null, eMins: null, pDate: null })
        .eq('id', id);

      if (error) throw error;

      // Po udanym zapisu w bazie - aktualizacja frontendu
      setTasks(prev => prev.map(t => t.id === id ? { ...t, sMins: null, eMins: null, pDate: null } : t));
      add("Zadanie cofnięto do backlogu.");
    } catch (err) {
      console.error(err);
      add("Błąd podczas cofania zadania.", "warn");
    }
  };

  const handleEditMood = async (dateStr, newV, newNote) => {
    const moodData = { d: dateStr, v: newV, note: newNote || "", user_email: user.email };
    const exists = moods.find(m => m.d === dateStr);

    try {
      if (exists) {
        const { error } = await supabase
          .from('moods')
          .update(moodData)
          .eq('d', dateStr)
          .eq('user_email', user.email);
        if (error) throw error;
        setMoods(prev => prev.map(m => m.d === dateStr ? { ...m, ...moodData } : m));
      } else {
        // Upewniamy się, że nie wysyłamy ID przy insercie
        const { id, ...insertData } = moodData;
        const { data, error } = await supabase
          .from('moods')
          .insert(insertData)
          .select();
        if (error) throw error;
        setMoods(prev => [data[0], ...prev]);
      }
      add("Zaktualizowano nastrój dla dnia " + dateStr);
    } catch (err) {
      console.error(err);
      add("Błąd zapisu nastroju.", "warn");
    }
  };

  const toggleTask = async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ done: !task.done })
        .eq('id', id);

      if (error) throw error;

      setTasks(prevTasks => {
        let updated = prevTasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
        return sortSmartQueue(updated);
      });
    } catch (err) {
      console.error(err);
      add("Błąd podczas aktualizacji zadania.", "warn");
    }
  };

  const saveTask = async (t) => {
    let taskToSave = { ...t, user_email: user.email };
    const durMatch = taskToSave.duration ? taskToSave.duration.match(/(\d+)/) : null;
    let durationAlert = false;

    if (durMatch && parseInt(durMatch[1]) < 15) {
      taskToSave.duration = "15 min";
      durationAlert = true;
    }

    try {
      // Oddzielamy id od reszty danych
      const { id, ...taskDataWithoutId } = taskToSave;

      if (taskToSave.id) {
        const { error } = await supabase
          .from('tasks')
          .update(taskDataWithoutId)
          .eq('id', taskToSave.id);
        if (error) throw error;

        setTasks(prev => sortSmartQueue(prev.map(task => task.id === taskToSave.id ? { ...task, ...taskToSave } : task)));
      } else {
        const { data, error } = await supabase
          .from('tasks')
          .insert(taskDataWithoutId)
          .select();
        if (error) throw error;

        setTasks(prev => sortSmartQueue([data[0], ...prev]));
      }

      if (durationAlert) {
        add("Czas minimalny na zadanie to 15 minut. Został on wydłużony do 15.", "warn");
      } else {
        if (t.id) add("Zmiany zostały zapisane.");
        else add("Zadanie dodane pomyślnie!");
      }
    } catch (err) {
      console.error(err);
      add("Błąd zapisu zadania.", "warn");
    }

    setIsTaskModalOpen(false);
    setEditingTask(null);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const deleteTask = async (id) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setTasks(p => p.filter(t => t.id !== id));
      add("Zadanie usunięte.");
    } catch (err) {
      console.error(err);
      add("Błąd podczas usuwania zadania.", "warn");
    }
  };

  const addMood = async (m) => {
    const nowL = getNow();
    const todayStr = `${nowL.getFullYear()}-${String(nowL.getMonth() + 1).padStart(2, '0')}-${String(nowL.getDate()).padStart(2, '0')}`;

    // Oddzielamy 'id' od reszty danych już na samym początku!
    const { id, ...moodDataWithoutId } = { ...m, d: todayStr, user_email: user.email };

    const existingIndex = moods.findIndex(mood => mood.d === todayStr);

    try {
      if (existingIndex >= 0) {
        const { error } = await supabase
          .from('moods')
          .update(moodDataWithoutId)
          .eq('d', todayStr)
          .eq('user_email', user.email);
        if (error) throw error;

        setMoods(prev => {
          const newMoods = [...prev];
          newMoods[existingIndex] = { ...newMoods[existingIndex], v: m.v, note: m.note };
          return newMoods;
        });
      } else {
        const { data, error } = await supabase
          .from('moods')
          .insert(moodDataWithoutId)
          .select();
        if (error) throw error;
        setMoods(prev => [...prev, data[0]]);
      }
      add("Twój nastrój został zapisany.");
    } catch (err) {
      console.error(err);
      add("Błąd zapisu nastroju.", "warn");
    }
  };

  if (view === "landing") return <><Font /><Landing onCTA={(mode) => { setAuthMode(mode); setView("auth"); }} /></>;
  // Zmieniono: Usuwamy setView("onboarding"), aby useEffect mógł sprawdzić bazę przed decyzją
  if (view === "auth") return <><Font /><AuthView mode={authMode} onSwitch={setAuthMode} onBack={() => setView("landing")} onAuth={(u) => setUser(u)} /></>;
  if (view === "onboarding") return (
    <>
      <Font />
      <Onboarding onComplete={async (prefs) => {
        try {
          // Zapisz preferencje w Supabase przed wejściem do aplikacji
          const { error } = await supabase
            .from('profiles')
            .upsert({ email: user.email, prefs });

          if (error) throw error;

          setUser({ ...user, prefs });
          setView("app");
          add("Ustawienia zostały zapisane!");
        } catch (err) {
          console.error(err);
          add("Nie udało się zapisać ustawień onboardingu.", "warn");
        }
      }} />
    </>
  );

  return (
    <div className="flex h-screen bg-[#F5EFE6] font-sans selection:bg-[#2D9E6B] selection:text-white overflow-hidden">
      <Font />
      <Toasts ts={ts} rm={rm} />

      {focusedTask ? (
        <FocusModeView
          task={focusedTask}
          onClose={() => setFocusedTask(null)}
          onComplete={(id) => { toggleTask(id); setFocusedTask(null); add("Świetna robota! Zadanie ukończone."); }}
        />
      ) : (
        <>
          <Sidebar
            active={activeTab}
            onNav={handleNav}
            user={user}
            onLogout={() => { setUser(null); setView("landing"); }}
            collapsed={isSidebarCollapsed}
            setCollapsed={setSidebarCollapsed}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            todayDate={getNow()}
            activeAlert={activeAlert}
            onDismissAlert={() => setDismissedAlertKey(currentAlertKey)}
          />
          <main className="flex-1 overflow-y-auto relative bg-[#FAFAFA]">
            {/* NOWY HEADER RESPANSYWNY */}
            <header className="w-full px-4 md:px-6 py-3 md:py-4 flex items-center justify-between border-b border-[#E8DDD0] bg-white sticky top-0 z-[60]">
              <div className="flex items-center space-x-2 md:space-x-4 truncate">
                <span className="text-lg md:text-xl font-bold text-[#164229] flex items-baseline gap-1 md:gap-2 truncate">
                  <span className="truncate">Cześć {user?.name ? user.name.split(' ')[0] : "Natalia"},</span>
                  <span className="capitalize text-sm md:text-lg text-[#5A7368] font-medium hidden sm:inline">{getNow().toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                </span>
              </div>

              <div className="flex items-center space-x-3 md:space-x-5 flex-shrink-0">
                {/* Streak i Tracker - widoczne tylko od tabletów w górę */}
                <div className="hidden md:flex items-center bg-[#F3F4F6] rounded-full px-6 py-2 space-x-5">
                  <div className="hidden lg:flex items-center space-x-2">
                    {[
                      { d: 'Pon', checked: true },
                      { d: 'Wt', checked: true },
                      { d: 'Śr', checked: true },
                      { d: 'Czw', checked: true },
                      { d: 'Pt', checked: false },
                      { d: 'Sb', checked: false },
                      { d: 'Ndz', checked: false },
                    ].map((day, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        {day.checked ? (
                          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[#50C878] text-white">
                            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border-[1.5px] border-dashed border-[#D1D5DB]"></div>
                        )}
                        <span className="text-[9px] text-[#6B7280] mt-0.5 text-center">{day.d}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xl drop-shadow-sm filter">🔥</span>
                    <span className="text-xl font-bold text-gray-800">{tasks.some(t => t.done) ? 13 : 12}</span>
                  </div>
                </div>

                {/* Profil - ikona widoczna zawsze, imię chowane na mobile */}
                <div className="flex items-center relative">
                  <button onClick={() => setProfileMenuOpen(!profileMenuOpen)} className="flex items-center space-x-2 focus:outline-none bg-[#F3F4F6] md:bg-transparent p-1 md:p-0 rounded-full">
                    <svg className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" fill="none" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="20" cy="20" fill="#E5E7EB" r="20" />
                      <path d="M20 20C22.2091 20 24 18.2091 24 16C24 13.7909 22.2091 12 20 12C17.7909 12 16 13.7909 16 16C16 18.2091 17.7909 20 20 20Z" fill="#9CA3AF" />
                      <path d="M20 22C15.5817 22 12 25.5817 12 30H28C28 25.5817 24.4183 22 20 22Z" fill="#9CA3AF" />
                    </svg>
                    <span className="hidden md:block text-xs font-medium text-gray-800">{user?.name || "Natalia"}</span>
                  </button>

                  <div className={`absolute top-full right-0 mt-3 w-40 bg-white rounded-2xl shadow-xl border border-[#E8DDD0] py-2 z-[100] origin-top-right transition-all duration-200 ease-out ${profileMenuOpen ? 'opacity-100 scale-100 translate-y-0 visible' : 'opacity-0 scale-95 -translate-y-2 invisible'}`}>
                    <button
                      onClick={() => {
                        localStorage.clear();
                        window.location.reload();
                      }}
                      className="w-full px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 flex items-center justify-center gap-2 transition-all"
                    >
                      <LogOut size={16} /> Wyloguj mnie
                    </button>
                  </div>
                </div>
              </div>
            </header>

            <div className="w-full">
              {activeTab === "dashboard" && (
                <DashboardView
                  tasks={tasks}
                  moods={moods}
                  selectedDate={selectedDate}
                  onChangeDate={(offset) => setSelectedDate(d => { const nd = new Date(d); nd.setDate(d.getDate() + offset); return nd; })}
                  onToggle={toggleTask}
                  onOpenTaskModal={() => { setEditingTask(null); setIsTaskModalOpen(true); }}
                  onEditTask={handleEditTask}
                  onDelete={deleteTask}
                  onReturnToBacklog={returnToBacklog}
                  onFocusTask={setFocusedTask}
                  onAlert={() => {
                    add("Wykryto sygnał ostrzegawczy. Przejdź do Systemu Ostrzegania.", "warn");
                    handleNav("warning");
                  }}
                  loading={isLoading}
                  onGeneratePlan={generatePlan}
                  userPrefs={user?.prefs}
                />
              )}
              {activeTab === "calendar" && (
                <CalendarView
                  tasks={tasks}
                  selectedDate={selectedDate}
                  onChangeDate={(offset) => setSelectedDate(d => { const nd = new Date(d); nd.setDate(d.getDate() + offset); return nd; })}
                  onToggle={toggleTask}
                  onDelete={deleteTask}
                  onFocusTask={setFocusedTask}
                  onEditTask={handleEditTask}
                  loading={isLoading}
                />
              )}

              {activeTab === "mood" && (
                <MoodView
                  moods={moods}
                  onOpenModal={() => setShowMoodModal(true)}
                  onEditMood={handleEditMood}
                  todayDate={getNow()}
                />
              )}
              {activeTab === "warning" && <WarningView loading={isLoading} user={user} />}
            </div>
          </main>

          {isTaskModalOpen && (
            <TaskModal
              onClose={() => { setIsTaskModalOpen(false); setEditingTask(null); }}
              onSave={saveTask}
              taskToEdit={editingTask}
            />
          )}

          {showMoodModal && <MoodModal onClose={() => setShowMoodModal(false)} onAdd={addMood} />}
          {showDebugModal && <DebugModal onClose={() => setShowDebugModal(false)} actions={debugActions} />}
        </>
      )}
    </div>
  );
}