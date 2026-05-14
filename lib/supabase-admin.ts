import { createClient } from '@supabase/supabase-js';

// Server-side only — uses service role key
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
);
