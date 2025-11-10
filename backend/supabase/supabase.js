// Backend Supabase configuration
// This is for server-side operations if needed

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseServiceKey = 'YOUR_SUPABASE_SERVICE_KEY'; // Use service key for backend

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default supabase;