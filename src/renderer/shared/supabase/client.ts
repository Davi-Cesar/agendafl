import { createClient } from '@supabase/supabase-js';

// Tenta obter credenciais da window.electronAPI (injetadas via Preload do Electron) ou do process.env
const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
