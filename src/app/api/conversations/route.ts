import { NextRequest, NextResponse } from 'next/server';
import {
  getContacts,
  getMessagesForContact,
  addMessage,
  markContactRead,
  upsertContact,
  getTenant,
  setContactHumanAssistance,
  deleteConversation,
  clearAllConversations,
} from '@/lib/store';
import { sendWhatsAppTextMessage, sendWhatsAppImageMessage, formatPhoneNumber } from '@/lib/whatsapp';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const phone = searchParams.get('phone');
    const tenantId = searchParams.get('tenantId') || undefined;

    const contacts = await getContacts(tenantId);

    if (phone) {
      const cleanPhone = formatPhoneNumber(phone);
      await markContactRead(cleanPhone, tenantId);
      const messages = await getMessagesForContact(cleanPhone, tenantId);
      return NextResponse.json({
        success: true,
        contacts,
        activeMessages: messages,
      });
    }

    return NextResponse.json({
      success: true,
      contacts,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

/**
 * Human Agent manual reply or Mode switch
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, text, mode, action, tenantId, imageUrl, mediaId, mediaPreviewUrl } = body;

    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'Phone number required' },
        { status: 400 }
      );
    }

    const cleanPhone = formatPhoneNumber(phone);
    const tenant = tenantId ? await getTenant(tenantId) : undefined;

    // If updating human assistance status
    if (action === 'toggle_human') {
      await setContactHumanAssistance(cleanPhone, Boolean(body.needsHumanAssistance), tenantId);
      return NextResponse.json({ success: true, needsHumanAssistance: Boolean(body.needsHumanAssistance) });
    }

    // If updating contact mode or metadata
    if (action === 'update_mode' && mode) {
      const updated = await upsertContact({
        tenantId,
        phone: cleanPhone,
        mode,
      });
      return NextResponse.json({ success: true, contact: updated });
    }

    // Validation: Require either text or an image
    const hasImage = Boolean(imageUrl || mediaId);
    const hasText = Boolean(text && text.trim());

    if (!hasImage && !hasText) {
      return NextResponse.json(
        { success: false, error: 'Message text or image required' },
        { status: 400 }
      );
    }

    let waResult;
    const finalCaption = text?.trim() || '';

    if (hasImage) {
      // Send image message via WhatsApp Cloud API
      waResult = await sendWhatsAppImageMessage(
        cleanPhone,
        {
          link: imageUrl,
          id: mediaId,
          caption: finalCaption,
        },
        {
          token: tenant?.whatsappToken,
          phoneNumberId: tenant?.phoneNumberId,
        }
      );
    } else {
      // Send plain text message via WhatsApp Cloud API
      waResult = await sendWhatsAppTextMessage(
        cleanPhone,
        finalCaption,
        {
          token: tenant?.whatsappToken,
          phoneNumberId: tenant?.phoneNumberId,
        }
      );
    }

    const message = await addMessage({
      tenantId: tenant?.id,
      contactPhone: cleanPhone,
      sender: 'agent',
      text: finalCaption,
      mediaUrl: hasImage ? (imageUrl || mediaPreviewUrl || '') : undefined,
      mediaType: hasImage ? 'image' : undefined,
      status: waResult.success ? 'sent' : 'failed',
      waMessageId: waResult.messageId,
      error: waResult.error,
    });

    return NextResponse.json({
      success: true,
      message,
      whatsappStatus: waResult,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

/**
 * Delete a chat conversation (messages & contact)
 */
export async function DELETE(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    let phone = searchParams.get('phone');
    let tenantId = searchParams.get('tenantId') || undefined;
    const clearAll = searchParams.get('clearAll') === 'true';

    // If clearing all conversations for this tenant
    if (clearAll) {
      await clearAllConversations(tenantId);
      return NextResponse.json({
        success: true,
        message: 'All conversations and leads cleared successfully',
      });
    }

    // Check JSON body if not in query params
    if (!phone) {
      try {
        const body = await req.json();
        phone = body.phone;
        tenantId = body.tenantId || tenantId;
        if (body.clearAll) {
          await clearAllConversations(tenantId);
          return NextResponse.json({
            success: true,
            message: 'All conversations and leads cleared successfully',
          });
        }
      } catch (e) {
        // ignore body parse failure
      }
    }

    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'Phone parameter is required' },
        { status: 400 }
      );
    }

    const cleanPhone = formatPhoneNumber(phone);
    await deleteConversation(cleanPhone, tenantId);

    return NextResponse.json({
      success: true,
      message: `Conversation for +${cleanPhone} successfully deleted`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
