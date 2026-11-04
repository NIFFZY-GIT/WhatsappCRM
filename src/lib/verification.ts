import fs from 'fs';
import path from 'path';
import { getSupabase } from './supabase';

export interface VerificationRecord {
  email: string;
  code: string;
  expiresAt: number;
  attempts: number;
  lastSentAt: number;
}

const SUPABASE_VERIFICATIONS_STORE_ID = 777;
const memoryStore = new Map<string, VerificationRecord>();

const DATA_DIR = path.join(process.cwd(), '.data');
const VERIF_FILE = path.join(DATA_DIR, 'verifications.json');

function ensureLocalVerifications(): Record<string, VerificationRecord> {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(VERIF_FILE)) {
      fs.writeFileSync(VERIF_FILE, JSON.stringify({}), 'utf-8');
      return {};
    }
    const content = fs.readFileSync(VERIF_FILE, 'utf-8');
    return JSON.parse(content || '{}');
  } catch {
    return {};
  }
}

function saveLocalVerifications(data: Record<string, VerificationRecord>) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(VERIF_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Failed to save local verifications:', err);
  }
}

async function loadVerifications(): Promise<Record<string, VerificationRecord>> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('automated_template')
        .eq('id', SUPABASE_VERIFICATIONS_STORE_ID)
        .maybeSingle();

      if (!error && data?.automated_template) {
        const parsed = JSON.parse(data.automated_template);
        if (typeof parsed === 'object' && parsed !== null) {
          for (const [k, v] of Object.entries(parsed)) {
            memoryStore.set(k.toLowerCase().trim(), v as VerificationRecord);
          }
          saveLocalVerifications(parsed);
          return parsed as Record<string, VerificationRecord>;
        }
      }
    } catch (e) {
      console.warn('Supabase loadVerifications error:', e);
    }
  }

  const local = ensureLocalVerifications();
  for (const [k, v] of Object.entries(local)) {
    memoryStore.set(k.toLowerCase().trim(), v);
  }
  return local;
}

async function persistVerifications(map: Record<string, VerificationRecord>): Promise<void> {
  // 1. Sync memory map
  for (const [k, v] of Object.entries(map)) {
    memoryStore.set(k.toLowerCase().trim(), v);
  }

  // 2. Local fallback
  saveLocalVerifications(map);

  // 3. Supabase Cloud for cross-serverless synchronization
  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('settings').upsert({
        id: SUPABASE_VERIFICATIONS_STORE_ID,
        business_name: 'ZEVARONE_VERIFICATIONS_STORE',
        automated_template: JSON.stringify(map),
        gemini_system_prompt: 'ZEVARONE_VERIFICATIONS_STORE',
        gemini_model: 'v1',
        auto_reply_enabled: true,
        default_mode: 'ai_chatbot',
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Supabase persistVerifications error:', e);
    }
  }
}

/**
 * Save an OTP code for an email with a 10-minute expiry and 45s resend throttle
 */
export async function saveVerificationCode(
  email: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  const cleanEmail = email.toLowerCase().trim();
  const all = await loadVerifications();

  const existing = all[cleanEmail];
  const now = Date.now();

  // Rate-limiting: must wait 45 seconds before requesting a new OTP
  if (existing && now - existing.lastSentAt < 45 * 1000) {
    const waitSec = Math.ceil((45 * 1000 - (now - existing.lastSentAt)) / 1000);
    return {
      success: false,
      error: `Please wait ${waitSec} second${waitSec === 1 ? '' : 's'} before requesting a new code.`,
    };
  }

  // Clean up any stale records older than 1 hour
  for (const [key, item] of Object.entries(all)) {
    if (now > item.expiresAt + 60 * 60 * 1000) {
      delete all[key];
    }
  }

  all[cleanEmail] = {
    email: cleanEmail,
    code: code.trim(),
    expiresAt: now + 10 * 60 * 1000, // 10 minutes valid
    attempts: 0,
    lastSentAt: now,
  };

  await persistVerifications(all);
  return { success: true };
}

/**
 * Verify OTP code against email record
 */
export async function verifyCode(
  email: string,
  inputCode: string
): Promise<{ valid: boolean; reason?: string }> {
  const cleanEmail = email.toLowerCase().trim();
  const cleanCode = (inputCode || '').trim();

  if (!cleanCode) {
    return { valid: false, reason: 'Please enter the 6-digit verification code.' };
  }

  const all = await loadVerifications();
  const record = all[cleanEmail];

  if (!record) {
    return {
      valid: false,
      reason: 'No verification code found for this email. Please click Resend Code.',
    };
  }

  const now = Date.now();
  if (now > record.expiresAt) {
    delete all[cleanEmail];
    await persistVerifications(all);
    return {
      valid: false,
      reason: 'Verification code has expired. Please click Resend Code.',
    };
  }

  if (record.attempts >= 5) {
    delete all[cleanEmail];
    await persistVerifications(all);
    return {
      valid: false,
      reason: 'Too many incorrect attempts. Please request a new verification code.',
    };
  }

  if (record.code !== cleanCode) {
    record.attempts += 1;
    all[cleanEmail] = record;
    await persistVerifications(all);
    const remaining = 5 - record.attempts;
    return {
      valid: false,
      reason: `Incorrect code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
    };
  }

  // Code is verified! Remove it to prevent replay attacks
  delete all[cleanEmail];
  await persistVerifications(all);

  return { valid: true };
}
