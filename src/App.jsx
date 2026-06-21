import React, { useState, useEffect, useCallback, useMemo } from "react";
import { LogOut, Menu } from "lucide-react";

// Lib
import { supabase } from "./lib/supabase";
import { INIT_TASKS } from "./lib/constants";
import { checkIsDate } from "./lib/dateHelpers";
import { analyzeMoodAlerts } from "./lib/analyzeMoodAlerts";

// Hooks
import usePersist from "./hooks/usePersist";
import useToasts from "./hooks/useToasts";

// UI
import Font from "./components/ui/Font";
import Toasts from "./components/ui/Toasts";

// Components
import Landing from "./components/Landing";
import AuthView from "./components/AuthView";
import Onboarding from "./components/Onboarding";
import Sidebar from "./components/Sidebar";
import FocusModeView from "./components/FocusModeView";
import TaskModal from "./components/TaskModal";
import MoodModal from "./components/MoodModal";
import DashboardView from "./components/DashboardView";
import CalendarView from "./components/CalendarView";
import MoodView from "./components/MoodView";
import WarningView from "./components/WarningView";
import SettingsView from "./components/SettingsView";
import DebugModal from "./components/DebugModal";
import AdminPanel from "./components/AdminPanel";

const ADMIN_EMAILS = ["admin"];

export default function App() {
  const [view, setView] = useState("landing");
  const [authMode, setAuthMode] = useState("login");
  const [user, setUser] = usePersist("wba_user", null);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [isLoading, setIsLoading] = useState(false);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [focusedTask, setFocusedTask] = useState(null);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [tasks, setTasks] = useState([]);
  const [moods, setMoods] = useState([]);
  const { ts, add, rm } = useToasts();
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Pobieranie danych z Supabase oraz sprawdzanie statusu onboardingu
  useEffect(() => {
    if (user && user.email) {
      // Admin nie potrzebuje danych użytkownika ani onboardingu
      if (ADMIN_EMAILS.includes(user.email)) {
        setView("app");
        return;
      }

      const fetchData = async () => {
        setIsLoading(true);
        try {
          // 1. Pobierz zadania
          const { data: tasksData } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_email', user.email);
          setTasks(tasksData || []);

          // 2. Pobierz nastroje
          const { data: moodsData } = await supabase
            .from('moods')
            .select('*')
            .eq('user_email', user.email)
            .order('d', { ascending: true });
          setMoods(moodsData || []);

          // 3. Pobierz preferencje (status onboardingu)
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('prefs')
            .eq('email', user.email)
            .single();

          if (!profileError && profileData) {
            // Użytkownik ma już profil - pomiń onboarding i wejdź do apki
            setUser(prev => ({ ...prev, prefs: profileData.prefs }));
            setView("app");
          } else {
            // Brak profilu w bazie - wymuś onboarding
            setView("onboarding");
          }
        } catch (err) {
          console.error("Błąd synchronizacji:", err);
          add("Błąd połączenia z bazą preferencji.", "warn");
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [user?.email]);

  const [offsetDays, setOffsetDays] = useState(0);
  const getNow = useCallback(() => {
    const d = new Date();
    if (offsetDays !== 0) d.setDate(d.getDate() + offsetDays);
    return d;
  }, [offsetDays]);

  const [hasPromptedToday, setHasPromptedToday] = useState(false);

  const [dismissedAlertKey, setDismissedAlertKey] = useState(null);
  const rawActiveAlert = useMemo(() => analyzeMoodAlerts(moods, getNow()), [moods, getNow]);
  const currentAlertKey = rawActiveAlert ? `${rawActiveAlert.id}-${getNow().toDateString()}` : null;
  const activeAlert = (rawActiveAlert && currentAlertKey !== dismissedAlertKey) ? rawActiveAlert : null;

  const [showDebugModal, setShowDebugModal] = useState(false);

  const isAdmin = user && ADMIN_EMAILS.includes(user.email);

  const handleTriggerScenario = async (scenarioId) => {
    setDismissedAlertKey(null);
    const nowL = new Date();
    nowL.setHours(0, 0, 0, 0);
    setOffsetDays(0);

    const generateFakeMood = (daysAgo, v) => {
      const d = new Date(nowL);
      d.setDate(d.getDate() - daysAgo);
      return {
        // Usunięto generowanie ID. Zostawiamy to chmurze Supabase.
        d: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
        v: v,
        note: "Symulacja",
        user_email: user.email
      };
    };

    let newMoods = [];
    if (scenarioId === 1) {
      newMoods.push(generateFakeMood(0, 0));
      newMoods.push(generateFakeMood(1, 0));
      newMoods.push(generateFakeMood(2, 1));
    } else if (scenarioId === 2) {
      for (let i = 0; i < 7; i++) newMoods.push(generateFakeMood(i, 3));
    } else if (scenarioId === 3) {
      const day = nowL.getDay();
      let diffToMonday = day === 0 ? -6 : 1 - day;
      if (diffToMonday > 0) diffToMonday -= 7;
      setOffsetDays(diffToMonday);
      const monDaysAgo = Math.abs(diffToMonday);
      newMoods.push(generateFakeMood(monDaysAgo, 2));
      newMoods.push(generateFakeMood(monDaysAgo + 3, 4));
    } else if (scenarioId === 4) {
      newMoods.push(generateFakeMood(0, 2));
      newMoods.push(generateFakeMood(1, 3));
      newMoods.push(generateFakeMood(2, 2));
      newMoods.push(generateFakeMood(3, 3));
      newMoods.push(generateFakeMood(4, 2));
    }

    try {
      // Wyciągamy tylko daty, które chcemy nadpisać w bazie
      const datesToReplace = newMoods.map(m => m.d);

      // Kasujemy z bazy TYLKO dni nadpisywane, zachowując prawdziwą historię
      await supabase
        .from('moods')
        .delete()
        .eq('user_email', user.email)
        .in('d', datesToReplace);

      // Wrzucamy nową symulację (tym razem przejdzie, bo nie ma wymuszonego ID)
      const { data, error } = await supabase.from('moods').insert(newMoods).select();
      if (error) throw error;

      // Aktualizujemy poprawnie UI bez utraty starych danych
      setMoods(prev => {
        const filtered = prev.filter(m => !datesToReplace.includes(m.d));
        return [...filtered, ...(data || [])].sort((a, b) => a.d.localeCompare(b.d));
      });

      setShowDebugModal(false);
      add("Zasymulowano scenariusz " + scenarioId);
    } catch (err) {
      console.error(err);
      add("Błąd symulacji.", "warn");
    }
  };

  const debugActions = {
    triggerScenario: handleTriggerScenario,

    clearTasks: async () => {
      await supabase.from('tasks').delete().eq('user_email', user.email);
      setTasks([]);
      add('Usunięto wszystkie zadania (Test)');
      setShowDebugModal(false);
    },

    addRandomTasks: async () => {
      const existingTitles = new Set(tasks.map(t => t.title));
      const available = INIT_TASKS.filter(t => !existingTitles.has(t.title));
      if (available.length === 0) {
        add(`Zadania w obiegu: ${tasks.length}/${INIT_TASKS.length} (Test)`);
        setShowDebugModal(false);
        return;
      }
      const shuffled = [...available].sort(() => Math.random() - 0.5);
      const picked = shuffled.slice(0, Math.min(20, available.length));
      const newTasks = picked.map(t => {
        const { id, ...rest } = t; // Usuwamy ID z INIT_TASKS
        return { ...rest, user_email: user.email, done: t.done, sMins: null, eMins: null, pDate: null };
      });

      const { data, error } = await supabase.from('tasks').insert(newTasks).select();
      if (!error) {
        setTasks(prev => sortSmartQueue([...prev, ...data]));
        add(`Zadania w obiegu: ${tasks.length + data.length}/${INIT_TASKS.length} (Test)`);
      }
      setShowDebugModal(false);
    },

    clearMoods: async () => {
      await supabase.from('moods').delete().eq('user_email', user.email);
      setMoods([]);
      add('Historia nastrojów wyczyszczona (Test)', 'info');
      setShowDebugModal(false);
    },

    totalWipe: async () => {
      try {
        await supabase.from('tasks').delete().eq('user_email', user.email);
        await supabase.from('moods').delete().eq('user_email', user.email);
        await supabase.from('profiles').delete().eq('email', user.email);

        setTasks([]);
        setMoods([]);
        setUser(null);
        setView("landing");
        localStorage.removeItem('wba_user');

        add('Zresetowano konto całkowicie (Test)', 'info');
        setShowDebugModal(false);
      } catch (err) {
        console.error(err);
        add('Błąd przy czyszczeniu konta', 'warn');
      }
    },

    generateFakeMoods: async () => {
      const fakeMoods = [];
      const datesToReplace = [];

      for (let i = 14; i >= 0; i--) {
        const d = getNow();
        d.setDate(d.getDate() - i);
        const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        fakeMoods.push({ d: ds, v: Math.floor(Math.random() * 5) + 1, note: "Testowa notatka", user_email: user.email });
        datesToReplace.push(ds);
      }

      try {
        // Usuwamy tylko te kilkanaście dni w tył, nie tykając reszty danych
        await supabase
          .from('moods')
          .delete()
          .eq('user_email', user.email)
          .in('d', datesToReplace);

        const { data, error } = await supabase.from('moods').insert(fakeMoods).select();
        if (error) throw error;

        setMoods(prev => {
          const filtered = prev.filter(m => !datesToReplace.includes(m.d));
          return [...filtered, ...(data || [])].sort((a, b) => a.d.localeCompare(b.d));
        });

        add('Sztuczna historia nastrojów wygenerowana (Test)', 'success');
      } catch (err) {
        console.error(err);
        add('Błąd generowania nastrojów.', 'warn');
      }
      setShowDebugModal(false);
    },

    timeTravelBack: () => {
      setOffsetDays(prev => prev - 1);
      setSelectedDate(d => { const nd = new Date(d); nd.setDate(nd.getDate() - 1); return nd; });
      add('Aplikacja: Przesunięto w czasie o 1 dzień wstecz (Test)', 'info');
    },

    timeTravelForward: () => {
      setOffsetDays(prev => prev + 1);
      setSelectedDate(d => { const nd = new Date(d); nd.setDate(nd.getDate() + 1); return nd; });
      add('Aplikacja: Przesunięto w czasie o 1 dzień do przodu (Test)', 'info');
    }
  };

  useEffect(() => {
    if (view === "landing" && user) setView("app");
  }, [user, view]);

  // --- REALTIME: Nasłuchiwanie zdalnych komend dla zwykłych użytkowników ---
  useEffect(() => {
    if (!user || !user.email || isAdmin) return;

    const channel = supabase
      .channel('remote-commands-' + user.email)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'remote_commands',
          filter: `target_email=eq.${user.email}`,
        },
        async (payload) => {
          const cmd = payload.new;
          if (cmd.status !== 'pending') return;

          console.log('[RemoteCommand] Received:', cmd.command_name, cmd.payload);

          // Wykonaj komendę lokalnie
          try {
            if (cmd.command_name === 'triggerScenario' && cmd.payload) {
              await debugActions.triggerScenario(cmd.payload);
            } else if (cmd.command_name === 'addRandomTasks') {
              await debugActions.addRandomTasks();
            } else if (cmd.command_name === 'generateFakeMoods') {
              await debugActions.generateFakeMoods();
            } else if (cmd.command_name === 'totalWipe') {
              await debugActions.totalWipe();
            } else if (cmd.command_name === 'clearTasks') {
              await debugActions.clearTasks();
            } else if (cmd.command_name === 'clearMoods') {
              await debugActions.clearMoods();
            }

            // Oznacz komendę jako wykonaną
            await supabase
              .from('remote_commands')
              .update({ status: 'done' })
              .eq('id', cmd.id);

            add(`Zdalna komenda "${cmd.command_name}" wykonana.`, 'info');
          } catch (err) {
            console.error('[RemoteCommand] Error:', err);
            await supabase
              .from('remote_commands')
              .update({ status: 'error' })
              .eq('id', cmd.id);
            add(`Błąd zdalnej komendy: ${cmd.command_name}`, 'warn');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.email, isAdmin]);

  // --- SKRÓTY KLAWISZOWE: Debug Modal (Shift+D) ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignoruj, gdy użytkownik pisze w polu tekstowym lub nie jest w widoku apki
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
      if (view !== 'app') return;

      // Skrót SHIFT + D (Debug Modal)
      if (e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setShowDebugModal(true);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view]);

  useEffect(() => {
    const nowLocal = getNow();
    const todayStr = `${nowLocal.getFullYear()}-${String(nowLocal.getMonth() + 1).padStart(2, '0')}-${String(nowLocal.getDate()).padStart(2, '0')}`;

    // 1. Sprawdzamy, czy użytkownik zapisał już dziś nastrój
    const moodToday = moods.find(m => m.d === todayStr);

    // 2. Sprawdzamy w pamięci przeglądarki, czy popup już dzisiaj wyskoczył
    const lastPromptDate = localStorage.getItem('wba_last_mood_prompt');

    if (!moodToday && lastPromptDate !== todayStr && !hasPromptedToday) {
      setTimeout(() => {
        setShowMoodModal(true);
        setHasPromptedToday(true);
        // Zapisujemy dzisiejszą datę do localStorage, aby F5 tego nie zresetowało
        localStorage.setItem('wba_last_mood_prompt', todayStr);
      }, 2000);
    }

    // Usunięto kod odpowiedzialny za wyskakiwanie popupu po 5 godzinach, 
    // aby aplikacja pytała o nastrój bezwzględnie raz dziennie.
  }, [moods, hasPromptedToday, getNow]);
  const handleNav = (tab) => {
    // Usunęliśmy stąd blokadę, która otwierała Modal zamiast widoku
    setIsLoading(true);
    setActiveTab(tab);
    setTimeout(() => setIsLoading(false), 800);
  };

  const sortSmartQueue = (tasksList) => {
    const nowLocal = getNow();
    const todayStr = `${nowLocal.getFullYear()}-${String(nowLocal.getMonth() + 1).padStart(2, '0')}-${String(nowLocal.getDate()).padStart(2, '0')}`;
    const lastMood = moods.length > 0 ? moods[moods.length - 1].v : 2;

    const getScore = (task) => {
      // USUNIĘTO: Zrzucanie zrobionych zadań na dno. Teraz wynik zawsze jest taki sam!
      let score = 0;

      if (task.p === "wysoki") score += 30;
      if (task.p === "sredni") score += 20;
      if (task.p === "niski") score += 10;

      if (task.deadline && task.deadline.startsWith(todayStr)) score += 100;

      const match = task.duration ? task.duration.match(/(\d+)/) : null;
      const mins = match ? parseInt(match[1]) : 60;
      if (mins <= 30) score += 5;

      if (lastMood <= 1) {
        score -= (task.difficulty || 0) * 15;
      } else {
        score += (task.difficulty || 0) * 6;
      }
      return score;
    };

    return [...tasksList].sort((a, b) => {
      const diff = getScore(b) - getScore(a);
      if (diff !== 0) return diff;
      return a.id - b.id; // Zapewnia absolutną stabilność kolejności przy remisach
    });
  };

  // --- NOWA LOGIKA: RĘCZNE GENEROWANIE PLANU Z ZAPISEM DO BAZY ---
  const generatePlan = async () => {
    // Godzina startu i długość dnia z preferencji onboardingu
    const parsedStart = user?.prefs?.startTime ? user.prefs.startTime.split(':').map(Number) : [6, 0];
    const timelineStart = parsedStart[0] || 6;
    const workHours = user?.prefs?.hours || 15;
    const dayLimitMins = (timelineStart + workHours) * 60;
    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

    let currentTasks = [...tasks];

    // 1. Wyodrębniamy sztywne bloki (dla selectedDate)
    const lockedBlocks = currentTasks
      .filter(t => t.isLocked && t.t && checkIsDate(t.t, selectedDate))
      .map(t => {
        const match = t.t.match(/(\d{1,2}):(\d{2})/);
        const startMins = match ? parseInt(match[1]) * 60 + parseInt(match[2]) : 0;
        const durMatch = t.duration ? t.duration.match(/(\d+)/) : null;
        const duration = durMatch ? parseInt(durMatch[1]) : 60;
        return { ...t, sMins: startMins, eMins: startMins + duration };
      })
      .sort((a, b) => a.sMins - b.sMins);

    // 2. Resetujemy zadania flex dla bieżącego dnia lub z backlogu
    let updatedTasks = currentTasks.map(t => {
      if (!t.isLocked && (t.pDate === dateStr || !t.pDate)) {
        return { ...t, sMins: null, eMins: null };
      }
      return t;
    });

    // 3. Wypełniamy luki zadaniami z kolejki (flex)
    const flexTasks = updatedTasks
      .filter(t => (t.pDate === dateStr || (!t.pDate && !t.isLocked)) && !t.sMins)
      .sort((a, b) => {
        if (a.p === "wysoki" && b.p !== "wysoki") return -1;
        if (a.p !== "wysoki" && b.p === "wysoki") return 1;
        return 0;
      });

    // Przygotowujemy dane dla każdego elastycznego zadania
    const flexData = flexTasks.map(t => {
      const durMatch = t.duration ? t.duration.match(/(\d+)/) : null;
      const duration = durMatch ? parseInt(durMatch[1]) : 45;
      const visualDuration = Math.max(duration, 45);
      let breakTime = 0;
      if (duration >= 50) {
        breakTime = 17;
      } else if (duration >= 25) {
        breakTime = Math.round((duration / 52) * 17);
      } else {
        breakTime = 3;
      }
      return { ...t, duration, visualDuration, breakTime };
    });

    const placed = new Set(); // ID zadań już umieszczonych w planie

    // Budujemy listę slotów (luk) między zablokowanymi blokami
    const gaps = [];
    let gapStart = timelineStart * 60;
    for (const block of lockedBlocks) {
      if (gapStart < block.sMins) {
        gaps.push({ start: gapStart, end: block.sMins });
      }
      gapStart = Math.max(gapStart, block.eMins);
    }
    // Ostatnia luka po ostatnim zablokowanym bloku do końca dnia
    if (gapStart < dayLimitMins) {
      gaps.push({ start: gapStart, end: dayLimitMins });
    }

    // Dla każdej luki próbujemy wypełnić ją zadaniami z kolejki
    for (const gap of gaps) {
      let pointer = gap.start;
      // Iterujemy po zadaniach w kolejności priorytetu
      for (const ft of flexData) {
        if (placed.has(ft.id)) continue; // już umieszczone

        const neededSpace = ft.visualDuration;
        // Sprawdź czy zadanie mieści się w pozostałej części luki
        if (pointer + neededSpace <= gap.end) {
          const idx = updatedTasks.findIndex(ut => ut.id === ft.id);
          if (idx !== -1) {
            updatedTasks[idx] = { ...updatedTasks[idx], sMins: pointer, eMins: pointer + ft.duration, pDate: dateStr };
          }
          placed.add(ft.id);
          pointer += neededSpace + ft.breakTime;
          // Jeśli pointer po przerwie wykroczył poza lukę, przerywamy tę lukę
          if (pointer >= gap.end) break;
        }
        // Jeśli zadanie się nie mieści, sprawdzamy kolejne (mniejsze) zadania
      }
    }

    // ZAPIS DO SUPABASE I DO STANU LOKALNEGO
    try {
      // Wszystkie zadania w tym momencie pochodzą już z bazy (mają poprawne ID).
      // Zamiast problematycznego 'upsert' na tabeli z 'GENERATED ALWAYS', wykonujemy bezpieczny 'update'.
      const tasksToSync = updatedTasks.filter(t => t.pDate === dateStr || (!t.pDate && !t.isLocked));

      if (tasksToSync.length > 0) {
        await Promise.all(
          tasksToSync.map(async (task) => {
            // Wyciągamy id, a resztę danych wysyłamy do aktualizacji
            const { id, ...taskDataWithoutId } = task;

            const { error } = await supabase
              .from('tasks')
              .update(taskDataWithoutId)
              .eq('id', id);

            if (error) throw error;
          })
        );
      }

      setTasks(updatedTasks);
      add(`Plan dnia (${selectedDate.toLocaleDateString('pl-PL')}) został wygenerowany! ✨`);
    } catch (err) {
      console.error(err);
      add("Nie udało się zapisać planu w bazie danych.", "warn");
    }
  };

  const returnToBacklog = async (id) => {
    try {
      // Resetowanie położenia zadania w Supabase
      const { error } = await supabase
        .from('tasks')
        .update({ sMins: null, eMins: null, pDate: null })
        .eq('id', id);

      if (error) throw error;

      // Po udanym zapisu w bazie - aktualizacja frontendu
      setTasks(prev => prev.map(t => t.id === id ? { ...t, sMins: null, eMins: null, pDate: null } : t));
      add("Zadanie cofnięto do backlogu.");
    } catch (err) {
      console.error(err);
      add("Błąd podczas cofania zadania.", "warn");
    }
  };

  const handleEditMood = async (dateStr, newV, newNote) => {
    const moodData = { d: dateStr, v: newV, note: newNote || "", user_email: user.email };
    const exists = moods.find(m => m.d === dateStr);

    try {
      if (exists) {
        const { error } = await supabase
          .from('moods')
          .update(moodData)
          .eq('d', dateStr)
          .eq('user_email', user.email);
        if (error) throw error;
        setMoods(prev => prev.map(m => m.d === dateStr ? { ...m, ...moodData } : m));
      } else {
        // Upewniamy się, że nie wysyłamy ID przy insercie
        const { id, ...insertData } = moodData;
        const { data, error } = await supabase
          .from('moods')
          .insert(insertData)
          .select();
        if (error) throw error;
        setMoods(prev => [data[0], ...prev]);
      }
      add("Zaktualizowano nastrój dla dnia " + dateStr);
    } catch (err) {
      console.error(err);
      add("Błąd zapisu nastroju.", "warn");
    }
  };

  const toggleTask = async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ done: !task.done })
        .eq('id', id);

      if (error) throw error;

      setTasks(prevTasks => {
        let updated = prevTasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
        return sortSmartQueue(updated);
      });
    } catch (err) {
      console.error(err);
      add("Błąd podczas aktualizacji zadania.", "warn");
    }
  };

  // ─── Pomocnicza: generowanie dat instancji cyklicznych ───────
  const generujDatyCykliczne = (pDateStr, recurrence, recurrenceEndStr) => {
    const daty = [];
    const dzis = new Date(); dzis.setHours(0, 0, 0, 0);
    const startDate = pDateStr ? (() => { const [y, m, d] = pDateStr.split('-').map(Number); return new Date(y, m - 1, d); })() : new Date(dzis);
    const maxDate = new Date(dzis); maxDate.setDate(maxDate.getDate() + 365);
    const endDate = recurrenceEndStr ? (() => { const [y, m, d] = recurrenceEndStr.split('-').map(Number); return new Date(y, m - 1, d); })() : null;
    const granica = endDate && endDate < maxDate ? endDate : maxDate;
    let current = new Date(startDate);

    const skok = () => {
      if (recurrence === 'codziennie') {
        current.setDate(current.getDate() + 1);
      } else if (recurrence.startsWith('co tydzień')) {
        current.setDate(current.getDate() + 7);
      } else if (recurrence === 'w dni robocze') {
        do { current.setDate(current.getDate() + 1); } while (current.getDay() === 0 || current.getDay() === 6);
      }
    };

    skok(); // Pierwszy skok (oryginał = istniejący rekord)
    while (current <= granica) {
      const y = current.getFullYear();
      const m = String(current.getMonth() + 1).padStart(2, '0');
      const d = String(current.getDate()).padStart(2, '0');
      daty.push(`${y}-${m}-${d}`);
      skok();
    }
    return daty;
  };

  const saveTask = async (t) => {
    let taskToSave = { ...t, user_email: user.email };
    const durMatch = taskToSave.duration ? taskToSave.duration.match(/(\d+)/) : null;
    let durationAlert = false;

    if (durMatch && parseInt(durMatch[1]) < 15) {
      taskToSave.duration = "15 min";
      durationAlert = true;
    }

    try {
      // Oddzielamy id od reszty danych
      const { id, ...taskDataWithoutId } = taskToSave;

      if (taskToSave.id) {
        // ── EDYCJA istniejącego zadania ──
        const { error } = await supabase
          .from('tasks')
          .update(taskDataWithoutId)
          .eq('id', taskToSave.id);
        if (error) throw error;

        setTasks(prev => sortSmartQueue(prev.map(task => task.id === taskToSave.id ? { ...task, ...taskToSave } : task)));
      } else {
        // ── TWORZENIE nowego zadania ──
        const isRecurring = taskDataWithoutId.recurrence
          && taskDataWithoutId.recurrence !== 'jednorazowo'
          && taskDataWithoutId.recurrence !== 'zmaterializowane';

        if (isRecurring) {
          // Materializacja: wstawiamy oryginał jako 'jednorazowo', a przyszłe daty jako 'zmaterializowane'
          // Czyścimy pole `t` z fragmentów cykliczności (🔁..., 🛑...)
          let cleanedT = taskDataWithoutId.t || '';
          cleanedT = cleanedT.replace(/\s*🛑\s*do\s*\S+/g, '').replace(/\s*🔁\s*.*/g, '').trim();
          const originalData = { ...taskDataWithoutId, recurrence: 'jednorazowo', t: cleanedT };
          const { data: origData, error: origErr } = await supabase
            .from('tasks')
            .insert(originalData)
            .select();
          if (origErr) throw origErr;

          // Generujemy instancje cykliczne
          const daty = generujDatyCykliczne(taskDataWithoutId.pDate, taskDataWithoutId.recurrence, taskDataWithoutId.recurrenceEnd);

          let zmaterializowane = [];
          if (daty.length > 0) {
            // Pomocnicza: zamienia daty w polach `t` i `deadline` na nową datę instancji
            const podmienDate = (str, nowaData) => {
              if (!str) return str;
              const [y, m, d] = nowaData.split('-');
              const newDatePL = `${parseInt(d)}.${parseInt(m)}.${y}`; // DD.MM.YYYY
              // Zamień format PL (DD.MM.YYYY) w stringu
              let result = str.replace(/\d{1,2}\.\d{1,2}\.\d{4}/, newDatePL);
              // Zamień format ISO (YYYY-MM-DD) w stringu
              result = result.replace(/\d{4}-\d{1,2}-\d{1,2}/, nowaData);
              // Zamień "o DD.MM.YYYY" w deadline
              result = result.replace(/(\d{1,2})[\.\/ -](\d{1,2})[\.\/ -](\d{4})/, newDatePL);
              return result;
            };

            const noweInstancje = daty.map(nowaData => ({
              ...taskDataWithoutId,
              pDate: nowaData,
              t: podmienDate(taskDataWithoutId.t, nowaData),
              deadline: podmienDate(taskDataWithoutId.deadline, nowaData),
              lockDateTime: taskDataWithoutId.lockDateTime ? (() => {
                // Zamień datę w lockDateTime (format YYYY-MM-DDTHH:MM)
                const timePart = taskDataWithoutId.lockDateTime.split('T')[1] || '00:00';
                return `${nowaData}T${timePart}`;
              })() : taskDataWithoutId.lockDateTime,
              done: false,
              recurrence: 'zmaterializowane',
              recurrenceEnd: null,
              sMins: null,
              eMins: null,
            }));

            const { data: insData, error: insErr } = await supabase
              .from('tasks')
              .insert(noweInstancje)
              .select();
            if (insErr) throw insErr;
            zmaterializowane = insData || [];
          }

          setTasks(prev => sortSmartQueue([...prev, origData[0], ...zmaterializowane]));
          add(`Zadanie cykliczne dodane! Wygenerowano ${daty.length + 1} instancji. 🔁`);
        } else {
          // Zwykłe jednorazowe zadanie
          const { data, error } = await supabase
            .from('tasks')
            .insert(taskDataWithoutId)
            .select();
          if (error) throw error;

          setTasks(prev => sortSmartQueue([data[0], ...prev]));
          add("Zadanie dodane pomyślnie!");
        }
      }

      if (durationAlert) {
        add("Czas minimalny na zadanie to 15 minut. Został on wydłużony do 15.", "warn");
      } else if (t.id) {
        add("Zmiany zostały zapisane.");
      }
    } catch (err) {
      console.error(err);
      add("Błąd zapisu zadania.", "warn");
    }

    setIsTaskModalOpen(false);
    setEditingTask(null);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const deleteTask = async (id) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setTasks(p => p.filter(t => t.id !== id));
      add("Zadanie usunięte.");
    } catch (err) {
      console.error(err);
      add("Błąd podczas usuwania zadania.", "warn");
    }
  };

  const addMood = async (m) => {
    const nowL = getNow();
    const todayStr = `${nowL.getFullYear()}-${String(nowL.getMonth() + 1).padStart(2, '0')}-${String(nowL.getDate()).padStart(2, '0')}`;

    // Oddzielamy 'id' od reszty danych już na samym początku!
    const { id, ...moodDataWithoutId } = { ...m, d: todayStr, user_email: user.email };

    const existingIndex = moods.findIndex(mood => mood.d === todayStr);

    try {
      if (existingIndex >= 0) {
        const { error } = await supabase
          .from('moods')
          .update(moodDataWithoutId)
          .eq('d', todayStr)
          .eq('user_email', user.email);
        if (error) throw error;

        setMoods(prev => {
          const newMoods = [...prev];
          newMoods[existingIndex] = { ...newMoods[existingIndex], v: m.v, note: m.note };
          return newMoods;
        });
      } else {
        const { data, error } = await supabase
          .from('moods')
          .insert(moodDataWithoutId)
          .select();
        if (error) throw error;
        setMoods(prev => [...prev, data[0]]);
      }
      add("Twój nastrój został zapisany.");
    } catch (err) {
      console.error(err);
      add("Błąd zapisu nastroju.", "warn");
    }
  };

  if (view === "landing") return <><Font /><Landing onCTA={(mode) => { setAuthMode(mode); setView("auth"); }} /></>;
  // Zmieniono: Usuwamy setView("onboarding"), aby useEffect mógł sprawdzić bazę przed decyzją
  if (view === "auth") return <><Font /><AuthView mode={authMode} onSwitch={setAuthMode} onBack={() => setView("landing")} onAuth={(u) => setUser(u)} /></>;
  if (view === "onboarding") return (
    <>
      <Font />
      <Onboarding onComplete={async (prefs) => {
        try {
          // Zapisz preferencje w Supabase przed wejściem do aplikacji
          const { error } = await supabase
            .from('profiles')
            .upsert({ email: user.email, prefs });

          if (error) throw error;

          setUser({ ...user, prefs });
          setView("app");
          add("Ustawienia zostały zapisane!");
        } catch (err) {
          console.error(err);
          add("Nie udało się zapisać ustawień onboardingu.", "warn");
        }
      }} />
    </>
  );

  // --- ADMIN PANEL: Renderuj panel administracyjny zamiast głównego widoku ---
  if (isAdmin) {
    return (
      <>
        <Font />
        <Toasts ts={ts} rm={rm} />
        <AdminPanel
          user={user}
          onLogout={() => { setUser(null); setView("landing"); }}
          addToast={add}
          supabase={supabase}
        />
      </>
    );
  }

  return (
    <div className="flex h-screen bg-[#F5EFE6] font-sans selection:bg-[#2D9E6B] selection:text-white overflow-hidden">
      <Font />
      <Toasts ts={ts} rm={rm} />

      {focusedTask ? (
        <FocusModeView
          task={focusedTask}
          onClose={() => setFocusedTask(null)}
          onComplete={(id) => { toggleTask(id); setFocusedTask(null); add("Świetna robota! Zadanie ukończone."); }}
        />
      ) : (
        <>
          <Sidebar
            active={activeTab}
            onNav={handleNav}
            user={user}
            onLogout={() => { setUser(null); setView("landing"); }}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            todayDate={getNow()}
            activeAlert={activeAlert}
            onDismissAlert={() => setDismissedAlertKey(currentAlertKey)}
            isMobileOpen={isMobileSidebarOpen}
            setIsMobileOpen={setIsMobileSidebarOpen}
          />
          <main className="flex-1 overflow-hidden relative bg-[#FAFAFA] flex flex-col">
            {/* NOWY HEADER RESPANSYWNY - UPROSZCZONY */}
            <header className="w-full px-4 md:px-10 py-6 flex items-center justify-between z-[60]">
              <div className="flex items-center space-x-2 md:space-x-4 truncate">
                <button
                  className="md:hidden p-1 mr-1 text-[#1A2F22]"
                  onClick={() => setIsMobileSidebarOpen(true)}
                >
                  <Menu size={24} />
                </button>
                <span className="text-xl md:text-2xl font-bold text-[#1A2F22] flex items-baseline gap-1 md:gap-2 truncate">
                  <span className="truncate">Cześć {user?.name ? user.name.split(' ')[0] : "Natalia"}!</span>
                  <span className="capitalize text-sm md:text-xl text-[#5A7368] font-medium hidden sm:inline ml-1">{getNow().toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                </span>
              </div>

              <div className="flex items-center space-x-3 md:space-x-5 flex-shrink-0">
                {/* Profil - ikona widoczna zawsze, imię chowane na mobile */}
                <div className="flex items-center relative">
                  <button onClick={() => setProfileMenuOpen(!profileMenuOpen)} className="flex items-center space-x-3 focus:outline-none bg-transparent p-1 md:p-0 rounded-full hover:bg-slate-50 transition-all px-2">
                    <svg className="w-9 h-9 rounded-full bg-[#E8DDD0] flex-shrink-0" fill="none" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="20" cy="20" fill="#E8DDD0" r="20" />
                      <path d="M20 20C22.2091 20 24 18.2091 24 16C24 13.7909 22.2091 12 20 12C17.7909 12 16 13.7909 16 16C16 18.2091 17.7909 20 20 20Z" fill="#9FB5AD" />
                      <path d="M20 22C15.5817 22 12 25.5817 12 30H28C28 25.5817 24.4183 22 20 22Z" fill="#9FB5AD" />
                    </svg>
                    <span className="hidden md:block text-sm font-bold text-[#1A2F22]">{user?.name || "Natalia"}</span>
                  </button>

                  <div className={`absolute top-full right-0 mt-3 w-40 bg-white rounded-2xl shadow-xl border border-[#E8DDD0] py-2 z-[100] origin-top-right transition-all duration-200 ease-out ${profileMenuOpen ? 'opacity-100 scale-100 translate-y-0 visible' : 'opacity-0 scale-95 -translate-y-2 invisible'}`}>
                    <button
                      onClick={() => {
                        localStorage.clear();
                        window.location.reload();
                      }}
                      className="w-full px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 flex items-center justify-center gap-2 transition-all"
                    >
                      <LogOut size={16} /> Wyloguj mnie
                    </button>
                  </div>
                </div>
              </div>
            </header>

            <div className="flex-1 min-h-0 relative flex flex-col w-full">
              {activeTab === "dashboard" && (
                <DashboardView
                  tasks={tasks}
                  moods={moods}
                  selectedDate={selectedDate}
                  onChangeDate={(offset) => setSelectedDate(d => { const nd = new Date(d); nd.setDate(d.getDate() + offset); return nd; })}
                  onToggle={toggleTask}
                  onOpenTaskModal={() => { setEditingTask(null); setIsTaskModalOpen(true); }}
                  onEditTask={handleEditTask}
                  onDelete={deleteTask}
                  onReturnToBacklog={returnToBacklog}
                  onFocusTask={setFocusedTask}
                  onAlert={() => {
                    add("Wykryto sygnał ostrzegawczy. Przejdź do Systemu Ostrzegania.", "warn");
                    handleNav("warning");
                  }}
                  loading={isLoading}
                  onGeneratePlan={generatePlan}
                  userPrefs={user?.prefs}
                />
              )}
              {activeTab === "calendar" && (
                <CalendarView
                  tasks={tasks}
                  selectedDate={selectedDate}
                  onChangeDate={(offset) => setSelectedDate(d => { const nd = new Date(d); nd.setDate(d.getDate() + offset); return nd; })}
                  onToggle={toggleTask}
                  onDelete={deleteTask}
                  onFocusTask={setFocusedTask}
                  onEditTask={handleEditTask}
                  loading={isLoading}
                />
              )}

              {activeTab === "mood" && (
                <MoodView
                  moods={moods}
                  onOpenModal={() => setShowMoodModal(true)}
                  onEditMood={handleEditMood}
                  todayDate={getNow()}
                />
              )}
              {activeTab === "warning" && <WarningView loading={isLoading} user={user} />}
              {activeTab === "settings" && <SettingsView user={user} setUser={setUser} add={add} />}
            </div>
          </main>

          {isTaskModalOpen && (
            <TaskModal
              onClose={() => { setIsTaskModalOpen(false); setEditingTask(null); }}
              onSave={saveTask}
              taskToEdit={editingTask}
            />
          )}

          {showMoodModal && <MoodModal onClose={() => setShowMoodModal(false)} onAdd={addMood} />}
          {showDebugModal && <DebugModal onClose={() => setShowDebugModal(false)} actions={debugActions} />}
        </>
      )}
    </div>
  );
}
