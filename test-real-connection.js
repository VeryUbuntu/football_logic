const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://bbkgobedbdlqalcnyvnt.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_t8nQvCh5MEy8_za5ZnlYIg_1_yKbyds';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testRealConnection() {
    console.log('Testing real network request...');
    // Try to list rows from 'profiles'. It might be empty but if Key is wrong it will be 401/403.
    const { data, error } = await supabase.from('profiles').select('*').limit(1);

    if (error) {
        console.error('❌ Real request failed:', error.message);
        console.log('Diagnosis: The Key is likely INVALID for Data API access.');
    } else {
        console.log('✅ Real request successful! Data:', data);
        console.log('Diagnosis: The Key IS VALID.');
    }
}

testRealConnection();
