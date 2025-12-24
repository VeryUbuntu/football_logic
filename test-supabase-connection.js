const { createClient } = require('@supabase/supabase-js');

// Load env vars manually for this script since it's running outside Next.js context
const SUPABASE_URL = 'https://bbkgobedbdlqalcnyvnt.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_t8nQvCh5MEy8_za5ZnlYIg_1_yKbyds';

console.log('Testing Supabase connection...');
console.log('URL:', SUPABASE_URL);
console.log('Key:', SUPABASE_ANON_KEY);

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
    try {
        // Try to get public config or just a simple health check query
        // Accessing auth.getSession is a good passive check
        const { data, error } = await supabase.auth.getSession();

        if (error) {
            console.error('❌ Connection failed with error:', error.message);
            console.error('Full error:', error);
            if (error.message.includes('apikey') || error.status === 401) {
                console.log('\n⚠️ DIAGNOSIS: The API Key appears to be invalid or unauthorized.');
                console.log('Standard Supabase Anon Keys typically serve with "eyJ..." (JWT format).');
                console.log('The key provided ("sb_publishable...") looks like a different type of key.');
            }
        } else {
            console.log('✅ Connection successful! Session retrieval attempted (result null is expected for no user).');
        }

    } catch (err) {
        console.error('❌ Unexpected error:', err.message);
    }
}

testConnection();
