export type BotMode = 'automated' | 'ai_chatbot';

export interface ProductItem {
  id: string;
  tenantId: string;
  name: string;
  price: string;
  category?: string;
  inStock: boolean;
  description: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  whatsappNumber: string;
  phoneNumberId?: string;
  whatsappToken?: string;
  geminiApiKey?: string;
  geminiSystemPrompt: string;
  automatedTemplate: string;
  defaultMode: BotMode;
  createdAt: string;
  isActive: boolean;
}

export interface Contact {
  id: string;
  tenantId?: string;
  phone: string;
  name: string;
  notes?: string;
  mode: BotMode;
  status: 'active' | 'archived';
  createdAt: string;
  lastMessageAt: string;
  unreadCount?: number;
  needsHumanAssistance?: boolean;
  assignedAgent?: string;
  tags?: string[];
}

export interface ChatMessage {
  id: string;
  tenantId?: string;
  contactPhone: string;
  sender: 'customer' | 'bot' | 'agent' | 'system';
  mode?: BotMode;
  text: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read' | 'failed';
  waMessageId?: string;
  error?: string;
}

export interface Conversation {
  contact: Contact;
  messages: ChatMessage[];
}

export interface AppSettings {
  defaultMode: BotMode;
  automatedTemplate: string;
  businessName: string;
  geminiSystemPrompt: string;
  geminiModel: string;
  autoReplyEnabled: boolean;
}

export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  details?: any;
}
