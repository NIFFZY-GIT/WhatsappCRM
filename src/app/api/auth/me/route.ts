import { NextRequest, NextResponse } from 'next/server';
import { getUserById, getUserByEmail, getTenant } from '@/lib/store';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('crm_auth_token')?.value;

    if (!token) {
      return NextResponse.json({ success: true, user: null, tenant: null });
    }

    let payload: { id?: string; email?: string } = {};
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      payload = JSON.parse(decoded);
    } catch {
      return NextResponse.json({ success: true, user: null, tenant: null });
    }

    let user = null;
    if (payload.id) {
      user = await getUserById(payload.id);
    }
    if (!user && payload.email) {
      user = await getUserByEmail(payload.email);
    }

    if (!user) {
      return NextResponse.json({ success: true, user: null, tenant: null });
    }

    const tenant = user.tenantId ? await getTenant(user.tenantId) : null;

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        businessName: user.businessName,
        tenantId: user.tenantId,
        role: user.role,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionPlan: user.subscriptionPlan,
        stripeCustomerId: user.stripeCustomerId,
        createdAt: user.createdAt,
      },
      tenant: tenant || null,
    });
  } catch (err: any) {
    console.error('Auth /me error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
