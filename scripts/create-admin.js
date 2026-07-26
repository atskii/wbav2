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

async function createAdmin() {
  console.log('Creating admin account...');
  const { data, error } = await supabase.auth.signUp({
    email: 'admin@wba.com',
    password: 'adminadmin',
  });
  
  if (error) {
    console.error('Błąd podczas tworzenia konta:', error.message);
  } else {
    console.log('Konto utworzone pomyślnie!', data.user?.email);
    if (data.session === null && data.user) {
        console.log('UWAGA: Supabase wymaga potwierdzenia email. W środowisku testowym może to być wyłączone.');
    }
  }
}

createAdmin();
