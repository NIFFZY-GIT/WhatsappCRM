import fs from 'fs';
import path from 'path';
import { Contact, ChatMessage, AppSettings, Tenant, ProductItem, BotMode, UserAccount } from './types';
import { getSupabase } from './supabase';

const DATA_DIR = path.join(process.cwd(), '.data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

interface StoreData {
  tenants: Tenant[];
  products: ProductItem[];
  contacts: Contact[];
  messages: ChatMessage[];
  settings: AppSettings;
  users?: UserAccount[];
}

const DEFAULT_SETTINGS: AppSettings = {
  defaultMode: 'ai_chatbot',
  businessName: 'Zevarone Group',
  automatedTemplate:
    'Hello {{name}}! 👋 Thank you for connecting with {{businessName}}.\n\nWe have received your message and our team will assist you shortly.\n\nReply anytime to speak with our AI agent or request human sales assistance!',
  geminiSystemPrompt:
    'You are a professional, helpful, and courteous AI assistant. Answer inquiries, share exact prices and specs from the catalogue, and notify human agents when needed.',
  geminiModel: 'gemini-flash-lite-latest',
  autoReplyEnabled: true,
};

const INITIAL_TENANTS: Tenant[] = [
  {
    id: 'tenant_zevarone',
    name: 'Zevarone Luxury Jewellers',
    slug: 'zevarone',
    whatsappNumber: '+94 77 228 4950',
    phoneNumberId: '1409984342191428',
    geminiSystemPrompt:
      'You are the AI concierge for Zevarone Luxury Fine Jewelry. You answer inquiries about gold, diamonds, bridal collections, custom jewelry crafting, and appointments with a polite, sophisticated tone.',
    automatedTemplate:
      'Hello {{name}}! 💎 Welcome to Zevarone Luxury Jewelry. We have received your inquiry and our styling consultant will connect with you shortly.\n\nBrowse catalog: https://zevarone.com',
    defaultMode: 'ai_chatbot',
    createdAt: new Date().toISOString(),
    isActive: true,
  },
  {
    id: 'tenant_techhub',
    name: 'TechHub Electronics',
    slug: 'techhub',
    whatsappNumber: '+91 98765 00010',
    phoneNumberId: '',
    geminiSystemPrompt:
      'You are the AI sales assistant for "TechHub Electronics". You answer customer inquiries about iPhones, Apple MacBooks, iPads, and accessories with instant, accurate prices and stock availability from our catalogue.',
    automatedTemplate:
      'Hello {{name}}! 📱 Welcome to TechHub Electronics. How can we help you today with smartphones or laptops?\n\nAsk me about any device or type "human" for agent assistance!',
    defaultMode: 'ai_chatbot',
    createdAt: new Date().toISOString(),
    isActive: true,
  },
];

const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: 'prod_solitaire_ring',
    tenantId: 'tenant_zevarone',
    name: '18K White Gold Solitaire Diamond Ring (1.0 Carat)',
    price: '$2,450 (₹1,85,000)',
    category: 'Rings',
    inStock: true,
    description: 'Certified GIA VVS1 round brilliant cut diamond mounted on handcrafted 18k white gold band.',
  },
  {
    id: 'prod_iphone15_128',
    tenantId: 'tenant_techhub',
    name: 'Apple iPhone 15 (128GB)',
    price: '$799 (₹74,900)',
    category: 'Smartphones',
    inStock: true,
    description: 'A16 Bionic chip, Dynamic Island, 48MP main camera, USB-C. Colors: Black, Blue, Green, Yellow, Pink.',
  },
];

/* ==================== LOCAL FILE STORE HELPERS ==================== */

function ensureLocalStore(): StoreData {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(STORE_FILE)) {
      const initial: StoreData = {
        tenants: INITIAL_TENANTS,
        products: INITIAL_PRODUCTS,
        contacts: [],
        messages: [],
        settings: DEFAULT_SETTINGS,
      };
      fs.writeFileSync(STORE_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const content = fs.readFileSync(STORE_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    return {
      tenants: parsed.tenants && parsed.tenants.length > 0 ? parsed.tenants : INITIAL_TENANTS,
      products: parsed.products && parsed.products.length > 0 ? parsed.products : INITIAL_PRODUCTS,
      contacts: parsed.contacts || [],
      messages: parsed.messages || [],
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
      users: parsed.users || [],
    };
  } catch (err) {
    return {
      tenants: INITIAL_TENANTS,
      products: INITIAL_PRODUCTS,
      contacts: [],
      messages: [],
      settings: DEFAULT_SETTINGS,
      users: [],
    };
  }
}

function saveLocalStore(data: StoreData): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving local store:', err);
  }
}

/* ==================== TENANTS (CLIENT BUSINESSES) ==================== */

export function parseTenantRow(t: any): Tenant {
  let automatedTemplate = t.automated_template || t.automatedTemplate || '';
  let welcomeMedia = t.welcome_media || t.welcomeMedia || [];
  let sendWelcomeMedia = t.send_welcome_media ?? t.sendWelcomeMedia ?? (welcomeMedia.length > 0);

  if (automatedTemplate.startsWith('__WELCOME_MEDIA__:')) {
    try {
      const newlineIdx = automatedTemplate.indexOf('\n\n');
      if (newlineIdx !== -1) {
        const jsonStr = automatedTemplate.substring('__WELCOME_MEDIA__:'.length, newlineIdx);
        const parsed = JSON.parse(jsonStr);
        welcomeMedia = parsed.media || [];
        sendWelcomeMedia = parsed.enabled ?? true;
        automatedTemplate = automatedTemplate.substring(newlineIdx + 2);
      }
    } catch (e) {}
  }

  return {
    id: t.id,
    name: t.name,
    slug: t.slug,
    whatsappNumber: t.whatsapp_number || t.whatsappNumber || '',
    phoneNumberId: t.phone_number_id || t.phoneNumberId || '',
    whatsappToken: t.whatsapp_token || t.whatsappToken || '',
    geminiApiKey: t.gemini_api_key || t.geminiApiKey || '',
    geminiSystemPrompt: t.gemini_system_prompt || t.geminiSystemPrompt || '',
    automatedTemplate,
    defaultMode: t.default_mode || t.defaultMode || 'ai_chatbot',
    welcomeMedia,
    sendWelcomeMedia,
    createdAt: t.created_at || t.createdAt,
    isActive: t.is_active ?? t.isActive ?? true,
  };
}

export async function getTenants(): Promise<Tenant[]> {
  const supabase = getSupabase();
  let tenantList: Tenant[] = [];

  if (supabase) {
    try {
      const { data, error } = await supabase.from('tenants').select('*').order('created_at', { ascending: true });
      if (!error && data && data.length > 0) {
        tenantList = data.map(parseTenantRow);
      }
    } catch (e) {
      console.warn('Supabase getTenants error, using local fallback:', e);
    }
  }

  if (tenantList.length === 0) {
    const local = ensureLocalStore();
    tenantList = local.tenants.map(parseTenantRow);
  }

  // Auto-sync: Guarantee that every registered user's business tenant is included
  try {
    const users = await getUsers();
    const existingIds = new Set(tenantList.map((t) => t.id));

    for (const u of users) {
      if (u.tenantId && !existingIds.has(u.tenantId)) {
        const bName = u.businessName || `${u.name}'s Business`;
        const slug =
          bName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') ||
          `tenant-${Date.now()}`;

        const autoTenant: Tenant = {
          id: u.tenantId,
          name: bName,
          slug,
          whatsappNumber: '',
          phoneNumberId: '',
          whatsappToken: '',
          geminiApiKey: '',
          geminiSystemPrompt: `You are the AI Sales & Support Concierge for ${bName}. Be professional, warm, and helpful.`,
          defaultMode: 'ai_chatbot',
          automatedTemplate: `Hello {{name}}! Welcome to ${bName}. How can we assist you today?`,
          welcomeMedia: [],
          sendWelcomeMedia: false,
          createdAt: u.createdAt || new Date().toISOString(),
          isActive: true,
        };

        tenantList.push(autoTenant);
        existingIds.add(u.tenantId);

        // Persist missing tenant to Supabase so it permanently exists
        if (supabase) {
          Promise.resolve(
            supabase.from('tenants').upsert({
              id: autoTenant.id,
              name: autoTenant.name,
              slug: autoTenant.slug,
              whatsapp_number: autoTenant.whatsappNumber,
              phone_number_id: autoTenant.phoneNumberId,
              gemini_system_prompt: autoTenant.geminiSystemPrompt,
              automated_template: autoTenant.automatedTemplate,
              default_mode: autoTenant.defaultMode,
              is_active: autoTenant.isActive,
            })
          ).catch(() => {});
        }
      }
    }
  } catch (err) {
    console.warn('Error syncing users to tenants:', err);
  }

  return tenantList;
}

export async function getTenant(idOrSlug: string): Promise<Tenant | undefined> {
  const tenants = await getTenants();
  return tenants.find((t) => t.id === idOrSlug || t.slug === idOrSlug);
}

export async function getTenantByPhoneNumberId(phoneNumberId?: string): Promise<Tenant> {
  const tenants = await getTenants();
  if (phoneNumberId) {
    const match = tenants.find((t) => t.phoneNumberId && t.phoneNumberId.trim() === phoneNumberId.trim());
    if (match) return match;
  }
  return tenants.find((t) => t.isActive) || tenants[0] || INITIAL_TENANTS[0];
}

export async function upsertTenant(tenantData: Partial<Tenant> & { name: string }): Promise<Tenant> {
  const slug =
    tenantData.slug ||
    tenantData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const id = tenantData.id || 'tenant_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
  const now = new Date().toISOString();

  // Encode welcomeMedia into automated_template for persistent multi-platform storage
  let storedAutomatedTemplate = tenantData.automatedTemplate || `Hello {{name}}! Welcome to ${tenantData.name}.`;
  if (tenantData.welcomeMedia && tenantData.welcomeMedia.length > 0) {
    const metaHeader = `__WELCOME_MEDIA__:${JSON.stringify({
      media: tenantData.welcomeMedia,
      enabled: tenantData.sendWelcomeMedia ?? true,
    })}\n\n`;
    storedAutomatedTemplate = metaHeader + storedAutomatedTemplate;
  }

  const supabase = getSupabase();
  if (supabase) {
    try {
      const row = {
        id,
        name: tenantData.name,
        slug,
        whatsapp_number: tenantData.whatsappNumber || '',
        phone_number_id: tenantData.phoneNumberId || '',
        whatsapp_token: tenantData.whatsappToken || '',
        gemini_api_key: tenantData.geminiApiKey || '',
        gemini_system_prompt: tenantData.geminiSystemPrompt || `You are the helpful AI assistant for ${tenantData.name}.`,
        automated_template: storedAutomatedTemplate,
        default_mode: tenantData.defaultMode || 'ai_chatbot',
        is_active: tenantData.isActive ?? true,
      };

      const { error: upsertErr } = await supabase.from('tenants').upsert(row);
      if (upsertErr) {
        console.error('Supabase upsertTenant error:', upsertErr);
      }
    } catch (e) {
      console.error('Supabase upsertTenant exception:', e);
    }
  }

  // Also update user's businessName if owner is registered with this tenantId
  try {
    const users = await getUsers();
    const owner = users.find((u) => u.tenantId === id);
    if (owner && owner.businessName !== tenantData.name) {
      await upsertUser({ ...owner, businessName: tenantData.name });
    }
  } catch (err) {
    console.warn('Failed to sync businessName to user account:', err);
  }

  // Update local file store as sync fallback
  const local = ensureLocalStore();
  const idx = local.tenants.findIndex((t) => t.id === id || t.slug === slug);
  const tenantObj: Tenant = {
    id,
    name: tenantData.name,
    slug,
    whatsappNumber: tenantData.whatsappNumber || '',
    phoneNumberId: tenantData.phoneNumberId || '',
    whatsappToken: tenantData.whatsappToken || '',
    geminiApiKey: tenantData.geminiApiKey || '',
    geminiSystemPrompt: tenantData.geminiSystemPrompt || `You are the helpful AI assistant for ${tenantData.name}.`,
    automatedTemplate: tenantData.automatedTemplate || `Hello {{name}}! Welcome to ${tenantData.name}.`,
    defaultMode: tenantData.defaultMode || 'ai_chatbot',
    welcomeMedia: tenantData.welcomeMedia || [],
    sendWelcomeMedia: tenantData.sendWelcomeMedia ?? true,
    createdAt: now,
    isActive: tenantData.isActive ?? true,
  };

  if (idx >= 0) {
    local.tenants[idx] = { ...local.tenants[idx], ...tenantObj };
  } else {
    local.tenants.push(tenantObj);
  }
  saveLocalStore(local);
  return tenantObj;
}

export async function deleteTenant(id: string): Promise<boolean> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('tenants').delete().eq('id', id);
    } catch (e) {
      console.error(e);
    }
  }
  const local = ensureLocalStore();
  const index = local.tenants.findIndex((t) => t.id === id);
  if (index >= 0 && local.tenants.length > 1) {
    local.tenants.splice(index, 1);
    saveLocalStore(local);
    return true;
  }
  return false;
}

/* ==================== PRODUCTS CATALOGUE ==================== */

export async function getProducts(tenantId?: string): Promise<ProductItem[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      let query = supabase.from('products').select('*').order('created_at', { ascending: false });
      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }
      const { data, error } = await query;
      if (!error && data) {
        return data.map((p: any) => ({
          id: p.id,
          tenantId: p.tenant_id,
          name: p.name,
          price: p.price,
          category: p.category,
          inStock: p.in_stock,
          description: p.description,
        }));
      }
    } catch (e) {
      console.warn('Supabase getProducts error, fallback to local:', e);
    }
  }

  const local = ensureLocalStore();
  if (tenantId) {
    return local.products.filter((p) => p.tenantId === tenantId);
  }
  return local.products;
}

export async function upsertProduct(product: Partial<ProductItem> & { name: string; price: string; tenantId: string }): Promise<ProductItem> {
  const id = product.id || 'prod_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);

  const supabase = getSupabase();
  if (supabase) {
    try {
      const row = {
        id,
        tenant_id: product.tenantId,
        name: product.name,
        price: product.price,
        category: product.category || 'General',
        in_stock: product.inStock ?? true,
        description: product.description || '',
      };
      await supabase.from('products').upsert(row);
    } catch (e) {
      console.error('Supabase upsertProduct error:', e);
    }
  }

  const local = ensureLocalStore();
  const existingIndex = local.products.findIndex((p) => p.id === id);
  const prodObj: ProductItem = {
    id,
    tenantId: product.tenantId,
    name: product.name,
    price: product.price,
    category: product.category || 'General',
    inStock: product.inStock ?? true,
    description: product.description || '',
  };

  if (existingIndex >= 0) {
    local.products[existingIndex] = prodObj;
  } else {
    local.products.push(prodObj);
  }
  saveLocalStore(local);
  return prodObj;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('products').delete().eq('id', id);
    } catch (e) {
      console.error(e);
    }
  }
  const local = ensureLocalStore();
  const index = local.products.findIndex((p) => p.id === id);
  if (index >= 0) {
    local.products.splice(index, 1);
    saveLocalStore(local);
    return true;
  }
  return false;
}

/* ==================== CONTACTS / LEADS ==================== */

export async function getContacts(tenantId?: string): Promise<Contact[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      let query = supabase.from('contacts').select('*').order('last_message_at', { ascending: false });
      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }
      const { data, error } = await query;
      if (!error && data) {
        return data.map((c: any) => ({
          id: c.id,
          tenantId: c.tenant_id,
          phone: c.phone,
          name: c.name,
          notes: c.notes,
          mode: c.mode,
          status: c.status,
          createdAt: c.created_at,
          lastMessageAt: c.last_message_at,
          unreadCount: c.unread_count,
          needsHumanAssistance: c.needs_human_assistance,
          assignedAgent: c.assigned_agent,
          tags: c.tags,
        }));
      }
    } catch (e) {
      console.warn('Supabase getContacts error, fallback to local:', e);
    }
  }

  const local = ensureLocalStore();
  let list = local.contacts;
  if (tenantId) {
    list = list.filter((c) => c.tenantId === tenantId);
  }
  return list.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
}

export async function getContact(phone: string, tenantId?: string): Promise<Contact | undefined> {
  const cleanPhone = phone.replace(/\D/g, '');
  const contacts = await getContacts(tenantId);
  return contacts.find((c) => c.phone.replace(/\D/g, '') === cleanPhone);
}

export async function upsertContact(contactData: Partial<Contact> & { phone: string; tenantId?: string }): Promise<Contact> {
  const cleanPhone = contactData.phone.replace(/\D/g, '');
  const activeTenantId = contactData.tenantId || 'tenant_zevarone';
  const now = new Date().toISOString();

  const existing = await getContact(cleanPhone, activeTenantId);
  const id = existing?.id || 'cnt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);

  const contactObj: Contact = {
    id,
    tenantId: activeTenantId,
    phone: cleanPhone,
    name: contactData.name || existing?.name || `Client +${cleanPhone}`,
    notes: contactData.notes ?? existing?.notes ?? '',
    mode: contactData.mode || existing?.mode || 'ai_chatbot',
    status: contactData.status || existing?.status || 'active',
    createdAt: existing?.createdAt || now,
    lastMessageAt: contactData.lastMessageAt || now,
    unreadCount: contactData.unreadCount ?? existing?.unreadCount ?? 0,
    needsHumanAssistance: contactData.needsHumanAssistance ?? existing?.needsHumanAssistance ?? false,
    assignedAgent: contactData.assignedAgent ?? existing?.assignedAgent ?? '',
    tags: contactData.tags ?? existing?.tags ?? [],
  };

  const supabase = getSupabase();
  if (supabase) {
    try {
      const row = {
        id,
        tenant_id: activeTenantId,
        phone: cleanPhone,
        name: contactObj.name,
        notes: contactObj.notes,
        mode: contactObj.mode,
        status: contactObj.status,
        last_message_at: contactObj.lastMessageAt,
        unread_count: contactObj.unreadCount,
        needs_human_assistance: contactObj.needsHumanAssistance,
        assigned_agent: contactObj.assignedAgent,
        tags: contactObj.tags,
      };
      await supabase.from('contacts').upsert(row, { onConflict: 'tenant_id,phone' });
    } catch (e) {
      console.error('Supabase upsertContact error:', e);
    }
  }

  // Update local
  const local = ensureLocalStore();
  const idx = local.contacts.findIndex((c) => c.phone.replace(/\D/g, '') === cleanPhone && c.tenantId === activeTenantId);
  if (idx >= 0) {
    local.contacts[idx] = contactObj;
  } else {
    local.contacts.push(contactObj);
  }
  saveLocalStore(local);
  return contactObj;
}

export async function setContactHumanAssistance(phone: string, needsHuman: boolean, tenantId?: string): Promise<void> {
  const cleanPhone = phone.replace(/\D/g, '');
  const activeTenantId = tenantId || 'tenant_zevarone';

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase
        .from('contacts')
        .update({ needs_human_assistance: needsHuman })
        .eq('phone', cleanPhone)
        .eq('tenant_id', activeTenantId);
    } catch (e) {
      console.error(e);
    }
  }

  const local = ensureLocalStore();
  const contact = local.contacts.find((c) => c.phone.replace(/\D/g, '') === cleanPhone && (!tenantId || c.tenantId === tenantId));
  if (contact) {
    contact.needsHumanAssistance = needsHuman;
    saveLocalStore(local);
  }
}

/* ==================== MESSAGES ==================== */

export function parseStoredMessage(m: any): ChatMessage {
  let text = m.text || '';
  let mediaUrl = m.media_url || m.mediaUrl;
  let mediaType = m.media_type || m.mediaType;

  if (text.startsWith('__MEDIA__:')) {
    try {
      const parsed = JSON.parse(text.substring('__MEDIA__:'.length));
      mediaUrl = parsed.url;
      mediaType = parsed.type || 'image';
      text = parsed.text || '';
    } catch (e) {}
  } else if (text.startsWith('[IMAGE:')) {
    const match = text.match(/^\[IMAGE:\s*([^\]]+)\]\s*([\s\S]*)$/);
    if (match) {
      mediaUrl = match[1].trim();
      mediaType = 'image';
      text = match[2]?.trim() || '';
    }
  }

  return {
    id: m.id,
    tenantId: m.tenant_id || m.tenantId,
    contactPhone: m.contact_phone || m.contactPhone,
    sender: m.sender,
    mode: m.mode,
    text,
    mediaUrl,
    mediaType,
    timestamp: m.timestamp,
    status: m.status,
    waMessageId: m.wa_message_id || m.waMessageId,
    error: m.error,
  };
}

export async function addMessage(msg: Omit<ChatMessage, 'id' | 'timestamp'> & { tenantId?: string }): Promise<ChatMessage> {
  const cleanPhone = msg.contactPhone.replace(/\D/g, '');
  const activeTenantId = msg.tenantId || 'tenant_zevarone';
  const id = 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
  const now = new Date().toISOString();

  const newMsg: ChatMessage = {
    ...msg,
    id,
    tenantId: activeTenantId,
    contactPhone: cleanPhone,
    timestamp: now,
  };

  const lowerText = (msg.text || '').toLowerCase();
  const humanTrigger =
    lowerText.includes('talk to human') ||
    lowerText.includes('speak to human') ||
    lowerText.includes('human agent') ||
    lowerText.includes('sales rep') ||
    lowerText.includes('real person') ||
    lowerText.includes('call me') ||
    lowerText.includes('speak with someone') ||
    lowerText.includes('human assistance');

  const supabase = getSupabase();
  if (supabase) {
    try {
      // If message contains media, encode in text for safe Supabase schema compatibility
      const storedText = msg.mediaUrl
        ? `__MEDIA__:${JSON.stringify({ url: msg.mediaUrl, type: msg.mediaType || 'image', text: msg.text || '' })}`
        : msg.text || '';

      const row = {
        id,
        tenant_id: activeTenantId,
        contact_phone: cleanPhone,
        sender: msg.sender,
        mode: msg.mode || 'ai_chatbot',
        text: storedText,
        timestamp: now,
        status: msg.status || 'delivered',
        wa_message_id: msg.waMessageId || null,
        error: msg.error || null,
      };
      await supabase.from('messages').insert(row);
    } catch (e) {
      console.error('Supabase addMessage error:', e);
    }
  }

  // Update contact last message
  await upsertContact({
    tenantId: activeTenantId,
    phone: cleanPhone,
    lastMessageAt: now,
    needsHumanAssistance: msg.sender === 'customer' && humanTrigger ? true : msg.sender === 'agent' ? false : undefined,
  });

  const local = ensureLocalStore();
  local.messages.push(newMsg);
  saveLocalStore(local);
  return newMsg;
}

export async function getMessagesForContact(phone: string, tenantId?: string): Promise<ChatMessage[]> {
  const cleanPhone = phone.replace(/\D/g, '');
  const activeTenantId = tenantId || 'tenant_zevarone';

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('contact_phone', cleanPhone)
        .eq('tenant_id', activeTenantId)
        .order('timestamp', { ascending: true });

      if (!error && data) {
        return data.map(parseStoredMessage);
      }
    } catch (e) {
      console.warn('Supabase getMessages error, fallback to local:', e);
    }
  }

  const local = ensureLocalStore();
  return local.messages
    .filter((m) => m.contactPhone.replace(/\D/g, '') === cleanPhone && (!tenantId || m.tenantId === tenantId))
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map(parseStoredMessage);
}

export async function deleteConversation(phone: string, tenantId?: string): Promise<boolean> {
  const cleanPhone = phone.replace(/\D/g, '');
  const activeTenantId = tenantId || 'tenant_zevarone';

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase
        .from('messages')
        .delete()
        .eq('contact_phone', cleanPhone)
        .eq('tenant_id', activeTenantId);

      await supabase
        .from('contacts')
        .delete()
        .eq('phone', cleanPhone)
        .eq('tenant_id', activeTenantId);
    } catch (e) {
      console.error('Supabase deleteConversation error:', e);
    }
  }

  const local = ensureLocalStore();
  local.messages = local.messages.filter(
    (m) => !(m.contactPhone.replace(/\D/g, '') === cleanPhone && (!tenantId || m.tenantId === tenantId))
  );
  local.contacts = local.contacts.filter(
    (c) => !(c.phone.replace(/\D/g, '') === cleanPhone && (!tenantId || c.tenantId === tenantId))
  );
  saveLocalStore(local);
  return true;
}

export async function clearAllConversations(tenantId?: string): Promise<boolean> {
  const activeTenantId = tenantId || 'tenant_zevarone';
  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('messages').delete().eq('tenant_id', activeTenantId);
      await supabase.from('contacts').delete().eq('tenant_id', activeTenantId);
    } catch (e) {
      console.error('Supabase clearAllConversations error:', e);
    }
  }

  const local = ensureLocalStore();
  local.messages = local.messages.filter((m) => tenantId && m.tenantId !== tenantId);
  local.contacts = local.contacts.filter((c) => tenantId && c.tenantId !== tenantId);
  saveLocalStore(local);
  return true;
}

export async function markContactRead(phone: string, tenantId?: string): Promise<void> {
  const cleanPhone = phone.replace(/\D/g, '');
  const activeTenantId = tenantId || 'tenant_zevarone';

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('contacts').update({ unread_count: 0 }).eq('phone', cleanPhone).eq('tenant_id', activeTenantId);
    } catch (e) {
      console.error(e);
    }
  }

  const local = ensureLocalStore();
  const contact = local.contacts.find((c) => c.phone.replace(/\D/g, '') === cleanPhone && (!tenantId || c.tenantId === tenantId));
  if (contact && contact.unreadCount && contact.unreadCount > 0) {
    contact.unreadCount = 0;
    saveLocalStore(local);
  }
}

/* ==================== GLOBAL SETTINGS ==================== */

export async function getSettings(): Promise<AppSettings> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('settings').select('*').eq('id', 1).single();
      if (!error && data) {
        return {
          defaultMode: data.default_mode,
          automatedTemplate: data.automated_template,
          businessName: data.business_name,
          geminiSystemPrompt: data.gemini_system_prompt,
          geminiModel: data.gemini_model,
          autoReplyEnabled: data.auto_reply_enabled,
        };
      }
    } catch (e) {
      console.warn('Supabase getSettings error:', e);
    }
  }
  const local = ensureLocalStore();
  return local.settings;
}

export async function updateSettings(newSettings: Partial<AppSettings>): Promise<AppSettings> {
  const local = ensureLocalStore();
  local.settings = { ...local.settings, ...newSettings };
  saveLocalStore(local);

  const supabase = getSupabase();
  if (supabase) {
    try {
      const row = {
        id: 1,
        default_mode: local.settings.defaultMode,
        automated_template: local.settings.automatedTemplate,
        business_name: local.settings.businessName,
        gemini_system_prompt: local.settings.geminiSystemPrompt,
        gemini_model: local.settings.geminiModel,
        auto_reply_enabled: local.settings.autoReplyEnabled,
        updated_at: new Date().toISOString(),
      };
      await supabase.from('settings').upsert(row);
    } catch (e) {
      console.error('Supabase updateSettings error:', e);
    }
  }

  return local.settings;
}

/* ==================== USERS & SUBSCRIPTION ==================== */

const SUPABASE_USERS_STORE_ID = 888;

export async function getUsers(): Promise<UserAccount[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('automated_template')
        .eq('id', SUPABASE_USERS_STORE_ID)
        .maybeSingle();

      if (!error && data?.automated_template) {
        try {
          const parsed = JSON.parse(data.automated_template);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Also sync local memory store
            const local = ensureLocalStore();
            local.users = parsed;
            saveLocalStore(local);
            return parsed;
          }
        } catch (e) {
          console.warn('Failed to parse Supabase users store JSON:', e);
        }
      }
    } catch (err) {
      console.warn('Supabase getUsers error, falling back to local store:', err);
    }
  }

  const local = ensureLocalStore();
  return local.users || [];
}

export async function getUserByEmail(email: string): Promise<UserAccount | undefined> {
  const users = await getUsers();
  const cleanEmail = email.toLowerCase().trim();
  return users.find((u) => u.email.toLowerCase().trim() === cleanEmail);
}

export async function getUserById(id: string): Promise<UserAccount | undefined> {
  const users = await getUsers();
  return users.find((u) => u.id === id);
}

export async function upsertUser(user: Partial<UserAccount> & { email: string; name: string }): Promise<UserAccount> {
  const cleanEmail = user.email.toLowerCase().trim();
  const currentUsers = await getUsers();
  const existingIdx = currentUsers.findIndex((u) => u.email.toLowerCase().trim() === cleanEmail);

  const now = new Date().toISOString();
  const userObj: UserAccount = {
    id: user.id || currentUsers[existingIdx]?.id || 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    email: cleanEmail,
    passwordHash: user.passwordHash || currentUsers[existingIdx]?.passwordHash || '',
    name: user.name || currentUsers[existingIdx]?.name || 'User',
    businessName: user.businessName || currentUsers[existingIdx]?.businessName || 'My Business',
    tenantId: user.tenantId || currentUsers[existingIdx]?.tenantId || 'tenant_zevarone',
    role: user.role || currentUsers[existingIdx]?.role || 'owner',
    subscriptionStatus: user.subscriptionStatus || currentUsers[existingIdx]?.subscriptionStatus || 'inactive',
    subscriptionPlan: user.subscriptionPlan || currentUsers[existingIdx]?.subscriptionPlan || 'Monthly Premium (5,000 LKR)',
    stripeCustomerId: user.stripeCustomerId || currentUsers[existingIdx]?.stripeCustomerId,
    stripeSessionId: user.stripeSessionId || currentUsers[existingIdx]?.stripeSessionId,
    createdAt: currentUsers[existingIdx]?.createdAt || now,
  };

  let updatedUsers: UserAccount[];
  if (existingIdx >= 0) {
    updatedUsers = [...currentUsers];
    updatedUsers[existingIdx] = { ...currentUsers[existingIdx], ...userObj };
  } else {
    updatedUsers = [...currentUsers, userObj];
  }

  // 1. Save to Supabase Cloud for multi-instance Vercel persistence
  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('settings').upsert({
        id: SUPABASE_USERS_STORE_ID,
        business_name: 'ZEVARONE_USERS_STORE',
        automated_template: JSON.stringify(updatedUsers),
        gemini_system_prompt: 'ZEVARONE_USERS_STORE',
        gemini_model: 'v1',
        auto_reply_enabled: true,
        default_mode: 'ai_chatbot',
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.error('Supabase upsertUser error:', e);
    }
  }

  // 2. Save to local store fallback
  const local = ensureLocalStore();
  local.users = updatedUsers;
  saveLocalStore(local);

  return userObj;
}

export async function getUserByStripeCustomerId(customerId: string): Promise<UserAccount | undefined> {
  const users = await getUsers();
  return users.find((u) => u.stripeCustomerId === customerId);
}

export async function updateUserSubscription(
  userIdOrEmail: string,
  status: 'active' | 'inactive' | 'trial',
  stripeData?: {
    customerId?: string;
    subscriptionId?: string;
    sessionId?: string;
    plan?: string;
    billingInterval?: 'monthly' | 'annual';
    subscriptionExpiresAt?: string;
    cancelAtPeriodEnd?: boolean;
    cancellationReason?: string;
    cancellationFeedback?: string;
    cancelledAt?: string;
  }
): Promise<UserAccount | undefined> {
  const currentUsers = await getUsers();
  const idx = currentUsers.findIndex(
    (u) => u.id === userIdOrEmail || u.email.toLowerCase().trim() === userIdOrEmail.toLowerCase().trim()
  );

  if (idx >= 0) {
    const updatedUsers = [...currentUsers];
    updatedUsers[idx].subscriptionStatus = status;
    if (stripeData?.customerId) updatedUsers[idx].stripeCustomerId = stripeData.customerId;
    if (stripeData?.subscriptionId) updatedUsers[idx].stripeSubscriptionId = stripeData.subscriptionId;
    if (stripeData?.sessionId) updatedUsers[idx].stripeSessionId = stripeData.sessionId;
    if (stripeData?.plan) updatedUsers[idx].subscriptionPlan = stripeData.plan;
    if (stripeData?.billingInterval) updatedUsers[idx].billingInterval = stripeData.billingInterval;
    if (stripeData?.subscriptionExpiresAt) updatedUsers[idx].subscriptionExpiresAt = stripeData.subscriptionExpiresAt;
    if (stripeData?.cancelAtPeriodEnd !== undefined) {
      updatedUsers[idx].cancelAtPeriodEnd = stripeData.cancelAtPeriodEnd;
      if (stripeData.cancelAtPeriodEnd === false) {
        delete updatedUsers[idx].cancellationReason;
        delete updatedUsers[idx].cancellationFeedback;
        delete updatedUsers[idx].cancelledAt;
      }
    }
    if (stripeData?.cancellationReason !== undefined) updatedUsers[idx].cancellationReason = stripeData.cancellationReason;
    if (stripeData?.cancellationFeedback !== undefined) updatedUsers[idx].cancellationFeedback = stripeData.cancellationFeedback;
    if (stripeData?.cancelledAt !== undefined) updatedUsers[idx].cancelledAt = stripeData.cancelledAt;

    // Save to Supabase
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('settings').upsert({
          id: SUPABASE_USERS_STORE_ID,
          business_name: 'ZEVARONE_USERS_STORE',
          automated_template: JSON.stringify(updatedUsers),
          gemini_system_prompt: 'ZEVARONE_USERS_STORE',
          gemini_model: 'v1',
          auto_reply_enabled: true,
          default_mode: 'ai_chatbot',
          updated_at: new Date().toISOString(),
        });
      } catch (e) {
        console.error('Supabase updateUserSubscription error:', e);
      }
    }

    const local = ensureLocalStore();
    local.users = updatedUsers;
    saveLocalStore(local);
    return updatedUsers[idx];
  }
  return undefined;
}

/* ==================== ZEVARONE MASTER ADMIN MONITORING ==================== */

export async function getClientWorkspacesSummary() {
  const tenants = await getTenants();
  const users = await getUsers();
  const allContacts = await getContacts();
  const local = ensureLocalStore();
  const allMessages = local.messages || [];

  return tenants.map((tenant) => {
    // Find tenant owner
    const owner = users.find((u) => u.tenantId === tenant.id);
    const tenantContacts = allContacts.filter((c) => c.tenantId === tenant.id);
    const tenantMessages = allMessages.filter((m) => m.tenantId === tenant.id);
    const aiHandled = tenantMessages.filter((m) => m.sender === 'bot').length;
    const humanHandled = tenantMessages.filter((m) => m.sender === 'agent').length;

    // Last activity
    let lastActivityAt = tenant.createdAt;
    if (tenantMessages.length > 0) {
      const sorted = [...tenantMessages].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      lastActivityAt = sorted[0].timestamp;
    } else if (tenantContacts.length > 0) {
      const sorted = [...tenantContacts].sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
      lastActivityAt = sorted[0].lastMessageAt;
    }

    return {
      tenant,
      owner,
      totalContacts: tenantContacts.length,
      totalMessages: tenantMessages.length,
      aiHandledMessages: aiHandled,
      humanHandledMessages: humanHandled,
      lastActivityAt,
    };
  });
}

export async function overrideClientSubscription(
  tenantId: string,
  status: 'active' | 'inactive' | 'trial',
  plan?: string
): Promise<UserAccount | undefined> {
  const users = await getUsers();
  const owner = users.find((u) => u.tenantId === tenantId);
  if (!owner) return undefined;

  return updateUserSubscription(owner.id, status, {
    plan: plan || (status === 'active' ? 'Zevarone Admin Override (Active)' : 'Inactive'),
    subscriptionExpiresAt: status === 'active' ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : undefined,
  });
}
