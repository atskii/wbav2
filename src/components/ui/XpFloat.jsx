import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function XpFloat({ xpItems }) {
  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      <AnimatePresence>
        {xpItems.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.4, y: item.y, x: item.x - 40 }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0.5, 1.25, 1.1, 0.9],
              y: item.y - 110,
              x: item.x - 40,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6, ease: [0.175, 0.885, 0.32, 1.275] }}
            className="absolute flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-full shadow-[0_8px_25px_rgba(45,158,107,0.45)] border-2 border-white/40 backdrop-blur-md"
          >
            <img src="/icons/star.svg" alt="XP Star" className="w-5 h-5 object-contain drop-shadow" />
            <span className="font-extrabold text-base tracking-wide drop-shadow-md">
              +{item.xp} XP
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
