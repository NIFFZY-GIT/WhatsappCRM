import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, upsertUser, getTenant, getTenants } from '@/lib/store';
import { UserAccount } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const isZevarone = cleanEmail.endsWith('@zevarone.com');
    let user = await getUserByEmail(cleanEmail);

    // Auto-seed initial Zevarone admin account if database is completely fresh
    if (!user && isZevarone) {
      const allTenants = await getTenants();
      const defaultTenant = allTenants[0] || { id: 'tenant_zevarone' };
      user = await upsertUser({
        name: 'Zevarone Master Admin',
        email: cleanEmail,
        passwordHash: Buffer.from(password).toString('base64'),
        businessName: 'Zevarone Enterprise HQ',
        tenantId: defaultTenant.id,
        role: 'superadmin',
        subscriptionStatus: 'active',
        subscriptionPlan: 'Zevarone Master Superadmin',
      });
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No account found with this email. Please register.' },
        { status: 404 }
      );
    }

    // Auto-elevate any @zevarone.com account to superadmin
    if (isZevarone && (user.role !== 'superadmin' || user.subscriptionStatus !== 'active')) {
      user.role = 'superadmin';
      user.subscriptionStatus = 'active';
      user.subscriptionPlan = 'Zevarone Master Superadmin';
      await upsertUser(user);
    }

    // Verify password against stored hash
    if (user.passwordHash) {
      const expectedHash = Buffer.from(password).toString('base64');
      if (user.passwordHash !== expectedHash) {
        return NextResponse.json(
          { success: false, error: 'Invalid password. Please try again.' },
          { status: 401 }
        );
      }
    }

    const tenant = await getTenant(user.tenantId);

    const res = NextResponse.json({
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
      },
      tenant: tenant || null,
    });

    const token = Buffer.from(JSON.stringify({ id: user.id, email: user.email })).toString('base64');
    res.cookies.set('crm_auth_token', token, {
      path: '/',
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
    });

    return res;
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Login failed' },
      { status: 500 }
    );
  }
}
