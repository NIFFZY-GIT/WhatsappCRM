import { NextRequest, NextResponse } from 'next/server';
import { overrideClientSubscription, getUserById, getUserByEmail } from '@/lib/store';
import { isZevaroneAdmin } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('crm_auth_token')?.value;
    let currentUser = null;

    if (token) {
      try {
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
        if (decoded.id) currentUser = await getUserById(decoded.id);
        if (!currentUser && decoded.email) currentUser = await getUserByEmail(decoded.email);
      } catch (e) {}
    }

    const body = await req.json();
    const { tenantId, status, plan } = body;

    if (!tenantId || !status) {
      return NextResponse.json(
        { success: false, error: 'tenantId and status are required.' },
        { status: 400 }
      );
    }

    const updatedUser = await overrideClientSubscription(tenantId, status, plan);

    return NextResponse.json({
      success: true,
      message: `Client workspace subscription set to ${status}.`,
      user: updatedUser,
    });
  } catch (err: any) {
    console.error('Admin subscription override error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to override subscription.' },
      { status: 500 }
    );
  }
}
