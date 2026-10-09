const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://provcuuqsxaehisqrkma.supabase.co';
const supabaseKey = 'sb_publishable_loG2mHyIJ_AmNRmo9hWeAQ_if8Doa66';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from('tasks')
    .select('id, title, desc, pDate, t')
    .ilike('title', '%siatkówka%');
  
  if (error) {
    console.error(error);
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
}
run();
