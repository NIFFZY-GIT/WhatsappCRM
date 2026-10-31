import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChatMessage, ProductItem } from './types';

export function getGeminiApiKey(): string {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_GEMINI_API_KEY ||
    ''
  ).trim();
}

export function getGeminiModelName(): string {
  const envModel = process.env.GEMINI_MODEL?.trim();
  if (envModel && envModel !== 'gemini-3.8-flash' && envModel !== 'gemini-2.5-flash') {
    return envModel;
  }
  return 'gemini-flash-lite-latest';
}

const FALLBACK_MODELS = [
  'gemini-flash-lite-latest',
  'gemini-flash-latest',
  'gemini-2.5-flash-lite',
];

/**
 * Generate an AI response using Google Gemini with automatic model fallback & Product Catalogue context
 */
export async function generateGeminiReply({
  customerMessage,
  history = [],
  systemPrompt,
  contactName,
  customApiKey,
  products = [],
}: {
  customerMessage: string;
  history?: ChatMessage[];
  systemPrompt?: string;
  contactName?: string;
  customApiKey?: string;
  products?: ProductItem[];
}): Promise<{ text: string; error?: string }> {
  const apiKey = customApiKey?.trim() || getGeminiApiKey();

  if (!apiKey) {
    return {
      text: 'Thank you for connecting with us! Our AI assistant is currently being configured. A customer specialist will assist you shortly.',
      error: 'GEMINI_API_KEY is missing in .env',
    };
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const preferredModel = getGeminiModelName();
  const modelsToTry = [preferredModel, ...FALLBACK_MODELS.filter((m) => m !== preferredModel)];

  // Build catalogue context
  let catalogueContext = '';
  if (products && products.length > 0) {
    catalogueContext = `\n\n=== OFFICIAL PRODUCT / SERVICE CATALOGUE & LIVE INVENTORY ===\n${products
      .map(
        (p) =>
          `• Item: ${p.name} | Price: ${p.price} | Stock: ${p.inStock ? 'Available In Stock' : 'Out of Stock'} | Category: ${p.category || 'General'} | Details: ${p.description}`
      )
      .join('\n')}\n\nCATALOGUE INSTRUCTIONS:\n- When a customer asks about a product (e.g. "How much is your iPhone 15?"), find it in the catalogue above and give the exact price, stock status, and key features immediately!\n- If they ask for something not in the catalogue, politely let them know and offer the closest alternative or human agent assistance.\n- If the customer wants to speak to a human or place a custom order, confirm that you have flagged this chat for human sales team takeover.`;
  }

  const basePrompt =
    systemPrompt ||
    `You are the helpful, friendly, and knowledgeable AI concierge. Assist the customer promptly, politely, and effectively. Keep responses concise and formatted nicely for WhatsApp with friendly emojis. The customer's name is "${contactName || 'Valued Client'}".`;

  const finalSystemPrompt = `${basePrompt}${catalogueContext}`;

  const recentMessages = history.slice(-10);
  const formattedHistory = recentMessages
    .filter((m) => m.text && m.text.trim().length > 0)
    .map((m) => ({
      role: m.sender === 'customer' ? 'user' : 'model',
      parts: [{ text: m.text }],
    }));

  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: finalSystemPrompt,
      });

      const chat = model.startChat({
        history: formattedHistory.length > 0 ? formattedHistory : undefined,
      });

      const generatePromise = chat.sendMessage(customerMessage);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout on model ${modelName}`)), 7000)
      );

      const result = await Promise.race([generatePromise, timeoutPromise]);
      const response = await result.response;
      const text = response.text();

      if (text && text.trim().length > 0) {
        return {
          text: text.trim(),
        };
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`Model ${modelName} failed:`, err?.message || err);

      // If error is 402 or 403, trying other models won't help as it's an account/billing issue
      if (
        err?.message?.includes('prepayment') ||
        err?.message?.includes('depleted') ||
        err?.message?.includes('API_KEY_SERVICE_BLOCKED')
      ) {
        break;
      }
    }
  }

  console.error('All Gemini attempts failed:', lastError);

  let friendlyError = lastError?.message || 'Gemini generation error';

  if (lastError?.message?.includes('prepayment') || lastError?.message?.includes('depleted')) {
    friendlyError =
      'Google Cloud Billing issue: Prepayment credits depleted on this project. To use Gemini 100% free without prepaying, create a fresh API key at https://aistudio.google.com/app/apikey inside a new, unbilled project.';
  } else if (
    lastError?.message?.includes('API_KEY_SERVICE_BLOCKED') ||
    lastError?.message?.includes('403 Forbidden')
  ) {
    friendlyError =
      'Generative Language API is blocked or restricted on this project. Generate a fresh key at https://aistudio.google.com/app/apikey in a new project.';
  } else if (lastError?.message?.includes('404')) {
    friendlyError =
      'Model version not found. Update GEMINI_MODEL=gemini-3.8-flash in .env.';
  }

  return {
    text: `Hello ${contactName || 'there'}! Thank you for contacting us. We received your message: "${customerMessage}". An agent will respond shortly!`,
    error: friendlyError,
  };
}

/**
 * Diagnostic test to verify Gemini API key
 */
export async function testGeminiConnection(): Promise<{
  connected: boolean;
  message: string;
}> {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    return {
      connected: false,
      message: 'GEMINI_API_KEY is not configured in .env',
    };
  }

  const preferredModel = getGeminiModelName();
  const modelsToTry = [preferredModel, ...FALLBACK_MODELS.filter((m) => m !== preferredModel)];
  const genAI = new GoogleGenerativeAI(apiKey);

  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Say "Connected!" in 1 word.');
      const text = result.response.text();

      return {
        connected: true,
        message: `Active (${modelName}): "${text.trim().slice(0, 50)}"`,
      };
    } catch (err: any) {
      lastError = err;
      if (
        err?.message?.includes('prepayment') ||
        err?.message?.includes('depleted') ||
        err?.message?.includes('API_KEY_SERVICE_BLOCKED')
      ) {
        break;
      }
    }
  }

  let msg = lastError?.message || 'Failed to authenticate with Gemini API';
  if (lastError?.message?.includes('prepayment') || lastError?.message?.includes('depleted')) {
    msg =
      'Credits depleted: This Google Cloud project has billing enabled with $0 balance. To use Gemini 100% free, create an API key at aistudio.google.com in a new project without linking a billing account.';
  } else if (lastError?.message?.includes('API_KEY_SERVICE_BLOCKED')) {
    msg =
      'Blocked: Generative Language API is restricted. Create an unrestricted key at aistudio.google.com.';
  }

  return {
    connected: false,
    message: msg,
  };
}
