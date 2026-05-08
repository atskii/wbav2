import { CheckCircle } from "lucide-react";

// ═══════════════════════════════════════════════════
//  STREAK PLANT (OBLICZENIA NA ŻYWO - NAPRAWIONE)
// ═══════════════════════════════════════════════════
export default function StreakPlant({ tasks }) {
  const total = tasks.length;
  const done = tasks.filter(t => t.done).length;
  const progress = total === 0 ? 0 : Math.round((done / total) * 100);


  const plantHeight = Math.max(15, progress);

  return (
    <div className="pt-4 xl:pt-[52px]">
      <h3 className="font-lora text-xl font-bold text-[#1A2F22] mb-2">Twoja roślinka streaku</h3>
      <p className="text-xs text-[#5A7368] mb-6 leading-relaxed">
        Twoja roślinka rośnie razem z Twoją konsekwencją. Każde ukończone zadanie zasila roślinę.
      </p>

      <div className="relative h-72 mb-6">
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
        <div className={`absolute left-1/2 -translate-x-1/2 text-5xl transition-all duration-700 z-30 ${progress === 100 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} style={{ bottom: `${64 + Math.round(30 + (plantHeight / 100) * 160) - 20}px` }}>
          🌸
        </div>
      </div>

      <div>
        <div className="flex justify-between mb-2">
          <span className="text-xs font-semibold text-[#5A7368]">Postęp dnia</span>
          <span translate="no" className="text-xs font-bold text-[#1E5C36]">{progress}% ({done}/{total})</span>
        </div>
        <div className="h-2.5 bg-[#F5EFE6] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#2D9E6B] to-[#1E5C36] rounded-full transition-all duration-1000 ease-out" style={{ width: `${progress}%` }} />
        </div>
        {progress === 100 && (
          <div className="bg-[#E8F4ED] rounded-2xl px-3 py-2 mt-4 flex items-start gap-2 animate-fade-in-up">
            <CheckCircle size={14} className="text-[#2D9E6B] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[#1E5C36] font-medium leading-relaxed">
              Świetna robota! Roślinka zakwitła. Odpocznij!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
