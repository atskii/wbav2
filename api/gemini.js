import { createClient } from "@supabase/supabase-js";

const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent";

const BURST_WINDOW_MS = 60 * 1000;
const BURST_MAX_REQUESTS = 5;
const DAILY_USER_LIMIT = 15;
const DAILY_GLOBAL_LIMIT = 150;

// Module-scoped burst rate limiter (per user/IP within a single serverless instance)
const burstRequests = new Map();

function checkBurstLimit(key) {
  const now = Date.now();
  const timestamps = (burstRequests.get(key) || []).filter(
    (ts) => now - ts < BURST_WINDOW_MS
  );
  if (timestamps.length >= BURST_MAX_REQUESTS) {
    burstRequests.set(key, timestamps);
    return false;
  }
  timestamps.push(now);
  burstRequests.set(key, timestamps);
  return true;
}

function isLocalHost(hostHeader = "") {
  const host = String(hostHeader).toLowerCase();
  return (
    host === "localhost" ||
    host.startsWith("localhost:") ||
    host === "127.0.0.1" ||
    host.startsWith("127.0.0.1:")
  );
}

function isAllowedOrigin(originHeader, hostHeader) {
  if (!originHeader) return true;
  try {
    const originUrl = new URL(originHeader);
    const originHostname = originUrl.hostname.toLowerCase();
    const requestHostname = String(hostHeader || "")
      .split(":")[0]
      .toLowerCase();

    if (requestHostname && originHostname === requestHostname) return true;
    if (originHostname === "localhost" || originHostname === "127.0.0.1") {
      return true;
    }
    if (originHostname.endsWith(".vercel.app")) return true;
    return false;
  } catch {
    return false;
  }
}

async function logTokenUsage(supabase, userEmail, usage, modelName) {
  try {
    const promptTokens = usage?.promptTokenCount || 0;
    const candidateTokens = usage?.candidatesTokenCount || 0;
    const totalTokens =
      usage?.totalTokenCount || promptTokens + candidateTokens;

    // Flash Lite (USD): $0.075 / 1M input, $0.30 / 1M output
    const estimatedCostUsd =
      promptTokens * 0.000000075 + candidateTokens * 0.0000003;

    const { error } = await supabase.from("token_usage").insert({
      user_email: userEmail || "anonymous",
      prompt_tokens: promptTokens,
      candidate_tokens: candidateTokens,
      total_tokens: totalTokens,
      estimated_cost_usd: Number(estimatedCostUsd.toFixed(8)),
      model_name: modelName,
    });

    if (error) {
      console.error("Błąd podczas zapisywania statystyk tokenów:", error);
    }
  } catch (err) {
    console.error("Błąd parsowania metadanych tokenów:", err);
  }
}

async function callGemini(apiKey, prompt, generationConfig) {
  const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.error?.message || `Błąd API Gemini: ${response.status}`
    );
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Gemini nie zwrócił odpowiedzi.");
  }

  return { text, usage: data?.usageMetadata || {} };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metoda niedozwolona. Użyj POST." });
  }

  const hostHeader = req.headers.host || "";
  if (!isAllowedOrigin(req.headers.origin, hostHeader)) {
    return res.status(403).json({ error: "Niedozwolony origin żądania." });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    return res
      .status(500)
      .json({ error: "Brak klucza GEMINI_API_KEY na serwerze." });
  }

  const SUPABASE_URL =
    process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const SUPABASE_ANON_KEY =
    process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return res
      .status(500)
      .json({ error: "Brak konfiguracji Supabase na serwerze." });
  }

  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : null;

  const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    token
      ? { global: { headers: { Authorization: `Bearer ${token}` } } }
      : undefined
  );

  let userEmail = null;
  if (token) {
    const { data: userData, error: authError } = await supabase.auth.getUser(
      token
    );
    if (authError || !userData?.user?.email) {
      return res
        .status(401)
        .json({ error: "Nieprawidłowa lub wygasła sesja użytkownika." });
    }
    userEmail = userData.user.email;
  } else if (isLocalHost(hostHeader)) {
    userEmail = "testuser@testuser";
  } else {
    return res
      .status(401)
      .json({ error: "Wymagane zalogowanie do wykonania zapytania AI." });
  }

  const clientIp =
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    req.socket?.remoteAddress ||
    "unknown";

  if (!checkBurstLimit(`${userEmail}:${clientIp}`)) {
    return res.status(429).json({
      error: "Zbyt wiele zapytań AI w krótkim czasie. Odczekaj minutę.",
    });
  }

  // 24h Circuit Breaker (per-user & global) backed by Supabase token_usage
  try {
    const sinceIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: recentUsage, error: usageErr } = await supabase
      .from("token_usage")
      .select("user_email, created_at")
      .gte("created_at", sinceIso);

    if (!usageErr && Array.isArray(recentUsage)) {
      if (recentUsage.length >= DAILY_GLOBAL_LIMIT) {
        return res.status(429).json({
          error:
            "Osiągnięto dzienny globalny limit zapytań AI. Spróbuj ponownie jutro.",
        });
      }

      const userCount = recentUsage.filter(
        (row) => row.user_email === userEmail
      ).length;
      if (userCount >= DAILY_USER_LIMIT) {
        return res.status(429).json({
          error: `Osiągnięto dzienny limit ${DAILY_USER_LIMIT} zapytań AI dla tego konta.`,
        });
      }
    }
  } catch (err) {
    console.error("Błąd sprawdzania limitów token_usage:", err);
  }

  const body = req.body && typeof req.body === "object" ? req.body : {};
  const { action } = body;

  if (action === "analyze_mood") {
    if (!Array.isArray(body.moods) || body.moods.length === 0) {
      return res
        .status(400)
        .json({ error: "Brak danych nastrojowych do analizy." });
    }

    const recentMoods = body.moods.slice(-14).map((m) => ({
      data: String(m?.data || m?.d || "").slice(0, 20),
      nastroj: Number(m?.nastroj ?? m?.v ?? 0),
      notatka: String(m?.notatka || m?.note || "").slice(0, 500),
    }));

    const userName = String(body.userName || "Użytkownik").slice(0, 60);

    const { data: articles, error: articlesError } = await supabase
      .from("articles")
      .select("title, source_title, author, summary");

    if (articlesError) {
      console.error("Błąd podczas pobierania bazy wiedzy:", articlesError);
    }

    const articlesContext =
      articles && articles.length > 0
        ? articles
            .map(
              (a, i) =>
                `--- Baza Wiedzy ${i + 1} ---\nTytuł: ${a.title}\nŹródło: ${a.source_title}\nAutor: ${a.author}\nStreszczenie: ${a.summary}`
            )
            .join("\n\n")
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

    try {
      const { text, usage } = await callGemini(GEMINI_API_KEY, prompt, {
        maxOutputTokens: 1024,
        temperature: 0.7,
      });

      await logTokenUsage(
        supabase,
        userEmail,
        usage,
        "gemini-flash-lite-latest"
      );

      return res.status(200).json({ text: text.trim() });
    } catch (err) {
      console.error("Błąd analyze_mood:", err);
      return res.status(502).json({ error: err.message });
    }
  }

  if (action === "generate_plan") {
    if (!Array.isArray(body.flexTasks)) {
      return res
        .status(400)
        .json({ error: "Nieprawidłowa lista zadań do zaplanowania." });
    }

    const flexTasks = body.flexTasks.slice(0, 50).map((t) => ({
      id: t?.id,
      title: String(t?.title || "").slice(0, 150),
      duration_mins: Number(t?.duration_mins ?? 45),
      priority: String(t?.priority ?? t?.p ?? "m").slice(0, 20),
      difficulty: Number(t?.difficulty ?? 0),
    }));

    const lastMood = Number(body.lastMood ?? 2);
    const userContext = String(body.userContext || "").slice(0, 500).trim();

    let userInstructions = "";
    if (userContext !== "") {
      userInstructions = `\n### UWAGI UŻYTKOWNIKA DO DZISIEJSZEGO PLANU:\n"${userContext}"\nZwróć na to SZCZEGÓLNĄ uwagę przy wyborze i układaniu priorytetów oraz uwzględnij sztywne ramy czasowe, jeśli użytkownik o nie prosi.\n`;
    }

    const prompt = `Jesteś bystrym asystentem AI ds. produktywności. Twoim zadaniem JEST JEDYNIE zrozumienie intencji czasowych użytkownika z notatki oraz nadanie priorytetów zadaniom z backlogu.

### KONTEKST
Ostatni nastrój użytkownika (0-6): ${lastMood} (Jeśli jest niski, faworyzuj lżejsze zadania przy układaniu rankingu).
${userInstructions}

### ZADANIA W BACKLOGU (ELASTYCZNE)
Oto lista elastycznych zadań, które czekają na wykonanie. Uporządkuj je od najważniejszego (najpilniejszego) do najmniej ważnego, tworząc spójny ranking.
${JSON.stringify(flexTasks, null, 2)}

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

    try {
      const { text, usage } = await callGemini(GEMINI_API_KEY, prompt, {
        maxOutputTokens: 2048,
        temperature: 0.1,
        responseMimeType: "application/json",
      });

      await logTokenUsage(
        supabase,
        userEmail,
        usage,
        "gemini-flash-lite-latest (hybrid)"
      );

      let cleanedText = text.trim();
      const firstBrace = cleanedText.indexOf("{");
      const lastBrace = cleanedText.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);
      }

      let parsedResponse;
      try {
        parsedResponse = JSON.parse(cleanedText);
      } catch {
        console.error("Błąd parsowania JSON odpowiedzi od Gemini:", text);
        return res
          .status(502)
          .json({ error: "Gemini zwrócił nieprawidłowy format JSON." });
      }

      return res.status(200).json({ parsedResponse });
    } catch (err) {
      console.error("Błąd generate_plan:", err);
      return res.status(502).json({ error: err.message });
    }
  }

  return res.status(400).json({ error: "Nieobsługiwana akcja AI." });
}
