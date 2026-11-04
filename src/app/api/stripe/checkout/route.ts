import { NextRequest, NextResponse } from 'next/server';
import { createStripeCheckoutSession, getStripe } from '@/lib/stripe';
import { getUserByEmail, getUserById } from '@/lib/store';
import { getSessionUser } from '@/lib/auth-server';

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser(req);
    const body = await req.json();
    const { userEmail, userId, tenantId, customerName, billingInterval = 'monthly' } = body;

    const email = userEmail || sessionUser?.email;
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'User email is required for Stripe billing.' },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin || 'https://crm.zevarone.com').replace(/\/$/, '');

    if (!stripe) {
      return NextResponse.json(
        { success: false, error: 'Stripe gateway is not configured. STRIPE_SECRET_KEY is missing.' },
        { status: 500 }
      );
    }

    const user = sessionUser || (await getUserByEmail(email));
    const customerId = user?.stripeCustomerId;

    const session = await createStripeCheckoutSession({
      userEmail: email,
      userId: user?.id || userId,
      tenantId: user?.tenantId || tenantId,
      customerName: user?.name || customerName,
      customerId,
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
