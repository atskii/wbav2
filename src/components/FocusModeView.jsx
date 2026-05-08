import { useState, useEffect } from "react";
import { X, Play, Pause, RotateCcw, Check, Target } from "lucide-react";

// ═══════════════════════════════════════════════════
//  FOCUS MODE
// ═══════════════════════════════════════════════════
export default function FocusModeView({ task, onClose, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);


  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => { setIsActive(false); setTimeLeft(25 * 60); };

  const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const secs = (timeLeft % 60).toString().padStart(2, '0');

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#1A2F22] text-white p-6 animate-fade-in-up">
      <button onClick={onClose} className="absolute top-8 left-8 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all flex items-center gap-2">
        <X size={18} /> Zakończ skupienie
      </button>
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2D9E6B]/20 text-[#2D9E6B] font-bold text-xs uppercase tracking-widest mb-8 border border-[#2D9E6B]/30">
          <Target size={14} /> Tryb Głębokiej Pracy
        </div>
        <h1 className="font-lora text-3xl font-bold mb-4">{task.title}</h1>
        {task.desc && <p className="text-[#9FB5AD] text-sm mb-12 max-w-sm mx-auto">{task.desc}</p>}
        <div className="relative flex items-center justify-center mb-12">
          <div className={`absolute w-64 h-64 rounded-full border-[6px] transition-all duration-1000 ${isActive ? 'border-[#2D9E6B] scale-105 opacity-100 animate-pulse' : 'border-white/10 scale-100 opacity-50'}`} />
          <div className="text-7xl font-mono font-light tracking-tighter">{mins}:{secs}</div>
        </div>
        <div className="flex items-center justify-center gap-6">
          <button onClick={resetTimer} className="p-4 rounded-full bg-white/5 hover:bg-white/10 text-[#9FB5AD] hover:text-white transition-all"><RotateCcw size={24} /></button>
          <button onClick={toggleTimer} className={`p-6 rounded-full flex items-center justify-center transition-all transform hover:scale-105 shadow-xl ${isActive ? 'bg-amber-500 hover:bg-amber-400 text-white' : 'bg-[#2D9E6B] hover:bg-emerald-400 text-white'}`}>
            {isActive ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
          </button>
          <button onClick={() => { onComplete(task.id); onClose(); }} className="p-4 rounded-full bg-white/5 hover:bg-white/10 text-[#9FB5AD] hover:text-[#2D9E6B] transition-all"><Check size={24} /></button>
        </div>
      </div>
    </div>
  );
}
