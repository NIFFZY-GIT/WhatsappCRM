import Stripe from 'stripe';

export const SUBSCRIPTION_PRICE_MONTHLY_LKR = 5000; // 5,000 LKR/month
export const SUBSCRIPTION_PRICE_ANNUAL_MONTHLY_LKR = 4500; // 4,500 LKR/month
export const SUBSCRIPTION_PRICE_ANNUAL_TOTAL_LKR = 54000; // 54,000 LKR/year (save 6,000 LKR)

export const SUBSCRIPTION_PLAN_MONTHLY = 'WhatsApp CRM & Gemini AI Pro - Monthly (5,000 LKR/mo)';
export const SUBSCRIPTION_PLAN_ANNUAL = 'WhatsApp CRM & Gemini AI Pro - Annual (4,500 LKR/mo, 54,000 LKR/yr)';

export function getStripe(): Stripe | null {
  const secretKey = (process.env.STRIPE_SECRET_KEY || process.env.STRIPE_API_KEY || '').trim();
  if (!secretKey) return null;
  return new Stripe(secretKey, {
    apiVersion: '2024-12-18.acacia' as any,
  });
}

/**
 * Create Stripe Checkout Session for Monthly (5,000 LKR) or Annual (54,000 LKR) recurring subscription
 */
export async function createStripeCheckoutSession({
  userEmail,
  userId,
  tenantId,
  customerName,
  customerId,
  billingInterval = 'monthly',
  successUrl,
  cancelUrl,
}: {
  userEmail: string;
  userId?: string;
  tenantId?: string;
  customerName?: string;
  customerId?: string;
  billingInterval?: 'monthly' | 'annual';
  successUrl: string;
  cancelUrl: string;
}): Promise<{ url: string; sessionId: string }> {
  const stripe = getStripe();
  if (!stripe) {
    throw new Error('STRIPE_SECRET_KEY is not configured in .env. Please set STRIPE_SECRET_KEY in Vercel / .env.');
  }

  const isAnnual = billingInterval === 'annual';
  const unitAmount = isAnnual
    ? SUBSCRIPTION_PRICE_ANNUAL_TOTAL_LKR * 100 // 5,400,000 cents = 54,000 LKR
    : SUBSCRIPTION_PRICE_MONTHLY_LKR * 100; // 500,000 cents = 5,000 LKR
  const interval = isAnnual ? 'year' : 'month';
  const planName = isAnnual ? SUBSCRIPTION_PLAN_ANNUAL : SUBSCRIPTION_PLAN_MONTHLY;

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'subscription',
    line_items: [
      {
        price_data: {
          currency: 'lkr',
          product_data: {
            name: planName,
            description: isAnnual
              ? 'Annual Pro Subscription: 54,000 LKR billed annually (4,500 LKR/mo). Recurring auto-renewal every 12 months with saved card on file.'
              : 'Monthly Pro Subscription: 5,000 LKR billed monthly. Recurring auto-renewal every 30 days with saved card on file.',
          },
          unit_amount: unitAmount,
          recurring: {
            interval: interval as any,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      userId: userId || '',
      userEmail,
      tenantId: tenantId || '',
      billingInterval,
      plan: planName,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  };

  if (customerId) {
    sessionParams.customer = customerId;
  } else {
    sessionParams.customer_email = userEmail;
  }

  const session = await stripe.checkout.sessions.create(sessionParams);

  return {
    url: session.url || '',
    sessionId: session.id,
  };
}

/**
 * Create Stripe Customer Portal Session for card updates, cancellation, & receipt downloads
 */
export async function createStripeCustomerPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}): Promise<string> {
  const stripe = getStripe();
  if (!stripe) {
    throw new Error('STRIPE_SECRET_KEY is not configured.');
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return portalSession.url;
}

/**
 * Fetch default payment method (card details) for a Stripe Customer
 */
export async function getStripeCustomerPaymentMethod(customerId: string): Promise<{
  brand?: string;
  last4?: string;
  expMonth?: number;
  expYear?: number;
} | null> {
  const stripe = getStripe();
  if (!stripe) return null;

  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
      limit: 1,
    });

    if (paymentMethods.data.length > 0 && paymentMethods.data[0].card) {
      const card = paymentMethods.data[0].card;
      return {
        brand: card.brand,
        last4: card.last4,
        expMonth: card.exp_month,
        expYear: card.exp_year,
      };
    }

    return null;
  } catch (err) {
    console.warn('[Stripe] Could not fetch payment method for customer:', customerId, err);
    return null;
  }
}

/**
 * Cancel Stripe Subscription (defaults to cancel at period end so customer gets what they paid for)
 */
export async function cancelStripeSubscription(
  subscriptionId: string,
  cancelAtPeriodEnd = true
): Promise<Stripe.Subscription | null> {
  const stripe = getStripe();
  if (!stripe) return null;

  try {
    if (cancelAtPeriodEnd) {
      return await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    } else {
      return await stripe.subscriptions.cancel(subscriptionId);
    }
  } catch (err) {
    console.error('[Stripe] Cancel subscription error:', err);
    throw err;
  }
}

/**
 * Resume a subscription that was set to cancel at period end
 */
export async function resumeStripeSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription | null> {
  const stripe = getStripe();
  if (!stripe) return null;

  try {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });
  } catch (err) {
    console.error('[Stripe] Resume subscription error:', err);
    throw err;
  }
}

/**
 * Retrieve Stripe Subscription details
 */
export async function getStripeSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription | null> {
  const stripe = getStripe();
  if (!stripe) return null;

  try {
    return await stripe.subscriptions.retrieve(subscriptionId);
  } catch (err) {
    console.warn('[Stripe] Could not retrieve subscription:', subscriptionId, err);
    return null;
  }
}
