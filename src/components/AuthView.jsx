import { useState } from "react";
import { ArrowLeft, Mail, KeyRound, Sparkles, User, Lock } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function AuthView({ mode, onAuth, onSwitch, onBack }) {
  const [email, setEmail] = useState(() => localStorage.getItem("wba_last_email") || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [message, setMessage] = useState("");

  const handleAuth = async (e) => {
    if (e) e.preventDefault();
    setErr("");
    setMessage("");

    let loginEmail = email.trim();
    if (!loginEmail) {
      setErr("Wprowadź swój e-mail lub login.");
      return;
    }

    // Mapowanie loginu "testuser" na poprawny e-mail bazy danych
    if (loginEmail.toLowerCase() === "testuser") {
      loginEmail = "testuser@testuser";
    }

    if (!password) {
      setErr("Wprowadź hasło.");
      return;
    }

    if (mode === "register") {
      if (password !== confirmPassword) {
        setErr("Hasła nie są identyczne.");
        return;
      }
      if (password.length < 6) {
        setErr("Hasło musi mieć co najmniej 6 znaków.");
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password: password,
        });

        if (error) throw error;
        
        if (data?.user) {
          localStorage.setItem("wba_last_email", loginEmail);
          onAuth({ email: data.user.email, name: data.user.email.split("@")[0] });
        }
      } else {
        // Zarejestruj się (Email weryfikacja powinna być wyłączona w ustawieniach Supabase)
        const { data, error } = await supabase.auth.signUp({
          email: loginEmail,
          password: password,
        });

        if (error) throw error;

        if (data?.user) {
          localStorage.setItem("wba_last_email", loginEmail);
          onAuth({ email: data.user.email, name: data.user.email.split("@")[0] });
        }
      }
    } catch (err) {
      console.error(err);
      if (err.message.includes("Invalid login credentials")) {
        setErr("Nieprawidłowy login lub hasło.");
      } else if (err.message.includes("User already registered")) {
        setErr("Użytkownik o tym adresie e-mail już istnieje.");
      } else {
        setErr(err.message || "Wystąpił błąd. Spróbuj ponownie.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setErr("");
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err) {
      console.error(err);
      setErr("Wystąpił błąd podczas logowania przez Google.");
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
            {mode === "login"
              ? "Wprowadź swoje dane, aby uzyskać dostęp do konta."
              : "Wprowadź e-mail i hasło, aby dołączyć do Wellbeing app."}
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

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="relative">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={mode === "login" ? "Twój e-mail lub login" : "np. jan.kowalski@example.com"}
                type="text"
                required
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[#E8DDD0] text-sm focus:outline-none focus:border-[#2D9E6B] transition-all bg-white text-gray-800"
              />
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9FB5AD] w-4 h-4" />
            </div>

            <div className="relative">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Hasło"
                type="password"
                required
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[#E8DDD0] text-sm focus:outline-none focus:border-[#2D9E6B] transition-all bg-white text-gray-800"
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9FB5AD] w-4 h-4" />
            </div>

            {mode === "register" && (
              <div className="relative">
                <input
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Powtórz hasło"
                  type="password"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[#E8DDD0] text-sm focus:outline-none focus:border-[#2D9E6B] transition-all bg-white text-gray-800"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9FB5AD] w-4 h-4" />
              </div>
            )}

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
                  {mode === "login" ? "Zaloguj się" : "Zarejestruj się"}
                </>
              )}
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E8DDD0]"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-xs text-[#5A7368] font-medium uppercase tracking-wider">lub</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3 bg-white text-[#1A2F22] border border-[#E8DDD0] rounded-2xl font-semibold text-sm hover:bg-gray-50 transition-all shadow-sm flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Kontynuuj z Google
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
