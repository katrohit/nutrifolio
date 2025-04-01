
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

// These environment variables are public and safe to expose
const supabaseUrl = 'https://placeholder-project-url.supabase.co';
const supabaseAnonKey = 'placeholder-anon-key';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
