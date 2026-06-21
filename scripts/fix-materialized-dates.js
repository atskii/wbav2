/**
 * ═══════════════════════════════════════════════════════════════════
 *  SKRYPT NAPRAWCZY: Aktualizacja pól t/lockDateTime/deadline
 *  w zmaterializowanych zadaniach
 * ═══════════════════════════════════════════════════════════════════
 *
 *  Problem: Pierwsza migracja skopiowała pola `t`, `lockDateTime`
 *  i `deadline` bez zmiany dat w nich zawartych. Przez to każda
 *  instancja miała starą datę w stringu `t`, co powodowało że
 *  checkIsDate() matchowało je na zły dzień.
 *
 *  Rozwiązanie: Dla każdego zmaterializowanego zadania podmień daty
 *  w polach `t`, `lockDateTime` i `deadline` na datę z `pDate`.
 *
 *  Uruchamianie:
 *    node scripts/fix-materialized-dates.js
 * ═══════════════════════════════════════════════════════════════════
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env") });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Brak zmiennych VITE_SUPABASE_URL lub VITE_SUPABASE_ANON_KEY w pliku .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ─── Podmień daty w stringu na nową datę z pDate ────────────────
function podmienDaty(str, pDate) {
  if (!str) return str;
  const [y, m, d] = pDate.split('-');
  const newDatePL = `${parseInt(d)}.${parseInt(m)}.${y}`; // DD.MM.YYYY

  let result = str;
  // Zamień format PL (DD.MM.YYYY)
  result = result.replace(/\d{1,2}\.\d{1,2}\.\d{4}/g, newDatePL);
  // Zamień format ISO (YYYY-MM-DD) — ale nie sam pDate w innych polach
  result = result.replace(/\d{4}-\d{1,2}-\d{1,2}/g, pDate);
  // Zamień format z ukośnikami (DD/MM/YYYY)
  result = result.replace(/\d{1,2}\/\d{1,2}\/\d{4}/g, newDatePL);

  return result;
}

function podmienLockDateTime(lockDateTime, pDate) {
  if (!lockDateTime) return lockDateTime;
  const timePart = lockDateTime.split('T')[1] || '00:00';
  return `${pDate}T${timePart}`;
}

// ═══════════════════════════════════════════════════════════════════
async function napraw() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  🔧 NAPRAWA: Aktualizacja dat w zmaterializowanych zadaniach");
  console.log("═══════════════════════════════════════════════════════\n");

  // Pobierz wszystkie zmaterializowane zadania
  const { data: zadania, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("recurrence", "zmaterializowane");

  if (error) {
    console.error("❌ Błąd pobierania:", error.message);
    process.exit(1);
  }

  if (!zadania || zadania.length === 0) {
    console.log("✅ Brak zmaterializowanych zadań do naprawy.\n");
    return;
  }

  console.log(`📥 Znaleziono ${zadania.length} zmaterializowanych zadań.\n`);

  let naprawione = 0;
  let pominięte = 0;
  const aktualizacje = [];

  for (const z of zadania) {
    if (!z.pDate) {
      pominięte++;
      continue;
    }

    const noweT = podmienDaty(z.t, z.pDate);
    const nowyDeadline = podmienDaty(z.deadline, z.pDate);
    const nowyLockDateTime = podmienLockDateTime(z.lockDateTime, z.pDate);

    // Sprawdź czy cokolwiek się zmieniło
    const zmieniono = noweT !== z.t || nowyDeadline !== z.deadline || nowyLockDateTime !== z.lockDateTime;

    if (zmieniono) {
      aktualizacje.push({
        id: z.id,
        t: noweT,
        deadline: nowyDeadline,
        lockDateTime: nowyLockDateTime,
      });
      naprawione++;
    } else {
      pominięte++;
    }
  }

  console.log(`⚙️  Do naprawienia: ${naprawione}, pominięto (bez zmian): ${pominięte}\n`);

  // Wykonaj aktualizacje partiami
  const ROZMIAR_PARTII = 100;
  for (let i = 0; i < aktualizacje.length; i += ROZMIAR_PARTII) {
    const partia = aktualizacje.slice(i, i + ROZMIAR_PARTII);

    await Promise.all(
      partia.map(async ({ id, t, deadline, lockDateTime }) => {
        const { error: updateErr } = await supabase
          .from("tasks")
          .update({ t, deadline, lockDateTime })
          .eq("id", id);

        if (updateErr) {
          console.error(`   ❌ Błąd aktualizacji zadania #${id}:`, updateErr.message);
        }
      })
    );

    console.log(`   ✅ Partia ${Math.floor(i / ROZMIAR_PARTII) + 1}: naprawiono ${partia.length} rekordów`);
  }

  console.log("\n═══════════════════════════════════════════════════════");
  console.log("  ✅ NAPRAWA ZAKOŃCZONA!");
  console.log(`  📝 Naprawiono: ${naprawione} zadań`);
  console.log(`  ⏭️  Pominięto:  ${pominięte} zadań`);
  console.log("═══════════════════════════════════════════════════════\n");
}

napraw().catch((err) => {
  console.error("❌ Nieoczekiwany błąd:", err);
  process.exit(1);
});
