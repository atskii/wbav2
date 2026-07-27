import { supabase } from "./supabase";

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
