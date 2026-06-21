/**
 * ═══════════════════════════════════════════════════════════════════
 *  SKRYPT MIGRACYJNY: Materializacja zadań cyklicznych
 * ═══════════════════════════════════════════════════════════════════
 *
 *  Cel: Zamiana zadań z deklaratywną cyklicznością (współdzielony stan)
 *       na pełną materializację instancji (osobny rekord z własnym ID
 *       dla każdego wystąpienia).
 *
 *  Uruchamianie:
 *    node scripts/migrate-recurrence.js
 *
 *  Wymagania:
 *    - npm install @supabase/supabase-js dotenv
 *    - Plik .env w katalogu głównym projektu z kluczami Supabase
 * ═══════════════════════════════════════════════════════════════════
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// ─── Ładowanie zmiennych środowiskowych z .env ──────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env") });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Brak zmiennych VITE_SUPABASE_URL lub VITE_SUPABASE_ANON_KEY w pliku .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ─── Stałe ──────────────────────────────────────────────────────
const HORYZONT_DNI = 365; // Twardy limit: max 365 dni w przód
const DZIS = new Date();
DZIS.setHours(0, 0, 0, 0);

// ─── Pomocnicza: formatowanie daty do 'YYYY-MM-DD' ─────────────
function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ─── Pomocnicza: parsowanie daty z tekstu 'YYYY-MM-DD' ─────────
function parseDate(str) {
  if (!str) return null;
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// ─── Sprawdzenie: czy dzień jest dniem roboczym (pon-pt) ────────
function isDzienRoboczy(date) {
  const day = date.getDay(); // 0=Nd, 6=Sob
  return day !== 0 && day !== 6;
}

// ═══════════════════════════════════════════════════════════════════
//  GENERATOR DAT na podstawie reguły cykliczności
// ═══════════════════════════════════════════════════════════════════
function generujDaty(pDateStr, recurrence, recurrenceEndStr) {
  const daty = [];

  // Data startu: pDate lub dzisiaj (jeśli pDate jest puste)
  const startDate = pDateStr ? parseDate(pDateStr) : new Date(DZIS);

  // Horyzont: recurrenceEnd lub dzisiaj + 365 dni
  const maxDate = new Date(DZIS);
  maxDate.setDate(maxDate.getDate() + HORYZONT_DNI);

  const endDate = recurrenceEndStr ? parseDate(recurrenceEndStr) : null;
  // Bierzemy wcześniejszą z dwóch dat jako twardy limit
  const granica = endDate && endDate < maxDate ? endDate : maxDate;

  // Zaczynamy od startDate + 1 skok (oryginalna data to istniejący rekord)
  let current = new Date(startDate);

  // Pierwszy skok
  const skok = () => {
    if (recurrence === "codziennie") {
      current.setDate(current.getDate() + 1);
    } else if (recurrence.startsWith("co tydzień")) {
      // Ignorujemy precyzyjne dni tygodnia, skok +7 dni
      current.setDate(current.getDate() + 7);
    } else if (recurrence === "w dni robocze") {
      // Skok co 1 dzień, ale pomijamy weekendy
      do {
        current.setDate(current.getDate() + 1);
      } while (!isDzienRoboczy(current));
    }
  };

  // Wykonujemy pierwszy skok
  skok();

  // Pętla generująca daty aż do granicy
  while (current <= granica) {
    daty.push(formatDate(current));
    skok();
  }

  return daty;
}

// ═══════════════════════════════════════════════════════════════════
//  GŁÓWNA FUNKCJA MIGRACJI
// ═══════════════════════════════════════════════════════════════════
async function migruj() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  🔄 START MIGRACJI: Materializacja zadań cyklicznych");
  console.log("═══════════════════════════════════════════════════════");
  console.log(`  📅 Data dzisiejsza: ${formatDate(DZIS)}`);
  console.log(`  📏 Horyzont czasowy: ${HORYZONT_DNI} dni\n`);

  // ─── KROK 1: Pobranie zadań cyklicznych ─────────────────────────
  console.log("📥 Krok 1: Pobieranie zadań cyklicznych z bazy...");

  const { data: zadania, error: fetchError } = await supabase
    .from("tasks")
    .select("*")
    .not("recurrence", "is", null)       // recurrence nie jest puste
    .neq("recurrence", "")               // recurrence nie jest pustym stringiem
    .neq("recurrence", "jednorazowo")    // pomijamy jednorazowe
    .neq("recurrence", "zmaterializowane"); // pomijamy już zmaterializowane

  if (fetchError) {
    console.error("❌ Błąd pobierania zadań:", fetchError.message);
    process.exit(1);
  }

  if (!zadania || zadania.length === 0) {
    console.log("✅ Brak zadań do migracji. Baza jest już aktualna.\n");
    return;
  }

  console.log(`   ➡️  Znaleziono ${zadania.length} zadań cyklicznych do przetworzenia.\n`);

  // ─── KROK 2–5: Generowanie nowych instancji ─────────────────────
  console.log("⚙️  Krok 2-5: Generowanie instancji dla każdego zadania...\n");

  const noweRekordy = [];
  const idDoAktualizacji = [];

  for (const zadanie of zadania) {
    const { id, recurrence, recurrenceEnd, pDate, ...reszta } = zadanie;

    // Generujemy listę przyszłych dat
    const daty = generujDaty(pDate, recurrence, recurrenceEnd);

    if (daty.length === 0) {
      console.log(`   ⏭️  Zadanie #${id} ("${zadanie.title}"): brak nowych dat do wygenerowania.`);
    } else {
      console.log(`   📋 Zadanie #${id} ("${zadanie.title}"): ${recurrence} → ${daty.length} nowych instancji`);
    }

    // Klonujemy oryginalne zadanie dla każdej daty
    for (const nowaData of daty) {
      noweRekordy.push({
        ...reszta,
        pDate: nowaData,
        done: false,
        recurrence: "zmaterializowane",
        recurrenceEnd: null,
        // Resetujemy planowanie (każda instancja startuje bez zaplanowanej godziny)
        sMins: null,
        eMins: null,
      });
    }

    // Zapamiętujemy ID oryginału do aktualizacji w kroku 7
    idDoAktualizacji.push(id);
  }

  console.log(`\n   📊 Łącznie wygenerowano: ${noweRekordy.length} nowych rekordów.\n`);

  // ─── KROK 6: Bulk Insert nowych instancji ──────────────────────
  if (noweRekordy.length > 0) {
    console.log("💾 Krok 6: Wstawianie nowych rekordów do bazy (Bulk Insert)...");

    // Supabase ma limit na rozmiar pojedynczego zapytania,
    // więc wstawiamy w partiach po 500 rekordów
    const ROZMIAR_PARTII = 500;
    let wstawiono = 0;

    for (let i = 0; i < noweRekordy.length; i += ROZMIAR_PARTII) {
      const partia = noweRekordy.slice(i, i + ROZMIAR_PARTII);

      const { error: insertError } = await supabase
        .from("tasks")
        .insert(partia);

      if (insertError) {
        console.error(`   ❌ Błąd wstawiania partii ${Math.floor(i / ROZMIAR_PARTII) + 1}:`, insertError.message);
        process.exit(1);
      }

      wstawiono += partia.length;
      console.log(`   ✅ Wstawiono partię ${Math.floor(i / ROZMIAR_PARTII) + 1}: ${partia.length} rekordów (łącznie: ${wstawiono}/${noweRekordy.length})`);
    }
  } else {
    console.log("ℹ️  Krok 6: Brak nowych rekordów do wstawienia — pomijam.");
  }

  // ─── KROK 7: Aktualizacja oryginalnych zadań ───────────────────
  console.log("\n🔒 Krok 7: Oznaczanie oryginalnych zadań jako 'jednorazowo'...");

  if (idDoAktualizacji.length > 0) {
    // Aktualizujemy recurrence na 'jednorazowo' dla wszystkich oryginałów
    const { error: updateError } = await supabase
      .from("tasks")
      .update({ recurrence: "jednorazowo" })
      .in("id", idDoAktualizacji);

    if (updateError) {
      console.error("   ❌ Błąd aktualizacji oryginałów:", updateError.message);
      process.exit(1);
    }

    console.log(`   ✅ Zaktualizowano ${idDoAktualizacji.length} oryginalnych zadań.`);
  }

  // ─── PODSUMOWANIE ──────────────────────────────────────────────
  console.log("\n═══════════════════════════════════════════════════════");
  console.log("  ✅ MIGRACJA ZAKOŃCZONA POMYŚLNIE!");
  console.log("═══════════════════════════════════════════════════════");
  console.log(`  📋 Przetworzone zadania cykliczne: ${zadania.length}`);
  console.log(`  📝 Nowe instancje w bazie:          ${noweRekordy.length}`);
  console.log(`  🔒 Oryginały oznaczone jako 'jednorazowo': ${idDoAktualizacji.length}`);
  console.log("═══════════════════════════════════════════════════════\n");
}

// ─── Uruchomienie ────────────────────────────────────────────────
migruj().catch((err) => {
  console.error("❌ Nieoczekiwany błąd:", err);
  process.exit(1);
});
