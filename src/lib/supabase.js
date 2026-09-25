import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL?.trim?.() || '';
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY?.trim?.() || '';
const hasValidUrl = /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(supabaseUrl);

export const isSupabaseConfigured = Boolean(hasValidUrl && supabaseAnonKey);

let client = null;
if (isSupabaseConfigured) {
  try {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      realtime: { params: { eventsPerSecond: 5 } },
    });
  } catch (error) {
    console.warn('Juvia Pass: Supabase could not be initialized.', error);
  }
}

export const supabase = client;
