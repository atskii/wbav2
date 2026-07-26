import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { analyzeMoodWithAI } from "../lib/gemini";
import { 
  Coins, 
  Cpu, 
  Users, 
  Activity, 
  RefreshCw, 
  Search, 
  Sparkles, 
  Clock, 
  ShieldAlert,
  CheckCircle2,
  DollarSign,
  Wallet,
  Calculator,
  TrendingUp,
  PiggyBank
} from "lucide-react";

const USD_TO_PLN = 4.0; // Stała przeliczeniowa dla szacunkowych kosztów PLN

export default function AnalyticsDashboard() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [simMessage, setSimMessage] = useState(null);
  
  // Stan budżetu początkowego w PLN (domyślnie 40 zł)
  const [initialBudgetPln, setInitialBudgetPln] = useState(40.0);
  const [isEditingBudget, setIsEditingBudget] = useState(false);

  const fetchTokenLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await supabase
        .from("token_usage")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchErr) throw fetchErr;
      setLogs(data || []);
    } catch (err) {
      console.error("Błąd podczas pobierania danych tokenów:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokenLogs();

    // Auto-refresh co 10 sekund jeśli włączony
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchTokenLogs();
      }, 10000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Obliczenia zagregowane
  const totalRequests = logs.length;
  const totalTokens = logs.reduce((acc, curr) => acc + (curr.total_tokens || 0), 0);
  const totalPromptTokens = logs.reduce((acc, curr) => acc + (curr.prompt_tokens || 0), 0);
  const totalCandidateTokens = logs.reduce((acc, curr) => acc + (curr.candidate_tokens || 0), 0);
  const totalCostUsd = logs.reduce((acc, curr) => acc + Number(curr.estimated_cost_usd || 0), 0);
  const totalCostPln = totalCostUsd * USD_TO_PLN;

  // Obliczenia Budżetowe & Prognoza Analiz
  const remainingBudgetPln = Math.max(0, initialBudgetPln - totalCostPln);
  const spentPercentage = initialBudgetPln > 0 
    ? Math.min(100, (totalCostPln / initialBudgetPln) * 100) 
    : 0;

  // Średni koszt 1 analizy na bazie historii (jeśli brak zapytań, wzorcowy koszt Gemini Flash Lite to ~0.00021 PLN)
  const avgCostPerRequestPln = totalRequests > 0 
    ? (totalCostPln / totalRequests) 
    : 0.00021;

  const avgCostPerRequestUsd = totalRequests > 0 
    ? (totalCostUsd / totalRequests) 
    : 0.0000525;

  // Prognozowana liczba pozostałych analiz
  const remainingAnalyses = avgCostPerRequestPln > 0 
    ? Math.floor(remainingBudgetPln / avgCostPerRequestPln) 
    : 0;

  // Grupowanie per konto (email)
  const userStatsMap = {};
  logs.forEach(log => {
    const email = log.user_email || "nieznany";
    if (!userStatsMap[email]) {
      userStatsMap[email] = {
        email,
        requests: 0,
        promptTokens: 0,
        candidateTokens: 0,
        totalTokens: 0,
        costUsd: 0,
        lastActive: log.created_at
      };
    }
    userStatsMap[email].requests += 1;
    userStatsMap[email].promptTokens += (log.prompt_tokens || 0);
    userStatsMap[email].candidateTokens += (log.candidate_tokens || 0);
    userStatsMap[email].totalTokens += (log.total_tokens || 0);
    userStatsMap[email].costUsd += Number(log.estimated_cost_usd || 0);
  });

  const userStatsList = Object.values(userStatsMap).sort((a, b) => b.costUsd - a.costUsd);

  const filteredUserStats = userStatsList.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLogs = logs.filter(l => 
    (l.user_email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.model_name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSimulateRequest = async () => {
    setSimulating(true);
    setSimMessage(null);
    try {
      const dummyMoods = [
        { d: "2026-07-24", v: 4, note: "Dobry dzień w pracy" },
        { d: "2026-07-25", v: 5, note: "Super trening" },
        { d: "2026-07-26", v: 6, note: "Wszystko śmiga!" }
      ];
      await analyzeMoodWithAI(dummyMoods, "TestUser Analytics", "testuser@testuser");
      setSimMessage({ type: "success", text: "Zapytanie wysłane! Tokeny zostały zarejestrowane w bazie." });
      await fetchTokenLogs();
    } catch (err) {
      setSimMessage({ type: "error", text: `Błąd symulacji: ${err.message}` });
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      {/* Top Navbar */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
              <Cpu size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                Panel Monitorowania Tokenów AI
                <span className="text-xs px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-mono">
                  Port :5175
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Śledzenie kosztów API Gemini Flash Lite w czasie rzeczywistym per konto użytkownika
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
              autoRefresh 
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" 
                : "bg-slate-800 text-slate-400 border-slate-700"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${autoRefresh ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
            Auto-odświeżanie {autoRefresh ? "(Włączone)" : "(Wyłączone)"}
          </button>

          <button
            onClick={fetchTokenLogs}
            disabled={loading}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-cyan-400" : ""} />
            Odśwież
          </button>

          <button
            onClick={handleSimulateRequest}
            disabled={simulating}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Sparkles size={14} className={simulating ? "animate-spin" : ""} />
            {simulating ? "Generowanie..." : "Testowe zapytanie AI"}
          </button>
        </div>
      </div>

      {simMessage && (
        <div className={`max-w-7xl mx-auto mt-4 p-4 rounded-xl text-xs font-medium border flex items-center gap-2 ${
          simMessage.type === "success" 
            ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" 
            : "bg-rose-500/10 text-rose-300 border-rose-500/20"
        }`}>
          {simMessage.type === "success" ? <CheckCircle2 size={16} /> : <ShieldAlert size={16} />}
          {simMessage.text}
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto space-y-6 mt-6">
        
        {/* NEW: Dedykowany Banner Budżetu i Kalkulatora Pozostałych Analiz */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-cyan-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            {/* Lewa sekcja: Budżet i Pozostała kwota */}
            <div className="space-y-4 max-w-xl">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-cyan-500/20 text-cyan-400 rounded-2xl border border-cyan-500/30">
                  <Wallet size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white tracking-tight">Kalkulator Pozostałego Budżetu API</h2>
                    <span className="text-[11px] px-2.5 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full font-semibold">
                      Depozyt: {initialBudgetPln.toFixed(2)} PLN
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Kalkulacja liczby pozostałych zapytań AI na podstawie Twojej wpłaty i średniego kosztu zapytań
                  </p>
                </div>
              </div>

              {/* Pasek postępu wykorzystania budżetu */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Wykorzystano: <strong className="text-rose-400">{totalCostPln.toFixed(4)} PLN</strong> ({spentPercentage.toFixed(3)}%)</span>
                  <span className="text-slate-400">Pozostało: <strong className="text-emerald-400">{remainingBudgetPln.toFixed(4)} PLN</strong></span>
                </div>
                <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full transition-all duration-500 shadow-lg shadow-cyan-500/30"
                    style={{ width: `${Math.max(1, 100 - spentPercentage)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Prawa sekcja: Glówny KPI - Liczba pozostałych analiz */}
            <div className="flex flex-col sm:flex-row items-stretch gap-4">
              {/* Główna karta z dużą liczbą pozostałych analiz */}
              <div className="bg-slate-950/80 border border-cyan-500/40 p-5 rounded-2xl flex-1 flex flex-col justify-center shadow-inner relative group hover:border-cyan-400 transition-all">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
                  <span>Szacowane Analizy</span>
                  <Sparkles size={16} className="text-cyan-400 animate-pulse" />
                </div>
                <div className="text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 to-emerald-400 tracking-tight font-mono">
                  ~{remainingAnalyses.toLocaleString("pl-PL")}
                </div>
                <div className="text-[11px] text-emerald-400 font-medium mt-1 flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  Pozostałe analizy nastroju do wyczerpania {initialBudgetPln} zł
                </div>
              </div>

              {/* Karta pomocnicza: Średni koszt per zapytanie */}
              <div className="bg-slate-950/60 border border-slate-800 p-5 rounded-2xl flex-1 flex flex-col justify-center">
                <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Średni Koszt / Analiza</span>
                  <Calculator size={16} className="text-indigo-400" />
                </div>
                <div className="text-xl font-bold text-white font-mono">
                  {avgCostPerRequestPln < 0.0001 
                    ? `< 0.0001 PLN` 
                    : `${avgCostPerRequestPln.toFixed(5)} PLN`}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  ≈ ${avgCostPerRequestUsd.toFixed(6)} USD ({totalRequests > 0 ? `na bazie ${totalRequests} wywołań` : "szacunek estymowany"})
                </div>
              </div>
            </div>
          </div>

          {/* Opcja edycji wpłaconego budżetu */}
          <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <PiggyBank size={14} className="text-cyan-400" />
              <span>Początkowy wkład budżetowy: <strong>{initialBudgetPln} PLN</strong></span>
            </div>
            
            {isEditingBudget ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="5"
                  min="1"
                  value={initialBudgetPln}
                  onChange={(e) => setInitialBudgetPln(Math.max(1, Number(e.target.value)))}
                  className="w-24 bg-slate-950 border border-cyan-500/50 rounded-lg px-2.5 py-1 text-xs text-white font-mono focus:outline-none"
                />
                <span className="text-xs text-slate-400">PLN</span>
                <button
                  onClick={() => setIsEditingBudget(false)}
                  className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-[11px]"
                >
                  Zapisz
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingBudget(true)}
                className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 font-medium transition-colors"
              >
                Zmień kwotę wpłaty
              </button>
            )}
          </div>

          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Cost */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-xl relative overflow-hidden group hover:border-cyan-500/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Łączny Koszt</span>
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                <DollarSign size={18} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-white tracking-tight">
                ${totalCostUsd.toFixed(6)}
              </div>
              <div className="text-xs font-bold text-emerald-400 mt-1 flex items-center gap-1">
                ≈ {totalCostPln.toFixed(4)} PLN
                <span className="text-[10px] text-slate-500 font-normal">(USD/PLN 4.0)</span>
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-all" />
          </div>

          {/* Card 2: Total Tokens */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-xl relative overflow-hidden group hover:border-cyan-500/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Łącznie Tokeny</span>
              <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
                <Coins size={18} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-white tracking-tight">
                {totalTokens.toLocaleString()} <span className="text-xs font-normal text-slate-400">tok</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex gap-2">
                <span>In: <strong className="text-slate-200">{totalPromptTokens}</strong></span>
                <span>•</span>
                <span>Out: <strong className="text-slate-200">{totalCandidateTokens}</strong></span>
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl group-hover:bg-cyan-500/10 transition-all" />
          </div>

          {/* Card 3: Total Requests */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-xl relative overflow-hidden group hover:border-cyan-500/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Zapytania AI</span>
              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                <Activity size={18} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-white tracking-tight">
                {totalRequests}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Wszystkie wykonane analizy nastroju
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-500/10 transition-all" />
          </div>

          {/* Card 4: Active Accounts */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-xl relative overflow-hidden group hover:border-cyan-500/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Aktywne Konta</span>
              <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
                <Users size={18} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-white tracking-tight">
                {userStatsList.length}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Unikalnych adresów e-mail użytkowników
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10 transition-all" />
          </div>
        </div>

        {/* Filter / Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Szukaj po e-mailu lub modelu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-slate-600"
            />
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Model: <strong className="text-cyan-400 font-semibold">gemini-flash-lite-latest</strong> ($0.075/1M in, $0.30/1M out)
          </span>
        </div>

        {/* Section 1: Per-User Cost Breakdown Table */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Users size={18} className="text-cyan-400" />
                Podsumowanie Zużycia i Kosztów per Konto Użytkownika
              </h2>
              <p className="text-xs text-slate-400">
                Przegląd kosztów wygenerowanych przez poszczególne adresy e-mail
              </p>
            </div>
            <span className="text-xs px-3 py-1 bg-slate-800 text-slate-300 rounded-lg font-mono">
              Liczba kont: {filteredUserStats.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Użytkownik (E-mail)</th>
                  <th className="py-3.5 px-4 text-center">Liczba zapytań</th>
                  <th className="py-3.5 px-4 text-right">Tokeny In (Prompt)</th>
                  <th className="py-3.5 px-4 text-right">Tokeny Out (Ans)</th>
                  <th className="py-3.5 px-4 text-right">Łącznie Tokeny</th>
                  <th className="py-3.5 px-4 text-right">Koszt (USD)</th>
                  <th className="py-3.5 px-4 text-right">Koszt (PLN)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredUserStats.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-500 text-xs">
                      {loading ? "Wczytywanie danych z bazy..." : "Brak danych o zużyciu tokenów."}
                    </td>
                  </tr>
                ) : (
                  filteredUserStats.map((user) => {
                    const userCostPln = user.costUsd * USD_TO_PLN;
                    return (
                      <tr key={user.email} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-medium text-cyan-300 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-cyan-400" />
                          {user.email}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-white">
                          {user.requests}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-400">
                          {user.promptTokens.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-400">
                          {user.candidateTokens.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-200">
                          {user.totalTokens.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                          ${user.costUsd.toFixed(6)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-300">
                          {userCostPln.toFixed(4)} zł
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Detailed Raw Logs */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Clock size={18} className="text-indigo-400" />
                Pełny Dziennik Zapytań AI (Historyczne Wywołania)
              </h2>
              <p className="text-xs text-slate-400">
                Pojedyncze transakcje z dokładnymi sygnaturami czasowymi
              </p>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              Najnowsze na górze
            </span>
          </div>

          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase text-[10px] tracking-wider sticky top-0 border-b border-slate-800 backdrop-blur-md">
                <tr>
                  <th className="py-3 px-4">Data i czas</th>
                  <th className="py-3 px-4">Konto Użytkownika</th>
                  <th className="py-3 px-4">Model</th>
                  <th className="py-3 px-4 text-right">In (Prompt)</th>
                  <th className="py-3 px-4 text-right">Out (Output)</th>
                  <th className="py-3 px-4 text-right">Suma Tokenów</th>
                  <th className="py-3 px-4 text-right">Koszt USD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-500 text-xs">
                      Brak zapytań w dzienniku.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => {
                    const dateFormatted = new Date(log.created_at).toLocaleString("pl-PL", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit"
                    });
                    return (
                      <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                          {dateFormatted}
                        </td>
                        <td className="py-3 px-4 font-mono text-cyan-300">
                          {log.user_email}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                          {log.model_name}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-400">
                          {log.prompt_tokens}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-400">
                          {log.candidate_tokens}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-semibold text-slate-200">
                          {log.total_tokens}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                          ${Number(log.estimated_cost_usd || 0).toFixed(6)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
