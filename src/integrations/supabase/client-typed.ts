
// This file is a typed wrapper for the automatically generated supabase client
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const SUPABASE_URL = "https://hgisakurzmekpejenzzj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnaXNha3Vyem1la3BlamVuenpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1OTIwNzksImV4cCI6MjA1OTE2ODA3OX0.NNuHIVMHny1YE7DLskdJZc3u9LEuhTBc9onW_7e9OsA";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
