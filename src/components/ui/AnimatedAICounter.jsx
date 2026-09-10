import React, { useState, useEffect, useRef } from "react";

export default function AnimatedAICounter({ id, aiTokens, className, iconClassName, textClassName }) {
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
    <div id={id} className={className} title={`${displayed} monet AI`}>
      <img
        src="/icons/AI Coin.svg"
        alt="AI Coin"
        className={`${iconClassName} ${isBouncing ? "animate-token-bounce z-10" : ""}`}
      />
      <span className={textClassName}>{displayed}</span>
    </div>
  );
}
