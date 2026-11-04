import { NextRequest, NextResponse } from 'next/server';
import { createStripeCustomerPortalSession, getStripe } from '@/lib/stripe';
import { getSessionUser } from '@/lib/auth-server';
import { getUserByEmail } from '@/lib/store';

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required. Please sign in.' },
        { status: 401 }
      );
    }

    if (!user.stripeCustomerId) {
      return NextResponse.json(
        {
          success: false,
          error: 'No active Stripe billing account found. Please subscribe to your first monthly plan to save a card on file.',
        },
        { status: 400 }
      );
    }

    const appUrl = (
      process.env.NEXT_PUBLIC_APP_URL ||
      req.nextUrl.origin ||
      'https://crm.zevarone.com'
    ).replace(/\/$/, '');

    const portalUrl = await createStripeCustomerPortalSession({
      customerId: user.stripeCustomerId,
      returnUrl: `${appUrl}/billing`,
    });

    return NextResponse.json({
      success: true,
      url: portalUrl,
    });
  } catch (err: any) {
    console.error('Customer Portal creation error:', err);
    return NextResponse.json(
      {
        success: false,
        error:
          err.message ||
          'Failed to open Stripe Customer Portal. Ensure the Customer Portal is enabled in your Stripe Dashboard.',
      },
      { status: 500 }
    );
  }
}
