import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../.env') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testPostgrestCatch() {
  try {
    const q = supabase.from("profiles").select("email, created_at");
    console.log('has catch?', typeof q.catch);
  } catch (err) {
    console.error('Error:', err);
  }
}

testPostgrestCatch();
