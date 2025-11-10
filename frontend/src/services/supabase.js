import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'YOUR_SUPABASE_URL'; // Replace with your Supabase URL
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'; // Replace with your Supabase Anon Key

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;