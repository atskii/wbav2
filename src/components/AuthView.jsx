import { useState } from "react";
import { ArrowLeft, Mail, KeyRound, Sparkles } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function AuthView({ mode, onAuth, onSwitch, onBack }) {
  const [email, setEmail] = useState(() => localStorage.getItem("wba_last_email") || "");
  const [otpToken, setOtpToken] = useState("");
  const [step, setStep] = useState("request"); // "request" | "verify"
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [message, setMessage] = useState("");

  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault();
    setErr("");
    setMessage("");

    if (!email) {
      setErr("Wprowadź swój adres e-mail.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin
        }
      });
      if (error) throw error;
      localStorage.setItem("wba_last_email", email);
      setStep("verify");
      setMessage("Link logowania oraz jednorazowy kod weryfikacyjny zostały wysłane na Twój adres e-mail. Sprawdź skrzynkę.");
    } catch (err) {
      console.error(err);
      setErr("Wystąpił błąd podczas wysyłania kodu. Spróbuj ponownie za chwilę.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setErr("");
    setMessage("");

    if (!otpToken) {
      setErr("Wprowadź kod weryfikacyjny.");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otpToken.trim(),
        type: "email"
      });
      if (error) throw error;

      if (data?.user) {
        onAuth({ email: data.user.email, name: data.user.email.split("@")[0] });
      }
    } catch (err) {
      console.error(err);
      setErr("Błędny lub wygasły kod weryfikacyjny. Spróbuj ponownie.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-dm-sans min-h-screen bg-[#F5EFE6] flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-[#E8DDD0] px-6 py-4 flex items-center justify-between">
        <button onClick={onBack}>
          <span className="font-lora text-[#1E5C36] font-bold text-xl">Wellbeing app</span>
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setStep("request");
              setErr("");
              setMessage("");
              onSwitch("login");
            }}
            className={`px-5 py-2 text-sm font-semibold rounded-full border-2 transition-all ${
              mode === "login"
                ? "bg-[#1E5C36] text-white border-[#1E5C36]"
                : "bg-transparent text-[#1E5C36] border-[#1E5C36] hover:bg-[#1E5C36]/5"
            }`}
          >
            Zaloguj się
          </button>
          <button
            onClick={() => {
              setStep("request");
              setErr("");
              setMessage("");
              onSwitch("register");
            }}
            className={`px-5 py-2 text-sm font-semibold rounded-full border-2 transition-all ${
              mode === "register"
                ? "bg-[#1E5C36] text-white border-[#1E5C36]"
                : "bg-transparent text-[#1E5C36] border-[#1E5C36] hover:bg-[#1E5C36]/5"
            }`}
          >
            Zarejestruj się
          </button>
        </div>
      </nav>

      {/* Main card */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative overflow-hidden">
        <div className="relative z-10 bg-white rounded-3xl shadow-2xl shadow-green-900/10 p-8 w-full max-w-md border border-[#E8DDD0] transition-all duration-300">
          <h2 className="font-lora text-2xl font-bold text-[#1A2F22] text-center mb-2">
            {mode === "login" ? "Zaloguj się" : "Stwórz konto"}
          </h2>
          <p className="text-center text-[#5A7368] text-sm mb-6">
            {step === "request"
              ? "Wprowadź swój e-mail, aby otrzymać jednorazowy link i kod logowania."
              : "Wpisz 6-cyfrowy kod, który wysłaliśmy na Twój e-mail."}
          </p>

          {err && (
            <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-600">
              {err}
            </div>
          )}
          {message && (
            <div className="mb-4 px-3 py-2.5 bg-green-50 border border-green-200 rounded-2xl text-xs text-green-700">
              {message}
            </div>
          )}

          {step === "request" ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div className="relative">
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="np. jan.kowalski@example.com"
                  type="email"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[#E8DDD0] text-sm focus:outline-none focus:border-[#2D9E6B] transition-all bg-white text-gray-800"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9FB5AD] w-4 h-4" />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#1E5C36] text-white rounded-2xl font-semibold text-sm hover:bg-[#164a2c] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    {mode === "login" ? "Wyślij kod logowania" : "Zarejestruj się"}
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="relative">
                <input
                  value={otpToken}
                  onChange={(e) => setOtpToken(e.target.value)}
                  placeholder="Wprowadź kod weryfikacyjny (6 cyfr)"
                  type="text"
                  pattern="[0-9]*"
                  maxLength={6}
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[#E8DDD0] text-sm focus:outline-none focus:border-[#2D9E6B] transition-all bg-white text-gray-800 tracking-wider font-mono font-bold text-center"
                />
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9FB5AD] w-4 h-4" />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#1E5C36] text-white rounded-2xl font-semibold text-sm hover:bg-[#164a2c] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  "Zweryfikuj kod"
                )}
              </button>

              <div className="flex justify-between items-center pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => setStep("request")}
                  className="text-[#5A7368] hover:text-[#1A2F22] flex items-center gap-1 font-medium transition-all"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Zmień e-mail
                </button>
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={loading}
                  className="text-[#1E5C36] hover:text-[#164a2c] font-semibold transition-all disabled:opacity-50"
                >
                  Wyślij kod ponownie
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
