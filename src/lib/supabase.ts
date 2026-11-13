import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_REST_URL ||
  ''
).trim();

const supabaseKey = (
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  ''
).trim();

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseKey && supabaseUrl.startsWith('https://'));
}

export function getSupabaseDetails() {
  return {
    isConfigured: isSupabaseConfigured(),
    url: supabaseUrl ? `${supabaseUrl.slice(0, 18)}...` : null,
    hasKey: Boolean(supabaseKey),
  };
}

let lastFailureTimestamp = 0;
const OFFLINE_COOLDOWN_MS = 60 * 1000; // 60 seconds cooldown before retrying cloud database

export function markSupabaseOffline(reason?: any) {
  lastFailureTimestamp = Date.now();
  if (reason) {
    const msg = reason?.message || reason?.details || JSON.stringify(reason);
    console.warn(`[Cloud Database] Temporary offline circuit-breaker active (cooldown: ${OFFLINE_COOLDOWN_MS / 1000}s). Reason: ${msg}`);
  }
}

export function isSupabaseHealthy(): boolean {
  if (!isSupabaseConfigured()) return false;
  if (Date.now() - lastFailureTimestamp < OFFLINE_COOLDOWN_MS) {
    return false;
  }
  return true;
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured() || !isSupabaseHealthy()) {
    return null;
  }
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
      global: {
        fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
          if (!isSupabaseHealthy()) {
            const err = new Error('Cloud Database is currently unreachable or paused');
            err.name = 'AbortError';
            throw err;
          }
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);
          try {
            const res = await fetch(input, {
              ...init,
              signal: init?.signal || controller.signal,
            });
            return res;
          } catch (err: any) {
            markSupabaseOffline(err);
            const abortErr = new Error(err?.message || 'Cloud Database connection failed');
            abortErr.name = 'AbortError';
            throw abortErr;
          } finally {
            clearTimeout(timeoutId);
          }
        },
      },
    });
  }
  return supabaseInstance;
}
