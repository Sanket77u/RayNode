const { createClient } = require('@supabase/supabase-js');
const config = require('../config');

if (!config.supabase.url || !config.supabase.key) {
    console.error('❌ Supabase credentials not found in .env file!');
    console.error('Please set SUPABASE_URL and SUPABASE_KEY in your .env file');
    process.exit(1);
}

const supabase = createClient(config.supabase.url, config.supabase.key);

// Test connection
supabase.from('tournaments').select('count', { count: 'exact', head: true })
    .then(({ error }) => {
        if (error) {
            console.error('❌ Supabase connection failed:', error.message);
            console.error('Please check your credentials and database schema');
        } else {
            console.log('✅ Supabase connected successfully');
        }
    });

module.exports = supabase;
