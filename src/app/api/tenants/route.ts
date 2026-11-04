import { NextRequest, NextResponse } from 'next/server';
import { getTenants, upsertTenant, deleteTenant } from '@/lib/store';
import { getSessionUser, checkAdminAuth } from '@/lib/auth-server';
import { isZevaroneAdmin } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    const isAdmin = isZevaroneAdmin(user);
    const allTenants = await getTenants();

    // Zevarone Admins get full multi-tenant list
    if (isAdmin) {
      return NextResponse.json({ success: true, tenants: allTenants });
    }

    // Regular client users only get their assigned business tenant
    if (user?.tenantId) {
      const userTenant = allTenants.filter((t) => t.id === user.tenantId);
      return NextResponse.json({ success: true, tenants: userTenant });
    }

    // Default fallback
    return NextResponse.json({
      success: true,
      tenants: allTenants.length > 0 ? [allTenants[0]] : [],
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    const isAdmin = isZevaroneAdmin(user);
    const body = await req.json();

    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Business name is required' },
        { status: 400 }
      );
    }

    // If not admin, cannot create arbitrary new businesses (they get one at registration)
    if (!isAdmin && !body.id) {
      return NextResponse.json(
        { success: false, error: 'Only administrators can create new business accounts.' },
        { status: 403 }
      );
    }

    // If not admin and updating, can only update their own assigned tenant
    if (!isAdmin && body.id && user?.tenantId && body.id !== user.tenantId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to modify another business account.' },
        { status: 403 }
      );
    }

    const tenant = await upsertTenant(body);
    return NextResponse.json({ success: true, tenant });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: 'Only administrators can delete business accounts.' },
        { status: 403 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Tenant ID required' },
        { status: 400 }
      );
    }

    await deleteTenant(id);

    return NextResponse.json({
      success: true,
      message: 'Business workspace and associated data deleted successfully.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
