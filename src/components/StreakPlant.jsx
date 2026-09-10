import { useState, useEffect } from "react";
import { CheckCircle, RefreshCw, Zap, Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateTaskXP } from "../lib/xpHelpers";

export function fireCustomConfetti() {
  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "99999";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  const width = (canvas.width = window.innerWidth);
  const height = (canvas.height = window.innerHeight);

  const colors = ['#2D9E6B', '#1E5C36', '#FFB7B2', '#FF9CEE', '#057E85', '#F59E0B', '#3B82F6'];
  const particles = [];

  // Left corner cannon
  for (let i = 0; i < 80; i++) {
    particles.push({
      x: width * 0.1,
      y: height,
      vx: Math.random() * 14 + 5,
      vy: -(Math.random() * 16 + 12),
      size: Math.random() * 10 + 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rSpeed: Math.random() * 12 - 6,
    });
  }

  // Right corner cannon
  for (let i = 0; i < 80; i++) {
    particles.push({
      x: width * 0.9,
      y: height,
      vx: -(Math.random() * 14 + 5),
      vy: -(Math.random() * 16 + 12),
      size: Math.random() * 10 + 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rSpeed: Math.random() * 12 - 6,
    });
  }

  const gravity = 0.4;
  let startTime = Date.now();

  function render() {
    ctx.clearRect(0, 0, width, height);
    let active = false;

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += gravity;
      p.rotation += p.rSpeed;

      if (p.y < height + 30) active = true;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    });

    if (active && Date.now() - startTime < 4000) {
      requestAnimationFrame(render);
    } else {
      canvas.remove();
    }
  }

  render();
}

// ═══════════════════════════════════════════════════
//  STREAK PLANT (OBLICZENIA NA ŻYWO)
// ═══════════════════════════════════════════════════
export default function StreakPlant({ tasks = [], userEmail = null }) {
  const total = tasks.length;
  const doneTasks = tasks.filter(t => t.done);
  const done = doneTasks.length;

  const totalXP = tasks.reduce((acc, t) => acc + calculateTaskXP(t), 0);
  const earnedXP = doneTasks.reduce((acc, t) => acc + calculateTaskXP(t), 0);

  const xpProgress = totalXP === 0 ? 0 : Math.round((earnedXP / totalXP) * 100);
  const plantHeight = Math.max(15, xpProgress);

  const [hasFlowered, setHasFlowered] = useState(false);
  const [plantType, setPlantType] = useState('image'); // 'image' or 'cactus'

  const currentStep = xpProgress === 0 ? 1 : Math.ceil(xpProgress / 10);

  useEffect(() => {
    if (xpProgress === 100 && !hasFlowered && total > 0) {
      setHasFlowered(true);
      fireCustomConfetti();
    } else if (xpProgress < 100) {
      setHasFlowered(false);
    }
  }, [xpProgress, hasFlowered, total]);

  return (
    <div id="tutorial-streak-plant" className="bg-white md:bg-white/90 backdrop-blur-sm md:rounded-3xl p-5 md:p-6 md:border md:border-[#E8DDD0] md:shadow-sm md:hover:shadow-md transition-all relative overflow-visible flex flex-col">
      {/* 1. TYTUŁ: Odstęp od dołu regulowany klasą mb-2 (np. mb-1, mb-2, mb-3, mb-4) */}
      <h3 className="font-lora text-xl font-bold text-[#1A2F22] text-center mb-3">Roślinka Streaku</h3>

      <div className="flex flex-col items-center w-full">
        {/* 2. KONTENER ROŚLINKY: Wysokość regulowana klasą h-64 (np. h-60, h-64, h-72) i odstęp mb-3 */}
        <div className="relative h-100 w-full mb-2">
          {plantType === 'cactus' ? (
            <>
              {/* Doniczka - na samym dole */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-36 h-16 bg-[#5A7368] rounded-b-3xl rounded-t-sm z-20 flex flex-col items-center">
                <div className="w-40 h-5 bg-[#3E5249] rounded-sm -mt-1.5 shadow-md" />
              </div>
              {/* Kaktus - rośnie z góry doniczki */}
              <div
                className="absolute left-1/2 -translate-x-1/2 w-20 bg-[#2D9E6B] rounded-t-[3rem] transition-all duration-1000 ease-out z-10 shadow-inner"
                style={{ bottom: '64px', height: `${Math.round(30 + (plantHeight / 100) * 160)}px` }}
              >
                <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(90deg,transparent,transparent_4px,#1A2F22_4px,#1A2F22_6px)] rounded-t-[3rem]" />
              </div>
              {/* Kwiatek - pojawia się przy 100% */}
              <AnimatePresence>
                {xpProgress === 100 && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0, rotate: -45 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.5, type: "spring" }}
                    className="absolute left-1/2 -translate-x-1/2 z-30"
                    style={{ bottom: `${64 + Math.round(30 + (plantHeight / 100) * 160) - 10}px` }}
                  >
                    <Sparkles className="w-8 h-8 text-[#FFB7B2] animate-pulse drop-shadow-md" />
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            /* Roślina ze zdjęć - doniczka w stałym rozmiarze zakotwiczona na dole */
            <div className="relative w-full h-full flex justify-center items-end pb-2">
              <AnimatePresence>
                <motion.img
                  key={currentStep}
                  src={`/plant/step ${currentStep}.png`}
                  alt={`Etap wzrostu ${currentStep}`}
                  initial={{ opacity: 0, filter: "blur(4px)", scale: 0.98 }}
                  animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                  exit={{ opacity: 0, filter: "blur(4px)", scale: 1.02 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  style={{ transformOrigin: "bottom center" }}
                  className="absolute bottom-0 w-48 sm:w-52 h-auto object-contain object-bottom pointer-events-none"
                />
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* 3. PRZYCISK ZMIANY ROŚLINKI: Odstęp od paska postępu regulowany klasą mb-3 (np. mb-2, mb-3, mb-4) */}
        <div className="flex justify-center mb-3">
          <button
            onClick={() => setPlantType(prev => prev === 'cactus' ? 'image' : 'cactus')}
            className="flex items-center gap-1.5 bg-[#078B83] hover:bg-[#06736D] text-white px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors cursor-pointer"
          >
            Zmień roślinkę <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* 4. PASEK POSTĘPU DNIA */}
      <div className="w-full pt-1">
        <div className="flex justify-between mb-2">
          <span className="text-xs font-semibold text-[#5A7368]">Postęp dnia</span>
          <span translate="no" className="text-xs font-bold text-[#1E5C36]">{done}/{total}</span>
        </div>
        <div className="h-2.5 bg-[#F5EFE6] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#2D9E6B] to-[#1E5C36] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${xpProgress}%` }}
            transition={{ type: "spring", stiffness: 50, damping: 15 }}
          />
        </div>

      </div>


    </div>
  );
}
