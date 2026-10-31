import { NextRequest, NextResponse } from 'next/server';
import {
  upsertContact,
  addMessage,
  getContact,
  getMessagesForContact,
  getSettings,
  getTenant,
  getTenants,
  getProducts,
} from '@/lib/store';
import { generateGeminiReply } from '@/lib/gemini';
import { formatPhoneNumber } from '@/lib/whatsapp';

/**
 * Simulator Endpoint:
 * Allows user to simulate an incoming message from a client phone number.
 * Triggers the exact same logic as Meta Webhook (Automated response or Gemini AI).
 */
export async function POST(req: NextRequest) {
  try {
    const { phone, message, name, tenantId } = await req.json();

    if (!phone || !message) {
      return NextResponse.json(
        { success: false, error: 'Phone and message are required' },
        { status: 400 }
      );
    }

    const cleanPhone = formatPhoneNumber(phone);
    const settings = getSettings();
    const tenants = getTenants();
    const tenant = (tenantId ? getTenant(tenantId) : null) || tenants[0];

    // 1. Get or create contact
    let contact = getContact(cleanPhone, tenant?.id);
    if (!contact) {
      contact = upsertContact({
        tenantId: tenant?.id,
        phone: cleanPhone,
        name: name || `Simulated Client (+${cleanPhone})`,
        mode: tenant?.defaultMode || settings.defaultMode,
      });
    }

    // 2. Add customer message
    const customerMsg = addMessage({
      tenantId: tenant?.id,
      contactPhone: cleanPhone,
      sender: 'customer',
      text: message.trim(),
      status: 'delivered',
    });

    const activeMode = contact.mode || tenant?.defaultMode || settings.defaultMode;
    let botReplyText = '';

    if (activeMode === 'ai_chatbot') {
      const history = getMessagesForContact(cleanPhone, tenant?.id);
      const tenantProducts = getProducts(tenant?.id);
      const aiResponse = await generateGeminiReply({
        customerMessage: message.trim(),
        history,
        systemPrompt: tenant?.geminiSystemPrompt || settings.geminiSystemPrompt,
        contactName: contact.name,
        customApiKey: tenant?.geminiApiKey,
        products: tenantProducts,
      });
      botReplyText = aiResponse.text;
    } else {
      const template = tenant?.automatedTemplate || settings.automatedTemplate;
      botReplyText = template
        .replace(/\{\{name\}\}/gi, contact.name)
        .replace(/\{\{phone\}\}/gi, cleanPhone)
        .replace(/\{\{businessName\}\}/gi, tenant?.name || settings.businessName);
    }

    // 3. Add bot reply
    const botMsg = addMessage({
      tenantId: tenant?.id,
      contactPhone: cleanPhone,
      sender: 'bot',
      mode: activeMode,
      text: botReplyText,
      status: 'sent',
    });

    return NextResponse.json({
      success: true,
      tenant,
      mode: activeMode,
      customerMessage: customerMsg,
      botReply: botMsg,
    });
  } catch (err: any) {
    console.error('Simulator error:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
