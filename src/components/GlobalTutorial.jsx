import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTutorials } from "../hooks/useTutorials";

const TUTORIAL_STEPS = [
  // --- SAMOUCZEK MENU GŁÓWNEGO (NAWIGACJA) ---
  {
    id: "nav_dashboard",
    title: "Strona główna (Plan dnia)",
    desc: "Twój główny panel z harmonogramem dnia, roślinką postępu i listą zaplanowanych zadań.",
    targetIdDesktop: "tutorial-nav-dashboard",
    targetIdMobile: "tutorial-mobile-nav-dashboard",
    placement: "right",
    screen: "dashboard"
  },
  {
    id: "nav_calendar",
    title: "Kalendarz",
    desc: "Przejrzysty widok miesięczny i tygodniowy. Pozwala planować zadania w przód i kontrolować obciążenie.",
    targetIdDesktop: "tutorial-nav-calendar",
    targetIdMobile: "tutorial-mobile-nav-calendar",
    placement: "right",
    screen: "dashboard"
  },
  {
    id: "nav_mood",
    title: "Monitor nastroju",
    desc: "Codzienne rejestrowanie samopoczucia i energii. Pomaga aplikacji lepiej dopasowywać tempo pracy do Twojego stanu.",
    targetIdDesktop: "tutorial-nav-mood",
    targetIdMobile: "tutorial-mobile-nav-mood",
    placement: "right",
    screen: "dashboard"
  },
  {
    id: "nav_warning",
    title: "Centrum pomocy i alerty",
    desc: "Wsparcie w momentach przeciążenia lub spadku motywacji oraz przydatne wskazówki wellbeingowe.",
    targetIdDesktop: "tutorial-nav-warning",
    targetIdMobile: "tutorial-mobile-nav-warning",
    placement: "right",
    screen: "dashboard"
  },
  {
    id: "nav_settings",
    title: "Ustawienia",
    desc: "Dostosuj preferencje aplikacji, godziny pracy, integrację z Kalendarzem Google i swoje konto.",
    targetIdDesktop: "tutorial-nav-settings",
    targetIdMobile: "tutorial-mobile-nav-settings",
    placement: "right",
    screen: "dashboard"
  },

  // --- SAMOUCZEK EKRANU GŁÓWNEGO (DASHBOARD) ---
  {
    id: "dashboard_date_nav",
    title: "Nawigacja po dniach",
    desc: "Służy po to, aby dokładnie ustawić sobie plan i wprowadzić zmiany w poszczególne dni.",
    targetIdDesktop: "tutorial-date-nav",
    targetIdMobile: "tutorial-date-nav",
    placement: "bottom",
    screen: "dashboard"
  },
  {
    id: "dashboard_generate_plan",
    title: "Generuj plan",
    desc: "Nasz algorytm ułoży optymalny plan dnia, biorąc pod uwagę parametry zadań: ich ważność, deadline oraz Twoje aktualne samopoczucie.",
    targetIdDesktop: "tutorial-generate-plan",
    targetIdMobile: "tutorial-mobile-generate-plan",
    placement: "bottom",
    screen: "dashboard"
  },
  {
    id: "dashboard_generate_plan_ai",
    title: "Wygeneruj plan AI",
    desc: "Dla maksymalnej personalizacji użyj AI. Sztuczna inteligencja przeanalizuje Twój dzień i inteligentnie dostosuje harmonogram zadań (koszt: 1 moneta).",
    targetIdDesktop: "tutorial-desktop-generate-plan-ai",
    targetIdMobile: "tutorial-mobile-generate-plan-ai",
    placement: "bottom",
    screen: "dashboard"
  },
  {
    id: "dashboard_add_task",
    title: "Dodaj zadanie",
    desc: "Tutaj szybko dodasz nowe zadania do swojego planu.",
    targetIdDesktop: "tutorial-add-task",
    targetIdMobile: "tutorial-mobile-add-task",
    placement: "bottom",
    screen: "dashboard"
  },
  {
    id: "dashboard_backlog",
    title: "Zadania poza planem (Backlog)",
    desc: "Tutaj trafiają zadania dodane bez określonej godziny. Możesz je w każdej chwili podejrzeć, a kliknięcie 'Generuj plan' automatycznie wpasuje je w Twój dzień.",
    targetIdDesktop: "tutorial-backlog",
    targetIdMobile: "tutorial-backlog",
    placement: "top",
    screen: "dashboard"
  },
  {
    id: "dashboard_streak_plant",
    title: "Roślinka Streaku",
    desc: "Wykonuj zadania, aby ją rozwijać! Zdobywaj XP za każde zrealizowane zadanie, a po osiągnięciu 100% roślinka zakwitnie.",
    targetIdDesktop: "tutorial-streak-plant",
    targetIdMobile: "tutorial-streak-plant",
    placement: "top",
    screen: "dashboard"
  },
  {
    id: "header_help",
    title: "Centrum pomocy (?)",
    desc: "Jeśli chciałbyś sobie kiedyś przypomnieć działanie aplikacji, kliknij tutaj, aby ponownie odtworzyć samouczek na danym ekranie.",
    targetIdDesktop: "tutorial-header-help",
    targetIdMobile: "tutorial-mobile-header-help",
    placement: "bottom",
    screen: "dashboard"
  },
  {
    id: "header_streak",
    title: "Dni serii (Streak)",
    desc: "Każdy dzień z rzędu, w którym wykonasz przynajmniej jedno zadanie, zwiększa Twoją serię. Utrzymuj ogień!",
    targetIdDesktop: "tutorial-header-streak",
    targetIdMobile: "tutorial-mobile-header-streak",
    placement: "bottom",
    screen: "dashboard"
  },
  {
    id: "header_ai_tokens",
    title: "Monety AI",
    desc: "Waluta do funkcji AI, którą zdobywasz m.in. za codzienne logowanie i utrzymywanie serii. Wykorzystuj ją do inteligentnego planowania!",
    targetIdDesktop: "tutorial-header-ai-tokens",
    targetIdMobile: "tutorial-mobile-header-ai-tokens",
    placement: "bottom",
    screen: "dashboard"
  },
  {
    id: "header_profile",
    title: "Twój profil",
    desc: "Możesz się tu wylogować, połączyć z Kalendarzem Google oraz przejść do Ustawień konta.",
    targetIdDesktop: "tutorial-header-profile",
    targetIdMobile: "tutorial-mobile-header-profile",
    placement: "bottom-left",
    screen: "dashboard"
  },

  // --- SAMOUCZEK EKRANU KALENDARZA (CALENDAR) ---
  {
    id: "calendar_month_picker",
    title: "Wybór miesiąca i roku",
    desc: "Kliknij tutaj, aby błyskawicznie przeskoczyć do dowolnego miesiąca lub roku i sprawdzić swój harmonogram.",
    targetIdDesktop: "tutorial-calendar-month-picker",
    targetIdMobile: "tutorial-mobile-calendar-month-picker",
    placement: "bottom",
    screen: "calendar"
  },
  {
    id: "calendar_view_type",
    title: "Widok: Dzień, Tydzień, Miesiąc",
    desc: "Dostosuj perspektywę kalendarza do swoich potrzeb – szczegółowy podgląd godzinowy dnia, układ tygodniowy lub pełna siatka miesiąca.",
    targetIdDesktop: "tutorial-calendar-view-type",
    targetIdMobile: "tutorial-mobile-calendar-month-picker",
    placement: "bottom",
    screen: "calendar"
  },
  {
    id: "calendar_today_btn",
    title: "Przycisk 'Dzisiaj'",
    desc: "Niezależnie od tego, w jak odległą datę klikniesz, ten przycisk natychmiast przeniesie Cię z powrotem do dzisiejszego dnia.",
    targetIdDesktop: "tutorial-calendar-today-btn",
    targetIdMobile: "tutorial-mobile-calendar-nav",
    placement: "bottom",
    screen: "calendar"
  },
  {
    id: "calendar_nav_arrows",
    title: "Przełączanie okresów",
    desc: "Przechodź wygodnie do poprzedniego lub kolejnego miesiąca / tygodnia / dnia. Na telefonie możesz też po prostu przesuwać palcem w lewo lub w prawo (swipe)!",
    targetIdDesktop: "tutorial-calendar-nav-arrows",
    targetIdMobile: "tutorial-mobile-calendar-nav",
    placement: "bottom-left",
    screen: "calendar"
  },
  {
    id: "calendar_month_grid",
    title: "Siatka zadań i planowanie",
    desc: "Kliknij dowolny dzień, aby wejść w jego szczegóły. Na komputerze możesz też przeciągać i upuszczać zadania bezpośrednio między dniami!",
    targetIdDesktop: "tutorial-calendar-month-grid",
    targetIdMobile: "tutorial-calendar-month-grid",
    placement: "top",
    screen: "calendar"
  },
  {
    id: "calendar_all_tasks",
    title: "Wszystkie zadania do zrobienia",
    desc: "Podgląd wszystkich Twoich nieukończonych zadań wraz z wygodną wyszukiwarką. Możesz stąd szybko sprawdzić lub edytować dowolne zadanie.",
    targetIdDesktop: "tutorial-calendar-all-tasks",
    targetIdMobile: "tutorial-calendar-month-grid",
    placement: "bottom-left",
    screen: "calendar"
  },

  // --- SAMOUCZEK EKRANU DODAWANIA / EDYCJI ZADANIA (TASK MODAL) ---
  {
    id: "task_duration",
    title: "Szacowany czas",
    desc: "Przewidywany czas na zadanie. Pomaga aplikacji idealnie rozplanować dzień i chronić Cię przed przeciążeniem.",
    targetIdDesktop: "tutorial-task-duration",
    targetIdMobile: "tutorial-task-duration",
    placement: "bottom",
    screen: "task_modal"
  },
  {
    id: "task_deadline",
    title: "Deadline",
    desc: "Ostateczny termin realizacji. Aplikacja automatycznie dopasuje plan tak, by ukończyć zadanie przed tą datą.",
    targetIdDesktop: "tutorial-task-deadline",
    targetIdMobile: "tutorial-task-deadline",
    placement: "bottom",
    screen: "task_modal"
  },
  {
    id: "task_difficulty",
    title: "Wysiłek umysłowy",
    desc: "Skala 1–5 określa poziom skupienia. Pomaga rozłożyć trudniejsze zadania i dobrać odpowiednie przerwy na regenerację.",
    targetIdDesktop: "tutorial-task-difficulty",
    targetIdMobile: "tutorial-task-difficulty",
    placement: "top",
    screen: "task_modal"
  },
  {
    id: "task_priority",
    title: "Ważność",
    desc: "Priorytet zadania. Decyduje o kolejności układania dnia – kluczowe zadania trafiają w godziny najwyższej energii.",
    targetIdDesktop: "tutorial-task-priority",
    targetIdMobile: "tutorial-task-priority",
    placement: "top",
    screen: "task_modal"
  },
  {
    id: "task_recurrence",
    title: "Cykliczność",
    desc: "Powtarzalność, np. codzienne nawyki, zadania w dni robocze lub spotkania co tydzień.",
    targetIdDesktop: "tutorial-task-recurrence",
    targetIdMobile: "tutorial-task-recurrence",
    placement: "top",
    screen: "task_modal"
  },
  {
    id: "task_lock",
    title: "Zablokuj termin (Kłódka)",
    desc: "Sztywno rezerwuje wybrane godziny w kalendarzu. Algorytm nie przesunie tego zadania podczas generowania planu.",
    targetIdDesktop: "tutorial-task-lock",
    targetIdMobile: "tutorial-task-lock",
    placement: "top",
    screen: "task_modal"
  },

  // --- SAMOUCZEK MONITORA NASTROJU (MOOD) ---
  {
    id: "mood_register",
    title: "Zarejestruj swój nastrój",
    desc: "Wybierz emotkę odpowiadającą Twojemu samopoczuciu i dodaj krótką notatkę. Regularne rejestrowanie pomaga dopasowywać plan dnia do Twojej energii.",
    targetIdDesktop: "tutorial-mood-register",
    targetIdMobile: "tutorial-mobile-mood-register",
    placement: "bottom",
    screen: "mood"
  },
  {
    id: "mood_ai",
    title: "Analiza AI nastroju",
    desc: "Sztuczna inteligencja przeanalizuje Twoje wpisy z ostatnich dni, wykryje wzorce i przygotuje dla Ciebie spersonalizowane wskazówki wellbeingowe.",
    targetIdDesktop: "tutorial-mood-ai",
    targetIdMobile: "tutorial-mobile-mood-ai",
    placement: "bottom",
    screen: "mood"
  },
  {
    id: "mood_filters",
    title: "Zakres czasu wykresu",
    desc: "Przełączaj perspektywę (Tydzień, Miesiąc, Kwartał), aby obserwować wahania energii i samopoczucia w krótkim lub dłuższym horyzoncie.",
    targetIdDesktop: "tutorial-mood-filters",
    targetIdMobile: "tutorial-mood-filters",
    placement: "bottom",
    screen: "mood"
  },
  {
    id: "mood_chart",
    title: "Wykres i edycja nastroju",
    desc: "Wizualizacja Twojego nastroju dzień po dniu. Kliknij dowolną kropkę na wykresie, aby podejrzeć notatkę lub zaktualizować swój wpis.",
    targetIdDesktop: "tutorial-mood-chart",
    targetIdMobile: "tutorial-mood-chart",
    placement: "top",
    screen: "mood"
  },
  {
    id: "mood_avg",
    title: "Linia średniej",
    desc: "Włącz lub wyłącz linię średniego nastroju, aby szybko sprawdzić ogólny bilans samopoczucia w wybranym okresie.",
    targetIdDesktop: "tutorial-mood-avg",
    targetIdMobile: "tutorial-mood-chart",
    placement: "bottom",
    screen: "mood"
  },

  // --- SAMOUCZEK CENTRUM POMOCY (WARNING / POMOC) ---
  {
    id: "help_notice",
    title: "Sygnał wellbeingowy",
    desc: "Aplikacja dba o Twoją równowagę psychiczną. Gdy zauważysz u siebie przeciążenie zadaniami lub spadek nastroju, ta sekcja przypomina o odpoczynku i wsparciu.",
    targetIdDesktop: "tutorial-help-notice",
    targetIdMobile: "tutorial-help-notice",
    placement: "bottom",
    screen: "warning"
  },
  {
    id: "help_contacts",
    title: "Baza bezpłatnego wsparcia",
    desc: "Sprawdzona lista bezpłatnych linii pomocowych i organizacji zaufania wraz z godzinami ich dyżurów i bezpośrednim kontaktem.",
    targetIdDesktop: "tutorial-help-contacts",
    targetIdMobile: "tutorial-help-contacts",
    placement: "top",
    screen: "warning"
  },

  // --- SAMOUCZEK USTAWIEŃ (SETTINGS) ---
  {
    id: "settings_name",
    title: "Nazwa użytkownika",
    desc: "Wpisz swoje imię lub pseudonim – tak będziemy zwracać się do Ciebie w aplikacji oraz podczas powiadomień AI.",
    targetIdDesktop: "tutorial-settings-name",
    targetIdMobile: "tutorial-settings-name",
    placement: "bottom",
    screen: "settings"
  },
  {
    id: "settings_worktime",
    title: "Czas pracy i start dnia",
    desc: "Ustal, ile godzin dziennie chcesz pracować oraz o której godzinie zaczynasz. Algorytm ułoży harmonogram zgodnie z tymi ramami.",
    targetIdDesktop: "tutorial-settings-worktime",
    targetIdMobile: "tutorial-settings-worktime",
    placement: "bottom",
    screen: "settings"
  },
  {
    id: "settings_boosters",
    title: "Poprawiacze nastroju",
    desc: "Zaznacz czynności, które dodają Ci energii w trudniejszych momentach (np. spacer, kawa, muzyka). Aplikacja może Ci je podpowiadać w trakcie przerw.",
    targetIdDesktop: "tutorial-settings-boosters",
    targetIdMobile: "tutorial-settings-boosters",
    placement: "top",
    screen: "settings"
  },
  {
    id: "settings_google",
    title: "Synchronizacja z Kalendarzem Google",
    desc: "Połącz swoje konto Google, aby automatycznie pobierać spotkania i rezerwować na nie czas w Twoim planie dnia.",
    targetIdDesktop: "tutorial-settings-google",
    targetIdMobile: "tutorial-settings-google",
    placement: "top",
    screen: "settings"
  },
  {
    id: "settings_faq",
    title: "FAQ – Baza wiedzy",
    desc: "Odpowiedzi na najczęściej zadawane pytania dotyczące działania aplikacji, algorytmu generowania planu i funkcji AI.",
    targetIdDesktop: "tutorial-settings-faq",
    targetIdMobile: "tutorial-settings-faq",
    placement: "top",
    screen: "settings"
  },
  {
    id: "settings_privacy",
    title: "Polityka Prywatności",
    desc: "Informacje o tym, w jaki sposób zbieramy, przetwarzamy i bezpiecznie przechowujemy Twoje dane. Twoje notatki i historia nastroju są w pełni prywatne.",
    targetIdDesktop: "tutorial-settings-privacy",
    targetIdMobile: "tutorial-settings-privacy",
    placement: "top",
    screen: "settings"
  },
  {
    id: "settings_terms",
    title: "Regulamin Usługi (ToS)",
    desc: "Zasady korzystania z aplikacji, opis działania funkcji asystenta AI oraz prawa i obowiązki użytkownika.",
    targetIdDesktop: "tutorial-settings-terms",
    targetIdMobile: "tutorial-settings-terms",
    placement: "top",
    screen: "settings"
  },
  {
    id: "settings_danger",
    title: "Strefa niebezpieczna (Usuwanie konta)",
    desc: "UWAGA: Usunięcie konta jest całkowicie NIEODWRACALNE i BEZPOWROTNE! Skasuje wszystkie Twoje zadania, całą historię nastroju, monety AI, serię dni (streak) oraz profil bez możliwości ich przywrócenia.",
    targetIdDesktop: "tutorial-settings-danger",
    targetIdMobile: "tutorial-settings-danger",
    placement: "top",
    screen: "settings"
  }
];

export default function GlobalTutorial({ userEmail, activeTab = "dashboard" }) {
  const { isTooltipSeen, markTooltipSeen } = useTutorials(userEmail);
  const [sequence, setSequence] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [position, setPosition] = useState(null);
  const tooltipRef = useRef(null);
  const prevTabRef = useRef(activeTab);

  // Aktualizacja sekwencji, reaguje również na reset lub zmianę ekranu (np. otwarcie modala)
  useEffect(() => {
    const relevantSteps = TUTORIAL_STEPS.filter(step => step.screen === activeTab);
    const unseen = relevantSteps.filter(step => !isTooltipSeen(step.id));

    if (activeTab !== prevTabRef.current) {
      prevTabRef.current = activeTab;
      setSequence(unseen);
      setCurrentIndex(0);
      return;
    }

    if (unseen.length > 0 && (sequence.length === 0 || currentIndex >= sequence.length || unseen.length === relevantSteps.length)) {
      setSequence(unseen);
      setCurrentIndex(0);
    } else if (unseen.length === 0 && sequence.length > 0) {
      setSequence([]);
      setCurrentIndex(0);
    }
  }, [isTooltipSeen, activeTab, sequence.length, currentIndex]);

  const currentStep = sequence[currentIndex];

  useEffect(() => {
    if (!currentStep) return;

    const isMobile = window.innerWidth < 768;
    const targetId = isMobile ? currentStep.targetIdMobile : currentStep.targetIdDesktop;
    const el = document.getElementById(targetId);

    if (el) {
      const rect = el.getBoundingClientRect();
      const isVisible = (
        rect.top >= 70 &&
        rect.bottom <= (window.innerHeight - 70)
      );

      if (!isVisible) {
        el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      }
    }

    const updatePosition = () => {
      const isMob = window.innerWidth < 768;
      const tId = isMob ? currentStep.targetIdMobile : currentStep.targetIdDesktop;
      const targetEl = document.getElementById(tId);

      if (!targetEl || !tooltipRef.current) {
        // Fallback - środek ekranu jeśli elementu nie widać
        setPosition({ top: window.innerHeight / 2 - 100, left: window.innerWidth / 2 - 140, fallback: true });
        return;
      }

      const rect = targetEl.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();

      let top, left;
      let arrowProps = {};

      const space = 12;
      const targetCenterX = rect.left + rect.width / 2;
      const targetCenterY = rect.top + rect.height / 2;

      let actualPlacement = currentStep.placement;

      // Dla wersji mobilnej elementy menu są na dole ekranu, więc dymek ma być nad nimi (top)
      if (isMob && actualPlacement === 'right') {
        actualPlacement = 'top';
      }

      // Sprawdzenie czy tooltip ucieknie za górną/dolną krawędź ekranu
      if (actualPlacement === 'top' && (rect.top - tooltipRect.height - space < 16)) {
        actualPlacement = 'bottom';
      } else if (actualPlacement === 'bottom' && (rect.bottom + tooltipRect.height + space > window.innerHeight - 16)) {
        actualPlacement = 'top';
      }

      if (actualPlacement === 'right') {
        left = rect.right + space;
        top = targetCenterY - tooltipRect.height / 2;
        top = Math.max(16, Math.min(top, window.innerHeight - tooltipRect.height - 16));
        left = Math.max(16, Math.min(left, window.innerWidth - tooltipRect.width - 16));

        const rawY = targetCenterY - top - 10;
        arrowProps = {
          direction: 'left',
          y: Math.max(16, Math.min(rawY, tooltipRect.height - 24))
        };
      } else if (actualPlacement === 'left') {
        left = rect.left - tooltipRect.width - space;
        top = targetCenterY - tooltipRect.height / 2;
        top = Math.max(16, Math.min(top, window.innerHeight - tooltipRect.height - 16));
        left = Math.max(16, Math.min(left, window.innerWidth - tooltipRect.width - 16));

        const rawY = targetCenterY - top - 10;
        arrowProps = {
          direction: 'right',
          y: Math.max(16, Math.min(rawY, tooltipRect.height - 24))
        };
      } else if (actualPlacement === 'bottom') {
        top = rect.bottom + space;
        left = targetCenterX - tooltipRect.width / 2;
        left = Math.max(16, Math.min(left, window.innerWidth - tooltipRect.width - 16));

        const rawX = targetCenterX - left - 10;
        arrowProps = {
          direction: 'up',
          x: Math.max(16, Math.min(rawX, tooltipRect.width - 24))
        };
      } else if (actualPlacement === 'top') {
        top = rect.top - tooltipRect.height - space;
        left = targetCenterX - tooltipRect.width / 2;
        left = Math.max(16, Math.min(left, window.innerWidth - tooltipRect.width - 16));

        const rawX = targetCenterX - left - 10;
        arrowProps = {
          direction: 'down',
          x: Math.max(16, Math.min(rawX, tooltipRect.width - 24))
        };
      } else if (actualPlacement === 'bottom-left') {
        top = rect.bottom + space;
        left = rect.right - tooltipRect.width;
        left = Math.max(16, Math.min(left, window.innerWidth - tooltipRect.width - 16));

        const rawX = targetCenterX - left - 10;
        arrowProps = {
          direction: 'up',
          x: Math.max(16, Math.min(rawX, tooltipRect.width - 24))
        };
      }

      top = Math.max(16, Math.min(top, window.innerHeight - tooltipRect.height - 16));

      setPosition({ top, left, arrowProps, fallback: false, targetRect: rect });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    const observer = new MutationObserver(updatePosition);
    observer.observe(document.body, { childList: true, subtree: true });
    const interval = setInterval(updatePosition, 100);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
      observer.disconnect();
      clearInterval(interval);
    };
  }, [currentStep]);

  if (sequence.length === 0 || currentIndex >= sequence.length) return null;

  const handleNext = (e) => {
    if (e) e.stopPropagation();
    markTooltipSeen(currentStep.id);
    setCurrentIndex(prev => prev + 1);
  };

  const handleSkipAll = (e) => {
    if (e) e.stopPropagation();
    for (let i = currentIndex; i < sequence.length; i++) {
      markTooltipSeen(sequence[i].id);
    }
    setCurrentIndex(sequence.length);
  };

  return (
    <div
      className="fixed inset-0 z-[10000] overflow-hidden"
      onClick={() => {
        if (window.innerWidth < 768) handleNext();
      }}
    >
      {/* Podświetlenie celu - metoda z boxShadow (hole punch) */}
      <div
        className="absolute pointer-events-none"
        style={{
          borderRadius: '16px',
          top: position && !position.fallback && position.targetRect ? position.targetRect.top - 6 : 0,
          left: position && !position.fallback && position.targetRect ? position.targetRect.left - 6 : 0,
          width: position && !position.fallback && position.targetRect ? position.targetRect.width + 12 : 0,
          height: position && !position.fallback && position.targetRect ? position.targetRect.height + 12 : 0,
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.55)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep.id}
          ref={tooltipRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed bg-white rounded-2xl shadow-2xl w-[280px] sm:w-[320px] p-4 sm:p-5 border-2 border-[#2D9E6B]"
          style={position ? { top: position.top, left: position.left } : { opacity: 0, top: '-999px' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Strzałka przypominająca komiksowy dymek */}
          {position && !position.fallback && position.arrowProps && (
            <>
              {position.arrowProps.direction === 'up' && (
                <>
                  <div className="absolute -top-2.5 w-0 h-0 border-x-[8px] border-x-transparent border-b-[10px] border-b-white" style={{ left: position.arrowProps.x }}></div>
                  <div className="absolute -top-3 w-0 h-0 border-x-[9px] border-x-transparent border-b-[11px] border-b-[#2D9E6B] -z-10" style={{ left: position.arrowProps.x - 1 }}></div>
                </>
              )}
              {position.arrowProps.direction === 'down' && (
                <>
                  <div className="absolute -bottom-2.5 w-0 h-0 border-x-[8px] border-x-transparent border-t-[10px] border-t-white" style={{ left: position.arrowProps.x }}></div>
                  <div className="absolute -bottom-3 w-0 h-0 border-x-[9px] border-x-transparent border-t-[11px] border-t-[#2D9E6B] -z-10" style={{ left: position.arrowProps.x - 1 }}></div>
                </>
              )}
              {position.arrowProps.direction === 'left' && (
                <>
                  <div className="absolute -left-2.5 w-0 h-0 border-y-[8px] border-y-transparent border-r-[10px] border-r-white" style={{ top: position.arrowProps.y }}></div>
                  <div className="absolute -left-3 w-0 h-0 border-y-[9px] border-y-transparent border-r-[11px] border-r-[#2D9E6B] -z-10" style={{ top: position.arrowProps.y - 1 }}></div>
                </>
              )}
              {position.arrowProps.direction === 'right' && (
                <>
                  <div className="absolute -right-2.5 w-0 h-0 border-y-[8px] border-y-transparent border-l-[10px] border-l-white" style={{ top: position.arrowProps.y }}></div>
                  <div className="absolute -right-3 w-0 h-0 border-y-[9px] border-y-transparent border-l-[11px] border-l-[#2D9E6B] -z-10" style={{ top: position.arrowProps.y - 1 }}></div>
                </>
              )}
            </>
          )}

          <strong className="text-[#1E5C36] font-bold text-sm block mb-2">
            {currentStep.title}:
          </strong>
          <p className="text-xs sm:text-sm text-[#5A7368] leading-relaxed mb-4">
            {currentStep.desc}
          </p>

          <div className="flex gap-2">
            <button
              onClick={handleNext}
              className="hidden md:block flex-1 bg-[#2D9E6B] text-white font-bold py-2 rounded-xl hover:bg-[#1E5C36] transition-colors shadow-sm text-center text-sm"
            >
              Dalej
            </button>
            <button
              onClick={handleSkipAll}
              className="hidden md:block bg-gray-100 text-[#5A7368] font-bold py-2 px-4 rounded-xl hover:bg-gray-200 transition-colors text-center text-sm"
            >
              Pomiń
            </button>
          </div>

          <div className="md:hidden text-center text-[#2D9E6B] font-bold text-[10px] opacity-70 animate-pulse mt-1">
            Dotknij gdziekolwiek na ekranie, aby przejść dalej
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Pomiń wszystko dla mobile - w prawym dolnym rogu ekranu, a nie w samym modalu */}
      <div className="md:hidden fixed bottom-6 right-6 z-[10001]">
        <button
          onClick={handleSkipAll}
          className="bg-white/95 backdrop-blur-md text-[#5A7368] border border-[#E8DDD0] font-bold py-2.5 px-4 rounded-xl shadow-xl active:scale-95 transition-all text-xs"
        >
          Pomiń wszystko
        </button>
      </div>
    </div>
  );
}
