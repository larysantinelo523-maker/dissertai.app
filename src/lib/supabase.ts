import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://qchhvtpfrzaorhtndgiz.supabase.co';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable__GprElIPNV29rULQJ4A_EA_R-V7900F';
export const SUPABASE_SERVICE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY as string;

// Cliente normal para as funções que não precisam de bypass
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── Device ID (anônimo, persistido em localStorage) ──────────────────────────
const DEVICE_ID_KEY = 'disserta-device-id';

export function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}
