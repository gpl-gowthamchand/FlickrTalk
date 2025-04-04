
// This file is a typed wrapper for the automatically generated supabase client
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const SUPABASE_URL = "https://dpcyxgkxqkknrdycfpxc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwY3l4Z2t4cWtrbnJkeWNmcHhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MDcxMTAsImV4cCI6MjA1ODk4MzExMH0.kX3U0QaTrFMoWka_ulliP4TNb--PynLD4XrVO1s4_Ek";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
