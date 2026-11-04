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
 * Create Stripe Checkout Session for Monthly (5,000 LKR) or Annual (54,000 LKR) subscription
 */
export async function createStripeCheckoutSession({
  userEmail,
  userId,
  tenantId,
  customerName,
  billingInterval = 'monthly',
  successUrl,
  cancelUrl,
}: {
  userEmail: string;
  userId?: string;
  tenantId?: string;
  customerName?: string;
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

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: userEmail,
    line_items: [
      {
        price_data: {
          currency: 'lkr',
          product_data: {
            name: planName,
            description: isAnnual
              ? 'Annual Pro Subscription with 10% discount: Full access to WhatsApp Shared Inbox, Gemini AI Sales Concierge, Automated Media Sequences, Product Catalog, and Multi-Tenant Isolation for 1 full year.'
              : 'Monthly Pro Subscription: Full access to WhatsApp Shared Inbox, Gemini AI Sales Concierge, Automated Media Sequences, Product Catalog, and Multi-Tenant Isolation.',
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
  });

  return {
    url: session.url || '',
    sessionId: session.id,
  };
}
