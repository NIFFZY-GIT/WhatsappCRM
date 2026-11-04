import { NextRequest, NextResponse } from 'next/server';
import { cancelStripeSubscription, resumeStripeSubscription } from '@/lib/stripe';
import { getSessionUser } from '@/lib/auth-server';
import { getUserById, updateUserSubscription } from '@/lib/store';

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Sign in required.' }, { status: 401 });
    }

    const latestUser = (await getUserById(user.id)) || user;
    const body = await req.json();
    const action = body.action || 'cancel'; // 'cancel' | 'resume'

    if (!latestUser.stripeSubscriptionId) {
      return NextResponse.json(
        {
          success: false,
          error: 'No active Stripe recurring subscription found for this account.',
        },
        { status: 400 }
      );
    }

    if (action === 'resume') {
      await resumeStripeSubscription(latestUser.stripeSubscriptionId);
      await updateUserSubscription(latestUser.id, 'active', {
        cancelAtPeriodEnd: false,
      });

      return NextResponse.json({
        success: true,
        message: 'Your subscription renewal has been reactivated. Your card will continue to renew automatically.',
        cancelAtPeriodEnd: false,
      });
    }

    // Cancel at period end
    await cancelStripeSubscription(latestUser.stripeSubscriptionId, true);
    await updateUserSubscription(latestUser.id, 'active', {
      cancelAtPeriodEnd: true,
    });

    return NextResponse.json({
      success: true,
      message:
        'Your subscription auto-renewal has been cancelled. You can continue using your WhatsApp CRM until the end of your current 30-day billing period.',
      cancelAtPeriodEnd: true,
    });
  } catch (err: any) {
    console.error('Subscription cancellation error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update subscription cancellation status.' },
      { status: 500 }
    );
  }
}
