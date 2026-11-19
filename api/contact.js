const TO_EMAIL = process.env.CONTACT_TO_EMAIL || "alek.iglow@gmail.com";

const COOLDOWN_MS = 60 * 1000; // max 1 wiadomość na 60s z jednego IP
const HOURLY_WINDOW_MS = 60 * 60 * 1000; // okno 1 godziny
const HOURLY_MAX_PER_IP = 3; // max 3 wiadomości na godzinę z jednego IP
const DAILY_WINDOW_MS = 24 * 60 * 60 * 1000;
const DAILY_GLOBAL_MAX = 50; // globalny bezpiecznik dzienny

const ipHistory = new Map();
let globalTimestamps = [];

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

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function checkRateLimit(ip) {
  const now = Date.now();

  globalTimestamps = globalTimestamps.filter(
    (ts) => now - ts < DAILY_WINDOW_MS
  );
  if (globalTimestamps.length >= DAILY_GLOBAL_MAX) {
    return {
      ok: false,
      error: "Osiągnięto dzienny limit wiadomości. Spróbuj ponownie jutro.",
    };
  }

  const recent = (ipHistory.get(ip) || []).filter(
    (ts) => now - ts < HOURLY_WINDOW_MS
  );

  if (recent.length > 0 && now - recent[recent.length - 1] < COOLDOWN_MS) {
    return {
      ok: false,
      error: "Odczekaj minutę przed wysłaniem kolejnej wiadomości.",
    };
  }

  if (recent.length >= HOURLY_MAX_PER_IP) {
    return {
      ok: false,
      error: `Przekroczono limit ${HOURLY_MAX_PER_IP} wiadomości na godzinę z tego adresu IP.`,
    };
  }

  recent.push(now);
  ipHistory.set(ip, recent);
  globalTimestamps.push(now);
  return { ok: true };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metoda niedozwolona. Użyj POST." });
  }

  if (!isAllowedOrigin(req.headers.origin, req.headers.host || "")) {
    return res.status(403).json({ error: "Niedozwolony origin żądania." });
  }

  const body = req.body && typeof req.body === "object" ? req.body : {};

  // Honeypot przeciwko botom (ukryte pole powinno pozostać puste)
  if (body.website && String(body.website).trim() !== "") {
    return res.status(200).json({ ok: true });
  }

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const message = String(body.message || "").trim();
  const acceptedTerms = Boolean(body.acceptedTerms);

  if (name.length < 2 || name.length > 100) {
    return res
      .status(400)
      .json({ error: "Podaj poprawne imię (2–100 znaków)." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email) || email.length > 150) {
    return res
      .status(400)
      .json({ error: "Podaj poprawny adres e-mail." });
  }

  if (message.length < 10 || message.length > 2000) {
    return res
      .status(400)
      .json({ error: "Wiadomość powinna mieć od 10 do 2000 znaków." });
  }

  if (!acceptedTerms) {
    return res
      .status(400)
      .json({ error: "Musisz zaakceptować regulamin, aby wysłać wiadomość." });
  }

  const clientIp =
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    req.socket?.remoteAddress ||
    "unknown";

  const limitCheck = checkRateLimit(clientIp);
  if (!limitCheck.ok) {
    return res.status(429).json({ error: limitCheck.error });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    return res.status(503).json({
      error:
        "Wysyłka e-mail nie jest jeszcze skonfigurowana na serwerze (brak zmiennej RESEND_API_KEY).",
    });
  }

  const fromEmail =
    process.env.CONTACT_FROM_EMAIL || "Wellbeing App <onboarding@resend.dev>";

  try {
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [TO_EMAIL],
        reply_to: email,
        subject: `[WBA Kontakt] Wiadomość od ${name}`,
        html: `
          <div style="font-family: sans-serif; line-height: 1.6; color: #151515;">
            <h2 style="color: #0E6630;">Nowa wiadomość z formularza Wellbeing App</h2>
            <p><strong>Imię:</strong> ${escapeHtml(name)}</p>
            <p><strong>E-mail:</strong> ${escapeHtml(email)}</p>
            <p><strong>IP nadawcy:</strong> ${escapeHtml(clientIp)}</p>
            <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 16px 0;" />
            <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
          </div>
        `,
      }),
    });

    if (!resendRes.ok) {
      const errBody = await resendRes.json().catch(() => ({}));
      console.error("Resend API error:", errBody);
      return res.status(502).json({
        error:
          "Nie udało się wysłać wiadomości. Spróbuj ponownie za chwilę.",
      });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Contact endpoint error:", err);
    return res
      .status(500)
      .json({ error: "Wystąpił błąd serwera podczas wysyłki wiadomości." });
  }
}
