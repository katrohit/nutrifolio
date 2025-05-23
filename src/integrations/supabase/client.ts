
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Using constants for the Supabase URL and key
// These values are client-side public keys, but using constants makes it easier to change them in the future
const SUPABASE_URL = "https://wpckzzjlhusvhmckrwen.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwY2t6empsaHVzdmhtY2tyd2VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MTcwMDUsImV4cCI6MjA1OTA5MzAwNX0.uIsnw6DnFBLDFp_UDB_H2rJYyUge6L8E1KlX30Z6gyg";

// Create a comment explaining these are public keys, not secrets
/**
 * NOTE: These are public, client-side keys that are meant to be exposed in the browser.
 * They only have anon/public permissions as defined by your Supabase project's Row Level Security (RLS).
 * No sensitive operations can be performed using these keys alone.
 */
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'implicit',
  }
});

// Add debug logging to help troubleshoot auth issues
console.log('Supabase client initialized with URL:', SUPABASE_URL);
