# 🔒 Księga Bezpieczeństwa — Wellbeing App

> **Cel dokumentu:** Referencja bezpieczeństwa dla deweloperów i agentów AI audytujących ten projekt.  
> **Standard:** OWASP Top 10 — 2025  
> **Ostatnia aktualizacja:** 2026-07-13  

---

## Spis treści

1. [A01:2025 — Broken Access Control](#a012025--broken-access-control)
   - [Opis zagrożenia](#opis-zagrożenia)
   - [Warianty zagrożeń (CWE)](#warianty-zagrożeń-cwe)
   - [Scenariusze ataków specyficzne dla tego projektu](#scenariusze-ataków-specyficzne-dla-tego-projektu)
   - [Wymagania ochrony — checklist](#wymagania-ochrony--checklist)
2. [Audyt projektu Wellbeing App](#audyt-projektu-wellbeing-app)
   - [Znalezione podatności](#znalezione-podatności)
   - [Zastosowane poprawki](#zastosowane-poprawki)
   - [Rekomendacje do wdrożenia w Supabase Dashboard](#rekomendacje-do-wdrożenia-w-supabase-dashboard)
3. [Instrukcja audytu dla agentów AI](#instrukcja-audytu-dla-agentów-ai)

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

> **Referencje OWASP:**
> - [OWASP Top 10 - A01:2025 Broken Access Control](https://owasp.org/Top10/A01_2025-Broken_Access_Control/)
> - [OWASP Proactive Controls: C1: Implement Access Control](https://owasp.org/www-project-proactive-controls/)
> - [OWASP ASVS: V8 Authorization](https://owasp.org/www-project-application-security-verification-standard/)
> - [OWASP Testing Guide: Authorization Testing](https://owasp.org/www-project-web-security-testing-guide/)
> - [OWASP Cheat Sheet: Authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
