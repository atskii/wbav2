import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY;
const GEMINI_URL_PLAN = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${GEMINI_API_KEY}`;

const prompt = `Jesteś asystentem AI planującym dzień użytkownika. Twoim zadaniem jest ułożenie elastycznych zadań na osi czasu.

### KONTEKST
Data: 2026-08-27
Dzień roboczy: od 6:00 do 21:00
Ostatni nastrój użytkownika (0-6): 2

### ZADANIA SZTYWNE (ZABLOKOWANE W KALENDARZU)
[]

### ZADANIA ELASTYCZNE (DO ZAPLANOWANIA)
Rozmieść te zadania na osi czasu (określając sMins i eMins dla każdego).
Zasady absolutne, których MUSISZ przestrzegać:
1. NIE WOLNO zmieniać parametru "duration" zadania. Czas trwania zadania (eMins - sMins) musi być równy wymaganemu czasowi.
2. Zadania NIE MOGĄ na siebie zachodzić (sMins kolejnego musi być >= eMins poprzedniego). Pamiętaj też o zadaniach sztywnych!
3. Zadania nie mogą wychodzić poza czas dnia roboczego (eMins <= 1260). Nie możesz przypisać zadania poniżej 360.
4. Pomiędzy zadaniami dodaj krótkie przerwy (np. 5-15 min) na odpoczynek, szczególnie po długich/trudnych zadaniach. Zwróć na to uwagę w wiadomości do użytkownika.
5. Jeśli mamy dużo zadań, a brakuje miejsca w dniu, po prostu olej najmniej ważne zadania (zwróć mniejszą liczbę elementów w mappedTasks) i nie przydzielaj im czasu (brak czasu będzie oznaczał pozostawienie ich w Backlogu).

Lista do ułożenia:
[]

Zwróć odpowiedź WYŁĄCZNIE w formacie JSON o następującej strukturze:
{
  "mappedTasks": [
    { "id": 123, "sMins": 600, "eMins": 645 } 
  ],
  "coachMessage": "Jedna, spójna, bardzo spersonalizowana wypowiedź od Ciebie (AI) skierowana bezpośrednio do użytkownika. Podsumuj jak ułożyłeś dzień, wspomnij o najważniejszych zadaniach, nawiąż do jego nastroju i dołożonych przerw. Napisz to w tonie przyjacielskim (np. 'Hej, plan został ułożony tak, abyś wyrobił się z zadaniami do 15. Widzę, że masz dzisiaj nieco gorszy humor, więc między trudniejszymi zadaniami zostawiłem Ci trochę więcej czasu na reset. Powodzenia, trzymam kciuki!')."
}
Nie dołączaj znaczników Markdown, zwróć tylko czysty obiekt JSON.`;

async function test() {
  const response = await fetch(GEMINI_URL_PLAN, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
    console.error("HTTP ERROR", await response.text());
    return;
  }
  
  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}

test();
