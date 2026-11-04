import { NextRequest, NextResponse } from 'next/server';
import { getClientWorkspacesSummary } from '@/lib/store';
import { checkAdminAuth } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  try {
    const auth = await checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error || 'Admin access required' },
        { status: auth.status || 403 }
      );
    }

    const workspaces = await getClientWorkspacesSummary();

    // Calculate system-wide KPIs
    const totalClients = workspaces.length;
    const activeSubscriptions = workspaces.filter(
      (w) => w.owner?.subscriptionStatus === 'active'
    ).length;
    const cancelledSubscriptions = workspaces.filter(
      (w) => Boolean(w.owner?.cancelAtPeriodEnd || w.owner?.cancellationReason)
    ).length;
    const totalContacts = workspaces.reduce((sum, w) => sum + w.totalContacts, 0);
    const totalMessages = workspaces.reduce((sum, w) => sum + w.totalMessages, 0);
    const totalAiMessages = workspaces.reduce((sum, w) => sum + w.aiHandledMessages, 0);
    const estimatedMrrLkr = activeSubscriptions * 5000;

    return NextResponse.json({
      success: true,
      isAdmin: true,
      currentUser: auth.user
        ? {
            id: auth.user.id,
            email: auth.user.email,
            name: auth.user.name,
            role: auth.user.role,
          }
        : null,
      kpis: {
        totalClients,
        activeSubscriptions,
        inactiveSubscriptions: totalClients - activeSubscriptions,
        cancelledSubscriptions,
        totalContacts,
        totalMessages,
        totalAiMessages,
        estimatedMrrLkr,
      },
      workspaces,
    });
  } catch (err: any) {
    console.error('Admin clients fetch error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch client workspace monitor data.' },
      { status: 500 }
    );
  }
}
