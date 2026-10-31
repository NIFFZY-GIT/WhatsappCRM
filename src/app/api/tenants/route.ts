import { NextRequest, NextResponse } from 'next/server';
import { getTenants, upsertTenant, deleteTenant } from '@/lib/store';

export async function GET() {
  const tenants = await getTenants();
  return NextResponse.json({ success: true, tenants });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Business name is required' },
        { status: 400 }
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
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Tenant ID required' },
        { status: 400 }
      );
    }

    const deleted = await deleteTenant(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete the only existing business account' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
