# 📚 Lista Zależności i Bibliotek Projektu

Poniżej znajduje się lista wszystkich zewnętrznych bibliotek używanych w projekcie (zgodnie z listą z `package.json`), podzielona na kategorie wraz z opisem ich przeznaczenia. Jest to istotny element inwentaryzacji oprogramowania (zgodnie z **OWASP A03:2025**).

## 1. Zależności Główne (Produkcyjne)

Te biblioteki są włączane do ostatecznej, zbudowanej wersji aplikacji i uruchamiane w przeglądarce użytkownika.

| Biblioteka | Wersja | Przeznaczenie |
|------------|--------|---------------|
| **`react`** | `^19.2.4` | Główny framework frontendowy do budowania interfejsu użytkownika (UI). |
| **`react-dom`** | `^19.2.4` | Pakiet Reacta służący do renderowania komponentów w strukturze DOM przeglądarki. |
| **`@supabase/supabase-js`** | `^2.105.1` | Oficjalny klient (SDK) do komunikacji z bazą danych, uwierzytelnianiem i innymi usługami Supabase. |
| **`lucide-react`** | `^1.7.0` | Zestaw minimalistycznych, estetycznych i dostępnych ikon w formie komponentów React. |
| **`dotenv`** | `^17.4.2` | Ładowanie zmiennych środowiskowych z plików `.env` (w tym projekcie obsługiwane natywnie także przez Vite). |
| **`web-vitals`** | `^2.1.4` | Biblioteka do pomiaru wskaźników Core Web Vitals (np. LCP, FID, CLS) wpływających na wydajność i SEO. |

---

## 2. Zależności Deweloperskie (DevDependencies)

Zestaw narzędzi wykorzystywanych wyłącznie podczas pisania kodu oraz budowania aplikacji. Nie są one częścią wynikowego pakietu, który jest wysyłany do klienta.

### Narzędzia Budowania (Build Tools)

| Biblioteka | Wersja | Przeznaczenie |
|------------|--------|---------------|
| **`vite`** | `^8.0.10` | Błyskawiczny serwer deweloperski oraz narzędzie budujące (bundler) nowej generacji. |
| **`@vitejs/plugin-react`** | `^6.0.1` | Oficjalny plugin integrujący Reacta z mechanizmami Vite (m.in. Fast Refresh). |

### Stylowanie (CSS)

| Biblioteka | Wersja | Przeznaczenie |
|------------|--------|---------------|
| **`tailwindcss`** | `^4.2.4` | Framework CSS typu "utility-first", służący do szybkiego tworzenia nowoczesnego i responsywnego designu bez pisania własnego CSS. |
| **`postcss`** | `^8.5.12` | Narzędzie do transformacji kodu CSS za pomocą pluginów JavaScript (wymagane m.in. przez TailwindCSS i Autoprefixer). |
| **`@tailwindcss/postcss`** | `^4.2.4` | Wtyczka łącząca ekosystem TailwindCSS v4 z narzędziem PostCSS. |
| **`autoprefixer`** | `^10.5.0` | Wtyczka PostCSS, która automatycznie dodaje przedrostki producentów przeglądarek (vendor prefixes) do reguł CSS. |

---

## 3. Zależności Testowe

Biblioteki służące do pisania i uruchamiania testów automatycznych, weryfikujące poprawność działania komponentów.

| Biblioteka | Wersja | Przeznaczenie |
|------------|--------|---------------|
| **`@testing-library/react`** | `^16.3.2` | Narzędzia ułatwiające testowanie komponentów Reacta z perspektywy interakcji użytkownika. |
| **`@testing-library/dom`** | `^10.4.1` | Podstawowe metody przeszukiwania struktury DOM (używane przez `testing-library/react`). |
| **`@testing-library/jest-dom`** | `^6.9.1` | Rozszerzenie asercji dla środowiska Jest, ułatwiające sprawdzanie m.in. czy element jest w dokumencie lub czy ma określone style. |
| **`@testing-library/user-event`** | `^13.5.0` | Symulacja interakcji użytkownika z przeglądarką (klikanie, pisanie) w testach, zbliżona do realnego zachowania. |

> **Uwaga (A03:2025):** Ze względu na potencjalne ryzyko ataków na łańcuch dostaw, zawsze używaj komendy `npm run audit:check` (lub `npm audit`), aby upewnić się, że żadna z powyższych bibliotek lub ich ukrytych zależności (transitive dependencies) nie posiada zgłoszonych, otwartych luk bezpieczeństwa. Zestawienie wszystkich zależności w formacie JSON można wygenerować poleceniem `npm run sbom:generate`.
