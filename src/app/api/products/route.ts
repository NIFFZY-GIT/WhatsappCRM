import { NextRequest, NextResponse } from 'next/server';
import { getProducts, upsertProduct, deleteProduct } from '@/lib/store';
import { getSessionUser } from '@/lib/auth-server';
import { isZevaroneAdmin } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    const isAdmin = isZevaroneAdmin(user);
    const searchParams = req.nextUrl.searchParams;
    let tenantId = searchParams.get('tenantId') || undefined;

    if (!isAdmin && user?.tenantId) {
      tenantId = user.tenantId;
    }

    const products = await getProducts(tenantId);
    return NextResponse.json({ success: true, products });
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
    let { tenantId, name, price, category, description, inStock, id } = body;

    if (!isAdmin && user?.tenantId) {
      tenantId = user.tenantId;
    }

    if (!tenantId || !name || !price) {
      return NextResponse.json(
        { success: false, error: 'Tenant ID, Product Name, and Price are required' },
        { status: 400 }
      );
    }

    const product = await upsertProduct({
      id,
      tenantId,
      name: name.trim(),
      price: price.trim(),
      category: category?.trim() || 'General',
      description: description?.trim() || '',
      inStock: inStock ?? true,
    });

    return NextResponse.json({ success: true, product });
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
        { success: false, error: 'Product ID required' },
        { status: 400 }
      );
    }

    const deleted = await deleteProduct(id);
    return NextResponse.json({ success: deleted });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
