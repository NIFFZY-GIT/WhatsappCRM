import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth-server';
import { getStripe } from '@/lib/stripe';
import { getUserByEmail, updateUserSubscription } from '@/lib/store';

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser(req);
    let user = sessionUser;

    if (!user) {
      try {
        const body = await req.json();
        if (body.email) {
          user = (await getUserByEmail(body.email)) || null;
        }
      } catch {}
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required. Please sign in.' },
        { status: 401 }
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

    // Create a Stripe Customer if not existing
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

      await updateUserSubscription(user.id, user.subscriptionStatus, {
        customerId,
      });
    }

    // Create SetupIntent for on-site card collection
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      usage: 'off_session',
    });

    return NextResponse.json({
      success: true,
      clientSecret: setupIntent.client_secret,
      customerId,
    });
  } catch (err: any) {
    console.error('Error in create-setup-intent:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to initiate card setup.' },
      { status: 500 }
    );
  }
}
