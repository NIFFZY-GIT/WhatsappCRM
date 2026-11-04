import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const res = NextResponse.json({ success: true, message: 'Logged out successfully' });
  res.cookies.delete('crm_auth_token');
  return res;
}
