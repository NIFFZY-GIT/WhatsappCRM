import { NextRequest, NextResponse } from 'next/server';
import { getSettings, updateSettings } from '@/lib/store';
import { getWhatsAppConfig } from '@/lib/whatsapp';
import { getGeminiApiKey } from '@/lib/gemini';
import { isSupabaseConfigured } from '@/lib/supabase';

export async function GET() {
  const settings = await getSettings();
  const waConfig = getWhatsAppConfig();
  const geminiKey = getGeminiApiKey();

  return NextResponse.json({
    settings,
    database: {
      type: isSupabaseConfigured() ? 'supabase' : 'local_file',
      connected: isSupabaseConfigured(),
    },
    envStatus: {
      hasWhatsAppToken: Boolean(waConfig.token),
      hasPhoneNumberId: Boolean(waConfig.phoneNumberId),
      hasWabaId: Boolean(waConfig.wabaId),
      hasGeminiKey: Boolean(geminiKey),
      hasSupabase: isSupabaseConfigured(),
      verifyToken: waConfig.verifyToken,
      phoneNumberId: waConfig.phoneNumberId ? `${waConfig.phoneNumberId.slice(0, 4)}...${waConfig.phoneNumberId.slice(-4)}` : null,
      appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = await updateSettings(body);
    return NextResponse.json({ success: true, settings: updated });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
