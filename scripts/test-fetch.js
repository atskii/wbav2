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

async function testFetch() {
  console.log('Testing fetch profiles, tasks, moods without auth...');
  const { data: profiles, error: pErr } = await supabase.from("profiles").select("*");
  const { data: tasks, error: tErr } = await supabase.from("tasks").select("*");
  const { data: moods, error: mErr } = await supabase.from("moods").select("*");
  
  console.log('Profiles:', profiles?.length, pErr);
  console.log('Tasks:', tasks?.length, tErr);
  console.log('Moods:', moods?.length, mErr);
}

testFetch();
