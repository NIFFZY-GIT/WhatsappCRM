import { NextRequest, NextResponse } from 'next/server';
import { getStripeCustomerPaymentMethod, getStripeSubscription } from '@/lib/stripe';
import { getSessionUser } from '@/lib/auth-server';
import { getUserById } from '@/lib/store';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Refresh latest user record
    const latestUser = (await getUserById(user.id)) || user;

    let card = null;
    if (latestUser.stripeCustomerId) {
      card = await getStripeCustomerPaymentMethod(latestUser.stripeCustomerId);
    }

    let subscriptionInfo = null;
    if (latestUser.stripeSubscriptionId) {
      const sub = await getStripeSubscription(latestUser.stripeSubscriptionId);
      if (sub) {
        subscriptionInfo = {
          id: sub.id,
          status: sub.status,
          cancelAtPeriodEnd: Boolean(sub.cancel_at_period_end),
          currentPeriodEnd: (sub as any).current_period_end
            ? new Date((sub as any).current_period_end * 1000).toISOString()
            : latestUser.subscriptionExpiresAt,
        };
      }
    }

    return NextResponse.json({
      success: true,
      card,
      subscription: subscriptionInfo,
      subscriptionStatus: latestUser.subscriptionStatus,
      subscriptionPlan: latestUser.subscriptionPlan,
      billingInterval: latestUser.billingInterval || 'monthly',
      subscriptionExpiresAt: latestUser.subscriptionExpiresAt,
      cancelAtPeriodEnd: latestUser.cancelAtPeriodEnd || subscriptionInfo?.cancelAtPeriodEnd || false,
    });
  } catch (err: any) {
    console.error('Stripe status API error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch billing status' },
      { status: 500 }
    );
  }
}
