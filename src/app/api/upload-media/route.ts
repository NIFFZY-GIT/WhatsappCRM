import { NextRequest, NextResponse } from 'next/server';
import { uploadWhatsAppMedia } from '@/lib/whatsapp';
import { getTenant } from '@/lib/store';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const tenantId = (formData.get('tenantId') as string) || undefined;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No image file uploaded' },
        { status: 400 }
      );
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'Only image files (JPEG, PNG, WEBP, GIF) are supported.' },
        { status: 400 }
      );
    }

    const tenant = tenantId ? await getTenant(tenantId) : undefined;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload directly to Meta WhatsApp Media Cloud
    const uploadResult = await uploadWhatsAppMedia(
      buffer,
      file.name,
      file.type,
      {
        token: tenant?.whatsappToken,
        phoneNumberId: tenant?.phoneNumberId,
      }
    );

    if (!uploadResult.success) {
      return NextResponse.json(
        { success: false, error: uploadResult.error || 'Failed to upload media to WhatsApp' },
        { status: 500 }
      );
    }

    // Convert to base64 preview for instant UI rendering in CRM
    const base64Preview = `data:${file.type};base64,${buffer.toString('base64')}`;

    return NextResponse.json({
      success: true,
      mediaId: uploadResult.mediaId,
      previewUrl: base64Preview,
      fileName: file.name,
      mimeType: file.type,
      fileSize: file.size,
    });
  } catch (err: any) {
    console.error('Error in upload-media endpoint:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Media upload failed' },
      { status: 500 }
    );
  }
}
