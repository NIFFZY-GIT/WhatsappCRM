import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { getUserByEmail, getUserByStripeCustomerId, updateUserSubscription } from '@/lib/store';
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
      event = JSON.parse(rawBody);
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const customerEmail = session.customer_details?.email || session.customer_email;
        const interval = (session.metadata?.billingInterval as 'monthly' | 'annual') || 'monthly';
        const isAnnual = interval === 'annual';
        const planName = isAnnual
          ? 'WhatsApp CRM & Zevarone AI Pro - Annual (4,500 LKR/mo, 54,000 LKR/yr)'
          : 'WhatsApp CRM & Zevarone AI Pro - Monthly (5,000 LKR/mo)';

        const expiresAt = new Date(
          Date.now() + (isAnnual ? 365 : 30) * 24 * 60 * 60 * 1000
        ).toISOString();

        if (customerEmail) {
          const updated = await updateUserSubscription(customerEmail, 'active', {
            customerId: typeof session.customer === 'string' ? session.customer : undefined,
            subscriptionId: typeof session.subscription === 'string' ? session.subscription : undefined,
            sessionId: session.id,
            plan: planName,
            billingInterval: interval,
            subscriptionExpiresAt: expiresAt,
            cancelAtPeriodEnd: false,
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

      // Automatically charge card every 30 days (or 1 year) & renew access
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;
        const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;
        const customerEmail = invoice.customer_email;

        // Skip the zero-amount or initial duplicate if already processed
        let user = customerId ? await getUserByStripeCustomerId(customerId) : null;
        if (!user && customerEmail) {
          user = await getUserByEmail(customerEmail);
        }

        if (user) {
          const lines = invoice.lines?.data || [];
          const periodEndUnix = lines[0]?.period?.end;
          const nextExpiresAt = periodEndUnix
            ? new Date(periodEndUnix * 1000).toISOString()
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

          const isAnnual = user.billingInterval === 'annual';
          const planName = isAnnual
            ? 'WhatsApp CRM & Zevarone AI Pro - Annual (4,500 LKR/mo, 54,000 LKR/yr)'
            : 'WhatsApp CRM & Zevarone AI Pro - Monthly (5,000 LKR/mo)';

          await updateUserSubscription(user.id, 'active', {
            customerId: customerId || user.stripeCustomerId,
            subscriptionId: subscriptionId || user.stripeSubscriptionId,
            subscriptionExpiresAt: nextExpiresAt,
            cancelAtPeriodEnd: false,
          });

          // Send auto-renewal confirmation email to the user
          sendPaymentReceiptEmail({
            to: user.email,
            name: user.name,
            businessName: user.businessName,
            amountLkr: isAnnual ? 54000 : 5000,
            interval: isAnnual ? 'annual' : 'monthly',
            planName,
            sessionId: invoice.id,
          }).catch((e) => console.warn('Renewal receipt email error:', e));

          console.log(`[Stripe Webhook] Recurring 30-day charge succeeded for ${user.email}. Renewed until ${nextExpiresAt}`);
        }
        break;
      }

      // If recurring charge failed (card expired or insufficient funds)
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;
        if (customerId) {
          const user = await getUserByStripeCustomerId(customerId);
          if (user) {
            await updateUserSubscription(user.id, 'inactive');
            console.warn(`[Stripe Webhook] Recurring payment failed for ${user.email}. Subscription deactivated.`);
          }
        }
        break;
      }

      // When user cancels subscription or subscription reaches end of cycle
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;
        if (customerId) {
          const user = await getUserByStripeCustomerId(customerId);
          if (user) {
            await updateUserSubscription(user.id, 'inactive', {
              cancelAtPeriodEnd: false,
            });
            console.log(`[Stripe Webhook] Subscription terminated for ${user.email}`);
          }
        }
        break;
      }

      // When subscription settings update (e.g. cancel_at_period_end toggled)
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;
        if (customerId) {
          const user = await getUserByStripeCustomerId(customerId);
          if (user) {
            await updateUserSubscription(user.id, user.subscriptionStatus, {
              cancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end),
            });
          }
        }
        break;
      }

      default:
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
