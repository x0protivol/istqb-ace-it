// Test script to verify Supabase connection
// Run this in your browser console after setting up Supabase

const testSupabaseConnection = async () => {
  try {
    // Test if environment variables are loaded
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    console.log('🔍 Checking environment variables...');
    console.log('URL:', url ? '✅ Set' : '❌ Missing');
    console.log('Key:', key ? '✅ Set' : '❌ Missing');
    
    if (!url || !key) {
      console.error('❌ Environment variables not configured!');
      return;
    }
    
    // Test database connection
    console.log('🔍 Testing database connection...');
    const { data, error } = await supabase
      .from('questions')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error);
      return;
    }
    
    console.log('✅ Database connection successful!');
    
    // Test questions table
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .limit(5);
    
    if (questionsError) {
      console.error('❌ Questions query failed:', questionsError);
      return;
    }
    
    console.log('✅ Questions table working!');
    console.log('📊 Found', questions.length, 'questions');
    
    // Test user stats
    const { data: stats, error: statsError } = await supabase
      .from('user_stats')
      .select('*')
      .limit(1);
    
    if (statsError) {
      console.error('❌ User stats query failed:', statsError);
      return;
    }
    
    console.log('✅ User stats table working!');
    console.log('📊 User stats:', stats[0]);
    
    console.log('🎉 All tests passed! Your Supabase setup is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
testSupabaseConnection(); 