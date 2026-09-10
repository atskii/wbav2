import React, { useState, useEffect, useRef } from "react";

export default function AnimatedAICounter({ id, aiTokens, className, iconClassName, textClassName, onClick, showPlus }) {
  const [displayed, setDisplayed] = useState(aiTokens);
  const [isBouncing, setIsBouncing] = useState(false);
  const isCounting = useRef(false);

  // Sync initial state if it mounts with a weird state
  useEffect(() => {
    if (!isCounting.current && Math.abs(aiTokens - displayed) > 50) {
      setDisplayed(aiTokens);
    }
  }, [aiTokens]);

  useEffect(() => {
    if (aiTokens === displayed) {
      isCounting.current = false;
      return;
    }

    const delay = isCounting.current ? 250 : 700;
    isCounting.current = true;
    const direction = aiTokens > displayed ? 1 : -1;

    const timer = setTimeout(() => {
      setDisplayed(prev => prev + direction);
      setIsBouncing(true);
      setTimeout(() => setIsBouncing(false), 150);
    }, delay);

    return () => clearTimeout(timer);
  }, [aiTokens, displayed]);

  return (
    <div 
      id={id} 
      className={`${className} ${onClick ? 'cursor-pointer' : ''}`} 
      title={`${displayed} monet AI`}
      onClick={onClick}
    >
      <div className="relative flex items-center justify-center">
        <img
          src="/icons/AI Coin.svg"
          alt="AI Coin"
          className={`${iconClassName} ${isBouncing ? "animate-token-bounce z-10" : ""}`}
        />
        {showPlus && (
          <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#2D9E6B] rounded-full border border-white flex items-center justify-center shadow-sm">
            <span className="text-white text-[10px] font-black leading-none mb-[0.5px] ml-[0.5px]">+</span>
          </div>
        )}
      </div>
      <span className={textClassName}>{displayed}</span>
    </div>
  );
}
