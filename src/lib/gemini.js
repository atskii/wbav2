import { supabase } from "./supabase";
import { checkIsDate } from "./dateHelpers";

async function getAuthHeaders() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return {
    "Content-Type": "application/json",
    ...(session?.access_token
      ? { Authorization: `Bearer ${session.access_token}` }
      : {}),
  };
}

/**
 * Analyze mood data via server-side Gemini proxy (/api/gemini).
 * @param {Array} moods – array of { d: "YYYY-MM-DD", v: 0-6, note: string }
 * @param {string} userName – user's name for personalization
 * @param {string} userEmail – kept for caller compatibility
 * @returns {Promise<string>} – AI analysis text
 */
export async function analyzeMoodWithAI(
  moods,
  userName = "Użytkownik",
  userEmail = "testuser@testuser"
) {
  if (!moods || moods.length === 0) {
    throw new Error("Brak danych nastrojowych do analizy.");
  }

  // Ogranicz do ostatnich 14 dni (zgodnie z logiką projektu)
  const recentMoods = moods.slice(-14).map((m) => ({
    data: m.d,
    nastroj: m.v, // 0=Tragedia, 1=Źle, 2=Neutralnie, 3=Dobrze, 4=Bardzo dobrze, 5=Świetnie, 6=Fantastycznie
    notatka: m.note || "",
  }));

  const headers = await getAuthHeaders();
  const response = await fetch("/api/gemini", {
    method: "POST",
    headers,
    cache: "no-store",
    body: JSON.stringify({
      action: "analyze_mood",
      moods: recentMoods,
      userName,
      userEmail,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.error || `Błąd serwera AI: ${response.status}`
    );
  }

  const data = await response.json();
  if (!data?.text) {
    throw new Error("Gemini nie zwrócił odpowiedzi.");
  }

  return data.text.trim();
}

/**
 * Używa modelu Gemini (przez backendowe proxy /api/gemini) do ułożenia zoptymalizowanego planu dnia,
 * bazując na sztywnych zadaniach, luźnych zadaniach (z priorytetami i czasami) i preferencjach użytkownika.
 */
export async function generatePlanWithAI(
  tasks,
  userPrefs,
  selectedDate,
  lastMood,
  userEmail,
  userContext = ""
) {
  const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;
  const parsedStart = userPrefs?.startTime
    ? userPrefs.startTime.split(":").map(Number)
    : [6, 0];
  const timelineStart = parsedStart[0] || 6;
  const workHours = userPrefs?.hours || 15;
  const dayLimitMins = Math.min(timelineStart + workHours, 24) * 60;

  // Rozdzielenie zadań (teraz testowe mają poprawne parametry, ale dla pewności zostawiamy fallback dla starych danych)
  const lockedTasks = tasks
    .filter((t) => {
      if (!t.isLocked) return false;
      if (t.pDate) return t.pDate === dateStr;
      if (t.t) return checkIsDate(t.t, selectedDate);
      return false;
    })
    .map((t) => {
      let sMins = t.sMins;
      let eMins = t.eMins;
      if (sMins === null || sMins === undefined) {
        const match = t.t ? t.t.match(/(\d{1,2}):(\d{2})/) : null;
        sMins = match ? parseInt(match[1]) * 60 + parseInt(match[2]) : 0;
        const durMatch = t.duration ? t.duration.match(/(\d+)/) : null;
        const duration = durMatch ? parseInt(durMatch[1]) : 60;
        eMins = sMins + duration;
      }
      return { ...t, sMins, eMins };
    })
    .sort((a, b) => a.sMins - b.sMins);

  const flexTasks = tasks.filter(
    (t) => !t.isLocked && !t.done && (t.pDate === dateStr || !t.pDate)
  );

  const serializedFlexTasks = flexTasks.map((t) => {
    const durMatch = t.duration ? t.duration.match(/(\d+)/) : null;
    const durationMins = durMatch ? parseInt(durMatch[1]) : 45;
    return {
      id: t.id,
      title: t.title,
      duration_mins: durationMins,
      priority: t.p,
      difficulty: t.difficulty || 0,
    };
  });

  const headers = await getAuthHeaders();
  const response = await fetch("/api/gemini", {
    method: "POST",
    headers,
    cache: "no-store",
    body: JSON.stringify({
      action: "generate_plan",
      flexTasks: serializedFlexTasks,
      lastMood,
      userContext,
      userEmail,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("Gemini Proxy Error:", errorData);
    throw new Error(
      errorData?.error || "Błąd serwera AI podczas planowania."
    );
  }

  const data = await response.json();
  const parsedResponse = data?.parsedResponse;
  if (!parsedResponse) {
    throw new Error("Brak odpowiedzi od Gemini.");
  }

  // --- ALGORYTM MATEMATYCZNY (TETRIS) ---
  const mappedTasks = [];
  const BREAK_MINS = 5; // standardowa minimalna przerwa techniczna między zadaniami
  let currentMins = timelineStart * 60; // zaczynamy od początku doby
  let continuousWorkMins = 0; // śledzi ciągły czas pracy
  const aiBreakDurations =
    parsedResponse && Array.isArray(parsedResponse.suggestedBreakDurations)
      ? [...parsedResponse.suggestedBreakDurations]
      : [];

  // Krok 1: Przetwarzanie kotwic czasowych z AI (timeConstraints)
  const aiLocks = [];
  if (parsedResponse && Array.isArray(parsedResponse.timeConstraints)) {
    for (const constraint of parsedResponse.timeConstraints) {
      const task = flexTasks.find(
        (t) => String(t.id) === String(constraint.id)
      );
      if (task && constraint.time) {
        const match = constraint.time.match(/(\d{1,2}):(\d{2})/);
        if (match) {
          const sMins = parseInt(match[1]) * 60 + parseInt(match[2]);
          let duration = 45;
          if (task.duration) {
            const dMatch = task.duration.match(/(\d+)/);
            if (dMatch) duration = parseInt(dMatch[1]);
          }
          const eMins = sMins + duration;

          mappedTasks.push({ id: task.id, sMins, eMins });
          aiLocks.push({ id: task.id, sMins, eMins });
        }
      }
    }
  }

  // Połączone sztywne zadania (z kalendarza + kotwice AI)
  const allLocked = [...lockedTasks, ...aiLocks].sort(
    (a, b) => a.sMins - b.sMins
  );

  // Krok 2: Uzupełnianie wolnych okienek zadaniami (Tetris)
  if (parsedResponse && Array.isArray(parsedResponse.rankedTaskIds)) {
    for (const taskId of parsedResponse.rankedTaskIds) {
      // Jeśli zadanie zostało "zakotwiczone", nie planujemy go podwójnie
      if (aiLocks.some((lock) => String(lock.id) === String(taskId))) continue;

      const task = flexTasks.find((t) => String(t.id) === String(taskId));
      if (!task) continue;

      let duration = 45;
      if (task.duration) {
        const match = task.duration.match(/(\d+)/);
        if (match) duration = parseInt(match[1]);
      }

      let potentialStart = currentMins;
      let scheduled = false;

      // Dopóki zadanie mieści się w limitach dnia roboczego
      while (potentialStart + duration <= dayLimitMins) {
        const potentialEnd = potentialStart + duration;

        // Sprawdzamy czy okienko [potentialStart, potentialEnd] nie nakłada się na sztywne zadania
        const overlappingLock = allLocked.find(
          (lt) =>
            Math.max(potentialStart, lt.sMins) <
            Math.min(potentialEnd, lt.eMins)
        );

        if (overlappingLock) {
          // Nakłada się! Przesuwamy "kursor" czasu dokładnie na koniec zablokowanego zadania + 5 minut przerwy minimalnej
          potentialStart = overlappingLock.eMins + 5;
        } else {
          // Sukces - czysto! Dodajemy zadanie.
          mappedTasks.push({
            id: task.id,
            sMins: potentialStart,
            eMins: potentialEnd,
          });

          continuousWorkMins += duration;

          let nextGap = BREAK_MINS;
          // Jeśli pracowaliśmy 90 minut lub więcej, wrzucamy dłuższą przerwę od AI
          if (continuousWorkMins >= 90 && aiBreakDurations.length > 0) {
            const suggestedGap = aiBreakDurations.shift();
            // Upewniamy się, że przerwa od AI ma co najmniej 15 minut (by DashboardView ją wyświetlił jako visualGap)
            nextGap = Math.max(suggestedGap, 15);
            continuousWorkMins = 0; // resetujemy licznik po długiej przerwie
          }

          // Przesuwamy kursor czasu z uwzględnieniem przerwy
          currentMins = potentialEnd + nextGap;
          scheduled = true;
          break;
        }
      }

      if (!scheduled) {
        // Zadanie się nie zmieściło - wyląduje w Backlogu
      }
    }
  }

  return {
    mappedTasks: mappedTasks,
    coachMessage:
      parsedResponse.coachMessage ||
      "Oto Twój spersonalizowany plan na dziś! Powodzenia!",
  };
}
