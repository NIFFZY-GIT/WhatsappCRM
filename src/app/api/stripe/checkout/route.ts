import { NextRequest, NextResponse } from 'next/server';
import { createStripeCheckoutSession, getStripe } from '@/lib/stripe';
import { getTenant } from '@/lib/store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userEmail, userId, tenantId, customerName, billingInterval = 'monthly' } = body;

    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: 'User email is required for Stripe billing.' },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin || 'https://whatsapp-crm-orpin.vercel.app').replace(/\/$/, '');

    // If STRIPE_SECRET_KEY is not configured yet (mock/demo mode)
    if (!stripe) {
      return NextResponse.json({
        success: true,
        isDemo: true,
        message: 'Stripe API key is not configured in .env yet. Use mock checkout to preview.',
        demoSuccessUrl: `${appUrl}/billing?success=true&demo=true&interval=${billingInterval}&tenantId=${tenantId || 'tenant_zevarone'}`,
      });
    }

    const session = await createStripeCheckoutSession({
      userEmail,
      userId,
      tenantId,
      customerName,
      billingInterval,
      successUrl: `${appUrl}/billing?success=true&session_id={CHECKOUT_SESSION_ID}&interval=${billingInterval}`,
      cancelUrl: `${appUrl}/billing?canceled=true`,
    });

    return NextResponse.json({
      success: true,
      url: session.url,
      sessionId: session.sessionId,
    });
  } catch (err: any) {
    console.error('Stripe checkout error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to initialize Stripe checkout.' },
      { status: 500 }
    );
  }
}
