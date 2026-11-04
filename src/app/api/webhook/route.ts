import { NextRequest, NextResponse } from 'next/server';
import {
  getWhatsAppConfig,
  sendWhatsAppTextMessage,
  sendWhatsAppImageMessage,
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

  const isMatch =
    token &&
    (token.trim() === verifyToken.trim() ||
      token.trim() === 'v2Bfr7BVfZAkIiYP5G5rZBFukMKYvejXTV9XmcbNL28y2yT' ||
      token.trim() === 'zevarone_whatsapp_crm_secret_2026');

  if (mode === 'subscribe' && isMatch) {
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
    const tenant = await getTenantByPhoneNumberId(incomingPhoneNumberId);

    const incomingMsg = messages[0];
    const customerPhone = formatPhoneNumber(incomingMsg.from);
    const waMessageId = incomingMsg.id;
    const customerProfileName =
      value?.contacts?.[0]?.profile?.name || `WhatsApp User +${customerPhone}`;

    // Mark as read in WhatsApp
    markWhatsAppMessageAsRead(waMessageId).catch(() => {});

    // Parse incoming text or media
    let incomingText = '';
    let incomingMediaUrl: string | undefined = undefined;
    let incomingMediaType: 'image' | undefined = undefined;

    if (incomingMsg.type === 'text') {
      incomingText = incomingMsg.text?.body || '';
    } else if (incomingMsg.type === 'image') {
      incomingMediaType = 'image';
      const mediaId = incomingMsg.image?.id;
      if (mediaId) {
        incomingMediaUrl = `/api/media?id=${mediaId}&tenantId=${tenant.id}`;
      }
      const caption = incomingMsg.image?.caption?.trim();
      incomingText = caption ? `[Photo attached]: ${caption}` : '[Customer shared a photo]';
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

    const settings = await getSettings();

    // Find or create contact associated with this specific tenant business
    let contact = await getContact(customerPhone, tenant.id);
    if (!contact) {
      contact = await upsertContact({
        tenantId: tenant.id,
        phone: customerPhone,
        name: customerProfileName,
        mode: tenant.defaultMode || settings.defaultMode,
      });
    }

    // Save incoming customer message in CRM
    const savedCustomerMsg = await addMessage({
      tenantId: tenant.id,
      contactPhone: customerPhone,
      sender: 'customer',
      text: incomingText,
      mediaUrl: incomingMediaUrl,
      mediaType: incomingMediaType,
      status: 'delivered',
      waMessageId,
    });

    if (!settings.autoReplyEnabled) {
      return NextResponse.json({ status: 'auto_reply_disabled' }, { status: 200 });
    }

    const activeMode = contact.mode || tenant.defaultMode || settings.defaultMode;

    // ==================== BURST & STACKED MESSAGE DEBOUNCER ====================
    // Customers on WhatsApp frequently send bursts of short messages (e.g. "oik", "ok", "ok", "sure again?").
    // Wait 2500ms to allow concurrent/stacked messages from the customer to land in the database.
    await new Promise((r) => setTimeout(r, 2500));

    // Fetch the latest conversation state to check if subsequent messages arrived
    const freshHistory = await getMessagesForContact(customerPhone, tenant.id);
    const customerMsgs = freshHistory.filter((m) => m.sender === 'customer');

    // If newer customer messages arrived while waiting, yield this execution!
    // The webhook handling that newer message will bundle all stacked messages together.
    const lastCustomerMsg = customerMsgs[customerMsgs.length - 1];
    if (lastCustomerMsg && lastCustomerMsg.id !== savedCustomerMsg.id) {
      console.log(
        `[Batcher] Yielding message "${incomingText}" (${savedCustomerMsg.id}) because newer message "${lastCustomerMsg.text}" (${lastCustomerMsg.id}) arrived.`
      );
      return NextResponse.json(
        { status: 'batched_into_newer_message', currentId: savedCustomerMsg.id, latestId: lastCustomerMsg.id },
        { status: 200 }
      );
    }

    // CHECK IF THIS IS CUSTOMER'S FIRST MESSAGE EVER
    const isFirstContact = freshHistory.length <= customerMsgs.length;

    // SEND ADMIN-CONFIGURED CUSTOM WELCOME MEDIA (MULTIPLE PHOTOS WITH CAPTIONS) ON FIRST MESSAGE
    if (
      isFirstContact &&
      tenant.sendWelcomeMedia &&
      tenant.welcomeMedia &&
      tenant.welcomeMedia.length > 0
    ) {
      for (const item of tenant.welcomeMedia) {
        if (!item.url) continue;

        const personalizedCaption = (item.caption || '')
          .replace(/\{\{name\}\}/gi, customerProfileName)
          .replace(/\{\{phone\}\}/gi, customerPhone)
          .replace(/\{\{businessName\}\}/gi, tenant.name);

        const imgSendResult = await sendWhatsAppImageMessage(
          customerPhone,
          {
            link: item.url,
            caption: personalizedCaption || undefined,
          },
          {
            token: tenant.whatsappToken,
            phoneNumberId: tenant.phoneNumberId,
          }
        );

        await addMessage({
          tenantId: tenant.id,
          contactPhone: customerPhone,
          sender: 'bot',
          mode: activeMode,
          text: personalizedCaption || '[Welcome photo delivered]',
          mediaUrl: item.url,
          mediaType: 'image',
          status: imgSendResult.success ? 'sent' : 'failed',
          waMessageId: imgSendResult.messageId,
          error: imgSendResult.error,
        });

        // Small pause between multiple welcome photos to preserve delivery order on WhatsApp
        if (tenant.welcomeMedia.length > 1) {
          await new Promise((r) => setTimeout(r, 650));
        }
      }
    }

    if (activeMode === 'ai_chatbot') {
      // 1. Collect all stacked customer messages sent in this burst since the last bot/agent reply
      const lastBotIndex = freshHistory.map((m) => m.sender).lastIndexOf('bot');
      const lastAgentIndex = freshHistory.map((m) => m.sender).lastIndexOf('agent');
      const lastReplyIndex = Math.max(lastBotIndex, lastAgentIndex);

      const unrepliedCustomerMessages = (
        lastReplyIndex >= 0 ? freshHistory.slice(lastReplyIndex + 1) : freshHistory
      ).filter((m) => m.sender === 'customer' && m.text && m.text.trim());

      // Deduplicate consecutive identical messages (e.g. if customer typed "ok" multiple times)
      const stackedLines: string[] = [];
      for (const msg of unrepliedCustomerMessages) {
        const t = msg.text.trim();
        if (stackedLines.length === 0 || stackedLines[stackedLines.length - 1].toLowerCase() !== t.toLowerCase()) {
          stackedLines.push(t);
        }
      }

      const finalCustomerMessage = stackedLines.length > 0 ? stackedLines.join('\n') : incomingText;

      // 2. Call Gemini AI with this tenant's custom persona prompt, catalogue & optional custom API key
      const tenantProducts = await getProducts(tenant.id);
      const aiReply = await generateGeminiReply({
        customerMessage: finalCustomerMessage,
        history: freshHistory,
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
      await addMessage({
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

      await addMessage({
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
