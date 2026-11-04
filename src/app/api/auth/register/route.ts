import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, upsertUser, upsertTenant } from '@/lib/store';
import { Tenant, UserAccount } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, businessName, phoneNumber } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and password are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await getUserByEmail(cleanEmail);
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists. Please sign in.' },
        { status: 400 }
      );
    }

    // 1. Create a dedicated Tenant for this user
    const tenantId = 'tenant_' + Date.now();
    const bName = (businessName || `${name}'s Business`).trim();
    const slug = bName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');

    const newTenant: Tenant = {
      id: tenantId,
      name: bName,
      slug: slug || `tenant-${Date.now()}`,
      whatsappNumber: (phoneNumber || '').replace(/\D/g, ''),
      phoneNumberId: '',
      whatsappToken: '',
      geminiApiKey: '',
      geminiSystemPrompt: `You are the AI Sales & Support Concierge for ${bName}. Be professional, warm, and helpful.`,
      defaultMode: 'ai_chatbot',
      automatedTemplate: 'Hello! Welcome to ' + bName + '. How can we assist you today?',
      welcomeMedia: [],
      sendWelcomeMedia: false,
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    await upsertTenant(newTenant);

    // 2. Create User Account (inactive subscription until 5000 LKR paid)
    const newUser: UserAccount = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: name.trim(),
      email: cleanEmail,
      passwordHash: Buffer.from(password).toString('base64'),
      businessName: bName,
      tenantId: tenantId,
      role: 'owner',
      subscriptionStatus: 'inactive', // Requires 5,000 LKR Stripe subscription
      subscriptionPlan: 'WhatsApp CRM & Gemini AI Pro (5,000 LKR/mo)',
      createdAt: new Date().toISOString(),
    };

    const savedUser = await upsertUser(newUser);

    const res = NextResponse.json({
      success: true,
      user: {
        id: savedUser.id,
        email: savedUser.email,
        name: savedUser.name,
        businessName: savedUser.businessName,
        tenantId: savedUser.tenantId,
        role: savedUser.role,
        subscriptionStatus: savedUser.subscriptionStatus,
        subscriptionPlan: savedUser.subscriptionPlan,
      },
      tenant: newTenant,
    });

    // Set HTTP session cookie
    const token = Buffer.from(JSON.stringify({ id: savedUser.id, email: savedUser.email })).toString('base64');
    res.cookies.set('crm_auth_token', token, {
      path: '/',
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: 'lax',
    });

    return res;
  } catch (err: any) {
    console.error('Registration error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Registration failed' },
      { status: 500 }
    );
  }
}
