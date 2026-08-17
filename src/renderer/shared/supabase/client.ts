import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { ElectronAPI } from '../../../main/preload';

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

let clientInstance: SupabaseClient | null = null;

export async function getSupabaseClient(): Promise<SupabaseClient> {
  if (clientInstance) return clientInstance;

  const env = await window.electronAPI.getEnv();

  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    throw new Error('Variáveis SUPABASE_URL e SUPABASE_ANON_KEY não encontradas no .env');
  }

  clientInstance = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
  return clientInstance;
}
