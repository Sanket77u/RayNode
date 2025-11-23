// Test script to verify Supabase connection
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Testing Supabase Connection...\n');

// Check environment variables
console.log('Environment Variables:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_KEY:', process.env.SUPABASE_KEY ? '✅ Set' : '❌ Missing');
console.log('');

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    console.error('❌ Missing Supabase credentials in .env file!');
    process.exit(1);
}

// Create client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Test connection
async function testConnection() {
    try {
        console.log('Testing database connection...');
        
        // Test tournaments table
        const { data: tournaments, error: tournamentsError } = await supabase
            .from('tournaments')
            .select('*')
            .limit(1);
        
        if (tournamentsError) {
            console.error('❌ Tournaments table error:', tournamentsError.message);
            console.error('\nMake sure you ran the SQL schema from supabase-schema.sql');
            return false;
        }
        console.log('✅ Tournaments table accessible');
        
        // Test players table
        const { data: players, error: playersError } = await supabase
            .from('players')
            .select('*')
            .limit(1);
        
        if (playersError) {
            console.error('❌ Players table error:', playersError.message);
            return false;
        }
        console.log('✅ Players table accessible');
        
        // Test tournament_squads table
        const { data: squads, error: squadsError } = await supabase
            .from('tournament_squads')
            .select('*')
            .limit(1);
        
        if (squadsError) {
            console.error('❌ Tournament_squads table error:', squadsError.message);
            return false;
        }
        console.log('✅ Tournament_squads table accessible');
        
        // Test matches table
        const { data: matches, error: matchesError } = await supabase
            .from('matches')
            .select('*')
            .limit(1);
        
        if (matchesError) {
            console.error('❌ Matches table error:', matchesError.message);
            return false;
        }
        console.log('✅ Matches table accessible');
        
        console.log('\n🎉 All database tables are working correctly!');
        console.log('You can now start your bot with: npm start');
        return true;
        
    } catch (error) {
        console.error('❌ Connection test failed:', error.message);
        return false;
    }
}

testConnection().then(() => process.exit(0));
