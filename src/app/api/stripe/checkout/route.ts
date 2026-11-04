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

    if (!stripe) {
      return NextResponse.json(
        { success: false, error: 'Stripe gateway is not configured. STRIPE_SECRET_KEY is missing.' },
        { status: 500 }
      );
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
