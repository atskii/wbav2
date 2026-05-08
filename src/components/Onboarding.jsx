import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [hours, setHours] = useState(8);

  const [startHour, setStartHour] = useState("08");
  const [startMinute, setStartMinute] = useState("00");

  const [picks, setPicks] = useState([]);

  const OPTS = ["Wyjście na słońce", "Kilka minut przerwy", "Dobra kawa", "Krótki spacer", "Rozmowa z bliskim", "Mała przekąska", "Przerwa od pracy", "Muzyka", "Zmiana otoczenia"];

  const toggle = b => setPicks(p => p.includes(b) ? p.filter(x => x !== b) : [...p, b]);

  const handleHourChange = (delta) => {
    let newH = parseInt(startHour, 10) + delta;
    if (isNaN(newH)) newH = 8 + delta;
    if (newH < 0) newH = 23;
    if (newH > 23) newH = 0;
    setStartHour(String(newH).padStart(2, "0"));
  };

  const handleMinuteChange = (delta) => {
    let newM = parseInt(startMinute, 10) + delta;
    if (isNaN(newM)) newM = delta;
    if (newM < 0) newM = 59;
    if (newM > 59) newM = 0;
    setStartMinute(String(newM).padStart(2, "0"));
  };

  const handleHourInputBlur = () => {
    let val = parseInt(startHour, 10);
    if (isNaN(val)) val = 8;
    if (val < 0) val = 0;
    if (val > 23) val = 23;
    setStartHour(String(val).padStart(2, "0"));
  };

  const handleMinuteInputBlur = () => {
    let val = parseInt(startMinute, 10);
    if (isNaN(val)) val = 0;
    if (val < 0) val = 0;
    if (val > 59) val = 59;
    setStartMinute(String(val).padStart(2, "0"));
  };

  return (
    <div className="font-dm-sans min-h-screen bg-[#F5EFE6] flex flex-col">
      <nav className="bg-white/85 backdrop-blur-xl border-b border-[#E8DDD0] px-6 py-4"><span className="font-lora text-[#1E5C36] font-bold text-xl">Wellbeing app</span></nav>
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative overflow-hidden">
        <div className="relative z-10 bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg border border-[#E8DDD0]">
          <div className="flex justify-center gap-2 mb-7">
            {[0, 1, 2].map(i => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-400 ${i <= step ? "w-10 bg-[#1E5C36]" : "w-5 bg-[#E8DDD0]"}`} />
            ))}
          </div>
          {step === 0 && <>
            <h2 className="font-lora text-2xl font-bold text-center text-[#1A2F22] mb-2">Pytanie 1 z 3</h2>
            <p className="text-center text-[#5A7368] mb-8 text-sm">Ile godzin dziennie spędzasz w pracy?</p>
            <div className="flex items-center justify-center gap-6">
              <button onClick={() => setHours(h => Math.max(1, h - 1))} className="w-12 h-12 rounded-2xl border-2 border-[#E8DDD0] flex items-center justify-center text-xl font-bold text-[#5A7368] transition-all">−</button>
              <span className="text-6xl font-bold text-[#1A2F22] w-20 text-center">{hours}</span>
              <button onClick={() => setHours(h => Math.min(24, h + 1))} className="w-12 h-12 rounded-2xl border-2 border-[#E8DDD0] flex items-center justify-center text-xl font-bold text-[#5A7368] transition-all">+</button>
            </div>
          </>}
          {step === 1 && <>
            <h2 className="font-lora text-2xl font-bold text-center text-[#1A2F22] mb-2">Pytanie 2 z 3</h2>
            <p className="text-center text-[#5A7368] mb-4 text-sm">Od której godziny chcesz rozpoczynać swoje zadania?</p>

            <div className="flex items-center justify-center gap-4 my-6">
              <div className="flex flex-col items-center">
                <button onClick={() => handleHourChange(1)} className="p-2 text-[#5A7368] hover:text-[#1E5C36] transition-colors hover:-translate-y-1"><ChevronUp size={36} strokeWidth={2.5} /></button>
                <input
                  type="text"
                  value={startHour}
                  onChange={e => setStartHour(e.target.value.replace(/\D/g, ''))}
                  onBlur={handleHourInputBlur}
                  className="w-24 text-center text-6xl font-bold text-[#1A2F22] bg-transparent outline-none focus:text-[#2D9E6B] transition-colors"
                  maxLength={2}
                />
                <button onClick={() => handleHourChange(-1)} className="p-2 text-[#5A7368] hover:text-[#1E5C36] transition-colors hover:translate-y-1"><ChevronDown size={36} strokeWidth={2.5} /></button>
              </div>
              <div className="text-5xl font-bold text-[#1A2F22] pb-2">:</div>
              <div className="flex flex-col items-center">
                <button onClick={() => handleMinuteChange(1)} className="p-2 text-[#5A7368] hover:text-[#1E5C36] transition-colors hover:-translate-y-1"><ChevronUp size={36} strokeWidth={2.5} /></button>
                <input
                  type="text"
                  value={startMinute}
                  onChange={e => setStartMinute(e.target.value.replace(/\D/g, ''))}
                  onBlur={handleMinuteInputBlur}
                  className="w-24 text-center text-6xl font-bold text-[#1A2F22] bg-transparent outline-none focus:text-[#2D9E6B] transition-colors"
                  maxLength={2}
                />
                <button onClick={() => handleMinuteChange(-1)} className="p-2 text-[#5A7368] hover:text-[#1E5C36] transition-colors hover:translate-y-1"><ChevronDown size={36} strokeWidth={2.5} /></button>
              </div>
            </div>
            <p className="text-center text-[11px] font-bold text-[#9FB5AD] uppercase tracking-widest mt-2">Możesz też wpisać godzinę z klawiatury</p>
          </>}
          {step === 2 && <>
            <h2 className="font-lora text-2xl font-bold text-center text-[#1A2F22] mb-1">Pytanie 3 z 3</h2>
            <p className="text-center text-[#5A7368] text-sm mb-1">Co najszybciej poprawia Ci nastrój kiedy masz kryzys w ciągu dnia?</p>
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1 mt-4">
              {OPTS.map(b => (
                <label key={b} className={`flex items-start gap-2 p-3 rounded-2xl cursor-pointer transition-all text-xs leading-relaxed ${picks.includes(b) ? "bg-[#E8F4ED] border-2 border-[#2D9E6B] text-[#1E5C36]" : "bg-[#F5EFE6] border-2 border-transparent text-[#1A2F22] hover:border-[#E8DDD0]"}`}>
                  <input type="checkbox" checked={picks.includes(b)} onChange={() => toggle(b)} className="mt-0.5 rounded accent-[#1E5C36] flex-shrink-0" />
                  <span>{b}</span>
                </label>
              ))}
            </div>
          </>}
          <button onClick={() => { if (step < 2) setStep(s => s + 1); else onComplete({ hours, startTime: `${startHour}:${startMinute}`, picks }); }} className="w-full py-3.5 mt-6 bg-[#1E5C36] text-white rounded-2xl font-semibold hover:bg-[#164a2c] transition-all shadow-lg">
            Kontynuuj
          </button>
        </div>
      </div>
    </div>
  );
}
