-- ==============================================================================
-- WhatsApp CRM & Gemini AI Hub — Supabase Database Schema
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

-- 1. Tenants (Client Businesses)
CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  whatsapp_number TEXT DEFAULT '',
  phone_number_id TEXT DEFAULT '',
  whatsapp_token TEXT DEFAULT '',
  gemini_api_key TEXT DEFAULT '',
  gemini_system_prompt TEXT NOT NULL,
  automated_template TEXT NOT NULL,
  default_mode TEXT NOT NULL DEFAULT 'ai_chatbot',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- 2. Products / Catalogue
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  in_stock BOOLEAN DEFAULT TRUE,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Contacts / Leads
CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  name TEXT NOT NULL,
  notes TEXT DEFAULT '',
  mode TEXT NOT NULL DEFAULT 'ai_chatbot',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  unread_count INT DEFAULT 0,
  needs_human_assistance BOOLEAN DEFAULT FALSE,
  assigned_agent TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  CONSTRAINT unique_tenant_phone UNIQUE(tenant_id, phone)
);

-- 4. Messages History
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  contact_phone TEXT NOT NULL,
  sender TEXT NOT NULL, -- 'customer' | 'bot' | 'agent' | 'system'
  mode TEXT,            -- 'automated' | 'ai_chatbot'
  text TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'delivered',
  wa_message_id TEXT,
  error TEXT
);

-- 5. Global Settings
CREATE TABLE IF NOT EXISTS settings (
  id INT PRIMARY KEY DEFAULT 1,
  default_mode TEXT NOT NULL DEFAULT 'ai_chatbot',
  automated_template TEXT NOT NULL,
  business_name TEXT NOT NULL,
  gemini_system_prompt TEXT NOT NULL,
  gemini_model TEXT NOT NULL DEFAULT 'gemini-3.8-flash',
  auto_reply_enabled BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices for rapid lookups
CREATE INDEX IF NOT EXISTS idx_products_tenant ON products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_contacts_tenant ON contacts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_contacts_phone ON contacts(phone);
CREATE INDEX IF NOT EXISTS idx_messages_tenant_contact ON messages(tenant_id, contact_phone);

-- Enable Row Level Security (RLS) but allow service & authenticated access
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access to anon/service for API" ON tenants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to anon/service for API" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to anon/service for API" ON contacts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to anon/service for API" ON messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to anon/service for API" ON settings FOR ALL USING (true) WITH CHECK (true);

-- Seed Initial Default Tenants if empty
INSERT INTO tenants (id, name, slug, whatsapp_number, gemini_system_prompt, automated_template, default_mode)
VALUES 
  (
    'tenant_zevarone', 
    'Zevarone Luxury Jewellers', 
    'zevarone', 
    '+94 77 228 4950', 
    'You are the AI concierge for Zevarone Luxury Fine Jewelry. You answer inquiries about gold, diamonds, bridal collections, custom jewelry crafting, and appointments with a polite, sophisticated tone.',
    'Hello {{name}}! 💎 Welcome to Zevarone Luxury Jewelry. We have received your inquiry and our styling consultant will connect with you shortly.\n\nBrowse catalog: https://zevarone.com',
    'ai_chatbot'
  ),
  (
    'tenant_techhub', 
    'TechHub Electronics', 
    'techhub', 
    '+91 98765 00010', 
    'You are the AI sales assistant for TechHub Electronics. You answer inquiries about iPhones, MacBooks, iPads, and accessories with instant, accurate prices and stock availability from our catalogue.',
    'Hello {{name}}! 📱 Welcome to TechHub Electronics. How can we help you today with smartphones or laptops?\n\nAsk me about any device or type "human" for agent assistance!',
    'ai_chatbot'
  )
ON CONFLICT (id) DO NOTHING;

-- Seed Sample Products
INSERT INTO products (id, tenant_id, name, price, category, in_stock, description)
VALUES
  ('prod_iphone15_128', 'tenant_techhub', 'Apple iPhone 15 (128GB)', '$799 (₹74,900)', 'Smartphones', true, 'A16 Bionic chip, Dynamic Island, 48MP main camera. Colors: Black, Blue, Green.'),
  ('prod_macbook_m3', 'tenant_techhub', 'MacBook Air 13" (M3, 16GB)', '$1,299', 'Laptops', true, 'Blazing-fast M3 chip, Liquid Retina display, MagSafe charging.'),
  ('prod_solitaire_ring', 'tenant_zevarone', '18K White Gold Solitaire Diamond Ring (1.0ct)', '$2,450', 'Rings', true, 'Certified GIA VVS1 round brilliant cut diamond on 18k white gold band.')
ON CONFLICT (id) DO NOTHING;
