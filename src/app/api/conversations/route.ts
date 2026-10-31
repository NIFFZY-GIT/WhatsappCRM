import { NextRequest, NextResponse } from 'next/server';
import {
  getContacts,
  getMessagesForContact,
  addMessage,
  markContactRead,
  upsertContact,
  getTenant,
  setContactHumanAssistance,
} from '@/lib/store';
import { sendWhatsAppTextMessage, formatPhoneNumber } from '@/lib/whatsapp';

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
    const { phone, text, mode, action, tenantId } = body;

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

    // Otherwise it's an agent manual message
    if (!text || !text.trim()) {
      return NextResponse.json(
        { success: false, error: 'Message text required' },
        { status: 400 }
      );
    }

    const waResult = await sendWhatsAppTextMessage(
      cleanPhone,
      text.trim(),
      {
        token: tenant?.whatsappToken,
        phoneNumberId: tenant?.phoneNumberId,
      }
    );

    const message = await addMessage({
      tenantId: tenant?.id,
      contactPhone: cleanPhone,
      sender: 'agent',
      text: text.trim(),
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
