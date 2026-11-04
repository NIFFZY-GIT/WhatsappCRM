import { NextRequest, NextResponse } from 'next/server';
import { getWhatsAppMediaUrl, cleanWhatsAppToken, getWhatsAppConfig } from '@/lib/whatsapp';
import { getTenant } from '@/lib/store';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const mediaId = searchParams.get('id');
    const tenantId = searchParams.get('tenantId') || undefined;

    if (!mediaId) {
      return new NextResponse('Media ID missing', { status: 400 });
    }

    const tenant = tenantId ? await getTenant(tenantId) : undefined;
    const defaultConfig = getWhatsAppConfig();
    const token = cleanWhatsAppToken(tenant?.whatsappToken || defaultConfig.token);

    if (!token) {
      return new NextResponse('WhatsApp token not configured', { status: 401 });
    }

    // 1. Fetch download URL from Meta
    const metaMedia = await getWhatsAppMediaUrl(mediaId, { token });
    if (!metaMedia.success || !metaMedia.url) {
      return new NextResponse(metaMedia.error || 'Media not found on WhatsApp', { status: 404 });
    }

    // 2. Fetch the actual binary image bytes from Meta's CDN
    const mediaRes = await fetch(metaMedia.url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!mediaRes.ok) {
      return new NextResponse('Failed to fetch media from Meta CDN', { status: mediaRes.status });
    }

    const contentType = mediaRes.headers.get('content-type') || metaMedia.mimeType || 'image/jpeg';
    const arrayBuffer = await mediaRes.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    });
  } catch (err: any) {
    console.error('Error proxying WhatsApp media:', err);
    return new NextResponse(err.message || 'Error streaming media', { status: 500 });
  }
}
