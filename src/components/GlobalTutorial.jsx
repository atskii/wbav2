import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTutorials } from "../hooks/useTutorials";

const TUTORIAL_STEPS = [
  {
    id: "dashboard_date_nav",
    title: "Nawigacja po dniach",
    desc: "Służy po to, aby dokładnie ustawić sobie plan i wprowadzić zmiany w poszczególne dni.",
    targetIdDesktop: "tutorial-date-nav",
    targetIdMobile: "tutorial-date-nav",
    placement: "bottom"
  },
  {
    id: "dashboard_generate_plan",
    title: "Generuj plan",
    desc: "Nasz algorytm ułoży optymalny plan dnia, biorąc pod uwagę parametry zadań: ich ważność, deadline oraz Twoje aktualne samopoczucie.",
    targetIdDesktop: "tutorial-generate-plan",
    targetIdMobile: "tutorial-mobile-generate-plan",
    placement: "bottom"
  },
  {
    id: "dashboard_generate_plan_ai",
    title: "Wygeneruj plan AI",
    desc: "Dla maksymalnej personalizacji użyj AI. Sztuczna inteligencja przeanalizuje Twój dzień i inteligentnie dostosuje harmonogram zadań (koszt: 1 moneta).",
    targetIdDesktop: "tutorial-desktop-generate-plan-ai",
    targetIdMobile: "tutorial-mobile-generate-plan-ai",
    placement: "bottom"
  },
  {
    id: "dashboard_add_task",
    title: "Dodaj zadanie",
    desc: "Tutaj szybko dodasz nowe zadania do swojego planu.",
    targetIdDesktop: "tutorial-add-task",
    targetIdMobile: "tutorial-mobile-add-task",
    placement: "bottom"
  },
  {
    id: "dashboard_backlog",
    title: "Zadania poza planem (Backlog)",
    desc: "Tutaj trafiają zadania dodane bez określonej godziny. Możesz je w każdej chwili podejrzeć, a kliknięcie 'Generuj plan' automatycznie wpasuje je w Twój dzień.",
    targetIdDesktop: "tutorial-backlog",
    targetIdMobile: "tutorial-backlog",
    placement: "top"
  },
  {
    id: "dashboard_streak_plant",
    title: "Roślinka Streaku",
    desc: "Wykonuj zadania, aby ją rozwijać! Zdobywaj XP za każde zrealizowane zadanie, a po osiągnięciu 100% roślinka zakwitnie.",
    targetIdDesktop: "tutorial-streak-plant",
    targetIdMobile: "tutorial-streak-plant",
    placement: "top"
  },
  {
    id: "header_help",
    title: "Centrum pomocy (?)",
    desc: "Jeśli chciałbyś sobie kiedyś przypomnieć działanie aplikacji, kliknij tutaj, aby ponownie odtworzyć samouczek na danym ekranie.",
    targetIdDesktop: "tutorial-header-help",
    targetIdMobile: "tutorial-mobile-header-help",
    placement: "bottom"
  },
  {
    id: "header_streak",
    title: "Dni serii (Streak)",
    desc: "Każdy dzień z rzędu, w którym wykonasz przynajmniej jedno zadanie, zwiększa Twoją serię. Utrzymuj ogień!",
    targetIdDesktop: "tutorial-header-streak",
    targetIdMobile: "tutorial-mobile-header-streak",
    placement: "bottom"
  },
  {
    id: "header_ai_tokens",
    title: "Monety AI",
    desc: "Waluta do funkcji AI, którą zdobywasz m.in. za codzienne logowanie i utrzymywanie serii. Wykorzystuj ją do inteligentnego planowania!",
    targetIdDesktop: "tutorial-header-ai-tokens",
    targetIdMobile: "tutorial-mobile-header-ai-tokens",
    placement: "bottom"
  },
  {
    id: "header_profile",
    title: "Twój profil",
    desc: "Możesz się tu wylogować, połączyć z Kalendarzem Google oraz przejść do Ustawień konta.",
    targetIdDesktop: "tutorial-header-profile",
    targetIdMobile: "tutorial-mobile-header-profile",
    placement: "bottom-left"
  }
];

export default function GlobalTutorial({ userEmail }) {
  const { isTooltipSeen, markTooltipSeen } = useTutorials(userEmail);
  const [sequence, setSequence] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [position, setPosition] = useState(null);
  const tooltipRef = useRef(null);

  // Aktualizacja sekwencji, reaguje również na reset (gdy isTooltipSeen zmieni referencję)
  useEffect(() => {
    const unseen = TUTORIAL_STEPS.filter(step => !isTooltipSeen(step.id));
    // Resetujemy do nowej sekwencji tylko jeśli aktualnie nic nie wyświetlamy
    if (unseen.length > 0 && (sequence.length === 0 || currentIndex >= sequence.length)) {
      setSequence(unseen);
      setCurrentIndex(0);
    }
  }, [isTooltipSeen, sequence.length, currentIndex]);

  const currentStep = sequence[currentIndex];

  useEffect(() => {
    if (!currentStep) return;

    const updatePosition = () => {
      const isMobile = window.innerWidth < 768;
      const targetId = isMobile ? currentStep.targetIdMobile : currentStep.targetIdDesktop;
      const el = document.getElementById(targetId);

      if (!el || !tooltipRef.current) {
        // Fallback - środek ekranu jeśli elementu nie widać
        setPosition({ top: window.innerHeight / 2 - 100, left: window.innerWidth / 2 - 140, fallback: true });
        return;
      }

      const rect = el.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();

      let top, left;
      let arrowProps = {};

      const space = 12;
      const targetCenterX = rect.left + rect.width / 2;
      const targetCenterY = rect.top + rect.height / 2;

      let actualPlacement = currentStep.placement;

      // Sprawdzenie czy tooltip ucieknie za górną krawędź ekranu
      if (actualPlacement === 'top' && (rect.top - tooltipRect.height - space < 16)) {
        actualPlacement = 'bottom';
      } else if (actualPlacement === 'bottom' && (rect.bottom + tooltipRect.height + space > window.innerHeight - 16)) {
        actualPlacement = 'top';
      }

      if (actualPlacement === 'bottom') {
        top = rect.bottom + space;
        left = targetCenterX - tooltipRect.width / 2;
        left = Math.max(16, Math.min(left, window.innerWidth - tooltipRect.width - 16));

        arrowProps = {
          direction: 'up',
          x: targetCenterX - left - 10
        };
      } else if (actualPlacement === 'top') {
        top = rect.top - tooltipRect.height - space;
        left = targetCenterX - tooltipRect.width / 2;
        left = Math.max(16, Math.min(left, window.innerWidth - tooltipRect.width - 16));

        arrowProps = {
          direction: 'down',
          x: targetCenterX - left - 10
        };
      } else if (actualPlacement === 'bottom-left') {
        // Wyrównanie do prawej krawędzi dla elementów w nagłówku (żeby nie wychodziły poza prawy róg ekranu)
        top = rect.bottom + space;
        left = rect.right - tooltipRect.width;
        left = Math.max(16, Math.min(left, window.innerWidth - tooltipRect.width - 16));

        arrowProps = {
          direction: 'up',
          x: targetCenterX - left - 10
        };
      }

      // Bezpiecznik: jeśli mimo wszystko top jest ujemny (np. dla bottom-left gdy ekran jest bardzo mały), 
      // chociaż to rzadkość bo bottom-left idzie w dół. 
      // Zabezpieczamy 'top' na sztywno:
      top = Math.max(16, Math.min(top, window.innerHeight - tooltipRect.height - 16));

      setPosition({ top, left, arrowProps, fallback: false, targetRect: rect });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    const observer = new MutationObserver(updatePosition);
    observer.observe(document.body, { childList: true, subtree: true });
    const interval = setInterval(updatePosition, 500);

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
