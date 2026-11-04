import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/store';
import { saveVerificationCode } from '@/lib/verification';
import { sendVerificationCodeEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, businessName } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email format (e.g. you@company.com).' },
        { status: 400 }
      );
    }

    // 1. Ensure user is not already registered
    const existing = await getUserByEmail(cleanEmail);
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: 'An account with this email already exists. Please switch to Sign In.',
        },
        { status: 400 }
      );
    }

    // 2. Generate random 6-digit numeric OTP code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 3. Save OTP with throttle check
    const saveRes = await saveVerificationCode(cleanEmail, code);
    if (!saveRes.success) {
      return NextResponse.json(
        { success: false, error: saveRes.error || 'Please wait before requesting another code.' },
        { status: 429 }
      );
    }

    // 4. Send email via Zoho Mail SMTP
    const emailRes = await sendVerificationCodeEmail({
      to: cleanEmail,
      code,
      name: name?.trim() || businessName?.trim() || undefined,
    });

    if (!emailRes.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unable to deliver verification code to this email. Please check the spelling or try again later.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been dispatched to ${cleanEmail}.`,
    });
  } catch (err: any) {
    console.error('Error in send-verification route:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to process verification request.' },
      { status: 500 }
    );
  }
}
