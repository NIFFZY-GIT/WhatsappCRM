import { NextResponse } from 'next/server';
import { testWhatsAppConnection } from '@/lib/whatsapp';
import { testGeminiConnection } from '@/lib/gemini';

export async function GET() {
  const [whatsappResult, geminiResult] = await Promise.all([
    testWhatsAppConnection(),
    testGeminiConnection(),
  ]);

  return NextResponse.json({
    whatsapp: whatsappResult,
    gemini: geminiResult,
    timestamp: new Date().toISOString(),
  });
}
