// ═══════════════════════════════════════════════════
//  CONSTANTS & CONFIG
// ═══════════════════════════════════════════════════
export const BURNOUT_KW = [
  "nie mam siły", "przytłacza", "koniec z tym", "dość", "nie mogę",
  "wypalenie", "rezygnuję", "za dużo", "zmęczony", "zmęczona",
  "załamanie", "beznadziejna", "desperacja", "płaczę", "nie daję rady"
];

export const PRIOS = [
  { id: "niski", label: "niski priorytet", tw: "bg-green-100 text-green-700", dot: "bg-green-400" },
  { id: "sredni", label: "średni priorytet", tw: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-400" },
  { id: "wysoki", label: "wysoki priorytet", tw: "bg-red-100 text-red-700", dot: "bg-red-400" },
];
export const CONTACTS = [
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
export const EMOJIS = ["😫", "😟", "😐", "🙂", "😊", "😄", "🤩"];
export const MOOD_L = [
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

export const INIT_MOODS = generateHistoricalMoods();




export const DAYS = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sb", "Ndz"];

import { todayYMD, todayPL, day2YMD, day2PL, day3YMD, day3PL, day4YMD, day4PL, day5YMD, day5PL, in3HoursTime } from "./dateHelpers";

export const INIT_TASKS = [
  // --- DZIEŃ 1 (DZISIAJ) ---
  { id: 1, title: "Zaplanowanie pierwszego tygodnia", w: 2, p: "niski", done: false, duration: "15 min", deadline: "", difficulty: 1, desc: "Przegląd funkcji aplikacji.", isLocked: false, t: "", pDate: todayYMD, sMins: null, eMins: null },
  { id: 2, title: "Wysłanie raportu do szefa", w: 7, p: "wysoki", done: false, duration: "45 min", deadline: `${todayYMD} o ${in3HoursTime}`, difficulty: 4, desc: "Zestawienie danych.", isLocked: false, t: "", pDate: todayYMD, sMins: null, eMins: null },
  { id: 3, title: "Konsultacje projektowe", w: 6, p: "sredni", done: false, duration: "60 min", deadline: "", difficulty: 3, desc: "Postępy w projekcie.", isLocked: true, t: `🔒 11:00 (${todayPL})`, pDate: todayYMD, sMins: 660, eMins: 720 },
  { id: 4, title: "Projektowanie architektury", w: 10, p: "wysoki", done: false, duration: "180 min", deadline: `${day2YMD} o 12:00`, difficulty: 5, desc: "Tryb Focus Mode.", isLocked: false, t: "", pDate: todayYMD, sMins: null, eMins: null },
  { id: 5, title: "Mindfulness", w: 2, p: "niski", done: false, duration: "20 min", deadline: "", difficulty: 1, desc: "Chwila dla siebie.", isLocked: true, t: `🔒 08:30 (${todayPL}) 🔁 codziennie`, pDate: todayYMD, sMins: 510, eMins: 530 },
  { id: 6, title: "Pilny telefon do klienta", w: 5, p: "wysoki", done: false, duration: "10 min", deadline: `${todayYMD} o 16:00`, difficulty: 3, desc: "Wyjaśnienie uwag do faktury.", isLocked: false, t: "", pDate: todayYMD, sMins: null, eMins: null },
  { id: 7, title: "Zakupy spożywcze", w: 3, p: "niski", done: false, duration: "40 min", deadline: "", difficulty: 2, desc: "Lista na lodówce.", isLocked: false, t: "", pDate: todayYMD, sMins: null, eMins: null },
  { id: 8, title: "Podlewanie roślin", w: 1, p: "niski", done: false, duration: "10 min", deadline: "", difficulty: 1, desc: "Nie zapomnij o paprotce.", isLocked: false, t: "", pDate: todayYMD, sMins: null, eMins: null },
  // --- DZIEŃ 2 ---
  { id: 9, title: "Analiza konkurencji", w: 6, p: "sredni", done: false, duration: "90 min", deadline: `${day2YMD} o 17:00`, difficulty: 4, desc: "Przygotowanie tabeli porównawczej.", isLocked: false, t: "", pDate: day2YMD, sMins: null, eMins: null },
  { id: 10, title: "Joga wieczorna‍♀️", w: 2, p: "niski", done: false, duration: "30 min", deadline: "", difficulty: 1, desc: "Rozciąganie po pracy.", isLocked: true, t: `🔒 20:00 (${day2PL})`, pDate: day2YMD, sMins: 1200, eMins: 1230 },
  { id: 11, title: "Sprzątanie biurka", w: 2, p: "niski", done: false, duration: "15 min", deadline: "", difficulty: 1, desc: "Organizacja przestrzeni pracy.", isLocked: false, t: "", pDate: day2YMD, sMins: null, eMins: null },
  { id: 12, title: "Testowanie modułu logowania", w: 8, p: "wysoki", done: false, duration: "45 min", deadline: `${day2YMD} o 10:00`, difficulty: 4, desc: "Sprawdzenie błędów walidacji.", isLocked: false, t: "", pDate: day2YMD, sMins: null, eMins: null },
  // --- DZIEŃ 3 ---
  { id: 13, title: "Briefing poranny", w: 4, p: "sredni", done: false, duration: "15 min", deadline: "", difficulty: 2, desc: "Szybkie statusy.", isLocked: true, t: `🔒 07:00 (${day3PL})`, pDate: day3YMD, sMins: 420, eMins: 435 },
  { id: 14, title: "Nauka nowego frameworka", w: 7, p: "sredni", done: false, duration: "120 min", deadline: "", difficulty: 4, desc: "Kurs na Udemy.", isLocked: false, t: "", pDate: day3YMD, sMins: null, eMins: null },
  { id: 15, title: "Czytanie książki", w: 2, p: "niski", done: false, duration: "45 min", deadline: "", difficulty: 1, desc: "Dobrostan psychiczny.", isLocked: false, t: "", pDate: day3YMD, sMins: null, eMins: null },
  { id: 16, title: "Webinar o AI", w: 5, p: "niski", done: false, duration: "60 min", deadline: `${day3YMD} o 15:00`, difficulty: 3, desc: "Nowości w GPT-5.", isLocked: false, t: "", pDate: day3YMD, sMins: null, eMins: null },
  // --- DZIEŃ 4 ---
  { id: 17, title: "Wizyta u dentysty", w: 5, p: "wysoki", done: false, duration: "60 min", deadline: "", difficulty: 3, desc: "Kontrola okresowa.", isLocked: true, t: `🔒 14:30 (${day4PL})`, pDate: day4YMD, sMins: 870, eMins: 930 },
  { id: 18, title: "Przygotowanie prezentacji", w: 9, p: "wysoki", done: false, duration: "120 min", deadline: `${day5YMD} o 09:00`, difficulty: 4, desc: "Slajdy na zarząd.", isLocked: false, t: "", pDate: day4YMD, sMins: null, eMins: null },
  { id: 19, title: "Przegląd finansów", w: 4, p: "sredni", done: false, duration: "40 min", deadline: "", difficulty: 3, desc: "Budżet domowy.", isLocked: false, t: "", pDate: day4YMD, sMins: null, eMins: null },
  { id: 20, title: "Odpowiedź na feedback", w: 3, p: "sredni", done: false, duration: "20 min", deadline: `${day4YMD} o 18:00`, difficulty: 2, desc: "Maile od zespołu HR.", isLocked: false, t: "", pDate: day4YMD, sMins: null, eMins: null },
  // --- DZIEŃ 5 ---
  { id: 21, title: "Spacer w lesie", w: 1, p: "niski", done: false, duration: "60 min", deadline: "", difficulty: 1, desc: "Pełny reset.", isLocked: false, t: "", pDate: day5YMD, sMins: null, eMins: null },
  { id: 22, title: "Naprawa kranu", w: 5, p: "niski", done: false, duration: "30 min", deadline: "", difficulty: 3, desc: "Cieknie w kuchni.", isLocked: false, t: "", pDate: day5YMD, sMins: null, eMins: null },
  { id: 23, title: "Obiad z rodziną", w: 2, p: "niski", done: false, duration: "90 min", deadline: "", difficulty: 1, desc: "Wspólny czas.", isLocked: true, t: `🔒 13:00 (${day5PL})`, pDate: day5YMD, sMins: 780, eMins: 870 },
  { id: 24, title: "Planowanie kolejnego sprintu", w: 6, p: "sredni", done: false, duration: "60 min", deadline: `${day5YMD} o 16:00`, difficulty: 3, desc: "Zaległości z backlogu.", isLocked: false, t: "", pDate: day5YMD, sMins: null, eMins: null },
  { id: 25, title: "Trening cardio", w: 4, p: "sredni", done: false, duration: "45 min", deadline: "", difficulty: 4, desc: "Poprawa kondycji.", isLocked: false, t: "", pDate: day5YMD, sMins: null, eMins: null },
  // --- BACKLOG ---
  { id: 26, title: "Zrobienie prania", w: 2, p: "niski", done: false, duration: "15 min", deadline: "", difficulty: 1, desc: "Szybki program na 30 stopni.", isLocked: false, t: "", pDate: null, sMins: null, eMins: null },
  { id: 27, title: "Raport kwartalny Q3", w: 9, p: "wysoki", done: false, duration: "120 min", deadline: `${day3YMD} o 15:00`, difficulty: 5, desc: "Wymaga pełnego skupienia.", isLocked: false, t: "", pDate: null, sMins: null, eMins: null },
  { id: 28, title: "Wieczorna medytacja", w: 2, p: "niski", done: false, duration: "20 min", deadline: "", difficulty: 1, desc: "Wyciszenie przed snem.", isLocked: true, t: `🔒 21:30 (${todayPL}) 🔁 codziennie`, pDate: null, sMins: 1290, eMins: 1310 },
  { id: 29, title: "Spotkanie 1:1 z szefem", w: 7, p: "wysoki", done: false, duration: "30 min", deadline: "", difficulty: 3, desc: "Rozmowa o podwyżce.", isLocked: true, t: `🔒 10:00 (${day2PL})`, pDate: null, sMins: 600, eMins: 630 },
  { id: 30, title: "Przegląd subskrypcji i opłaty", w: 4, p: "sredni", done: true, duration: "45 min", deadline: "", difficulty: 2, desc: "Anulować Netflixa.", isLocked: false, t: "", pDate: null, sMins: null, eMins: null },
  { id: 31, title: "Trening siłowy", w: 6, p: "sredni", done: false, duration: "60 min", deadline: "", difficulty: 4, desc: "Dzień nóg.", isLocked: true, t: `🔒 18:00 (${todayPL}) 🔁 co tydzień`, pDate: null, sMins: 1080, eMins: 1140 },
  { id: 32, title: "Aktualizacja CV", w: 5, p: "sredni", done: false, duration: "90 min", deadline: `${day4YMD} o 23:59`, difficulty: 3, desc: "Dopisać nowy projekt.", isLocked: false, t: "", pDate: null, sMins: null, eMins: null },
  { id: 33, title: "Telefon do babci", w: 8, p: "wysoki", done: true, duration: "20 min", deadline: "", difficulty: 1, desc: "Zapytać o zdrowie.", isLocked: false, t: "", pDate: null, sMins: null, eMins: null },
  { id: 34, title: "Odpisywanie na zaległe maile", w: 4, p: "niski", done: false, duration: "30 min", deadline: "", difficulty: 2, desc: "Inbox Zero.", isLocked: false, t: "", pDate: null, sMins: null, eMins: null },
  { id: 35, title: "Głęboka praca nad kodem", w: 10, p: "wysoki", done: false, duration: "180 min", deadline: "", difficulty: 5, desc: "Implementacja nowego algorytmu.", isLocked: true, t: `🔒 10:30 (${day3PL})`, pDate: day3YMD, sMins: 630, eMins: 810 },
  { id: 36, title: "Rozpisanie diety", w: 3, p: "sredni", done: false, duration: "40 min", deadline: "", difficulty: 2, desc: "Lista posiłków.", isLocked: false, t: "", pDate: null, sMins: null, eMins: null },
  { id: 37, title: "Posprzątanie pulpitu", w: 1, p: "niski", done: false, duration: "10 min", deadline: "", difficulty: 1, desc: "Usunięcie starych screenów.", isLocked: false, t: "", pDate: null, sMins: null, eMins: null },
  { id: 38, title: "Wymiana żarówek w przedpokoju", w: 2, p: "niski", done: false, duration: "15 min", deadline: "", difficulty: 1, desc: "Kupić ciepłe światło.", isLocked: false, t: "", pDate: null, sMins: null, eMins: null },
  { id: 39, title: "Obejrzenie wykładu z psychologii", w: 5, p: "sredni", done: false, duration: "90 min", deadline: `${day5YMD} o 12:00`, difficulty: 4, desc: "Zrobić notatki.", isLocked: false, t: "", pDate: null, sMins: null, eMins: null },
  { id: 40, title: "Wyjście z psem do parku", w: 3, p: "wysoki", done: false, duration: "45 min", deadline: "", difficulty: 1, desc: "Więcej ruchu na świeżym powietrzu.", isLocked: true, t: `🔒 16:30 (${todayPL})`, pDate: todayYMD, sMins: 990, eMins: 1035 },
  { id: 41, title: "Analiza błędów w aplikacji", w: 8, p: "wysoki", done: false, duration: "120 min", deadline: `${todayYMD} o 18:00`, difficulty: 5, desc: "Przejrzeć logi z Sentry.", isLocked: false, t: "", pDate: null, sMins: null, eMins: null },
  { id: 42, title: "Wizyta w urzędzie", w: 7, p: "wysoki", done: false, duration: "90 min", deadline: "", difficulty: 3, desc: "Odbiór dokumentów.", isLocked: true, t: `🔒 11:30 (${day4PL})`, pDate: day4YMD, sMins: 690, eMins: 780 },
  { id: 43, title: "Przesadzenie Monstery", w: 2, p: "niski", done: false, duration: "40 min", deadline: "", difficulty: 2, desc: "Nowa ziemia i doniczka.", isLocked: false, t: "", pDate: null, sMins: null, eMins: null },
  { id: 44, title: "Burza mózgów - marketing", w: 6, p: "sredni", done: false, duration: "60 min", deadline: "", difficulty: 4, desc: "5 nowych kampanii.", isLocked: false, t: "", pDate: null, sMins: null, eMins: null },
  { id: 45, title: "Wieczorny spacer (Odcięcie)", w: 2, p: "niski", done: false, duration: "30 min", deadline: "", difficulty: 1, desc: "Bez telefonu i słuchawek.", isLocked: true, t: `🔒 20:30 (${day2PL})`, pDate: day2YMD, sMins: 1230, eMins: 1260 },
  { id: 46, title: "Zaplanowanie wyjazdu na weekend", w: 3, p: "niski", done: false, duration: "60 min", deadline: "", difficulty: 2, desc: "Zarezerwować nocleg.", isLocked: false, t: "", pDate: null, sMins: null, eMins: null },
  { id: 47, title: "Szybki power nap", w: 1, p: "niski", done: true, duration: "20 min", deadline: "", difficulty: 1, desc: "Regeneracja mózgu.", isLocked: false, t: "", pDate: null, sMins: null, eMins: null },
  { id: 48, title: "Przejrzenie rachunków", w: 4, p: "sredni", done: false, duration: "25 min", deadline: `${day2YMD} o 10:00`, difficulty: 3, desc: "Domowy budżet w Excelu.", isLocked: false, t: "", pDate: null, sMins: null, eMins: null },
  { id: 49, title: "Składanie mebli z IKEA", w: 5, p: "sredni", done: false, duration: "120 min", deadline: "", difficulty: 4, desc: "Nowa komoda.", isLocked: false, t: "", pDate: null, sMins: null, eMins: null },
  { id: 50, title: "Wdrożenie zmian na produkcję", w: 9, p: "wysoki", done: false, duration: "45 min", deadline: "", difficulty: 5, desc: "Krytyczny proces.", isLocked: true, t: `🔒 06:00 (${day5PL})`, pDate: day5YMD, sMins: 360, eMins: 405 }
];

export const APP_FAQS = [
  { q: "Jak działa system punktów i roślinka (Streak)?", a: "Za każde odhaczone zadanie zyskujesz XP. Konsekwentne realizowanie planu sprawia, że Twoja wirtualna roślinka rośnie. Gdy zamkniesz 100% dziennego planu - rozkwitnie w pełni!" },
  { q: "Czy moje dane i wpisy nastrojów są prywatne?", a: "Absolutnie tak. Aplikacja dba o Twoje bezpieczeństwo, a wpisy o Twoim samopoczuciu nie są nigdzie udostępniane (np. do działów HR). Zostały stworzone wyłącznie do Twojego wglądu." },
  { q: "Jak zintegrować aplikację z Kalendarzem Google?", a: "W Ustawieniach kliknij przycisk 'Synchronizuj Kalendarz'. Zaloguj się na konto Google, a aplikacja automatycznie zablokuje w Twoim harmonogramie czas na Twoje spotkania i wykłady." },
  { q: "Co oznaczają kolory kropek przy zadaniach?", a: "Czerwony to priorytet wysoki (najważniejsze), żółty to priorytet średni, a zielony to priorytet niski. Aplikacja zawsze sortuje zadania od najważniejszych na górze." },
  { q: "Co się stanie po usunięciu konta?", a: "Konto zostanie trwale usunięte wraz ze wszystkimi zadaniami, statystykami i wpisami o nastroju. Operacji tej nie można cofnąć." },
  { q: "Gdzie znajdę profesjonalną pomoc psychologiczną?", a: "W zakładce 'Pomoc' (ikona parasola) znajduje się baza zaufanych, darmowych telefonów zaufania. Aplikacja zasugeruje Ci tę zakładkę przy wykryciu spadku formy." },
  { q: "Jak edytować zaplanowane zadanie?", a: "Wystarczy kliknąć na nazwę zadania na głównej liście lub kalendarzu, aby otworzyć okno edycji szczegółów (czasu, priorytetu, trudności)." },
  { q: "Gdzie mogę zmienić swój dzienny czas pracy?", a: "Przejdź do zakładki 'Ustawienia' (ikona koła zębatego) i użyj przycisków +/- w sekcji 'Czas pracy', aby dopasować go do obecnych potrzeb." },
  { q: "Jak działają Poprawiacze Nastroju?", a: "Wybierasz je w Ustawieniach (np. spacer, kawa). Jeśli Twój nastrój drastycznie spadnie, aplikacja zaproponuje Ci krótką przerwę na wybraną przez Ciebie aktywność." },
  { q: "Gdzie sprawdzę moje statystyki?", a: "W zakładce 'Analityka' (ikona wykresu) znajdziesz wizualizację trendów Twojego nastroju oraz historii wykonywania zadań w czasie." },
  { q: "Co oznacza wskaźnik 'Trudność' zadania?", a: "Trudność (1-5) pomaga algorytmowi w rozłożeniu sił na cały dzień. Najtrudniejsze zadania proponowane są w godzinach Twojej najwyższej produktywności." },
  { q: "Jak długo przechowywane są moje dane?", a: "Dane są bezpiecznie zapisywane w zabezpieczonej bazie Supabase. Zgodnie z naszą polityką, w przypadku nieużywania aplikacji, dane są trwale usuwane z serwera po 60 dniach." },
  { q: "Czy mogę używać aplikacji na telefonie?", a: "Tak! Interfejs aplikacji jest w 100% responsywny i automatycznie dostosowuje swój układ do ekranów smartfonów oraz tabletów." },
  { q: "Jak zaplanować zadanie na inny dzień?", a: "Podczas dodawania nowego zadania, w polu terminu lub kalendarza wybierz datę w przyszłości. Zadanie pojawi się na liście dopiero w wybranym dniu." },
  { q: "Co się stanie, jeśli nie wykonam całego planu?", a: "Niewykonane zadania nie przepadają. Zostają przeniesione do zakładki zaległych (Backlog), skąd możesz je ponownie zaplanować na kolejny dzień." },
  { q: "Dlaczego aplikacja pyta o mój nastrój?", a: "Codzienny wpis o samopoczuciu to kluczowy element przeciwdziałania wypaleniu zawodowemu. Dzięki temu system 'uczy się' Twoich spadków formy." },
  { q: "Kto ma wgląd w moje notatki o nastroju?", a: "Tylko i wyłącznie Ty. Architektura systemu gwarantuje zachowanie poufności informacji (brak dostępu dla administracji uczelni)." },
  { q: "Czy mogę dodać własne typy priorytetów?", a: "Obecnie system korzysta ze zoptymalizowanej skali trzech priorytetów (Wysoki, Średni, Niski), aby zapobiec paraliżowi analitycznemu." }
];
