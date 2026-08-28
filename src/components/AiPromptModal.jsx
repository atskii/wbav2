import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Wand2 } from 'lucide-react';

function AiPromptModal({ isOpen, onClose, onSubmit }) {
  const [prompt, setPrompt] = useState("");

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[700] flex items-center justify-center p-3 sm:p-4">
        {/* Tło przyciemniające */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#1A2F22]/40 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg bg-white border border-[#E8DDD0] rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col z-10"
        >
          {/* Header */}
          <div className="p-6 sm:p-7 pb-4 bg-[#FAF8F5] border-b border-[#E8DDD0] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#E8F4ED] text-[#1E5C36] rounded-2xl shadow-sm">
                <Sparkles size={22} />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#1A2F22]">Inteligentny Planista</h2>
                <p className="text-xs font-semibold text-[#5A7368] tracking-wide">Dopasuj plan dnia do swoich potrzeb</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-[#9FB5AD] hover:text-[#1A2F22] hover:bg-[#F2EFE9] rounded-full transition-all cursor-pointer"
            >
              <X size={22} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 sm:p-7 space-y-4">
            <p className="text-sm text-[#5A7368] leading-relaxed">
              Masz jakieś szczególne życzenia lub uwagi na dzisiaj? AI weźmie je pod uwagę podczas optymalizacji Twojego harmonogramu.
            </p>
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="np. 'Muszę skończyć raport przed 12:00', 'Dziś mam gorszy dzień, daj mi lżejsze zadania popołudniu'..."
                className="w-full h-32 p-4 bg-[#FAF8F5] border-2 border-[#E8DDD0] rounded-2xl text-[#1A2F22] placeholder-[#9FB5AD] focus:outline-none focus:border-[#2D9E6B] focus:bg-white resize-none transition-all text-sm leading-relaxed"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 sm:p-7 pt-2 bg-white flex justify-end items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-3 text-sm font-bold text-[#5A7368] hover:text-[#1A2F22] hover:bg-[#F2EFE9] rounded-2xl transition-all cursor-pointer"
            >
              Anuluj
            </button>
            <button
              onClick={() => {
                onSubmit(prompt);
                setPrompt("");
              }}
              className="px-6 py-3 text-sm font-bold bg-[#1E5C36] hover:bg-[#164628] text-white rounded-2xl shadow-lg shadow-[#1E5C36]/20 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
            >
              <Wand2 size={18} />
              Ułóż plan dnia
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default AiPromptModal;
