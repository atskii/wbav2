const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://provcuuqsxaehisqrkma.supabase.co';
const supabaseKey = 'sb_publishable_loG2mHyIJ_AmNRmo9hWeAQ_if8Doa66';
const supabase = createClient(supabaseUrl, supabaseKey);
async function run() {
  const { data, error } = await supabase.rpc('get_schema_or_something'); // we can't easily get schema with anon key, but we can try to fetch a single task and see its fields
  const { data: t } = await supabase.from('tasks').select('*').limit(1);
  console.log(t);
}
run();
