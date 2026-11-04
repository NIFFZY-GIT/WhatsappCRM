import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { getUserByEmail, getUserById, updateUserSubscription } from '@/lib/store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, isDemo, email, userId } = body;

    const stripe = getStripe();

    // 1. If demo test activation
    if (isDemo || !stripe) {
      const targetUser = userId ? await getUserById(userId) : email ? await getUserByEmail(email) : null;
      if (targetUser) {
        await updateUserSubscription(targetUser.id, 'active', {
          plan: 'WhatsApp CRM & Gemini AI Pro (5,000 LKR/mo)',
          sessionId: sessionId || `demo_sess_${Date.now()}`,
        });
        return NextResponse.json({
          success: true,
          message: 'Subscription successfully activated (Demo / Test Mode)!',
          subscriptionStatus: 'active',
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

      if (customerEmail) {
        await updateUserSubscription(customerEmail, 'active', {
          customerId: stripeCustomerId,
          sessionId: session.id,
          plan: 'WhatsApp CRM & Gemini AI Pro (5,000 LKR/mo)',
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Payment verified! 5,000 LKR Pro Subscription is now active.',
        subscriptionStatus: 'active',
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
