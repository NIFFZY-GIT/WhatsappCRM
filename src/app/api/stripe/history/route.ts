import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth-server';
import { getStripe } from '@/lib/stripe';
import { getUserByEmail } from '@/lib/store';

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser(req);
    const searchEmail = req.nextUrl.searchParams.get('email');
    const user = sessionUser || (searchEmail ? await getUserByEmail(searchEmail) : null);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
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

    if (!user.stripeCustomerId) {
      return NextResponse.json({
        success: true,
        invoices: [],
        message: 'No billing account found yet.',
      });
    }

    const stripeInvoices = await stripe.invoices.list({
      customer: user.stripeCustomerId,
      limit: 25,
    });

    const invoices = stripeInvoices.data.map((inv) => {
      const lineItem = inv.lines?.data?.[0];
      const description =
        lineItem?.description ||
        (inv.amount_paid >= 5000000
          ? 'WhatsApp CRM & Zevarone AI Pro (Annual)'
          : 'WhatsApp CRM & Zevarone AI Pro (Monthly)');

      return {
        id: inv.id,
        number: inv.number || inv.id,
        date: new Date(inv.created * 1000).toISOString(),
        amountLkr: Math.round(inv.amount_paid / 100),
        status: inv.status || 'paid',
        planName: description,
        hostedInvoiceUrl: inv.hosted_invoice_url,
        invoicePdf: inv.invoice_pdf,
        periodEnd: lineItem?.period?.end
          ? new Date(lineItem.period.end * 1000).toISOString()
          : undefined,
      };
    });

    return NextResponse.json({
      success: true,
      invoices,
    });
  } catch (err: any) {
    console.error('Error fetching billing history:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch billing history.' },
      { status: 500 }
    );
  }
}
