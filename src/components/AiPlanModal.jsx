import React from "react";
import { X, Sparkles, Check } from "lucide-react";

export default function AiPlanModal({ isOpen, onClose, data }) {
  if (!isOpen) return null;

  // Obsługa sytuacji, gdy przekazano obiekt lub zwykły string
  const isObject = typeof data === "object" && data !== null;
  const simpleMessage = typeof data === "string" ? data : (data?.coachMessage || "AI pomyślnie zoptymalizowało Twój harmonogram na dzisiaj!");

  return (
    <div 
      className="fixed inset-0 z-[700] flex items-center justify-center bg-[#1A2F22]/40 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl w-full max-w-lg border border-[#E8DDD0] animate-in zoom-in-95 duration-200 relative overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Dekoracyjne tło u góry */}
        <div className="bg-[#FAF8F5] px-6 sm:px-7 pt-6 sm:pt-7 pb-5 border-b border-[#E8DDD0]">
          {/* Nagłówek pop-upu */}
          <div className="flex items-center justify-between flex-shrink-0 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#E8F4ED] text-[#1E5C36] flex items-center justify-center shadow-sm">
                <Sparkles size={22} />
              </div>
              <div>
                <h3 className="font-bold text-[#1A2F22] text-xl leading-tight">Wiadomość od AI</h3>
                <p className="text-xs font-semibold text-[#5A7368] tracking-wide">Twój asystent produktywności</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-[#F2EFE9] rounded-full transition-all text-[#9FB5AD] hover:text-[#1A2F22] cursor-pointer"
              title="Zamknij"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Zawartość pop-upu (wiadomość) */}
        <div className="p-6 sm:p-7 overflow-y-auto pr-3 flex-1 text-[#1A2F22]">
            <div className="bg-[#FAF8F5] rounded-2xl p-5 sm:p-6 border border-[#E8DDD0] relative">
              <p className="text-sm sm:text-[15px] text-[#2C4035] leading-relaxed font-medium whitespace-pre-wrap relative z-10">
                {simpleMessage}
              </p>
            </div>
        </div>

        {/* Przycisk akceptacji */}
        <div className="px-6 sm:px-7 pb-6 sm:pb-7 pt-2">
          <button 
            onClick={onClose} 
            className="w-full py-3.5 px-4 bg-[#1E5C36] hover:bg-[#164628] text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-[#1E5C36]/20 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
          >
            <Check size={18} />
            Rozumiem, zaczynamy!
          </button>
        </div>
      </div>
    </div>
  );
}
