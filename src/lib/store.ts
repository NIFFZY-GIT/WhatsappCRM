import fs from 'fs';
import path from 'path';
import { Contact, ChatMessage, AppSettings, Tenant, ProductItem, BotMode } from './types';

const DATA_DIR = path.join(process.cwd(), '.data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

interface StoreData {
  tenants: Tenant[];
  products: ProductItem[];
  contacts: Contact[];
  messages: ChatMessage[];
  settings: AppSettings;
}

const DEFAULT_SETTINGS: AppSettings = {
  defaultMode: 'ai_chatbot',
  businessName: 'TechHub & Zevarone Group',
  automatedTemplate:
    'Hello {{name}}! 👋 Thank you for connecting with {{businessName}}.\n\nWe have received your message and our team will assist you shortly.\n\nReply anytime to speak with our AI agent or request human sales assistance!',
  geminiSystemPrompt:
    'You are a professional, helpful, and courteous AI sales assistant. Answer product inquiries, share exact prices and specs from the catalogue, and notify human agents when needed.',
  geminiModel: 'gemini-3.8-flash',
  autoReplyEnabled: true,
};

const INITIAL_TENANTS: Tenant[] = [
  {
    id: 'tenant_techhub',
    name: 'TechHub Electronics',
    slug: 'techhub',
    whatsappNumber: '+91 98765 00010',
    phoneNumberId: '',
    geminiSystemPrompt:
      'You are the AI sales assistant for "TechHub Electronics". You answer customer inquiries about iPhones, Apple MacBooks, iPads, and accessories with instant, accurate prices and stock availability from our catalogue. If the customer requests human assistance, to negotiate a deal, or to speak to a manager, notify them that a sales rep is being alerted.',
    automatedTemplate:
      'Hello {{name}}! 📱 Welcome to TechHub Electronics. How can we help you today with smartphones, laptops, or accessories?\n\nAsk me about any device or type "human" for agent assistance!',
    defaultMode: 'ai_chatbot',
    createdAt: new Date().toISOString(),
    isActive: true,
  },
  {
    id: 'tenant_zevarone',
    name: 'Zevarone Luxury Jewellers',
    slug: 'zevarone',
    whatsappNumber: '+91 98765 00001',
    phoneNumberId: '',
    geminiSystemPrompt:
      'You are the AI concierge for Zevarone Luxury Fine Jewelry. You answer inquiries about gold, diamonds, bridal collections, custom jewelry crafting, and appointments with a polite, sophisticated tone.',
    automatedTemplate:
      'Hello {{name}}! 💎 Welcome to Zevarone Luxury Jewelry. We have received your inquiry and our styling consultant will connect with you shortly.\n\nBrowse catalog: https://zevarone.com',
    defaultMode: 'ai_chatbot',
    createdAt: new Date().toISOString(),
    isActive: true,
  },
  {
    id: 'tenant_apex_realty',
    name: 'Apex Prime Real Estate',
    slug: 'apex-realty',
    whatsappNumber: '+91 98765 00002',
    phoneNumberId: '',
    geminiSystemPrompt:
      'You are the AI sales assistant for Apex Prime Real Estate. You assist clients looking for luxury apartments, commercial office spaces, and villa plots. Help them schedule property viewings.',
    automatedTemplate:
      'Hi {{name}}! 🏡 Thank you for your interest in Apex Prime Real Estate. A dedicated property specialist will contact you with brochure details shortly.',
    defaultMode: 'automated',
    createdAt: new Date().toISOString(),
    isActive: true,
  },
];

const INITIAL_PRODUCTS: ProductItem[] = [
  // TechHub Products
  {
    id: 'prod_iphone15_128',
    tenantId: 'tenant_techhub',
    name: 'Apple iPhone 15 (128GB)',
    price: '$799 (₹74,900)',
    category: 'Smartphones',
    inStock: true,
    description: 'A16 Bionic chip, Dynamic Island, 48MP main camera, USB-C. Colors: Black, Blue, Green, Yellow, Pink.',
  },
  {
    id: 'prod_iphone15_pro',
    tenantId: 'tenant_techhub',
    name: 'Apple iPhone 15 Pro (256GB)',
    price: '$999 (₹1,24,900)',
    category: 'Smartphones',
    inStock: true,
    description: 'Titanium design, A17 Pro chip, Action button, 48MP pro camera system with 3x Telephoto.',
  },
  {
    id: 'prod_macbook_air_m3',
    tenantId: 'tenant_techhub',
    name: 'MacBook Air 13" (M3, 16GB, 512GB)',
    price: '$1,299 (₹1,34,900)',
    category: 'Laptops',
    inStock: true,
    description: 'Blazing-fast M3 chip, Liquid Retina display, up to 18 hours battery life, MagSafe charging.',
  },
  {
    id: 'prod_airpods_pro',
    tenantId: 'tenant_techhub',
    name: 'Apple AirPods Pro (2nd Gen with USB-C)',
    price: '$249 (₹24,900)',
    category: 'Audio',
    inStock: true,
    description: 'Active Noise Cancellation, Transparency mode, Personalized Spatial Audio, MagSafe Case.',
  },

  // Zevarone Products
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
    id: 'prod_bridal_necklace',
    tenantId: 'tenant_zevarone',
    name: '22K Royal Kundan Bridal Choker Set',
    price: '$4,800 (₹3,60,000)',
    category: 'Necklaces',
    inStock: true,
    description: 'Pure 22K gold intricate Kundan work with Russian emerald drops and matching chandelier earrings.',
  },
];

function ensureStoreExists(): StoreData {
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
    };
  } catch (err) {
    console.error('Error reading store file:', err);
    return {
      tenants: INITIAL_TENANTS,
      products: INITIAL_PRODUCTS,
      contacts: [],
      messages: [],
      settings: DEFAULT_SETTINGS,
    };
  }
}

function saveStore(data: StoreData): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving store file:', err);
  }
}

/* ==================== PRODUCTS CATALOGUE ==================== */

export function getProducts(tenantId?: string): ProductItem[] {
  const data = ensureStoreExists();
  if (tenantId) {
    return data.products.filter((p) => p.tenantId === tenantId);
  }
  return data.products;
}

export function upsertProduct(product: Partial<ProductItem> & { name: string; price: string; tenantId: string }): ProductItem {
  const data = ensureStoreExists();
  const existingIndex = data.products.findIndex((p) => product.id && p.id === product.id);

  if (existingIndex >= 0) {
    const updated: ProductItem = {
      ...data.products[existingIndex],
      ...product,
    };
    data.products[existingIndex] = updated;
    saveStore(data);
    return updated;
  } else {
    const created: ProductItem = {
      id: product.id || 'prod_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      tenantId: product.tenantId,
      name: product.name,
      price: product.price,
      category: product.category || 'General',
      inStock: product.inStock ?? true,
      description: product.description || '',
    };
    data.products.push(created);
    saveStore(data);
    return created;
  }
}

export function deleteProduct(id: string): boolean {
  const data = ensureStoreExists();
  const index = data.products.findIndex((p) => p.id === id);
  if (index >= 0) {
    data.products.splice(index, 1);
    saveStore(data);
    return true;
  }
  return false;
}

/* ==================== TENANTS ==================== */

export function getTenants(): Tenant[] {
  const data = ensureStoreExists();
  return data.tenants;
}

export function getTenant(idOrSlug: string): Tenant | undefined {
  const data = ensureStoreExists();
  return data.tenants.find((t) => t.id === idOrSlug || t.slug === idOrSlug);
}

export function getTenantByPhoneNumberId(phoneNumberId?: string): Tenant {
  const data = ensureStoreExists();
  if (phoneNumberId) {
    const match = data.tenants.find(
      (t) => t.phoneNumberId && t.phoneNumberId.trim() === phoneNumberId.trim()
    );
    if (match) return match;
  }
  return data.tenants.find((t) => t.isActive) || data.tenants[0] || INITIAL_TENANTS[0];
}

export function upsertTenant(tenantData: Partial<Tenant> & { name: string }): Tenant {
  const data = ensureStoreExists();
  const slug =
    tenantData.slug ||
    tenantData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const existingIndex = data.tenants.findIndex(
    (t) => (tenantData.id && t.id === tenantData.id) || t.slug === slug
  );

  const now = new Date().toISOString();

  if (existingIndex >= 0) {
    const updated: Tenant = {
      ...data.tenants[existingIndex],
      ...tenantData,
      slug,
    };
    data.tenants[existingIndex] = updated;
    saveStore(data);
    return updated;
  } else {
    const created: Tenant = {
      id: tenantData.id || 'tenant_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: tenantData.name,
      slug,
      whatsappNumber: tenantData.whatsappNumber || '',
      phoneNumberId: tenantData.phoneNumberId || '',
      whatsappToken: tenantData.whatsappToken || '',
      geminiApiKey: tenantData.geminiApiKey || '',
      geminiSystemPrompt:
        tenantData.geminiSystemPrompt ||
        `You are the helpful AI assistant for ${tenantData.name}. Assist customers promptly, politely, and effectively.`,
      automatedTemplate:
        tenantData.automatedTemplate ||
        `Hello {{name}}! Welcome to ${tenantData.name}. We have received your message and will assist you shortly!`,
      defaultMode: tenantData.defaultMode || 'ai_chatbot',
      createdAt: now,
      isActive: tenantData.isActive ?? true,
    };
    data.tenants.push(created);
    saveStore(data);
    return created;
  }
}

export function deleteTenant(id: string): boolean {
  const data = ensureStoreExists();
  const index = data.tenants.findIndex((t) => t.id === id);
  if (index >= 0 && data.tenants.length > 1) {
    data.tenants.splice(index, 1);
    saveStore(data);
    return true;
  }
  return false;
}

/* ==================== SETTINGS ==================== */

export function getSettings(): AppSettings {
  const data = ensureStoreExists();
  return data.settings;
}

export function updateSettings(newSettings: Partial<AppSettings>): AppSettings {
  const data = ensureStoreExists();
  data.settings = { ...data.settings, ...newSettings };
  saveStore(data);
  return data.settings;
}

/* ==================== CONTACTS ==================== */

export function getContacts(tenantId?: string): Contact[] {
  const data = ensureStoreExists();
  let list = data.contacts;
  if (tenantId) {
    list = list.filter((c) => c.tenantId === tenantId);
  }
  return list.sort(
    (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  );
}

export function getContact(phone: string, tenantId?: string): Contact | undefined {
  const data = ensureStoreExists();
  const cleanPhone = phone.replace(/\D/g, '');
  return data.contacts.find(
    (c) =>
      c.phone.replace(/\D/g, '') === cleanPhone &&
      (!tenantId || c.tenantId === tenantId)
  );
}

export function upsertContact(
  contactData: Partial<Contact> & { phone: string; tenantId?: string }
): Contact {
  const data = ensureStoreExists();
  const cleanPhone = contactData.phone.replace(/\D/g, '');
  const activeTenantId = contactData.tenantId || data.tenants[0]?.id || 'tenant_default';

  const existingIndex = data.contacts.findIndex(
    (c) =>
      c.phone.replace(/\D/g, '') === cleanPhone &&
      c.tenantId === activeTenantId
  );

  const now = new Date().toISOString();

  if (existingIndex >= 0) {
    const updated: Contact = {
      ...data.contacts[existingIndex],
      ...contactData,
      phone: cleanPhone,
      tenantId: activeTenantId,
      lastMessageAt: contactData.lastMessageAt || now,
    };
    data.contacts[existingIndex] = updated;
    saveStore(data);
    return updated;
  } else {
    const tenant = data.tenants.find((t) => t.id === activeTenantId);
    const created: Contact = {
      id: 'cnt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      tenantId: activeTenantId,
      phone: cleanPhone,
      name: contactData.name || `Client +${cleanPhone}`,
      notes: contactData.notes || '',
      mode: contactData.mode || tenant?.defaultMode || data.settings.defaultMode,
      status: 'active',
      createdAt: now,
      lastMessageAt: now,
      unreadCount: 0,
      needsHumanAssistance: contactData.needsHumanAssistance ?? false,
    };
    data.contacts.push(created);
    saveStore(data);
    return created;
  }
}

export function setContactHumanAssistance(phone: string, needsHuman: boolean, tenantId?: string): void {
  const data = ensureStoreExists();
  const cleanPhone = phone.replace(/\D/g, '');
  const contact = data.contacts.find(
    (c) => c.phone.replace(/\D/g, '') === cleanPhone && (!tenantId || c.tenantId === tenantId)
  );
  if (contact) {
    contact.needsHumanAssistance = needsHuman;
    saveStore(data);
  }
}

/* ==================== MESSAGES ==================== */

export function addMessage(
  msg: Omit<ChatMessage, 'id' | 'timestamp'> & { tenantId?: string }
): ChatMessage {
  const data = ensureStoreExists();
  const cleanPhone = msg.contactPhone.replace(/\D/g, '');
  const activeTenantId = msg.tenantId || data.tenants[0]?.id || 'tenant_default';

  const newMsg: ChatMessage = {
    ...msg,
    tenantId: activeTenantId,
    contactPhone: cleanPhone,
    id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    timestamp: new Date().toISOString(),
  };

  data.messages.push(newMsg);

  // Check if message demands human takeover:
  const lowerText = msg.text.toLowerCase();
  const humanTrigger =
    lowerText.includes('talk to human') ||
    lowerText.includes('speak to human') ||
    lowerText.includes('human agent') ||
    lowerText.includes('sales rep') ||
    lowerText.includes('real person') ||
    lowerText.includes('call me') ||
    lowerText.includes('speak with someone') ||
    lowerText.includes('human assistance');

  // Update contact's lastMessageAt and unread count
  const contact = data.contacts.find(
    (c) => c.phone.replace(/\D/g, '') === cleanPhone && c.tenantId === activeTenantId
  );
  if (contact) {
    contact.lastMessageAt = newMsg.timestamp;
    if (msg.sender === 'customer') {
      contact.unreadCount = (contact.unreadCount || 0) + 1;
      if (humanTrigger) {
        contact.needsHumanAssistance = true;
      }
    } else if (msg.sender === 'agent') {
      // If agent manually replied, clear human assistance flag!
      contact.needsHumanAssistance = false;
    }
  } else {
    data.contacts.push({
      id: 'cnt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      tenantId: activeTenantId,
      phone: cleanPhone,
      name: `Client +${cleanPhone}`,
      mode: msg.mode || data.settings.defaultMode,
      status: 'active',
      createdAt: newMsg.timestamp,
      lastMessageAt: newMsg.timestamp,
      unreadCount: msg.sender === 'customer' ? 1 : 0,
      needsHumanAssistance: humanTrigger,
    });
  }

  saveStore(data);
  return newMsg;
}

export function getMessagesForContact(phone: string, tenantId?: string): ChatMessage[] {
  const data = ensureStoreExists();
  const cleanPhone = phone.replace(/\D/g, '');
  return data.messages
    .filter(
      (m) =>
        m.contactPhone.replace(/\D/g, '') === cleanPhone &&
        (!tenantId || m.tenantId === tenantId)
    )
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

export function markContactRead(phone: string, tenantId?: string): void {
  const data = ensureStoreExists();
  const cleanPhone = phone.replace(/\D/g, '');
  const contact = data.contacts.find(
    (c) =>
      c.phone.replace(/\D/g, '') === cleanPhone &&
      (!tenantId || c.tenantId === tenantId)
  );
  if (contact && contact.unreadCount && contact.unreadCount > 0) {
    contact.unreadCount = 0;
    saveStore(data);
  }
}
