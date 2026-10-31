import { WhatsAppSendResult } from './types';

const GRAPH_API_BASE = 'https://graph.facebook.com';

export function cleanWhatsAppToken(token: string): string {
  if (!token) return '';
  let cleaned = token.trim();
  // Fix accidental duplicate 'E' at the start (e.g. EEAAS... -> EAAS...)
  if (cleaned.startsWith('EEAA')) {
    cleaned = cleaned.substring(1);
  }
  // Meta tokens typically terminate at 'ZDZD'
  const zdzdIdx = cleaned.indexOf('ZDZD');
  if (zdzdIdx !== -1 && cleaned.length > zdzdIdx + 4) {
    cleaned = cleaned.substring(0, zdzdIdx + 4);
  }
  return cleaned;
}

export function getWhatsAppConfig() {
  const configuredVerifyToken = process.env.WHATSAPP_VERIFY_TOKEN?.trim();
  return {
    token: cleanWhatsAppToken(process.env.WHATSAPP_TOKEN || ''),
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID?.trim() || '',
    wabaId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID?.trim() || '',
    verifyToken: configuredVerifyToken || 'v2Bfr7BVfZAkIiYP5G5rZBFukMKYvejXTV9XmcbNL28y2yT',
    apiVersion: process.env.WHATSAPP_API_VERSION?.trim() || 'v21.0',
  };
}

/**
 * Clean phone number to digits only, ensuring country code prefix.
 */
export function formatPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  // If user entered 10 digits without country code (e.g., standard Indian mobile 9876543210), prepend 91 default or return cleaned
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }
  return cleaned;
}

/**
 * Send a plain text message to a client via WhatsApp Cloud API
 */
export async function sendWhatsAppTextMessage(
  recipientPhone: string,
  text: string,
  options?: {
    token?: string;
    phoneNumberId?: string;
    apiVersion?: string;
  }
): Promise<WhatsAppSendResult> {
  const defaultConfig = getWhatsAppConfig();
  const token = cleanWhatsAppToken(options?.token || defaultConfig.token);
  const phoneNumberId = options?.phoneNumberId?.trim() || defaultConfig.phoneNumberId;
  const apiVersion = options?.apiVersion?.trim() || defaultConfig.apiVersion;

  const formattedPhone = formatPhoneNumber(recipientPhone);

  if (!token || !phoneNumberId) {
    return {
      success: false,
      error: 'WhatsApp credentials missing. Please set WHATSAPP_TOKEN and WHATSAPP_PHONE_NUMBER_ID in .env',
    };
  }

  const endpoint = `${GRAPH_API_BASE}/${apiVersion}/${phoneNumberId}/messages`;

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: formattedPhone,
    type: 'text',
    text: {
      preview_url: false,
      body: text,
    },
  };

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      const errorMsg = data?.error?.message || data?.error?.error_user_msg || res.statusText;
      const errorType = data?.error?.type;
      const errorCode = data?.error?.code;

      let guidance = '';
      if (errorCode === 190) {
        guidance = ' (Access token has expired or is invalid. Generate a new token in Meta Developer Portal)';
      } else if (errorCode === 131030) {
        guidance = ' (Recipient phone number is not registered in Meta Sandbox test phone numbers list)';
      } else if (errorCode === 131047) {
        guidance = ' (Re-engagement message: Client has not messaged you in 24 hours. Send a Meta-approved Template message first)';
      }

      console.error('WhatsApp API Error:', data);
      return {
        success: false,
        error: `${errorMsg}${guidance}`,
        details: data.error,
      };
    }

    const messageId = data?.messages?.[0]?.id;
    return {
      success: true,
      messageId,
      details: data,
    };
  } catch (err: any) {
    console.error('Fetch exception sending WhatsApp message:', err);
    return {
      success: false,
      error: err.message || 'Network error communicating with WhatsApp Cloud API',
    };
  }
}

/**
 * Mark a message as read in WhatsApp
 */
export async function markWhatsAppMessageAsRead(messageId: string): Promise<boolean> {
  const { token, phoneNumberId, apiVersion } = getWhatsAppConfig();
  if (!token || !phoneNumberId || !messageId) return false;

  try {
    await fetch(`${GRAPH_API_BASE}/${apiVersion}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId,
      }),
    });
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Diagnostic test to verify WhatsApp API credentials
 */
export async function testWhatsAppConnection(): Promise<{
  connected: boolean;
  message: string;
  accountDetails?: any;
}> {
  const { token, phoneNumberId, apiVersion } = getWhatsAppConfig();

  if (!token) {
    return {
      connected: false,
      message: 'WHATSAPP_TOKEN is not configured in .env',
    };
  }

  if (!phoneNumberId) {
    return {
      connected: false,
      message: 'WHATSAPP_PHONE_NUMBER_ID is not configured in .env',
    };
  }

  try {
    const res = await fetch(`${GRAPH_API_BASE}/${apiVersion}/${phoneNumberId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        connected: false,
        message: data?.error?.message || 'Failed to authenticate with Meta Graph API',
      };
    }

    return {
      connected: true,
      message: `Successfully connected! Phone: ${data.display_phone_number || data.id} (${data.verified_name || 'Verified'})`,
      accountDetails: data,
    };
  } catch (err: any) {
    return {
      connected: false,
      message: err.message || 'Network error reaching Meta API',
    };
  }
}
