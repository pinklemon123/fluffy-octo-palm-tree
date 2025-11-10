import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'YOUR_SUPABASE_URL'; // Replace with your Supabase URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'; // Replace with your Supabase Anon Key

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;