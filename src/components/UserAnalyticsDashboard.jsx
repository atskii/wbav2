import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { 
  Users, 
  Activity, 
  RefreshCw, 
  Search, 
  CheckCircle2,
  BarChart3,
  Target,
  Sparkles
} from "lucide-react";

// Domyślne dane dla konta testowego testuser@testuser (które w aplikacji działa lokalnie w localStorage)
const MOCK_TEST_USER = {
  email: "testuser@testuser",
  createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 dni temu
  lastActive: new Date().toISOString(), // Dziś
  totalTasks: 18,
  tasksDone: 14,
  moodsLogged: 12,
};

export default function UserAnalyticsDashboard() {
  const [usersStats, setUsersStats] = useState([]);
  const [kpis, setKpis] = useState({
    totalUsers: 0,
    activeLast7Days: 0,
    totalTasksDone: 0,
    totalMoodsLogged: 0
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      // Pobieranie danych ze wszystkich powiązanych tabel w Supabase (bez wadliwego .catch na Postgrest builderze)
      const [profRes, taskRes, moodRes] = await Promise.all([
        supabase.from("profiles").select("email, created_at"),
        supabase.from("tasks").select("user_email, done, created_at"),
        supabase.from("moods").select("user_email, created_at, d")
      ]);

      const safeProfiles = profRes?.data || [];
      const safeTasks = taskRes?.data || [];
      const safeMoods = moodRes?.data || [];

      // Grupowanie danych na użytkownika
      const statsMap = {};

      // Zawsze dodajemy testusera (lokalny profil deweloperski)
      statsMap[MOCK_TEST_USER.email] = { ...MOCK_TEST_USER };

      safeProfiles.forEach(p => {
        if (p.email) {
          statsMap[p.email] = {
            email: p.email,
            createdAt: p.created_at || null,
            lastActive: p.created_at || null,
            totalTasks: 0,
            tasksDone: 0,
            moodsLogged: 0,
          };
        }
      });

      safeTasks.forEach(t => {
        const email = t.user_email;
        if (!email) return;
        if (!statsMap[email]) {
          statsMap[email] = { email, createdAt: null, lastActive: null, totalTasks: 0, tasksDone: 0, moodsLogged: 0 };
        }
        statsMap[email].totalTasks += 1;
        if (t.done) statsMap[email].tasksDone += 1;
        
        if (t.created_at) {
          if (!statsMap[email].lastActive || new Date(t.created_at) > new Date(statsMap[email].lastActive)) {
            statsMap[email].lastActive = t.created_at;
          }
          if (!statsMap[email].createdAt || new Date(t.created_at) < new Date(statsMap[email].createdAt)) {
            statsMap[email].createdAt = t.created_at;
          }
        }
      });

      safeMoods.forEach(m => {
        const email = m.user_email;
        if (!email) return;
        if (!statsMap[email]) {
          statsMap[email] = { email, createdAt: null, lastActive: null, totalTasks: 0, tasksDone: 0, moodsLogged: 0 };
        }
        statsMap[email].moodsLogged += 1;
        
        const moodDate = m.created_at || m.d;
        if (moodDate) {
          if (!statsMap[email].lastActive || new Date(moodDate) > new Date(statsMap[email].lastActive)) {
            statsMap[email].lastActive = moodDate;
          }
        }
      });

      const userStatsList = Object.values(statsMap).sort((a, b) => {
        if (!a.lastActive) return 1;
        if (!b.lastActive) return -1;
        return new Date(b.lastActive) - new Date(a.lastActive);
      });

      setUsersStats(userStatsList);

      const now = new Date();
      const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));
      
      const activeLast7Days = userStatsList.filter(u => u.lastActive && new Date(u.lastActive) >= sevenDaysAgo).length;
      const totalTasksDone = userStatsList.reduce((acc, u) => acc + u.tasksDone, 0);
      const totalMoodsLogged = userStatsList.reduce((acc, u) => acc + u.moodsLogged, 0);
      
      setKpis({
        totalUsers: userStatsList.length,
        activeLast7Days,
        totalTasksDone,
        totalMoodsLogged
      });

    } catch (err) {
      console.error("Błąd podczas pobierania analityki:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchAnalytics();
      }, 30000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const filteredUsers = usersStats.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      {/* Top Navbar */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
              <Users size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                Monitor Użytkowników
                <span className="text-xs px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full font-mono">
                  Port :5176
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Analiza aktywności, retencji oraz zaangażowania użytkowników aplikacji
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
              autoRefresh 
                ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30" 
                : "bg-slate-800 text-slate-400 border-slate-700"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${autoRefresh ? "bg-indigo-400 animate-pulse" : "bg-slate-500"}`} />
            Auto-odświeżanie {autoRefresh ? "(Włączone)" : "(Wyłączone)"}
          </button>

          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Odśwież dane
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6 mt-6">
        
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Users */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-xl relative overflow-hidden group hover:border-indigo-500/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Wszyscy Użytkownicy</span>
              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                <Users size={18} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-black text-white tracking-tight">
                {kpis.totalUsers}
              </div>
              <div className="text-xs font-bold text-slate-400 mt-1 flex items-center gap-1">
                Zarejestrowane konta
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-500/10 transition-all" />
          </div>

          {/* Card 2: Active Users */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-xl relative overflow-hidden group hover:border-emerald-500/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Aktywni (7 dni)</span>
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                <Activity size={18} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-black text-white tracking-tight">
                {kpis.activeLast7Days}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Konta wykazujące aktywność
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-all" />
          </div>

          {/* Card 3: Tasks Done */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-xl relative overflow-hidden group hover:border-cyan-500/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ukończone Zadania</span>
              <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
                <CheckCircle2 size={18} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-black text-white tracking-tight">
                {kpis.totalTasksDone.toLocaleString()}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                W całej aplikacji
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl group-hover:bg-cyan-500/10 transition-all" />
          </div>

          {/* Card 4: Moods Logged */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-xl relative overflow-hidden group hover:border-fuchsia-500/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Logowania Nastroju</span>
              <div className="p-2 bg-fuchsia-500/10 text-fuchsia-400 rounded-xl border border-fuchsia-500/20">
                <BarChart3 size={18} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-black text-white tracking-tight">
                {kpis.totalMoodsLogged.toLocaleString()}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Zarejestrowane wpisy
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-fuchsia-500/5 rounded-full blur-xl group-hover:bg-fuchsia-500/10 transition-all" />
          </div>
        </div>

        {/* Filter / Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
          <div className="relative w-full sm:w-96">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Szukaj po e-mailu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-600"
            />
          </div>
          <span className="text-xs text-slate-400 font-medium bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
            Wyświetlam <strong className="text-indigo-400">{filteredUsers.length}</strong> użytkowników
          </span>
        </div>

        {/* User Activity Table */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Target size={18} className="text-indigo-400" />
                Szczegółowa Aktywność Per Użytkownik
              </h2>
              <p className="text-xs text-slate-400">
                Logowania, wykonane zadania i ogólne zaangażowanie bez dostępu do prywatnych treści
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-4 px-5">Użytkownik (E-mail)</th>
                  <th className="py-4 px-5">Data Dołączenia</th>
                  <th className="py-4 px-5">Ostatnia Aktywność</th>
                  <th className="py-4 px-5 text-center">Wszystkie Zadania</th>
                  <th className="py-4 px-5 text-center">Ukończone</th>
                  <th className="py-4 px-5 text-center">Skuteczność</th>
                  <th className="py-4 px-5 text-center">Wpisy Nastroju</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-500 text-sm">
                      {loading ? "Trwa ładowanie analityki..." : "Brak wyników do wyświetlenia."}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const joinDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString("pl-PL") : "Brak danych";
                    let lastActiveDisplay = "Brak danych";
                    let isActiveRecent = false;
                    
                    if (user.lastActive) {
                      const lastActiveDate = new Date(user.lastActive);
                      lastActiveDisplay = lastActiveDate.toLocaleString("pl-PL", { 
                        day: "2-digit", month: "2-digit", year: "numeric", 
                        hour: "2-digit", minute: "2-digit" 
                      });
                      
                      const daysSinceActive = (new Date() - lastActiveDate) / (1000 * 60 * 60 * 24);
                      isActiveRecent = daysSinceActive <= 3;
                    }

                    const completionRate = user.totalTasks > 0 
                      ? Math.round((user.tasksDone / user.totalTasks) * 100) 
                      : 0;

                    const isMock = user.email === MOCK_TEST_USER.email;

                    return (
                      <tr key={user.email} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-4 px-5 font-mono font-medium text-slate-200 flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${isActiveRecent ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-slate-600'}`} title={isActiveRecent ? "Aktywny niedawno" : "Nieaktywny"} />
                          {user.email}
                          {isMock && (
                            <span className="text-[10px] px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full font-sans flex items-center gap-1">
                              <Sparkles size={10} /> Test User
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-5 text-slate-400">
                          {joinDate}
                        </td>
                        <td className="py-4 px-5 text-slate-300 font-medium">
                          {lastActiveDisplay}
                        </td>
                        <td className="py-4 px-5 text-center font-mono text-slate-400">
                          {user.totalTasks}
                        </td>
                        <td className="py-4 px-5 text-center font-mono font-bold text-cyan-400">
                          {user.tasksDone}
                        </td>
                        <td className="py-4 px-5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  completionRate > 70 ? 'bg-emerald-400' : 
                                  completionRate > 30 ? 'bg-amber-400' : 'bg-rose-400'
                                }`}
                                style={{ width: `${completionRate}%` }}
                              />
                            </div>
                            <span className="font-mono text-[10px] text-slate-300">{completionRate}%</span>
                          </div>
                        </td>
                        <td className="py-4 px-5 text-center font-mono font-semibold text-fuchsia-400">
                          {user.moodsLogged}
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
