import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Sparkles } from "lucide-react";

export default function PlantCatalogModal({
  isOpen,
  onClose,
  currentPlant = "image",
  onSelectPlant,
  streakCount = 0,
  claimedDays = [],
}) {
  if (!isOpen) return null;

  // Normalized current ID
  const activePlantId = currentPlant === 'cactus' ? 'cactus' 
    : currentPlant === 'bamboo' ? 'bamboo' 
    : currentPlant === 'bonsai' ? 'bonsai' 
    : 'monstera';

  const plants = [
    {
      id: "monstera",
      rawId: "image",
      name: "Monstera Deliciosa",
      requiredStreak: 0,
      isUnlocked: true,
      renderPreview: () => (
        <div className="w-full h-20 flex items-center justify-center">
          <img
            src="/plant/step 10.png"
            alt="Monstera Deliciosa"
            className="h-20 w-auto object-contain drop-shadow-sm"
          />
        </div>
      ),
    },
    {
      id: "cactus",
      rawId: "cactus",
      name: "Kaktus Pustynny",
      requiredStreak: 3,
      isUnlocked: streakCount >= 3 || claimedDays.includes(3),
      renderPreview: () => (
        <div className="w-full h-20 flex flex-col items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-[#FF9CEE] mb-0.5 animate-pulse" />
          {/* Cactus Stem */}
          <div className="w-8 h-10 bg-[#2D9E6B] rounded-t-[1.6rem] shadow-inner relative overflow-hidden flex justify-center">
            <div className="absolute inset-0 opacity-25 bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,#1A2F22_2px,#1A2F22_4px)]" />
          </div>
          {/* Pot */}
          <div className="w-14 h-6 bg-[#5A7368] rounded-b-xl rounded-t-xs shadow flex flex-col items-center">
            <div className="w-16 h-1.5 bg-[#3E5249] rounded-xs -mt-0.5 shadow-xs" />
          </div>
        </div>
      ),
    },
    {
      id: "bonsai",
      rawId: "bonsai",
      name: "Bonsai Zen",
      requiredStreak: 7,
      isUnlocked: streakCount >= 7 || claimedDays.includes(7),
      renderPreview: () => (
        <div className="w-full h-20 flex items-center justify-center">
          <img
            src="/bonsai/bonsai10.png"
            alt="Bonsai Zen"
            className="h-24 w-auto object-contain drop-shadow-sm pb-1"
          />
        </div>
      ),
    },
    {
      id: "bamboo",
      rawId: "bamboo",
      name: "Bambus Szczęścia",
      requiredStreak: 14,
      isUnlocked: streakCount >= 14 || claimedDays.includes(14),
      renderPreview: () => (
        <div className="w-full h-20 flex flex-col items-center justify-center pt-1">
          <svg className="w-12 h-16 object-contain drop-shadow-sm -mb-2 z-10" viewBox="0 0 100 100" fill="none">
            <rect x="37" y="40" width="6" height="60" rx="1.5" fill="#43A047" />
            <line x1="37" y1="60" x2="43" y2="60" stroke="#2E7D32" strokeWidth="1.2" />
            <line x1="37" y1="80" x2="43" y2="80" stroke="#2E7D32" strokeWidth="1.2" />
            <rect x="47" y="50" width="6" height="50" rx="1.5" fill="#66BB6A" />
            <line x1="47" y1="70" x2="53" y2="70" stroke="#388E3C" strokeWidth="1.2" />
            <rect x="57" y="45" width="5" height="55" rx="1.5" fill="#43A047" />
            <line x1="57" y1="65" x2="62" y2="65" stroke="#2E7D32" strokeWidth="1.2" />
            <path d="M43 50 C 53 44, 56 36, 56 36 C 56 36, 47 43, 43 50 Z" fill="#81C784" />
            <path d="M53 60 C 65 54, 68 46, 68 46 C 68 46, 58 55, 53 60 Z" fill="#81C784" />
          </svg>
          <div className="relative w-16 h-3.5 bg-gradient-to-b from-[#FFF8E1] to-[#FFE082] rounded-b-xl rounded-t-sm overflow-hidden border border-[#FFD54F]/50 z-20">
            <div className="absolute top-0 w-18 h-1 bg-[#F9A825] rounded-sm -ml-1" />
          </div>
        </div>
      ),
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 10 }}
          transition={{ type: "spring", damping: 25, stiffness: 320 }}
          className="relative w-full max-w-[340px] sm:max-w-[360px] bg-white rounded-3xl shadow-2xl border border-[#E8DDD0] overflow-hidden z-10 p-5 flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Minimal Header */}
          <div className="flex items-center justify-between pb-3 mb-1 border-b border-[#F0EAE1]">
            <h3 className="font-lora text-lg font-bold text-[#1A2F22]">
              Katalog Roślin
            </h3>

            <div className="flex items-center gap-2">

              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-[#F5EFE6] hover:bg-[#E8DDD0] text-[#1A2F22] flex items-center justify-center transition-colors cursor-pointer"
                title="Zamknij"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Minimal 2x2 Grid of Square Cards */}
          <div className="grid grid-cols-2 gap-3 pt-3">
            {plants.map((plant) => {
              const isSelected = activePlantId === plant.id;
              const isLocked = !plant.isUnlocked;

              return (
                <div
                  key={plant.id}
                  onClick={() => {
                    if (!isLocked) {
                      onSelectPlant(plant.rawId);
                      onClose();
                    }
                  }}
                  className={`relative aspect-square rounded-2xl flex flex-col items-center justify-between p-2.5 transition-all duration-200 select-none ${
                    isLocked
                      ? "bg-stone-100/90 border border-stone-200 cursor-not-allowed"
                      : isSelected
                      ? "bg-emerald-50/60 border-2 border-[#078B83] shadow-md ring-2 ring-[#078B83]/20 cursor-pointer"
                      : "bg-[#FAF7F2] border border-[#E8DDD0] hover:border-[#078B83]/60 hover:bg-white hover:shadow-md cursor-pointer"
                  }`}
                >
                  {/* Selected Active Indicator Checkmark */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#078B83] text-white flex items-center justify-center shadow-xs z-10">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}

                  {/* Plant visual preview */}
                  <div
                    className={`w-full flex-1 flex items-center justify-center transition-all ${
                      isLocked ? "grayscale opacity-35" : ""
                    }`}
                  >
                    {plant.renderPreview()}
                  </div>

                  {/* Locked Center Badge: 3 🔥 */}
                  {isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="flex items-center gap-1 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full shadow-md border border-orange-200/90">
                        <span className="font-black text-sm text-[#D9480F]">
                          {plant.requiredStreak}
                        </span>
                        <img
                          src="/icons/fire.svg"
                          alt="Streak"
                          className="w-3.5 h-3.5 object-contain"
                        />
                      </div>
                    </div>
                  )}

                  {/* Compact Plant Name */}
                  <div className="w-full text-center mt-1">
                    <span
                      className={`text-xs font-semibold block truncate ${
                        isLocked
                          ? "text-stone-400"
                          : isSelected
                          ? "text-[#078B83] font-bold"
                          : "text-[#1A2F22]"
                      }`}
                    >
                      {plant.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
