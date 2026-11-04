import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { getUserByEmail, updateUserSubscription } from '@/lib/store';
import { sendPaymentReceiptEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ received: true, note: 'Stripe not initialized' });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get('stripe-signature');

  let event: any;

  try {
    const rawBody = await req.text();

    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } else {
      // In development or if webhook secret is not set yet
      event = JSON.parse(rawBody);
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const customerEmail = session.customer_details?.email || session.customer_email;
        const interval = (session.metadata?.billingInterval as 'monthly' | 'annual') || 'monthly';
        const isAnnual = interval === 'annual';
        const planName = isAnnual
          ? 'WhatsApp CRM & Gemini AI Pro - Annual (4,500 LKR/mo, 54,000 LKR/yr)'
          : 'WhatsApp CRM & Gemini AI Pro - Monthly (5,000 LKR/mo)';

        const expiresAt = new Date(
          Date.now() + (isAnnual ? 365 : 30) * 24 * 60 * 60 * 1000
        ).toISOString();

        if (customerEmail) {
          const updated = await updateUserSubscription(customerEmail, 'active', {
            customerId: typeof session.customer === 'string' ? session.customer : undefined,
            sessionId: session.id,
            plan: planName,
            billingInterval: interval,
            subscriptionExpiresAt: expiresAt,
          });

          sendPaymentReceiptEmail({
            to: customerEmail,
            name: updated?.name || 'Customer',
            businessName: updated?.businessName || 'Business',
            amountLkr: isAnnual ? 54000 : 5000,
            interval,
            planName,
            sessionId: session.id,
          }).catch((e) => console.warn('Payment receipt email webhook error:', e));

          console.log(`[Stripe Webhook] Subscription activated for ${customerEmail} (${planName})`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        // Invert subscription to inactive if canceled
        console.log(`[Stripe Webhook] Subscription canceled for customer ${customerId}`);
        break;
      }

      default:
        // Other events ignored
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Stripe webhook handling error:', err);
    return NextResponse.json(
      { error: err.message || 'Webhook error' },
      { status: 400 }
    );
  }
}
