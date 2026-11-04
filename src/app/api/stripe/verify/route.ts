import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { getUserByEmail, getUserById, updateUserSubscription } from '@/lib/store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, isDemo, email, userId, interval = 'monthly' } = body;

    const stripe = getStripe();
    const isAnnual = interval === 'annual';
    const planName = isAnnual
      ? 'WhatsApp CRM & Gemini AI Pro - Annual (4,500 LKR/mo, 54,000 LKR/yr)'
      : 'WhatsApp CRM & Gemini AI Pro - Monthly (5,000 LKR/mo)';

    const expiresAt = new Date(
      Date.now() + (isAnnual ? 365 : 30) * 24 * 60 * 60 * 1000
    ).toISOString();

    // 1. If demo test activation or Stripe not configured
    if (isDemo || !stripe) {
      const targetUser = userId ? await getUserById(userId) : email ? await getUserByEmail(email) : null;
      if (targetUser) {
        await updateUserSubscription(targetUser.id, 'active', {
          plan: planName,
          billingInterval: isAnnual ? 'annual' : 'monthly',
          subscriptionExpiresAt: expiresAt,
          sessionId: sessionId || `demo_sess_${Date.now()}`,
        });
        return NextResponse.json({
          success: true,
          message: `Subscription successfully activated (${isAnnual ? 'Annual 4,500 LKR/mo' : 'Monthly 5,000 LKR/mo'} - Demo / Test Mode)!`,
          subscriptionStatus: 'active',
          plan: planName,
          expiresAt,
        });
      }
      return NextResponse.json({
        success: true,
        message: 'Demo activation processed.',
        subscriptionStatus: 'active',
      });
    }

    // 2. Real Stripe session verification
    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required to verify Stripe payment.' },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid' || session.status === 'complete') {
      const customerEmail = session.customer_details?.email || session.customer_email || email;
      const stripeCustomerId = typeof session.customer === 'string' ? session.customer : undefined;
      const detectedInterval = session.metadata?.billingInterval || interval;
      const sessionIsAnnual = detectedInterval === 'annual';
      const actualPlan = sessionIsAnnual
        ? 'WhatsApp CRM & Gemini AI Pro - Annual (4,500 LKR/mo, 54,000 LKR/yr)'
        : 'WhatsApp CRM & Gemini AI Pro - Monthly (5,000 LKR/mo)';

      const actualExpiresAt = new Date(
        Date.now() + (sessionIsAnnual ? 365 : 30) * 24 * 60 * 60 * 1000
      ).toISOString();

      if (customerEmail) {
        await updateUserSubscription(customerEmail, 'active', {
          customerId: stripeCustomerId,
          sessionId: session.id,
          plan: actualPlan,
          billingInterval: sessionIsAnnual ? 'annual' : 'monthly',
          subscriptionExpiresAt: actualExpiresAt,
        });
      }

      return NextResponse.json({
        success: true,
        message: `Payment verified! ${sessionIsAnnual ? 'Annual (4,500 LKR/mo)' : 'Monthly (5,000 LKR/mo)'} Pro Subscription is now active.`,
        subscriptionStatus: 'active',
        plan: actualPlan,
        expiresAt: actualExpiresAt,
      });
    }

    return NextResponse.json({
      success: false,
      message: `Payment status is ${session.payment_status}`,
      subscriptionStatus: 'inactive',
    });
  } catch (err: any) {
    console.error('Stripe verify error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}
