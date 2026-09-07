import { supabase } from "./supabase";
import { checkIsDate } from "./dateHelpers";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${GEMINI_API_KEY}`;

/**
 * Analyze mood data using Gemini Flash Lite (cheapest model).
 * @param {Array} moods – array of { d: "YYYY-MM-DD", v: 0-6, note: string }
 * @param {string} userName – user's name for personalization
 * @param {string} userEmail – user's email for per-account cost tracking
 * @returns {Promise<string>} – AI analysis text
 */
export async function analyzeMoodWithAI(moods, userName = "Użytkownik", userEmail = "testuser@testuser") {
  if (!GEMINI_API_KEY) {
    throw new Error("Brak klucza API Gemini. Dodaj VITE_GEMINI_API_KEY do pliku .env");
  }

  if (!moods || moods.length === 0) {
    throw new Error("Brak danych nastrojowych do analizy.");
  }

  // Pobierz bazę wiedzy (artykuły) z Supabase
  const { data: articles, error: articlesError } = await supabase
    .from('articles')
    .select('title, source_title, author, summary');

  if (articlesError) {
    console.error("Błąd podczas pobierania bazy wiedzy:", articlesError);
  }

  // Ogranicz do ostatnich 14 dni (zgodnie z logiką projektu)
  const recentMoods = moods.slice(-14).map(m => ({
    data: m.d,
    nastroj: m.v, // 0=Tragedia, 1=Źle, 2=Neutralnie, 3=Dobrze, 4=Bardzo dobrze, 5=Świetnie, 6=Fantastycznie
    notatka: m.note || ""
  }));

  const articlesContext = articles && articles.length > 0
    ? articles.map((a, i) => `--- Baza Wiedzy ${i + 1} ---\nTytuł: ${a.title}\nŹródło: ${a.source_title}\nAutor: ${a.author}\nStreszczenie: ${a.summary}`).join('\n\n')
    : "Brak dostępnej bazy wiedzy.";

  const prompt = `Jesteś empatycznym analitykiem wellbeing. Przeanalizuj dwutygodniowy trend nastroju użytkownika "${userName}".

Historia wpisów (ostatnie 14 dni, od najstarszego):
${JSON.stringify(recentMoods, null, 2)}

[BAZA WIEDZY NAUKOWEJ]
${articlesContext}

Twoje zadanie:
1. Wskaż główny powtarzający się wzorzec w ostatnich 14 dniach (np. czy stres nawraca w konkretne dni, odnieś się do notatek jeśli są).
2. Udziel empatycznego wsparcia wyjaśniając mechanizm problemu opierając się TYLKO na jednym z artykułów z załączonej bazy wiedzy.
3. Zasugeruj jedną konkretną technikę ratunkową z wybranego artykułu.
4. Zmieść się w jednym akapicie.
5. Na samym dole dopisz PUSTĄ LINIĘ, a następnie DOKŁADNIE podaj źródło, którego użyłeś w formacie:
📚 Polecane źródło: [Tytuł źródła z bazy] - [Autor z bazy]

Wymogi formatowania:
Pisz przyjaznym, zwięzłym tekstem. Nie używaj pogrubień (**). Pisz jak człowiek.`;

  const response = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.7
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `Błąd API Gemini: ${response.status}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Gemini nie zwrócił odpowiedzi.");
  }

  // Zapisz statystyki zużycia tokenów w Supabase
  try {
    const usage = data?.usageMetadata || {};
    const promptTokens = usage.promptTokenCount || 0;
    const candidateTokens = usage.candidatesTokenCount || 0;
    const totalTokens = usage.totalTokenCount || (promptTokens + candidateTokens);

    // Przelicznik Flash Lite (USD):
    // Prompt: $0.075 / 1,000,000 tokenów ($0.000000075 za token)
    // Candidate: $0.30 / 1,000,000 tokenów ($0.00000030 za token)
    const estimatedCostUsd = (promptTokens * 0.000000075) + (candidateTokens * 0.00000030);

    supabase.from('token_usage').insert({
      user_email: userEmail || 'anonymous',
      prompt_tokens: promptTokens,
      candidate_tokens: candidateTokens,
      total_tokens: totalTokens,
      estimated_cost_usd: Number(estimatedCostUsd.toFixed(8)),
      model_name: 'gemini-flash-lite-latest'
    }).then(({ error }) => {
      if (error) console.error("Błąd podczas zapisywania statystyk tokenów:", error);
    });
  } catch (err) {
    console.error("Błąd parsowania metadanych tokenów:", err);
  }

  return text.trim();
}

/**
 * Używa modelu Gemini do ułożenia zoptymalizowanego planu dnia, bazując na sztywnych zadaniach,
 * luźnych zadaniach (z priorytetami i czasami) i preferencjach użytkownika. Zwraca JSON.
 */
export async function generatePlanWithAI(tasks, userPrefs, selectedDate, lastMood, userEmail, userContext = "") {
  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    throw new Error("Brak klucza API Gemini.");
  }
  
  const GEMINI_URL_PLAN = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`;

  const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
  const parsedStart = userPrefs?.startTime ? userPrefs.startTime.split(':').map(Number) : [6, 0];
  const timelineStart = parsedStart[0] || 6;
  const workHours = userPrefs?.hours || 15;
  const dayLimitMins = Math.min(timelineStart + workHours, 24) * 60;
  
  // Rozdzielenie zadań (teraz testowe mają poprawne parametry, ale dla pewności zostawiamy fallback dla starych danych)
  const lockedTasks = tasks.filter(t => {
    if (!t.isLocked) return false;
    if (t.pDate) return t.pDate === dateStr;
    if (t.t) return checkIsDate(t.t, selectedDate);
    return false;
  }).map(t => {
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
  }).sort((a, b) => a.sMins - b.sMins);

  const flexTasks = tasks.filter(t => !t.isLocked && !t.done && (t.pDate === dateStr || !t.pDate));

  let userInstructions = "";
  if (userContext && userContext.trim() !== "") {
    userInstructions = `\n### UWAGI UŻYTKOWNIKA DO DZISIEJSZEGO PLANU:\n"${userContext.trim()}"\nZwróć na to SZCZEGÓLNĄ uwagę przy wyborze i układaniu priorytetów oraz uwzględnij sztywne ramy czasowe, jeśli użytkownik o nie prosi.\n`;
  }

  // Uproszczony prompt - prosimy o timeConstraints i posortowanie zadań
  const prompt = `Jesteś bystrym asystentem AI ds. produktywności. Twoim zadaniem JEST JEDYNIE zrozumienie intencji czasowych użytkownika z notatki oraz nadanie priorytetów zadaniom z backlogu.

### KONTEKST
Ostatni nastrój użytkownika (0-6): ${lastMood} (Jeśli jest niski, faworyzuj lżejsze zadania przy układaniu rankingu).
${userInstructions}

### ZADANIA W BACKLOGU (ELASTYCZNE)
Oto lista elastycznych zadań, które czekają na wykonanie. Uporządkuj je od najważniejszego (najpilniejszego) do najmniej ważnego, tworząc spójny ranking.
${JSON.stringify(flexTasks.map(t => {
    const durMatch = t.duration ? t.duration.match(/(\d+)/) : null;
    const durationMins = durMatch ? parseInt(durMatch[1]) : 45;
    return { id: t.id, title: t.title, duration_mins: durationMins, priority: t.p, difficulty: t.difficulty || 0 };
  }), null, 2)}

Zwróć odpowiedź WYŁĄCZNIE w formacie JSON o następującej strukturze:
{
  "timeConstraints": [
    // TYLKO JEŚLI użytkownik WPROST wskazał w uwagach konkretną godzinę dla jakiegoś zadania, np:
    // { "id": 123, "time": "12:00" } 
    // Jeśli brak takich uwag, zostaw pustą tablicę: []
  ],
  "rankedTaskIds": [ 
    // ID wszystkich (lub większości) zadań z backlogu, posortowane od najważniejszego do wykonania jako pierwsze. 
    // Algorytm zaplanuje je w dostępnych wolnych oknach w tej właśnie kolejności.
  ], 
  "suggestedBreakDurations": [
    // Lista liczb (w minutach) określająca proponowane przez Ciebie dłuższe przerwy regeneracyjne (np. [15, 30]). 
    // Wybierz ile przerw i jak długich (min 15) potrzebuje użytkownik dziś na podstawie nastroju i liczby zadań. 
    // Jeśli nie potrzebuje długich przerw, zwróć pustą tablicę [].
  ],
  "coachMessage": "Jedna, spójna, spersonalizowana i przyjacielska wypowiedź (ok 2-3 zdania). Zwróć się bezpośrednio do użytkownika. Powiedz dlaczego ustawiłeś taki priorytet, czy spełniłeś prośby czasowe i podrzuć zdanie motywacyjne."
}
UWAGA: Zwróć tylko czysty obiekt JSON. Nie dołączaj znaczników Markdown.`;

  const response = await fetch(GEMINI_URL_PLAN, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.1,
        responseMimeType: "application/json"
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("Gemini API Error:", errorData);
    throw new Error(errorData?.error?.message || "Błąd API Gemini podczas planowania.");
  }

  const data = await response.json();
  let text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!text) throw new Error("Brak odpowiedzi od Gemini.");

  try {
    const usage = data?.usageMetadata || {};
    const promptTokens = usage.promptTokenCount || 0;
    const candidateTokens = usage.candidatesTokenCount || 0;
    const totalTokens = usage.totalTokenCount || (promptTokens + candidateTokens);
    const estimatedCostUsd = (promptTokens * 0.000000075) + (candidateTokens * 0.00000030);

    supabase.from('token_usage').insert({
      user_email: userEmail || 'anonymous',
      prompt_tokens: promptTokens,
      candidate_tokens: candidateTokens,
      total_tokens: totalTokens,
      estimated_cost_usd: Number(estimatedCostUsd.toFixed(8)),
      model_name: 'gemini-flash-lite-latest (hybrid)'
    }).then(({ error }) => {
      if (error) console.error("Błąd zapisu tokenów:", error);
    });
  } catch (err) { }

  let parsedResponse = null;
  try {
    let cleanedText = text.trim();
    const firstBrace = cleanedText.indexOf('{');
    const lastBrace = cleanedText.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);
    }
    parsedResponse = JSON.parse(cleanedText);
  } catch (err) {
    console.error("Błąd parsowania JSON odpowiedzi od Gemini:", text);
    throw new Error("Gemini zwrócił nieprawidłowy format JSON.");
  }

  // --- ALGORYTM MATEMATYCZNY (TETRIS) ---
  const mappedTasks = [];
  const BREAK_MINS = 5; // standardowa minimalna przerwa techniczna między zadaniami
  let currentMins = timelineStart * 60; // zaczynamy od początku doby
  let continuousWorkMins = 0; // śledzi ciągły czas pracy
  const aiBreakDurations = (parsedResponse && Array.isArray(parsedResponse.suggestedBreakDurations)) 
    ? [...parsedResponse.suggestedBreakDurations] 
    : [];

  // Krok 1: Przetwarzanie kotwic czasowych z AI (timeConstraints)
  const aiLocks = [];
  if (parsedResponse && Array.isArray(parsedResponse.timeConstraints)) {
    for (const constraint of parsedResponse.timeConstraints) {
      const task = flexTasks.find(t => String(t.id) === String(constraint.id));
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
  const allLocked = [...lockedTasks, ...aiLocks].sort((a, b) => a.sMins - b.sMins);

  // Krok 2: Uzupełnianie wolnych okienek zadaniami (Tetris)
  if (parsedResponse && Array.isArray(parsedResponse.rankedTaskIds)) {
    for (const taskId of parsedResponse.rankedTaskIds) {
      // Jeśli zadanie zostało "zakotwiczone", nie planujemy go podwójnie
      if (aiLocks.some(lock => String(lock.id) === String(taskId))) continue;

      const task = flexTasks.find(t => String(t.id) === String(taskId));
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
        const overlappingLock = allLocked.find(lt =>
          Math.max(potentialStart, lt.sMins) < Math.min(potentialEnd, lt.eMins)
        );

        if (overlappingLock) {
          // Nakłada się! Przesuwamy "kursor" czasu dokładnie na koniec zablokowanego zadania + 5 minut przerwy minimalnej
          potentialStart = overlappingLock.eMins + 5;
        } else {
          // Sukces - czysto! Dodajemy zadanie.
          mappedTasks.push({
            id: task.id,
            sMins: potentialStart,
            eMins: potentialEnd
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
    coachMessage: parsedResponse.coachMessage || "Oto Twój spersonalizowany plan na dziś! Powodzenia!"
  };
}
