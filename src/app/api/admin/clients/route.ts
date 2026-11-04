import { NextRequest, NextResponse } from 'next/server';
import { getClientWorkspacesSummary, getUserById, getUserByEmail } from '@/lib/store';
import { isZevaroneAdmin } from '@/lib/types';

export async function GET(req: NextRequest) {
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

    // Check if requester has Zevarone admin rights
    const isAdmin = isZevaroneAdmin(currentUser);

    const workspaces = await getClientWorkspacesSummary();

    // Calculate system-wide KPIs
    const totalClients = workspaces.length;
    const activeSubscriptions = workspaces.filter(
      (w) => w.owner?.subscriptionStatus === 'active'
    ).length;
    const totalContacts = workspaces.reduce((sum, w) => sum + w.totalContacts, 0);
    const totalMessages = workspaces.reduce((sum, w) => sum + w.totalMessages, 0);
    const totalAiMessages = workspaces.reduce((sum, w) => sum + w.aiHandledMessages, 0);
    const estimatedMrrLkr = activeSubscriptions * 5000;

    return NextResponse.json({
      success: true,
      isAdmin,
      currentUser: currentUser
        ? {
            id: currentUser.id,
            email: currentUser.email,
            name: currentUser.name,
            role: currentUser.role,
          }
        : null,
      kpis: {
        totalClients,
        activeSubscriptions,
        inactiveSubscriptions: totalClients - activeSubscriptions,
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
