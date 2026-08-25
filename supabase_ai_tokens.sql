-- ==============================================================================
-- MIGRACJA: UPROSZCZONY SYSTEM TOKENÓW / MONET AI
-- ==============================================================================

-- 1. Aktualny bilans użytkownika
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS ai_tokens INTEGER NOT NULL DEFAULT 10;

-- 2. Całkowita liczba wydanych tokenów (statystyka)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS ai_tokens_spent INTEGER NOT NULL DEFAULT 0;

-- 3. Całkowita liczba uzyskanych tokenów (statystyka)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS ai_tokens_gained INTEGER NOT NULL DEFAULT 10;

-- 4. Uzupełnienie danych dla istniejących już użytkowników, którzy mają NULL
UPDATE profiles 
SET ai_tokens = 10, ai_tokens_spent = 0, ai_tokens_gained = 10
WHERE ai_tokens IS NULL;

-- 5. Opcjonalnie: usunięcie starej funkcji blokującej (jeśli została wcześniej utworzona)
DROP FUNCTION IF EXISTS spend_user_tokens(text, integer);
