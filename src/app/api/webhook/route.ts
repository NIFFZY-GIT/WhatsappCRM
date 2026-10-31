import { NextRequest, NextResponse } from 'next/server';
import {
  getWhatsAppConfig,
  sendWhatsAppTextMessage,
  markWhatsAppMessageAsRead,
  formatPhoneNumber,
} from '@/lib/whatsapp';
import {
  upsertContact,
  addMessage,
  getContact,
  getMessagesForContact,
  getSettings,
  getTenantByPhoneNumberId,
  getProducts,
} from '@/lib/store';
import { generateGeminiReply } from '@/lib/gemini';

/**
 * Webhook Verification Handler (GET)
 * Meta calls this endpoint when configuring Webhook in Meta App Dashboard
 */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const { verifyToken } = getWhatsAppConfig();

  console.log('Meta Webhook Challenge Request:', {
    mode,
    receivedToken: token,
    expectedToken: verifyToken,
    hasChallenge: Boolean(challenge),
  });

  if (mode === 'subscribe' && token && token.trim() === verifyToken.trim()) {
    console.log('WhatsApp Webhook successfully verified by Meta challenge!');
    return new Response(challenge || '', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  console.warn('WhatsApp Webhook verification failed. Token mismatch.');
  return new Response('Forbidden: Verification token mismatch', { status: 403 });
}

/**
 * Incoming Message Webhook Handler (POST)
 * Supports Multi-Tenant: Routes by incoming phone_number_id to the exact business tenant!
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.object !== 'whatsapp_business_account') {
      return NextResponse.json({ status: 'ignored' }, { status: 200 });
    }

    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    const messages = value?.messages;
    if (!messages || messages.length === 0) {
      return NextResponse.json({ status: 'no_messages' }, { status: 200 });
    }

    // MULTI-TENANT RESOLUTION: Find which client business received this message!
    const incomingPhoneNumberId = value?.metadata?.phone_number_id;
    const tenant = getTenantByPhoneNumberId(incomingPhoneNumberId);

    const incomingMsg = messages[0];
    const customerPhone = formatPhoneNumber(incomingMsg.from);
    const waMessageId = incomingMsg.id;
    const customerProfileName =
      value?.contacts?.[0]?.profile?.name || `WhatsApp User +${customerPhone}`;

    // Mark as read in WhatsApp
    markWhatsAppMessageAsRead(waMessageId).catch(() => {});

    // Parse incoming text
    let incomingText = '';
    if (incomingMsg.type === 'text') {
      incomingText = incomingMsg.text?.body || '';
    } else if (incomingMsg.type === 'button') {
      incomingText = incomingMsg.button?.text || '';
    } else if (incomingMsg.type === 'interactive') {
      incomingText =
        incomingMsg.interactive?.button_reply?.title ||
        incomingMsg.interactive?.list_reply?.title ||
        'Interactive selection';
    } else {
      incomingText = `[Received ${incomingMsg.type} message]`;
    }

    const settings = getSettings();

    // Find or create contact associated with this specific tenant business
    let contact = getContact(customerPhone, tenant.id);
    if (!contact) {
      contact = upsertContact({
        tenantId: tenant.id,
        phone: customerPhone,
        name: customerProfileName,
        mode: tenant.defaultMode || settings.defaultMode,
      });
    }

    // Save incoming customer message in CRM
    addMessage({
      tenantId: tenant.id,
      contactPhone: customerPhone,
      sender: 'customer',
      text: incomingText,
      status: 'delivered',
      waMessageId,
    });

    if (!settings.autoReplyEnabled) {
      return NextResponse.json({ status: 'auto_reply_disabled' }, { status: 200 });
    }

    const activeMode = contact.mode || tenant.defaultMode || settings.defaultMode;

    if (activeMode === 'ai_chatbot') {
      // 1. Fetch conversation history for this tenant
      const history = getMessagesForContact(customerPhone, tenant.id);

      // 2. Call Gemini AI with this tenant's custom persona prompt, catalogue & optional custom API key
      const tenantProducts = getProducts(tenant.id);
      const aiReply = await generateGeminiReply({
        customerMessage: incomingText,
        history,
        systemPrompt: tenant.geminiSystemPrompt || settings.geminiSystemPrompt,
        contactName: contact.name,
        customApiKey: tenant.geminiApiKey,
        products: tenantProducts,
      });

      // 3. Send AI response back using this tenant's WhatsApp credentials
      const waSendResult = await sendWhatsAppTextMessage(
        customerPhone,
        aiReply.text,
        {
          token: tenant.whatsappToken,
          phoneNumberId: tenant.phoneNumberId,
        }
      );

      // 4. Save Bot response
      addMessage({
        tenantId: tenant.id,
        contactPhone: customerPhone,
        sender: 'bot',
        mode: 'ai_chatbot',
        text: aiReply.text,
        status: waSendResult.success ? 'sent' : 'failed',
        waMessageId: waSendResult.messageId,
        error: waSendResult.error,
      });
    } else if (activeMode === 'automated') {
      // Automated canned response
      const template = tenant.automatedTemplate || settings.automatedTemplate;
      const autoReplyText = template
        .replace(/\{\{name\}\}/gi, contact.name)
        .replace(/\{\{phone\}\}/gi, customerPhone)
        .replace(/\{\{businessName\}\}/gi, tenant.name || settings.businessName);

      const waSendResult = await sendWhatsAppTextMessage(
        customerPhone,
        autoReplyText,
        {
          token: tenant.whatsappToken,
          phoneNumberId: tenant.phoneNumberId,
        }
      );

      addMessage({
        tenantId: tenant.id,
        contactPhone: customerPhone,
        sender: 'bot',
        mode: 'automated',
        text: autoReplyText,
        status: waSendResult.success ? 'sent' : 'failed',
        waMessageId: waSendResult.messageId,
        error: waSendResult.error,
      });
    }

    return NextResponse.json({ status: 'processed', tenant: tenant.name }, { status: 200 });
  } catch (err: any) {
    console.error('Webhook POST processing error:', err);
    return NextResponse.json({ error: err.message }, { status: 200 });
  }
}
