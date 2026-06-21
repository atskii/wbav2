/**
 * ═══════════════════════════════════════════════════════════════════
 *  SKRYPT NAPRAWCZY: Usunięcie emoji cykliczności z pola `t`
 * ═══════════════════════════════════════════════════════════════════
 *
 *  Problem: Oryginalne zadania cykliczne mają recurrence='jednorazowo'
 *  ale ich pole `t` wciąż zawiera stringi typu:
 *    "🔒 07:30 (10.06.2026) 🔁 w dni robocze"
 *    "🔒 10:00 (12.06.2026) 🔁 co tydzień pt"
 *    "🔒 15:14 (22.06.2026) 🔁 codziennie 🛑 do 2026-08-23"
 *
 *  Funkcja checkIsDate() parsuje ten string i matchuje zadanie
 *  na KAŻDY dzień tygodnia, powodując duplikaty w widoku.
 *
 *  Rozwiązanie: Usunąć fragmenty 🔁 ... i 🛑 ... z pola `t`
 *  dla zadań oznaczonych jako 'jednorazowo'.
 *
 *  Uruchamianie:
 *    node scripts/fix-t-strings.js
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

// ─── Wyczyść pole `t` z fragmentów cykliczności ─────────────────
function wyczyscT(tStr) {
  if (!tStr) return tStr;

  // Usuń "🔁 ..." (cały fragment od 🔁 do końca lub do 🛑)
  let result = tStr;
  // Usuń 🛑 do YYYY-MM-DD (lub 🛑 do ...)
  result = result.replace(/\s*🛑\s*do\s*\S+/g, '');
  // Usuń 🔁 i cokolwiek po nim (codziennie, co tydzień X, w dni robocze)
  result = result.replace(/\s*🔁\s*.*/g, '');

  return result.trim();
}

// ═══════════════════════════════════════════════════════════════════
async function napraw() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  🧹 NAPRAWA: Czyszczenie pola `t` z artefaktów cykliczności");
  console.log("═══════════════════════════════════════════════════════\n");

  // Pobierz zadania jednorazowe, które mają 🔁 w polu t
  const { data: zadania, error } = await supabase
    .from("tasks")
    .select("id, t, title, recurrence")
    .eq("recurrence", "jednorazowo")
    .like("t", "%🔁%");

  if (error) {
    console.error("❌ Błąd pobierania:", error.message);
    process.exit(1);
  }

  if (!zadania || zadania.length === 0) {
    console.log("✅ Brak zadań do naprawy.\n");
    return;
  }

  console.log(`📥 Znaleziono ${zadania.length} zadań z artefaktami cykliczności w polu t.\n`);

  let naprawione = 0;
  for (const z of zadania) {
    const noweT = wyczyscT(z.t);
    console.log(`   #${z.id} ("${z.title}")`);
    console.log(`      PRZED: "${z.t}"`);
    console.log(`      PO:    "${noweT}"`);

    const { error: updateErr } = await supabase
      .from("tasks")
      .update({ t: noweT })
      .eq("id", z.id);

    if (updateErr) {
      console.error(`   ❌ Błąd:`, updateErr.message);
    } else {
      naprawione++;
    }
  }

  console.log("\n═══════════════════════════════════════════════════════");
  console.log(`  ✅ NAPRAWA ZAKOŃCZONA! Naprawiono ${naprawione}/${zadania.length} zadań.`);
  console.log("═══════════════════════════════════════════════════════\n");
}

napraw().catch((err) => {
  console.error("❌ Nieoczekiwany błąd:", err);
  process.exit(1);
});
