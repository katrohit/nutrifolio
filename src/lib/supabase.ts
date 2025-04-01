
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

// These are public API keys, safe to use in client-side code
const supabaseUrl = 'https://wpckzzjlhusvhmckrwen.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwY2t6empsa3Vzdmhtc2tyd2VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MTcwMDUsImV4cCI6MjA1OTA5MzAwNX0.uIsnw6DnFBLDFp_UDB_H2rJYyUge6L8E1KlX30Z6gyg';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
