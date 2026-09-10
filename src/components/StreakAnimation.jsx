import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, X, Sparkles } from 'lucide-react';
import { fireCustomConfetti } from './StreakPlant'; // We need to export this from StreakPlant.jsx

export default function StreakAnimation({ streakCount, onClose, onClaimReward }) {
  const [showContent, setShowContent] = useState(false);
  const [isClaimed, setIsClaimed] = useState(false);

  const descriptionText = React.useMemo(() => {
    const descriptions = [
      "Każdy dzień to mały krok do przodu. Oby tak dalej!",
      "Konsekwencja to klucz do sukcesu. Świetnie Ci idzie!",
      "Kolejny dzień z odhaczonym zadaniem. Dobra robota!",
      "Nie zwalniasz tempa. Trzymaj tak dalej!",
      "Cegiełka po cegiełce budujesz swój nawyk. Gratulacje!"
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }, []);

  useEffect(() => {
    // Szybsze pojawienie się modala
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  // Przewijanie do aktualnego dnia po załadowaniu
  useEffect(() => {
    if (showContent) {
      // Czekamy 1.5s, aż pasek zjedzie i wszystkie kwadraty się powiększą
      const t = setTimeout(() => {
        const container = document.getElementById('reward-track-container');
        const el = document.getElementById(`streak-day-${streakCount}`);
        if (container && el) {
          const targetScroll = el.offsetLeft - (container.offsetWidth / 2) + (el.offsetWidth / 2);
          const startScroll = container.scrollLeft;
          const distance = targetScroll - startScroll;
          const duration = 1500; // 1.5 sekundy (wolniejsze, bardziej widoczne przesuwanie)
          let start = null;

          const step = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            // Funkcja Easing - easeInOutQuad
            const p = Math.min(progress / duration, 1);
            const ease = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
            
            if (progress < duration) {
              container.scrollLeft = startScroll + distance * ease;
              window.requestAnimationFrame(step);
            } else {
              container.scrollLeft = targetScroll;
            }
          };
          window.requestAnimationFrame(step);
        }
      }, 900); // Odpala się gdy pasek zjedzie na dół (po 0.9s)
      return () => clearTimeout(t);
    }
  }, [showContent, streakCount]);

  const startDay = Math.max(1, streakCount - 5);
  const endDay = streakCount + 5;
  const days = [];
  for (let i = startDay; i <= endDay; i++) {
    days.push(i);
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <Flame size={400} className="text-[#FF9800] blur-3xl" />
          </motion.div>
        </div>

        <motion.div
          className="relative bg-white w-full max-w-md m-4 rounded-[32px] p-6 sm:p-8 shadow-2xl flex flex-col items-center overflow-hidden"
          initial={{ scale: 0.8, y: 50, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.8, y: 50, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-50"
          >
            <X size={20} />
          </button>

          {showContent && (
            <>
              <motion.div 
                className="relative mb-4"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", bounce: 0.5, duration: 0.6 }}
              >
                <div className="absolute inset-0 bg-[#FF9800] blur-xl opacity-30 rounded-full animate-pulse" />
                <div className="w-20 h-20 bg-gradient-to-br from-[#FFB74D] to-[#F57C00] rounded-full flex items-center justify-center shadow-lg relative z-10 border-4 border-white">
                  <Flame size={40} className="text-white fill-white" />
                </div>
              </motion.div>

              <motion.h2 
                className="text-2xl sm:text-3xl font-black text-[#1A2F22] mb-1 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {streakCount} {streakCount === 1 ? 'Dzień' : 'Dni'}!
              </motion.h2>
              <motion.p 
                className="text-gray-500 text-center text-xs sm:text-sm font-medium mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Jesteś w gazie! Odbierz swoją nagrodę.
              </motion.p>

              <motion.div 
                className="w-full bg-[#F5EFE6] rounded-xl p-3 sm:p-4 mb-6 border border-[#E8DDD0] relative shadow-sm"
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, type: "spring", damping: 15 }}
              >
                <div className="text-center text-[#5A7368] text-[10px] sm:text-[11px] font-black uppercase tracking-wider mb-4">
                  Nagrody za Serię
                </div>

                <div id="reward-track-container" className="w-full overflow-x-auto overflow-y-hidden custom-scrollbar relative z-10 px-2 pt-4 pb-4 -mx-2">
                  <div className="flex items-center w-max gap-1 sm:gap-2">
                    {days.map((displayDay, index) => {
                      const isCompleted = displayDay < streakCount;
                      const isCurrent = displayDay === streakCount;
                      
                      let rewardValue = 1;
                      if (displayDay % 10 === 0) rewardValue = 10;
                      else if (displayDay % 5 === 0) rewardValue = 5;

                      const handleClaim = () => {
                        if (isCurrent && !isClaimed) {
                          setIsClaimed(true);
                          if (onClaimReward) onClaimReward(rewardValue);
                          
                          // Zamykamy modal po chwili, by było widać kliknięcie i animację lecącej monety
                          setTimeout(() => {
                            if (onClose) onClose();
                          }, 600);
                        }
                      };

                      const showAsCompleted = isCompleted || (isCurrent && isClaimed);

                      return (
                        <React.Fragment key={displayDay}>
                          <div id={`streak-day-${displayDay}`} className="flex flex-col items-center relative">
                            <div className={`absolute -top-3 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black z-20 shadow-sm border-2 transition-colors
                              ${showAsCompleted ? 'bg-[#2D9E6B] border-white text-white' : 'bg-white border-[#E8DDD0] text-[#5A7368]'}
                            `}>
                              {displayDay}
                            </div>

                            <motion.button
                              onClick={isCurrent ? handleClaim : undefined}
                              disabled={!isCurrent || isClaimed}
                              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-lg flex flex-col items-center justify-center border shadow-sm relative overflow-hidden transition-all duration-300 flex-shrink-0
                                ${showAsCompleted 
                                  ? 'bg-[#E5F2F3] border-[#1A949A]/30 cursor-default' 
                                  : isCurrent
                                  ? 'bg-gradient-to-b from-[#FFF5C3] to-[#FFD54F] border-[#F5B041] cursor-pointer hover:scale-105 active:scale-95'
                                  : 'bg-white border-[#E8DDD0] cursor-not-allowed opacity-80'
                                }
                                ${(isCurrent && !isClaimed) ? 'ring-4 ring-[#FFD54F]/50 scale-110 shadow-lg animate-pulse z-10' : ''}
                              `}
                              animate={{ scale: (isCurrent && !isClaimed) ? 1.1 : 1 }}
                              whileTap={isCurrent && !isClaimed ? { scale: 0.9 } : {}}
                            >
                              <div className={`flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1 
                                ${showAsCompleted ? 'text-[#02848C]' : (isCurrent && !isClaimed) ? 'text-[#D35400]' : 'text-gray-300'}`}>
                                <span className="font-black text-xs sm:text-sm">+{rewardValue}</span>
                                <img 
                                  src="/icons/AI Coin.svg" 
                                  alt="AI Token" 
                                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain transition-all duration-500
                                    ${(!showAsCompleted && !(isCurrent && !isClaimed)) ? 'grayscale opacity-40' : ''}
                                    ${isClaimed && isCurrent ? 'scale-125 rotate-12' : ''}
                                  `}
                                />
                              </div>
                              
                              {isCurrent && !isClaimed && (
                                <div className="absolute inset-0 bg-white/20 animate-ping rounded-lg" />
                              )}
                            </motion.button>
                            
                            {isCurrent && !isClaimed && (
                              <motion.div 
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute -bottom-5 w-24 text-center text-[10px] font-bold text-[#D35400] whitespace-nowrap"
                              >
                                Kliknij, by odebrać!
                              </motion.div>
                            )}
                          </div>

                          {displayDay < endDay && (
                            <div className="flex justify-center items-center px-0.5 sm:px-1">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={displayDay < streakCount ? "opacity-100" : "opacity-30"}>
                                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke={displayDay < streakCount ? "#2D9E6B" : "#A3B3AB"} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              </motion.div>

              <motion.button
                onClick={onClose}
                className="w-full py-4 bg-[#FF9800] text-white rounded-xl font-bold text-lg shadow-[0_4px_14px_rgba(255,152,0,0.4)] hover:bg-[#F57C00] hover:-translate-y-0.5 transition-all active:scale-95"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                Kontynuuj
              </motion.button>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
