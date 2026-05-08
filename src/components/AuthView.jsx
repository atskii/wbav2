import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

// ═══════════════════════════════════════════════════
//  AUTH VIEW & ONBOARDING
// ═══════════════════════════════════════════════════
export default function AuthView({ mode, onAuth, onSwitch, onBack }) {
  const [loginInput, setLoginInput] = useState("");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");


  // Hardcoded accounts for closed MVP
  const ACCOUNTS = {
    "Michał Jeska": "UP4444",
    "Aleksander Igłowski": "UP7777",
    "Marcin Klinowski": "UP5432",
    "Agnieszka Wojtasiak-Terech": "UP7890",
    "testuser": "testuser",
    "Kamila Łuczak": "UP2345",
  };

  const submit = () => {
    setErr("");
    if (!loginInput || !pw) { setErr("Uzupełnij login i hasło."); return; }
    const expectedPw = ACCOUNTS[loginInput];
    if (expectedPw && expectedPw === pw) {
      onAuth({ name: loginInput, email: loginInput });
    } else {
      setErr("Błędny login lub hasło. Brak dostępu.");
    }
  };
  return (
    <div className="font-dm-sans min-h-screen bg-[#F5EFE6] flex flex-col">
      <nav className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-[#E8DDD0] px-6 py-4 flex items-center justify-between">
        <button onClick={onBack}><span className="font-lora text-[#1E5C36] font-bold text-xl">Wellbeing app</span></button>
        <div className="flex gap-2">
          <button onClick={() => onSwitch("login")} className="px-5 py-2 text-sm font-semibold rounded-full border-2 transition-all bg-[#1E5C36] text-white border-[#1E5C36]">Zaloguj się</button>
          <button disabled className="px-5 py-2 text-sm font-semibold rounded-full border-2 bg-gray-400 text-gray-500 border-gray-400 cursor-not-allowed opacity-50 line-through">Zarejestruj się</button>
        </div>
      </nav>
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative overflow-hidden">
        <div className="relative z-10 bg-white rounded-3xl shadow-2xl shadow-green-900/10 p-8 w-full max-w-sm border border-[#E8DDD0]">
          <h2 className="font-lora text-2xl font-bold text-[#1A2F22] text-center mb-1">
            Zaloguj się
          </h2>
          <p className="text-center text-[#5A7368] text-sm mb-6">
            Cześć, dobrze Cię widzieć!
          </p>
          {err && <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-600">{err}</div>}
          <div className="space-y-3">
            <input value={loginInput} onChange={e => setLoginInput(e.target.value)} placeholder="Wprowadź swój login" type="text" className="w-full px-4 py-3 rounded-2xl border border-[#E8DDD0] text-sm focus:outline-none focus:border-[#2D9E6B] transition-all" />
            <div className="relative">
              <input value={pw} onChange={e => setPw(e.target.value)} placeholder="Wprowadź hasło" type={show ? "text" : "password"} className="w-full px-4 py-3 pr-10 rounded-2xl border border-[#E8DDD0] text-sm focus:outline-none focus:border-[#2D9E6B] transition-all" onKeyDown={e => { if (e.key === 'Enter') submit(); }} />
              <button onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9FB5AD] hover:text-[#5A7368]">{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
            </div>
            <button onClick={submit} className="w-full py-3.5 bg-[#1E5C36] text-white rounded-2xl font-semibold text-sm hover:bg-[#164a2c] transition-all shadow-lg mt-1">
              Zaloguj się
            </button>
            <p className="text-center text-sm text-gray-400 mt-4 line-through opacity-60">
              Funkcja rejestracji została zablokowana
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
