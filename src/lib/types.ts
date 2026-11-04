export type BotMode = 'automated' | 'ai_chatbot';

export interface WelcomeMediaItem {
  id: string;
  url: string;
  caption?: string;
}

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
  welcomeMedia?: WelcomeMediaItem[];
  sendWelcomeMedia?: boolean;
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
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'audio' | 'document';
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
  welcomeMedia?: WelcomeMediaItem[];
  sendWelcomeMedia?: boolean;
}

export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  details?: any;
}

export interface UserAccount {
  id: string;
  email: string;
  passwordHash?: string;
  name: string;
  businessName: string;
  tenantId: string;
  role: 'admin' | 'owner' | 'member';
  subscriptionStatus: 'active' | 'inactive' | 'trial';
  subscriptionPlan?: string;
  stripeCustomerId?: string;
  stripeSessionId?: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read?: boolean;
  actionUrl?: string;
  actionLabel?: string;
}
