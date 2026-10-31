import { NextRequest, NextResponse } from 'next/server';
import {
  upsertContact,
  addMessage,
  getSettings,
  getTenant,
  getTenants,
} from '@/lib/store';
import { sendWhatsAppTextMessage, formatPhoneNumber } from '@/lib/whatsapp';
import { generateGeminiReply } from '@/lib/gemini';
import { BotMode } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      phone,
      name = 'Valued Client',
      notes = '',
      mode: chosenMode,
      customMessage,
      tenantId,
    } = body;

    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required.' },
        { status: 400 }
      );
    }

    const cleanPhone = formatPhoneNumber(phone);
    const settings = await getSettings();
    const tenants = await getTenants();
    const tenant = (tenantId ? await getTenant(tenantId) : null) || tenants[0];

    const mode: BotMode = chosenMode || tenant?.defaultMode || settings.defaultMode;

    // 1. Save or update contact in store
    const contact = await upsertContact({
      tenantId: tenant?.id,
      phone: cleanPhone,
      name: name.trim() || `Client +${cleanPhone}`,
      notes: notes.trim(),
      mode,
    });

    let messageToSend = '';

    // 2. Determine message content based on mode
    if (customMessage && customMessage.trim().length > 0) {
      messageToSend = customMessage.trim();
    } else if (mode === 'automated') {
      const template = tenant?.automatedTemplate || settings.automatedTemplate;
      messageToSend = template
        .replace(/\{\{name\}\}/gi, contact.name)
        .replace(/\{\{phone\}\}/gi, cleanPhone)
        .replace(/\{\{businessName\}\}/gi, tenant?.name || settings.businessName);
    } else {
      // AI Chatbot Mode - Generate introductory welcome
      const aiResponse = await generateGeminiReply({
        customerMessage: `Hello, I am ${contact.name}. I just registered on your website with phone ${cleanPhone}. Please introduce yourself, welcome me warmly to ${tenant?.name || settings.businessName}, and ask how you can help me today.`,
        systemPrompt: tenant?.geminiSystemPrompt || settings.geminiSystemPrompt,
        contactName: contact.name,
        customApiKey: tenant?.geminiApiKey,
      });
      messageToSend = aiResponse.text;
    }

    // 3. Dispatch message via WhatsApp Cloud API with tenant's specific credentials
    const waResult = await sendWhatsAppTextMessage(
      cleanPhone,
      messageToSend,
      {
        token: tenant?.whatsappToken,
        phoneNumberId: tenant?.phoneNumberId,
      }
    );

    // 4. Record message in store
    const recordedMessage = await addMessage({
      tenantId: tenant?.id,
      contactPhone: cleanPhone,
      sender: mode === 'ai_chatbot' ? 'bot' : 'agent',
      mode,
      text: messageToSend,
      status: waResult.success ? 'sent' : 'failed',
      waMessageId: waResult.messageId,
      error: waResult.error,
    });

    return NextResponse.json({
      success: true,
      tenant,
      contact,
      message: recordedMessage,
      whatsappApiStatus: waResult,
      notice: waResult.success
        ? `Message sent successfully via WhatsApp Cloud API from ${tenant?.name || 'Business'} to +${cleanPhone}`
        : `Message logged in CRM, but WhatsApp Cloud API send failed: ${waResult.error}`,
    });
  } catch (err: any) {
    console.error('API /send-message error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
