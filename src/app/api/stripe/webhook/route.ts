import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { getUserByEmail, updateUserSubscription } from '@/lib/store';

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
        if (customerEmail) {
          await updateUserSubscription(customerEmail, 'active', {
            customerId: typeof session.customer === 'string' ? session.customer : undefined,
            sessionId: session.id,
            plan: 'WhatsApp CRM & Gemini AI Pro (5,000 LKR/mo)',
          });
          console.log(`[Stripe Webhook] Subscription activated for ${customerEmail} (5,000 LKR)`);
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
