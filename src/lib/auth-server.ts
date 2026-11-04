import { NextRequest } from 'next/server';
import { getUserById, getUserByEmail } from '@/lib/store';
import { UserAccount, isZevaroneAdmin } from '@/lib/types';

export async function getSessionUser(req: NextRequest): Promise<UserAccount | null> {
  try {
    const token = req.cookies.get('crm_auth_token')?.value;
    if (!token) return null;

    let payload: { id?: string; email?: string } = {};
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      payload = JSON.parse(decoded);
    } catch {
      return null;
    }

    let user: UserAccount | null = null;
    if (payload.id) {
      user = (await getUserById(payload.id)) || null;
    }
    if (!user && payload.email) {
      user = (await getUserByEmail(payload.email)) || null;
    }
    return user || null;
  } catch {
    return null;
  }
}

export async function checkAdminAuth(req: NextRequest): Promise<{ authorized: boolean; user: UserAccount | null; error?: string; status?: number }> {
  const user = await getSessionUser(req);
  if (!user) {
    return { authorized: false, user: null, error: 'Authentication required. Please sign in.', status: 401 };
  }
  if (!isZevaroneAdmin(user)) {
    return { authorized: false, user, error: 'Access denied. Administrator privileges required.', status: 403 };
  }
  return { authorized: true, user };
}
