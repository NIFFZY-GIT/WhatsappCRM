import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth-server';
import { getStripe, SUBSCRIPTION_PRICE_MONTHLY_LKR, SUBSCRIPTION_PRICE_ANNUAL_TOTAL_LKR, SUBSCRIPTION_PLAN_MONTHLY, SUBSCRIPTION_PLAN_ANNUAL } from '@/lib/stripe';
import { getUserByEmail, updateUserSubscription } from '@/lib/store';
import { sendPaymentReceiptEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser(req);
    const body = await req.json();
    const { paymentMethodId, billingInterval = 'monthly', email } = body;

    let user = sessionUser;
    if (!user && email) {
      user = (await getUserByEmail(email)) || null;
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required. Please sign in.' },
        { status: 401 }
      );
    }

    if (!paymentMethodId) {
      return NextResponse.json(
        { success: false, error: 'Payment method is required.' },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json(
        { success: false, error: 'Stripe gateway not configured.' },
        { status: 500 }
      );
    }

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || user.businessName || 'Business Client',
        metadata: {
          userId: user.id,
          businessName: user.businessName || '',
        },
      });
      customerId = customer.id;
    }

    // 1. Attach payment method to customer
    try {
      await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
    } catch (attachErr: any) {
      // If already attached, ignore
      if (!attachErr.message?.includes('already attached')) {
        console.warn('Payment method attach warning:', attachErr.message);
      }
    }

    // 2. Set as default payment method on customer account
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // 3. Ensure Product exists in Stripe
    let product;
    const existingProducts = await stripe.products.list({ limit: 5 });
    product = existingProducts.data.find(
      (p) => p.name.includes('Zevarone AI') || p.name.includes('WhatsApp CRM')
    );

    if (!product) {
      product = await stripe.products.create({
        name: 'WhatsApp CRM & Zevarone AI Pro',
        description: 'Autonomous AI Sales Concierge, Shared Inbox & Product Catalog for WhatsApp',
      });
    }

    // 4. Create Subscription
    const isAnnual = billingInterval === 'annual';
    const unitAmount = isAnnual
      ? SUBSCRIPTION_PRICE_ANNUAL_TOTAL_LKR * 100 // 54,000 LKR in cents
      : SUBSCRIPTION_PRICE_MONTHLY_LKR * 100; // 5,000 LKR in cents
    const interval = isAnnual ? 'year' : 'month';
    const planName = isAnnual ? SUBSCRIPTION_PLAN_ANNUAL : SUBSCRIPTION_PLAN_MONTHLY;

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price_data: {
            currency: 'lkr',
            product: product.id,
            unit_amount: unitAmount,
            recurring: { interval },
          },
        },
      ],
      default_payment_method: paymentMethodId,
      expand: ['latest_invoice.payment_intent'],
    });

    const latestInvoice: any = subscription.latest_invoice;
    const paymentIntent: any = latestInvoice?.payment_intent;

    // Check if 3D Secure / SCA authentication is needed by the bank
    if (paymentIntent && paymentIntent.status === 'requires_action') {
      return NextResponse.json({
        success: true,
        requiresAction: true,
        clientSecret: paymentIntent.client_secret,
        subscriptionId: subscription.id,
      });
    }

    // Calculate expiry (30 days or 365 days)
    const expiresAt = new Date(
      Date.now() + (isAnnual ? 365 : 30) * 24 * 60 * 60 * 1000
    ).toISOString();

    // 5. Update user subscription status in local & Supabase storage
    await updateUserSubscription(user.id, 'active', {
      customerId,
      subscriptionId: subscription.id,
      plan: planName,
      billingInterval: isAnnual ? 'annual' : 'monthly',
      subscriptionExpiresAt: expiresAt,
      cancelAtPeriodEnd: false,
    });

    // 6. Send payment receipt email via Zoho SMTP
    sendPaymentReceiptEmail({
      to: user.email,
      name: user.name || 'Valued Client',
      businessName: user.businessName || 'Business',
      amountLkr: isAnnual ? SUBSCRIPTION_PRICE_ANNUAL_TOTAL_LKR : SUBSCRIPTION_PRICE_MONTHLY_LKR,
      interval: isAnnual ? 'annual' : 'monthly',
      planName,
      sessionId: subscription.id,
    }).catch((emailErr) => {
      console.warn('Payment receipt email error:', emailErr);
    });

    return NextResponse.json({
      success: true,
      message: `Pro subscription activated! Auto-renewal active with your saved card.`,
      subscriptionId: subscription.id,
      plan: planName,
    });
  } catch (err: any) {
    console.error('Error in subscribe-embedded route:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Payment processing failed. Please check your card details.' },
      { status: 500 }
    );
  }
}
