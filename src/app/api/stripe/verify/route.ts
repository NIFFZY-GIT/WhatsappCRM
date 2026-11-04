import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { getUserByEmail, getUserById, updateUserSubscription } from '@/lib/store';
import { sendPaymentReceiptEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, email, userId, interval = 'monthly' } = body;

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json(
        { success: false, error: 'Stripe gateway is not configured.' },
        { status: 500 }
      );
    }

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
      const stripeSubscriptionId = typeof session.subscription === 'string' ? session.subscription : undefined;
      const detectedInterval = session.metadata?.billingInterval || interval;
      const sessionIsAnnual = detectedInterval === 'annual';
      const actualPlan = sessionIsAnnual
        ? 'WhatsApp CRM & Gemini AI Pro - Annual (4,500 LKR/mo, 54,000 LKR/yr)'
        : 'WhatsApp CRM & Gemini AI Pro - Monthly (5,000 LKR/mo)';

      const actualExpiresAt = new Date(
        Date.now() + (sessionIsAnnual ? 365 : 30) * 24 * 60 * 60 * 1000
      ).toISOString();

      if (customerEmail) {
        const updated = await updateUserSubscription(customerEmail, 'active', {
          customerId: stripeCustomerId,
          subscriptionId: stripeSubscriptionId,
          sessionId: session.id,
          plan: actualPlan,
          billingInterval: sessionIsAnnual ? 'annual' : 'monthly',
          subscriptionExpiresAt: actualExpiresAt,
          cancelAtPeriodEnd: false,
        });

        // Send payment confirmation email via Zoho SMTP
        sendPaymentReceiptEmail({
          to: customerEmail,
          name: updated?.name || 'Valued Business Partner',
          businessName: updated?.businessName || 'Your Business',
          amountLkr: sessionIsAnnual ? 54000 : 5000,
          interval: sessionIsAnnual ? 'annual' : 'monthly',
          planName: actualPlan,
          sessionId: session.id,
        }).catch((e) => console.warn('Payment receipt email error:', e));
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
