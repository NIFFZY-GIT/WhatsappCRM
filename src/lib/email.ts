import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.zoho.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '465', 10);
const SMTP_USER = process.env.SMTP_USER || 'no-reply@zevarone.com';
const SMTP_PASS = process.env.SMTP_PASS || 'dnD6QWis1aV7';
const SMTP_FROM = process.env.SMTP_FROM || `ZEVARONE WhatsApp CRM <${SMTP_USER}>`;

export function getTransporter() {
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // true for 465, false for 587
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false, // Prevents self-signed/proxy cert rejection
    },
  });
}

/**
 * Verify Zoho Mail SMTP connection status
 */
export async function verifySmtpConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const transporter = getTransporter();
    await transporter.verify();
    return { success: true, message: `Connected to ${SMTP_HOST}:${SMTP_PORT} as ${SMTP_USER}` };
  } catch (err: any) {
    console.error('SMTP verification failed:', err);
    return { success: false, message: err.message || 'SMTP connection failed' };
  }
}

/**
 * Send raw email
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from: SMTP_FROM,
      to,
      subject,
      text: text || html.replace(/<[^>]+>/g, ''),
      html,
    });

    console.log(`[Email Sent] To: ${to} | Subject: "${subject}" | ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error(`[Email Error] Failed to send email to ${to}:`, err);
    return { success: false, error: err.message || 'Failed to send email' };
  }
}

/**
 * Template: Welcome & Workspace Setup Email
 */
export async function sendWelcomeEmail({
  to,
  name,
  businessName,
  loginUrl = 'https://crm.zevarone.com/login',
}: {
  to: string;
  name: string;
  businessName: string;
  loginUrl?: string;
}) {
  const subject = `Welcome to ZEVARONE WhatsApp CRM — ${businessName} Workspace Created!`;
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F0F2F5; margin: 0; padding: 40px 20px; color: #111B21;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #E9EDEF; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    
    <!-- Header -->
    <div style="background-color: #111B21; padding: 32px 36px; border-bottom: 3px solid #00A884;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td>
            <div style="display: inline-block; background-color: #008069; color: #ffffff; width: 36px; height: 36px; line-height: 36px; text-align: center; font-weight: bold; font-size: 18px; border-radius: 8px;">W</div>
            <span style="font-size: 18px; font-weight: bold; color: #ffffff; margin-left: 10px; vertical-align: middle; letter-spacing: -0.5px;">ZEVARONE</span>
            <span style="font-size: 11px; background: #202C33; color: #25D366; font-weight: bold; padding: 2px 8px; border-radius: 4px; margin-left: 6px; vertical-align: middle;">AI CRM</span>
          </td>
        </tr>
      </table>
      <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 24px 0 6px 0; letter-spacing: -0.5px;">Welcome to Your WhatsApp AI Workspace!</h1>
      <p style="color: #AEBAC1; font-size: 13px; margin: 0;">Your dedicated customer communication hub is ready for ${businessName}.</p>
    </div>

    <!-- Body -->
    <div style="padding: 36px;">
      <p style="font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">Hello <strong>${name}</strong>,</p>
      
      <p style="font-size: 14px; line-height: 1.6; color: #54656F; margin: 0 0 24px 0;">
        Thank you for joining <strong>ZEVARONE WhatsApp Business CRM</strong>. Your dedicated business tenant has been created. You can now connect your Meta WhatsApp phone number, configure your 24/7 Zevarone AI sales concierge, and start converting leads into orders.
      </p>

      <!-- Account Summary Card -->
      <div style="background-color: #F0F2F5; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #E9EDEF;">
        <h3 style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #008069; margin: 0 0 12px 0;">Workspace Credentials</h3>
        <table width="100%" cellpadding="4" cellspacing="0" style="font-size: 13px;">
          <tr>
            <td style="color: #54656F; width: 140px;">Registered Company:</td>
            <td><strong>${businessName}</strong></td>
          </tr>
          <tr>
            <td style="color: #54656F;">Login Email:</td>
            <td><strong>${to}</strong></td>
          </tr>
          <tr>
            <td style="color: #54656F;">Platform Engine:</td>
            <td>Zevarone Neural Core v2.5 + Meta Cloud API</td>
          </tr>
          <tr>
            <td style="color: #54656F;">Next Step:</td>
            <td><span style="color: #008069; font-weight: bold;">Activate Pro via Stripe (5,000 LKR/mo)</span></td>
          </tr>
        </table>
      </div>

      <!-- Call to Action -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${loginUrl}" style="background-color: #008069; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-size: 14px; font-weight: bold; display: inline-block; box-shadow: 0 2px 6px rgba(0,128,105,0.3);">
          Sign In to Your Workspace &rarr;
        </a>
      </div>

      <!-- Feature Checklist -->
      <div style="border-top: 1px solid #E9EDEF; padding-top: 24px; margin-top: 24px;">
        <p style="font-size: 12px; font-weight: bold; text-transform: uppercase; color: #54656F; margin: 0 0 12px 0;">What you can do right now:</p>
        <ul style="font-size: 13px; color: #54656F; padding-left: 20px; line-height: 1.8; margin: 0;">
          <li>Upload your custom lookbook images for <strong>Welcome Media Sequences</strong></li>
          <li>Set up your custom <strong>Zevarone AI Prompts</strong> and catalog prices</li>
          <li>Manage team members inside the <strong>Shared Real-Time Inbox</strong></li>
          <li>Send mass promotional announcements via <strong>Broadcast Messenger</strong></li>
        </ul>
      </div>

      <p style="font-size: 13px; color: #54656F; margin: 28px 0 0 0; line-height: 1.6;">
        If you have any questions or require custom setup assistance, simply reply directly to this email or reach us at <a href="mailto:support@zevarone.com" style="color: #008069; text-decoration: none;">support@zevarone.com</a>.
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #FAFBFB; border-top: 1px solid #E9EDEF; padding: 24px 36px; text-align: center; font-size: 12px; color: #8696A0;">
      <p style="margin: 0 0 6px 0;">© 2026 ZEVARONE Group. All rights reserved.</p>
      <p style="margin: 0;">POWERED BY ZEVARONE CLOUD INFRASTRUCTURE</p>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({ to, subject, html });
}

/**
 * Template: Stripe Payment Receipt & Subscription Activation Email
 */
export async function sendPaymentReceiptEmail({
  to,
  name,
  businessName,
  amountLkr = 5000,
  interval = 'monthly',
  planName = 'WhatsApp CRM & Zevarone AI Pro',
  sessionId,
}: {
  to: string;
  name: string;
  businessName: string;
  amountLkr?: number;
  interval?: 'monthly' | 'annual';
  planName?: string;
  sessionId?: string;
}) {
  const isAnnual = interval === 'annual';
  const subject = `Payment Confirmed — Your ${isAnnual ? 'Annual' : 'Monthly'} Pro Subscription is Active!`;
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F0F2F5; margin: 0; padding: 40px 20px; color: #111B21;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #E9EDEF; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    
    <!-- Header -->
    <div style="background-color: #111B21; padding: 32px 36px; border-bottom: 3px solid #00A884;">
      <div style="display: inline-block; background: #E8F5E9; color: #008069; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 6px; text-transform: uppercase;">Payment Receipt</div>
      <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 16px 0 6px 0; letter-spacing: -0.5px;">Subscription Activated! 🎉</h1>
      <p style="color: #AEBAC1; font-size: 13px; margin: 0;">Thank you for your payment. Your 24/7 AI sales engine is live.</p>
    </div>

    <!-- Body -->
    <div style="padding: 36px;">
      <p style="font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">Hello <strong>${name}</strong>,</p>
      
      <p style="font-size: 14px; line-height: 1.6; color: #54656F; margin: 0 0 24px 0;">
        We have successfully processed your Stripe payment for <strong>${businessName}</strong>. Your account has been upgraded to the <strong>${planName}</strong>.
      </p>

      <!-- Receipt Breakdown -->
      <div style="background-color: #F0F2F5; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #E9EDEF;">
        <h3 style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #008069; margin: 0 0 12px 0;">Transaction Details</h3>
        <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 13px; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #E9EDEF;">
            <td style="color: #54656F;">Plan:</td>
            <td><strong>${planName}</strong></td>
          </tr>
          <tr style="border-bottom: 1px solid #E9EDEF;">
            <td style="color: #54656F;">Billing Cycle:</td>
            <td><strong>${isAnnual ? 'Annual (4,500 LKR/mo - 10% Discount)' : 'Monthly Recurring'}</strong></td>
          </tr>
          <tr style="border-bottom: 1px solid #E9EDEF;">
            <td style="color: #54656F;">Amount Paid:</td>
            <td><strong style="color: #008069; font-size: 16px;">${amountLkr.toLocaleString()} LKR</strong></td>
          </tr>
          <tr style="border-bottom: 1px solid #E9EDEF;">
            <td style="color: #54656F;">Payment Gateway:</td>
            <td>Stripe Verified Payment</td>
          </tr>
          ${sessionId ? `
          <tr>
            <td style="color: #54656F;">Transaction Reference:</td>
            <td style="font-family: monospace; font-size: 11px; color: #667781;">${sessionId}</td>
          </tr>` : ''}
        </table>
      </div>

      <!-- Action -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="https://crm.zevarone.com/inbox" style="background-color: #008069; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-size: 14px; font-weight: bold; display: inline-block;">
          Launch Live Shared Inbox &rarr;
        </a>
      </div>

      <p style="font-size: 13px; color: #54656F; margin: 24px 0 0 0; line-height: 1.6;">
        You can manage your subscription, download tax invoices, or update your payment card anytime from your <a href="https://crm.zevarone.com/billing" style="color: #008069; font-weight: bold; text-decoration: none;">Billing Dashboard</a>.
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #FAFBFB; border-top: 1px solid #E9EDEF; padding: 24px 36px; text-align: center; font-size: 12px; color: #8696A0;">
      <p style="margin: 0 0 6px 0;">© 2026 ZEVARONE Group. All rights reserved.</p>
      <p style="margin: 0;">POWERED BY ZEVARONE CLOUD INFRASTRUCTURE</p>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({ to, subject, html });
}

/**
 * Template: Immediate Alert when a WhatsApp Customer Requests Human Assistance
 */
export async function sendHumanSupportAlertEmail({
  to,
  businessName,
  customerName,
  customerPhone,
  lastMessage,
}: {
  to: string;
  businessName: string;
  customerName: string;
  customerPhone: string;
  lastMessage?: string;
}) {
  const subject = `⚠️ Urgent: Human Assistance Requested by ${customerName} (+${customerPhone})`;
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F0F2F5; margin: 0; padding: 40px 20px; color: #111B21;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #E9EDEF;">
    <div style="background-color: #D9381E; padding: 24px 32px; color: #ffffff;">
      <h2 style="margin: 0; font-size: 20px; font-weight: bold;">⚠️ Human Sales Agent Requested!</h2>
      <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Customer needs live support for ${businessName}.</p>
    </div>
    <div style="padding: 32px;">
      <p style="font-size: 14px; margin: 0 0 16px 0;">A customer on WhatsApp has requested human intervention or asked a complex question that requires an agent:</p>
      
      <div style="background: #F0F2F5; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
        <p style="margin: 0 0 6px 0; font-size: 13px;"><strong>Customer:</strong> ${customerName}</p>
        <p style="margin: 0 0 6px 0; font-size: 13px;"><strong>Phone:</strong> +${customerPhone}</p>
        ${lastMessage ? `<p style="margin: 8px 0 0 0; font-size: 13px; color: #54656F; font-style: italic;">"${lastMessage}"</p>` : ''}
      </div>

      <div style="text-align: center;">
        <a href="https://crm.zevarone.com/inbox" style="background-color: #111B21; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 13px; font-weight: bold; display: inline-block;">
          Take Over Chat in Shared Inbox &rarr;
        </a>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({ to, subject, html });
}


/**
 * Template: Email Verification Code (OTP) for Account Registration
 */
export async function sendVerificationCodeEmail({
  to,
  code,
  name,
}: {
  to: string;
  code: string;
  name?: string;
}) {
  const subject = `Your ZEVARONE Verification Code: ${code}`;
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F0F2F5; margin: 0; padding: 40px 20px; color: #111B21;">
  <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #E9EDEF; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    
    <!-- Header -->
    <div style="background-color: #111B21; padding: 32px 36px; border-bottom: 3px solid #00A884; text-align: center;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="center">
            <div style="display: inline-block; background-color: #008069; color: #ffffff; width: 36px; height: 36px; line-height: 36px; text-align: center; font-weight: bold; font-size: 18px; border-radius: 8px;">W</div>
            <span style="font-size: 18px; font-weight: bold; color: #ffffff; margin-left: 10px; vertical-align: middle; letter-spacing: -0.5px;">ZEVARONE</span>
            <span style="font-size: 11px; background: #202C33; color: #25D366; font-weight: bold; padding: 2px 8px; border-radius: 4px; margin-left: 6px; vertical-align: middle;">AI CRM</span>
          </td>
        </tr>
      </table>
      <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin: 20px 0 4px 0; letter-spacing: -0.5px;">Verify Your Work Email</h1>
      <p style="color: #AEBAC1; font-size: 13px; margin: 0;">Confirm your email to activate your WhatsApp AI workspace</p>
    </div>

    <!-- Body -->
    <div style="padding: 36px 32px; text-align: center;">
      <p style="font-size: 15px; line-height: 1.6; color: #111B21; margin: 0 0 16px 0;">
        ${name ? `Hello <strong>${name}</strong>,` : 'Hello,'}
      </p>
      
      <p style="font-size: 14px; line-height: 1.6; color: #54656F; margin: 0 0 28px 0;">
        Please enter the verification code below on the signup page to confirm your email and create your business workspace:
      </p>

      <!-- OTP Code Box -->
      <div style="background: #F0F2F5; border-radius: 12px; padding: 20px 16px; margin: 0 auto 28px auto; max-width: 340px; border: 1px solid #E9EDEF; letter-spacing: 12px; font-size: 36px; font-weight: 800; color: #008069; font-family: monospace; text-align: center;">
        ${code}
      </div>

      <div style="background: #FAFBFB; border-radius: 10px; padding: 14px 18px; margin-bottom: 24px; border: 1px solid #E9EDEF; text-align: left; font-size: 12px; color: #667781; line-height: 1.6;">
        <div>⏱️ This verification code is valid for <strong>10 minutes</strong>.</div>
        <div>🔒 For security reasons, never share this code with anyone.</div>
      </div>

      <p style="font-size: 12px; color: #8696A0; margin: 0;">
        If you did not initiate this request, you can safely disregard this email.
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #FAFBFB; border-top: 1px solid #E9EDEF; padding: 20px 32px; text-align: center; font-size: 12px; color: #8696A0;">
      <p style="margin: 0 0 4px 0;">© 2026 ZEVARONE Group. All rights reserved.</p>
      <p style="margin: 0;">POWERED BY ZEVARONE CLOUD INFRASTRUCTURE</p>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({ to, subject, html });
}
