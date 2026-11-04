import Stripe from 'stripe';

export const SUBSCRIPTION_PRICE_LKR = 5000; // 5,000 LKR
export const SUBSCRIPTION_PLAN_NAME = 'WhatsApp CRM & Gemini AI Pro (5,000 LKR/mo)';

export function getStripe(): Stripe | null {
  const secretKey = (process.env.STRIPE_SECRET_KEY || process.env.STRIPE_API_KEY || '').trim();
  if (!secretKey) return null;
  return new Stripe(secretKey, {
    apiVersion: '2024-12-18.acacia' as any,
  });
}

/**
 * Create Stripe Checkout Session for 5,000 LKR recurring subscription
 */
export async function createStripeCheckoutSession({
  userEmail,
  userId,
  tenantId,
  customerName,
  successUrl,
  cancelUrl,
}: {
  userEmail: string;
  userId?: string;
  tenantId?: string;
  customerName?: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ url: string; sessionId: string }> {
  const stripe = getStripe();
  if (!stripe) {
    throw new Error('STRIPE_SECRET_KEY is not configured in .env. Please set STRIPE_SECRET_KEY in Vercel / .env.');
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: userEmail,
    line_items: [
      {
        price_data: {
          currency: 'lkr',
          product_data: {
            name: SUBSCRIPTION_PLAN_NAME,
            description:
              'Full access to WhatsApp Shared Inbox, Gemini AI Sales Concierge, Automated Media Sequences, Product Catalog, Outbound Campaign Sender, and Multi-Tenant Isolation.',
          },
          unit_amount: SUBSCRIPTION_PRICE_LKR * 100, // 500,000 LKR cents = 5,000.00 LKR
          recurring: {
            interval: 'month',
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      userId: userId || '',
      userEmail,
      tenantId: tenantId || '',
      plan: SUBSCRIPTION_PLAN_NAME,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return {
    url: session.url || '',
    sessionId: session.id,
  };
}
