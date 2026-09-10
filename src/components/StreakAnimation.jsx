import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, X, Sparkles, Check, ChevronRight } from 'lucide-react';
import { fireCustomConfetti } from './StreakPlant';

export default function StreakAnimation({ streakCount, onClose, onClaimReward, mode = 'auto', claimedDays = [] }) {
  const isDashboard = mode === 'dashboard';
  // Skip intro animation if dashboard
  const [showContent, setShowContent] = useState(isDashboard);
  
  // Local state to instantly update UI before App.jsx rerenders
  const [localClaimedDays, setLocalClaimedDays] = useState(claimedDays);

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
    if (!isDashboard) {
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isDashboard]);

  // Przewijanie do aktualnego dnia po załadowaniu
  useEffect(() => {
    if (showContent) {
      const delay = isDashboard ? 100 : 900;
      const t = setTimeout(() => {
        const container = document.getElementById('reward-track-container');
        // Jeśli jesteśmy w dashboardzie, spróbujmy przeskrolować do najwcześniejszego nieodebranego, albo po prostu do obecnego
        const firstUnclaimed = days.find(d => d <= streakCount && !localClaimedDays.includes(d)) || streakCount;
        const el = document.getElementById(`streak-day-${firstUnclaimed}`);
        
        if (container && el) {
          const targetScroll = el.offsetLeft - (container.offsetWidth / 2) + (el.offsetWidth / 2);
          const startScroll = container.scrollLeft;
          const distance = targetScroll - startScroll;
          const duration = isDashboard ? 800 : 1500; 
          let start = null;

          const step = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
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
      }, delay);
      return () => clearTimeout(t);
    }
  }, [showContent, streakCount, isDashboard]);

  const startDay = Math.max(1, isDashboard ? streakCount - 15 : streakCount - 5);
  const endDay = isDashboard ? streakCount + 15 : streakCount + 5;
  const days = [];
  for (let i = startDay; i <= endDay; i++) {
    days.push(i);
  }

  const handleClaim = (dayNum, rewardValue) => {
    if (dayNum <= streakCount && !localClaimedDays.includes(dayNum)) {
      setLocalClaimedDays(prev => [...prev, dayNum]);
      if (onClaimReward) onClaimReward(dayNum, rewardValue);
      
      fireCustomConfetti();
      
      if (!isDashboard) {
        setTimeout(() => {
          if (onClose) onClose();
        }, 400);
      }
    }
  };

  const unclaimedCount = streakCount > 0 ? Array.from({ length: streakCount }, (_, i) => i + 1).filter(d => !localClaimedDays.includes(d)).length : 0;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {!isDashboard && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <Flame size={400} className="text-[#FF9800] blur-3xl" />
            </motion.div>
          </div>
        )}

        <motion.div
          className={`relative bg-white w-full ${isDashboard ? 'max-w-4xl' : 'max-w-md'} m-4 rounded-[32px] p-6 sm:p-8 shadow-2xl flex flex-col items-center overflow-hidden`}
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
              {/* HEADER SEKCJA */}
              {isDashboard ? (
                <div className="w-full flex flex-col md:flex-row items-center justify-between mb-8">
                  <div className="flex items-center gap-4 mb-4 md:mb-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#FFB74D] to-[#F57C00] rounded-full flex items-center justify-center shadow-lg border-4 border-orange-100 flex-shrink-0">
                      <Flame size={32} className="text-white fill-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-black text-[#1A2F22]">
                        Twój Szlak Nagród
                      </h2>
                      <p className="text-gray-500 text-sm font-medium">
                        Odbieraj monety AI za regularność.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center md:items-end">
                    <div className="text-[#5A7368] text-xs font-black uppercase tracking-wider mb-1">
                      Aktualna seria
                    </div>
                    <div className="text-3xl font-black text-[#FF9800]">
                      {streakCount} {streakCount === 1 ? 'Dzień' : 'Dni'}
                    </div>
                  </div>
                </div>
              ) : (
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
                    {descriptionText}
                  </motion.p>
                </>
              )}

              {/* INFO O NIEODEBRANYCH DLA DASHBOARDU */}
              {isDashboard && unclaimedCount > 0 && (
                <div className="w-full bg-orange-50 border border-orange-200 rounded-xl p-3 mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-orange-700 font-bold text-sm">
                    <Sparkles size={18} />
                    Masz {unclaimedCount} {unclaimedCount === 1 ? 'nieodebraną nagrodę' : (unclaimedCount > 1 && unclaimedCount < 5) ? 'nieodebrane nagrody' : 'nieodebranych nagród'}!
                  </div>
                </div>
              )}
              {isDashboard && unclaimedCount === 0 && (
                <div className="w-full bg-green-50 border border-green-200 rounded-xl p-3 mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-green-700 font-bold text-sm">
                    <Check size={18} />
                    Wszystkie nagrody odebrane. Wracaj jutro po więcej!
                  </div>
                </div>
              )}

              {/* TRACK NAGRÓD */}
              <motion.div 
                className={`w-full bg-[#F5EFE6] rounded-xl p-3 sm:p-4 mb-2 border border-[#E8DDD0] relative shadow-sm`}
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: isDashboard ? 0.1 : 0.6, type: "spring", damping: 15 }}
              >
                {!isDashboard && (
                  <div className="text-center text-[#5A7368] text-[10px] sm:text-[11px] font-black uppercase tracking-wider mb-4">
                    Nagrody za Serię
                  </div>
                )}

                <div id="reward-track-container" className="w-full overflow-x-auto overflow-y-hidden custom-scrollbar relative z-10 px-2 pt-4 pb-4 -mx-2">
                  <div className="flex items-center w-max gap-2 sm:gap-3">
                    {days.map((displayDay, index) => {
                      const isLocked = displayDay > streakCount;
                      const isClaimedDay = localClaimedDays.includes(displayDay);
                      const isUnclaimed = !isLocked && !isClaimedDay;
                      const isCurrent = displayDay === streakCount && !isDashboard;
                      
                      let rewardValue = 1;
                      if (displayDay % 10 === 0) rewardValue = 10;
                      else if (displayDay % 5 === 0) rewardValue = 5;

                      return (
                        <div key={displayDay} id={`streak-day-${displayDay}`} className="flex items-center">
                          <motion.div
                            whileHover={isUnclaimed ? { scale: 1.05 } : {}}
                            whileTap={isUnclaimed ? { scale: 0.95 } : {}}
                            className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border-2 transition-all relative
                              ${isClaimedDay ? 'bg-[#E8F4ED] border-[#2D9E6B] opacity-70' 
                                : isUnclaimed ? 'bg-white border-[#FF9800] shadow-md cursor-pointer' 
                                : 'bg-gray-100 border-gray-200 opacity-60'}
                              ${isCurrent ? 'ring-4 ring-orange-500/20' : ''}
                            `}
                            style={{ minWidth: isDashboard ? '90px' : '75px' }}
                            onClick={() => isUnclaimed && handleClaim(displayDay, rewardValue)}
                          >
                            <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${
                              isClaimedDay ? 'text-[#2D9E6B]' : isUnclaimed ? 'text-[#FF9800]' : 'text-gray-400'
                            }`}>
                              Dzień {displayDay}
                            </div>
                            
                            <div className="relative mb-2">
                              {isClaimedDay ? (
                                <div className="w-8 h-8 rounded-full bg-[#2D9E6B]/10 flex items-center justify-center text-[#2D9E6B]">
                                  <Check size={20} />
                                </div>
                              ) : isLocked && displayDay === 3 ? (
                                <div className="relative flex flex-col items-center grayscale opacity-40">
                                  <span className="text-2xl drop-shadow-sm leading-none select-none">🌵</span>
                                  <div className="absolute -bottom-1 -right-2 bg-gray-400 text-white text-[8px] font-extrabold px-1 rounded-sm shadow-xs">
                                    ROŚLINA
                                  </div>
                                </div>
                              ) : isLocked ? (
                                <div className="relative grayscale opacity-40">
                                  <img src="/icons/AI Coin.svg" alt="Coin" className="w-8 h-8 object-contain" />
                                  <div className="absolute -bottom-1 -right-1 bg-gray-400 text-white text-[9px] font-bold px-1 rounded-sm">
                                    +{rewardValue}
                                  </div>
                                </div>
                              ) : displayDay === 3 ? (
                                <div className="relative flex flex-col items-center">
                                  <span className="text-2xl drop-shadow-sm leading-none select-none">🌵</span>
                                  <div className="absolute -bottom-1 -right-2 bg-[#078B83] text-white text-[8px] font-extrabold px-1 rounded-sm shadow-xs">
                                    ROŚLINA
                                  </div>
                                </div>
                              ) : (
                                <div className="relative">
                                  <img src="/icons/AI Coin.svg" alt="Coin" className="w-8 h-8 object-contain" />
                                  <div className="absolute -bottom-1 -right-1 bg-[#1A949A] text-white text-[9px] font-bold px-1 rounded-sm">
                                    +{rewardValue}
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {isUnclaimed && (
                              <button 
                                className="w-full bg-[#FF9800] text-white text-[10px] font-bold py-1 rounded hover:bg-[#F57C00] transition-colors"
                              >
                                Odbierz
                              </button>
                            )}


                          </motion.div>
                          
                          {index < days.length - 1 && (
                            <div className="w-4 sm:w-6 flex items-center justify-center text-gray-300 mx-1">
                              <ChevronRight size={16} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>

              {!isDashboard && (
                <motion.div 
                  className="mt-2 text-center text-xs text-gray-400 font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  Graj regularnie po większe nagrody
                </motion.div>
              )}
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
