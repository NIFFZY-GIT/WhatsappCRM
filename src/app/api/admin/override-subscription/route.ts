import { NextRequest, NextResponse } from 'next/server';
import { overrideClientSubscription } from '@/lib/store';
import { checkAdminAuth } from '@/lib/auth-server';

export async function POST(req: NextRequest) {
  try {
    const auth = await checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error || 'Admin access required' },
        { status: auth.status || 403 }
      );
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
