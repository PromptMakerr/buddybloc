// Supabase Configuration
const SUPABASE_URL = 'https://gkufijlsdntmnqjylgue.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrdWZpamxzZG50bW5xanlsZ3VlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwMDc1MzQsImV4cCI6MjA3OTU4MzUzNH0.2keOpgSGHTlHY7SkIpdvWqTV7THEKV1zVd-0eD8_WUo';

// Initialize Supabase client
// Check if supabase is available (loaded via CDN)
if (typeof window.supabase !== 'undefined') {
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase initialized');
} else {
    console.error('❌ Supabase SDK not loaded! Make sure to include the CDN script.');
}
