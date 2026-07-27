import { Check, Clock, Play, Pencil, Trash2, Zap } from "lucide-react";
import PBadge from "./ui/PBadge";
import { motion, AnimatePresence } from "framer-motion";
import { calculateTaskXP } from "../lib/xpHelpers";

export default function TaskCard({ task, onToggle, onFocus, onDelete, onEdit }) {
  const taskXP = calculateTaskXP(task);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2, scale: 1.01 }}
      className={`bg-white rounded-2xl border border-[#E8DDD0] p-4 transition-all duration-200 hover:shadow-md hover:border-[#D4C9BC] group ${task.done ? "opacity-55" : ""}`}
    >
      <div className="flex items-start gap-3">
        <motion.button 
          whileTap={{ scale: 0.8 }}
          onClick={(e) => onToggle(task.id, e)} 
          title="zaznacz zadanie jako wykonane"
          className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-150 ${task.done ? "bg-[#1E5C36] border-[#1E5C36]" : "border-[#C4BBAF] hover:border-[#1E5C36] group-hover:border-[#2D9E6B]"}`}
        >
          <AnimatePresence>
            {task.done && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <Check size={11} className="text-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`text-sm font-semibold text-[#1A2F22] leading-snug ${task.done ? "line-through opacity-60" : ""}`}>{task.title}</p>
          </div>
          {task.t && <p className="text-[10px] text-[#9FB5AD] mt-0.5 font-medium">{task.t}</p>}
          {task.desc && <p className="text-xs text-[#5A7368] mt-1 leading-relaxed">{task.desc}</p>}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="flex items-center gap-1 text-[10px] font-bold text-[#5A7368] bg-[#F5EFE6] px-2 py-1 rounded-lg border border-[#E8DDD0]">
              <Clock size={12} /> {task.duration || "Brak"}
            </span>
            {task.deadline && (
              <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg border border-red-100">
                Deadline: {task.deadline}
              </span>
            )}
            <span className="text-[10px] font-bold text-[#1E5C36] bg-[#E8F4ED] px-2 py-1 rounded-lg border border-[#2D9E6B]/20">
              Trudność: {task.difficulty || 1}/5
            </span>
            <span className="flex items-center gap-0.5 text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
              <Zap size={11} className="fill-amber-400 text-amber-500" />
              +{taskXP} XP
            </span>
            <PBadge p={task.p} />
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
          {!task.done && (
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => onFocus(task)} title="tryb skupienia" className="w-8 h-8 rounded-full bg-[#E8F4ED] text-[#1E5C36] hover:bg-[#1E5C36] hover:text-white flex items-center justify-center shadow-sm">
              <Play size={14} className="ml-0.5" />
            </motion.button>
          )}
          {/* NOWY PRZYCISK EDYCJI */}
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => onEdit(task)} title="Edytuj zadanie" className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white flex items-center justify-center shadow-sm">
            <Pencil size={14} />
          </motion.button>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => onDelete(task.id)} title="usuń zadanie" className="w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center shadow-sm">
            <Trash2 size={14} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
