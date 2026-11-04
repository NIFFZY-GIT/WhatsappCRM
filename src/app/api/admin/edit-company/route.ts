import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/auth-server';
import { upsertTenant, getUsers, upsertUser, getTenant } from '@/lib/store';
import { BotMode } from '@/lib/types';

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
    const {
      tenantId,
      name,
      whatsappNumber,
      phoneNumberId,
      whatsappToken,
      defaultMode,
      geminiSystemPrompt,
      automatedTemplate,
      isActive,
      ownerName,
      ownerEmail,
      subscriptionStatus,
      subscriptionPlan,
    } = body;

    if (!tenantId || !name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Tenant ID and Company Name are required.' },
        { status: 400 }
      );
    }

    // 1. Update the tenant record
    const updatedTenant = await upsertTenant({
      id: tenantId,
      name: name.trim(),
      whatsappNumber: (whatsappNumber || '').trim(),
      phoneNumberId: (phoneNumberId || '').trim(),
      whatsappToken: typeof whatsappToken === 'string' ? whatsappToken.trim() : undefined,
      defaultMode: defaultMode as BotMode,
      geminiSystemPrompt: typeof geminiSystemPrompt === 'string' ? geminiSystemPrompt.trim() : undefined,
      automatedTemplate: typeof automatedTemplate === 'string' ? automatedTemplate.trim() : undefined,
      isActive: typeof isActive === 'boolean' ? isActive : true,
    });

    // 2. Update owner details if provided
    let updatedOwner = null;
    const users = await getUsers();
    const owner = users.find((u) => u.tenantId === tenantId);

    if (owner) {
      updatedOwner = await upsertUser({
        id: owner.id,
        email: ownerEmail?.trim() || owner.email,
        name: ownerName?.trim() || owner.name,
        businessName: name.trim(),
        role: owner.role,
        tenantId: tenantId,
        subscriptionStatus: subscriptionStatus || owner.subscriptionStatus,
        subscriptionPlan: subscriptionPlan || owner.subscriptionPlan,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Company details for ${name} updated successfully.`,
      tenant: updatedTenant,
      owner: updatedOwner,
    });
  } catch (err: any) {
    console.error('Error in edit-company route:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update company details.' },
      { status: 500 }
    );
  }
}
