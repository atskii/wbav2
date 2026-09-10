import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { fireCustomConfetti } from './StreakPlant';

// Plant visual data for the unlock animation
const PLANT_UNLOCK_DATA = {
  cactus: {
    name: "Kaktus Pustynny",
    description: "Wytrzymały towarzysz, który przetrwa każdą suszę. Odblokowany za 3 dni serii!",
    renderVisual: () => (
      <div className="flex flex-col items-center justify-center">
        <Sparkles className="w-5 h-5 text-[#FF9CEE] mb-1 animate-pulse" />
        <div className="w-14 h-18 bg-[#2D9E6B] rounded-t-[2.5rem] shadow-inner relative overflow-hidden flex justify-center">
          <div className="absolute inset-0 opacity-25 bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,#1A2F22_2px,#1A2F22_4px)]" />
        </div>
        <div className="w-22 h-9 bg-[#5A7368] rounded-b-xl rounded-t-xs shadow flex flex-col items-center">
          <div className="w-24 h-2.5 bg-[#3E5249] rounded-xs -mt-0.5 shadow-xs" />
        </div>
      </div>
    ),
  },
  bonsai: {
    name: "Bonsai Zen",
    description: "Miniaturowe drzewo, symbol cierpliwości i harmonii. Odblokowany za 7 dni serii!",
    renderVisual: () => (
      <div className="flex items-center justify-center">
        <svg className="w-24 h-24 object-contain" viewBox="0 0 100 100" fill="none">
          <ellipse cx="40" cy="35" rx="18" ry="11" fill="#2E7D32" opacity="0.9" />
          <ellipse cx="65" cy="30" rx="16" ry="9" fill="#388E3C" opacity="0.95" />
          <ellipse cx="50" cy="22" rx="14" ry="8" fill="#4CAF50" />
          <path d="M48 40 C 45 55, 38 65, 52 80 L 46 80 C 34 65, 40 52, 44 40 Z" fill="#5D4037" />
          <path d="M50 48 C 60 52, 64 45, 66 40" stroke="#5D4037" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M30 80 L70 80 L65 92 L35 92 Z" fill="#263238" />
          <rect x="26" y="77" width="48" height="4" rx="1.5" fill="#37474F" />
        </svg>
      </div>
    ),
  },
  bamboo: {
    name: "Bambus Szczęścia",
    description: "Szybko rosnący symbol fortuny i dobrobytu. Odblokowany za 14 dni serii!",
    renderVisual: () => (
      <div className="flex items-center justify-center">
        <svg className="w-24 h-24 object-contain" viewBox="0 0 100 100" fill="none">
          <rect x="37" y="18" width="6" height="60" rx="1.5" fill="#43A047" />
          <line x1="37" y1="36" x2="43" y2="36" stroke="#2E7D32" strokeWidth="1.2" />
          <line x1="37" y1="54" x2="43" y2="54" stroke="#2E7D32" strokeWidth="1.2" />
          <rect x="47" y="26" width="6" height="52" rx="1.5" fill="#66BB6A" />
          <line x1="47" y1="44" x2="53" y2="44" stroke="#388E3C" strokeWidth="1.2" />
          <line x1="47" y1="62" x2="53" y2="62" stroke="#388E3C" strokeWidth="1.2" />
          <rect x="57" y="22" width="5" height="56" rx="1.5" fill="#43A047" />
          <line x1="57" y1="40" x2="62" y2="40" stroke="#2E7D32" strokeWidth="1.2" />
          <path d="M43 26 C 53 20, 56 12, 56 12 C 56 12, 47 19, 43 26 Z" fill="#81C784" />
          <path d="M53 36 C 65 30, 68 22, 68 22 C 68 22, 58 31, 53 36 Z" fill="#81C784" />
          <path d="M37 45 C 26 39, 23 32, 23 32 C 23 32, 32 41, 37 45 Z" fill="#66BB6A" />
          <path d="M30 78 L70 78 L66 92 L34 92 Z" fill="#FFF8E1" stroke="#FFE082" strokeWidth="1.5" />
        </svg>
      </div>
    ),
  },
};

export default function PlantUnlockAnimation({ plantId, onClose }) {
  const plant = PLANT_UNLOCK_DATA[plantId];

  useEffect(() => {
    // Fire confetti on mount
    const timer = setTimeout(() => {
      fireCustomConfetti();
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Auto-close after a while
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!plant) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        onClick={onClose}
      >
        {/* Main container – plant circle on left, expanding banner to the right */}
        <motion.div
          className="flex items-center"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", damping: 22, stiffness: 180 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Plant circle – appears first with a bounce */}
          <motion.div
            className="relative z-10 w-28 h-28 rounded-full bg-gradient-to-br from-[#FAF7F2] to-[#F0EAE1] border-4 border-[#E8DDD0] shadow-2xl flex items-center justify-center flex-shrink-0"
            initial={{ scale: 0, rotate: -60 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", damping: 16, stiffness: 160, delay: 0.15 }}
          >
            {/* Glow ring */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-[#2D9E6B]/30"
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            />
            {plant.renderVisual()}
          </motion.div>

          {/* Expanding banner to the right */}
          <motion.div
            className="relative -ml-6 bg-gradient-to-r from-[#FAF7F2] to-[#F5EFE6] border-2 border-[#E8DDD0] rounded-r-2xl shadow-xl overflow-hidden flex flex-col justify-center pl-10 pr-6 py-5"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "auto", opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* "ODBLOKOWANO" label */}
            <motion.div
              className="flex items-center gap-1.5 mb-1.5"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1, duration: 0.4 }}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FF9800]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#FF9800]">
                Odblokowano
              </span>
            </motion.div>

            {/* Plant name */}
            <motion.h3
              className="text-lg font-black text-[#1A2F22] whitespace-nowrap leading-tight"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.25, duration: 0.4 }}
            >
              {plant.name}
            </motion.h3>

            {/* Description */}
            <motion.p
              className="text-xs text-[#5A7368] mt-1 max-w-[200px] leading-relaxed"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.4, duration: 0.4 }}
            >
              {plant.description}
            </motion.p>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
