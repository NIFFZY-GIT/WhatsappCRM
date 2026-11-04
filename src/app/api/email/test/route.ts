import { NextRequest, NextResponse } from 'next/server';
import { verifySmtpConnection, sendEmail, sendWelcomeEmail } from '@/lib/email';

export async function GET(req: NextRequest) {
  try {
    const status = await verifySmtpConnection();
    return NextResponse.json({
      success: status.success,
      message: status.message,
      smtp: {
        host: process.env.SMTP_HOST || 'smtp.zoho.com',
        port: process.env.SMTP_PORT || '465',
        user: process.env.SMTP_USER || 'no-reply@zevarone.com',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to = 'no-reply@zevarone.com', name = 'Test User', type = 'test' } = body;

    if (type === 'welcome') {
      const result = await sendWelcomeEmail({
        to,
        name,
        businessName: 'Zevarone Enterprise',
      });
      return NextResponse.json(result);
    }

    const result = await sendEmail({
      to,
      subject: '✅ ZEVARONE Zoho SMTP Email Service Test',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px; background: #FAFBFB; color: #111B21;">
          <h2 style="color: #008069;">Zoho SMTP Email Test Successful!</h2>
          <p>This email confirms that your <strong>no-reply@zevarone.com</strong> SMTP configuration on <strong>smtp.zoho.com:465</strong> is working perfectly.</p>
          <hr style="border: 0; border-top: 1px solid #E9EDEF; margin: 20px 0;" />
          <p style="font-size: 12px; color: #667781;">Timestamp: ${new Date().toISOString()}</p>
        </div>
      `,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
