'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useApp } from '@/context/AppContext';
import {
  Sparkles,
  MessageSquare,
  Bot,
  Image as ImageIcon,
  ShoppingBag,
  Send,
  Building2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Zap,
  LogIn,
  CreditCard,
  PhoneCall,
  Clock,
  TrendingUp,
  Headphones,
  Check,
} from 'lucide-react';

export default function LandingPage() {
  const { currentUser } = useApp();

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-[#111B21] flex flex-col font-sans selection:bg-[#008069] selection:text-white">
      {/* 1. TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#E9EDEF] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-[#008069] flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:bg-[#075E54] transition">
              W
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-[#111B21] tracking-tight">
                  ZEVARONE WhatsApp CRM
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E8F5E9] text-[#008069]">
                  AI HUB
                </span>
              </div>
              <p className="text-[11px] text-[#54656F] hidden sm:block">
                Gemini 2.5 AI Sales & Customer Concierge
              </p>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-[#54656F]">
            <a href="#services" className="hover:text-[#008069] transition">
              Our Services
            </a>
            <a href="#gemini-ai" className="hover:text-[#008069] transition">
              Gemini AI
            </a>
            <a href="#welcome-media" className="hover:text-[#008069] transition">
              Media Sequences
            </a>
            <a href="#pricing" className="hover:text-[#008069] transition">
              Pricing (5,000 LKR)
            </a>
            <a href="#faq" className="hover:text-[#008069] transition">
              FAQ
            </a>
          </nav>

          {/* Right Action Buttons: Login and Get Started */}
          <div className="flex items-center gap-2.5">
            {currentUser ? (
              <Link
                href="/inbox"
                className="px-4 py-2 bg-[#008069] hover:bg-[#075E54] text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
              >
                Go to Workspace
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3.5 py-2 text-xs font-bold text-[#111B21] hover:text-[#008069] border border-[#E9EDEF] hover:border-[#008069] bg-white rounded-xl transition flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#54656F]" />
                  Login
                </Link>
                <Link
                  href="/login"
                  className="px-4 py-2 bg-[#008069] hover:bg-[#075E54] text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
                >
                  Get Started
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. HERO ADVERTISEMENT & PROMOTIONAL SECTION */}
      <section className="bg-[#111B21] text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b border-[#202C33]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left 7 Columns: Promotional Pitch & CTAs */}
            <div className="lg:col-span-7 space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#202C33] border border-[#2A3942] text-xs text-[#00A884] font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-[#25D366]" />
                Official Meta Cloud API & Google Gemini 2.5 Flash
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
                Turn Every WhatsApp Chat into an{' '}
                <span className="text-[#25D366]">Automated Sale</span> with 24/7 AI
              </h1>

              {/* Subheadline / Ad Copy */}
              <p className="text-sm sm:text-base text-[#AEBAC1] leading-relaxed max-w-2xl">
                Empower your business with official WhatsApp Business Cloud API. Respond to customers in 2 seconds, send rich welcome photo sequences, showcase product catalogs, and broadcast campaigns — all in one unified CRM for just <strong>5,000 LKR/month</strong>.
              </p>

              {/* HERO ACTION BUTTONS (Login & Get Started) */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Link
                  href="/login"
                  className="px-6 py-3.5 bg-[#00A884] hover:bg-[#008069] text-white text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                >
                  Get Started Now
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/login"
                  className="px-6 py-3.5 bg-[#202C33] hover:bg-[#2A3942] border border-[#2A3942] text-[#E9EDEF] hover:text-white text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4 text-[#8696A0]" />
                  Login to Workspace
                </Link>

                <Link
                  href="/inbox"
                  className="px-4 py-3.5 text-xs text-[#8696A0] hover:text-[#00A884] font-semibold flex items-center justify-center gap-1 transition"
                >
                  Explore Demo Inbox →
                </Link>
              </div>

              {/* Key Metrics Counters */}
              <div className="pt-6 border-t border-[#202C33] grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <div className="text-2xl font-black text-white">2.5s</div>
                  <div className="text-[11px] text-[#8696A0]">AI Response Time</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-[#25D366]">4x</div>
                  <div className="text-[11px] text-[#8696A0]">Sales Conversion</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-white">100%</div>
                  <div className="text-[11px] text-[#8696A0]">Meta API Delivery</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-[#00A884]">5,000</div>
                  <div className="text-[11px] text-[#8696A0]">LKR / Month Flat</div>
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Interactive WhatsApp Chat Simulation Mockup */}
            <div className="lg:col-span-5">
              <div className="bg-[#0B141A] border border-[#202C33] rounded-2xl shadow-2xl overflow-hidden">
                {/* Chat Top Bar */}
                <div className="bg-[#202C33] px-4 py-3 flex items-center justify-between border-b border-[#2A3942]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#008069] text-white flex items-center justify-center font-bold text-xs">
                      Z
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        Zevarone VIP Customer
                        <span className="w-2 h-2 rounded-full bg-[#25D366]" />
                      </div>
                      <div className="text-[10px] text-[#8696A0]">online • Gemini AI Active</div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-[#111B21] text-[#00A884] px-2 py-0.5 rounded font-mono font-bold border border-[#2A3942]">
                    AUTOPILOT
                  </span>
                </div>

                {/* Chat Message Stream */}
                <div className="p-4 space-y-3 bg-[#0B141A] text-xs">
                  {/* Incoming Customer Message */}
                  <div className="flex flex-col items-start max-w-[85%]">
                    <div className="bg-[#202C33] text-[#E9EDEF] rounded-2xl rounded-tl-xs p-3 shadow-xs">
                      <p className="text-xs leading-relaxed">
                        Hi! Do you have the Royal Sapphire Necklace in stock? Can you send me photos and current price in LKR?
                      </p>
                      <span className="text-[10px] text-[#8696A0] block text-right mt-1">10:14 AM</span>
                    </div>
                  </div>

                  {/* AI Instant Media Sequence Response */}
                  <div className="flex flex-col items-end max-w-[90%] ml-auto">
                    <div className="bg-[#005C4B] text-white rounded-2xl rounded-tr-xs p-3 shadow-xs space-y-2">
                      <div className="flex items-center justify-between text-[10px] text-[#A6E3D8] font-bold pb-1 border-b border-[#0A705E]">
                        <span className="flex items-center gap-1">
                          <Bot className="w-3 h-3 text-[#25D366]" />
                          Gemini 2.5 AI Concierge
                        </span>
                        <span>0.8s</span>
                      </div>

                      <p className="text-xs leading-relaxed">
                        Hello! Yes, the <strong>Royal Sapphire Pendant Necklace</strong> is in stock! It features certified Ceylon Blue Sapphires handcrafted in 18K white gold.
                      </p>

                      {/* Welcome Media Photo Card */}
                      <div className="p-2 bg-[#004739] rounded-xl border border-[#006A57] flex items-center gap-2.5">
                        <div className="w-12 h-12 rounded-lg bg-[#111B21] flex items-center justify-center shrink-0 border border-[#202C33]">
                          <ShoppingBag className="w-5 h-5 text-[#25D366]" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-[11px] truncate">Royal Sapphire Necklace</div>
                          <div className="text-[10px] text-[#25D366] font-semibold">Rs. 185,000 LKR</div>
                          <div className="text-[9px] text-[#A6E3D8]">Ready for express courier delivery</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-[#A6E3D8] pt-1">
                        <span>Would you like to reserve yours now?</span>
                        <span>10:14 AM ✓✓</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Pill */}
                  <div className="flex justify-center">
                    <span className="text-[10px] bg-[#111B21] text-[#8696A0] px-3 py-1 rounded-full border border-[#202C33]">
                      ⚡ Automated First Message Media Sequence Sent
                    </span>
                  </div>
                </div>

                {/* Bottom Bar */}
                <div className="bg-[#202C33] px-3.5 py-2.5 flex items-center justify-between text-[11px] text-[#8696A0] border-t border-[#2A3942]">
                  <span>AI Autopilot Mode: Active</span>
                  <Link href="/login" className="text-[#25D366] hover:underline font-bold">
                    Try this in your CRM →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE SERVICES PROMOTION SECTION */}
      <section id="services" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-[#008069] bg-[#E8F5E9] px-3 py-1 rounded-md">
            WHAT WE DO
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#111B21] mt-3">
            Comprehensive WhatsApp Automation & AI Solutions
          </h2>
          <p className="text-xs sm:text-sm text-[#54656F] mt-2">
            Everything your business needs to turn WhatsApp into a self-driving sales and support engine.
          </p>
        </div>

        {/* 6 Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Service 1 */}
          <div className="bg-white border border-[#E9EDEF] rounded-2xl p-6 shadow-xs hover:border-[#008069] transition group">
            <div className="w-12 h-12 rounded-xl bg-[#E8F5E9] text-[#008069] flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition">
              <Bot className="w-6 h-6 text-[#008069]" />
            </div>
            <h3 className="text-base font-bold text-[#111B21]">
              Google Gemini 2.5 AI Sales Concierge
            </h3>
            <p className="text-xs text-[#54656F] mt-2 leading-relaxed">
              Autonomously answer product inquiries, offer discounts, quote real-time prices, and guide buyers through the sale without human delay.
            </p>
            <ul className="mt-4 space-y-1.5 text-xs text-[#54656F]">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#008069]" /> Custom system prompt tailored to your brand
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#008069]" /> Intelligent product recommendations
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#008069]" /> Instant human agent handoff when needed
              </li>
            </ul>
          </div>

          {/* Service 2 */}
          <div className="bg-white border border-[#E9EDEF] rounded-2xl p-6 shadow-xs hover:border-[#008069] transition group">
            <div className="w-12 h-12 rounded-xl bg-[#E8F5E9] text-[#008069] flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition">
              <ImageIcon className="w-6 h-6 text-[#008069]" />
            </div>
            <h3 className="text-base font-bold text-[#111B21]">
              Welcome Media Sequences
            </h3>
            <p className="text-xs text-[#54656F] mt-2 leading-relaxed">
              Never send a boring text reply again. Greet incoming customers with multiple curated product photos, showcase brochures, and custom sales captions.
            </p>
            <ul className="mt-4 space-y-1.5 text-xs text-[#54656F]">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#008069]" /> Multiple photos delivered automatically
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#008069]" /> Custom marketing captions per image
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#008069]" /> Upload from web admin with live preview
              </li>
            </ul>
          </div>

          {/* Service 3 */}
          <div className="bg-white border border-[#E9EDEF] rounded-2xl p-6 shadow-xs hover:border-[#008069] transition group">
            <div className="w-12 h-12 rounded-xl bg-[#E8F5E9] text-[#008069] flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition">
              <MessageSquare className="w-6 h-6 text-[#008069]" />
            </div>
            <h3 className="text-base font-bold text-[#111B21]">
              Shared Multi-Agent Team Inbox
            </h3>
            <p className="text-xs text-[#54656F] mt-2 leading-relaxed">
              Your entire team handles WhatsApp customer chats in real-time without page reloads, equipped with audio chimes and browser desktop notifications.
            </p>
            <ul className="mt-4 space-y-1.5 text-xs text-[#54656F]">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#008069]" /> Real-time instant message sync
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#008069]" /> Audio notifications & desktop alerts
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#008069]" /> One-click Human takeover switch
              </li>
            </ul>
          </div>

          {/* Service 4 */}
          <div className="bg-white border border-[#E9EDEF] rounded-2xl p-6 shadow-xs hover:border-[#008069] transition group">
            <div className="w-12 h-12 rounded-xl bg-[#E8F5E9] text-[#008069] flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition">
              <ShoppingBag className="w-6 h-6 text-[#008069]" />
            </div>
            <h3 className="text-base font-bold text-[#111B21]">
              Product Catalog & Order Management
            </h3>
            <p className="text-xs text-[#54656F] mt-2 leading-relaxed">
              Showcase your inventory with photos, descriptions, stock availability, and prices in LKR. Share direct product cards right inside any customer chat.
            </p>
            <ul className="mt-4 space-y-1.5 text-xs text-[#54656F]">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#008069]" /> Interactive product card sharing
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#008069]" /> Stock status & LKR pricing
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#008069]" /> Connected with Gemini AI product knowledge
              </li>
            </ul>
          </div>

          {/* Service 5 */}
          <div className="bg-white border border-[#E9EDEF] rounded-2xl p-6 shadow-xs hover:border-[#008069] transition group">
            <div className="w-12 h-12 rounded-xl bg-[#E8F5E9] text-[#008069] flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition">
              <Send className="w-6 h-6 text-[#008069]" />
            </div>
            <h3 className="text-base font-bold text-[#111B21]">
              Bulk Campaign Broadcast Messenger
            </h3>
            <p className="text-xs text-[#54656F] mt-2 leading-relaxed">
              Send personalized seasonal sales campaigns, updates, and order notifications with automatic Sri Lankan and international phone format sanitization.
            </p>
            <ul className="mt-4 space-y-1.5 text-xs text-[#54656F]">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#008069]" /> Automated phone number cleaner (94...)
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#008069]" /> Meta Cloud API delivery verification
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#008069]" /> Full broadcast history logs
              </li>
            </ul>
          </div>

          {/* Service 6 */}
          <div className="bg-white border border-[#E9EDEF] rounded-2xl p-6 shadow-xs hover:border-[#008069] transition group">
            <div className="w-12 h-12 rounded-xl bg-[#E8F5E9] text-[#008069] flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition">
              <Building2 className="w-6 h-6 text-[#008069]" />
            </div>
            <h3 className="text-base font-bold text-[#111B21]">
              Isolated Multi-Tenant Business Accounts
            </h3>
            <p className="text-xs text-[#54656F] mt-2 leading-relaxed">
              Each registered company gets its own isolated tenant with dedicated WhatsApp phone credentials, isolated contacts, custom AI instructions, and catalog.
            </p>
            <ul className="mt-4 space-y-1.5 text-xs text-[#54656F]">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#008069]" /> 100% private business database
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#008069]" /> Custom Phone Number ID binding
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#008069]" /> Stripe recurring subscription management
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS (3 SIMPLE STEPS) */}
      <section className="bg-white border-y border-[#E9EDEF] py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#008069] bg-[#E8F5E9] px-3 py-1 rounded-md">
              SIMPLE 3-STEP SETUP
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111B21] mt-3">
              How Your Business Starts in Under 5 Minutes
            </h2>
            <p className="text-xs sm:text-sm text-[#54656F] mt-2">
              No complicated developer setup. Start automating your customer inquiries today.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-[#F0F2F5] border border-[#E9EDEF] rounded-2xl p-6 relative">
              <div className="w-10 h-10 rounded-xl bg-[#008069] text-white flex items-center justify-center font-bold text-sm mb-4">
                1
              </div>
              <h3 className="text-base font-bold text-[#111B21]">Create Your Business Account</h3>
              <p className="text-xs text-[#54656F] mt-2 leading-relaxed">
                Register with your business email and company name. Your dedicated workspace is automatically initialized with your custom tenant ID.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#F0F2F5] border border-[#E9EDEF] rounded-2xl p-6 relative">
              <div className="w-10 h-10 rounded-xl bg-[#008069] text-white flex items-center justify-center font-bold text-sm mb-4">
                2
              </div>
              <h3 className="text-base font-bold text-[#111B21]">Connect WhatsApp & Catalog</h3>
              <p className="text-xs text-[#54656F] mt-2 leading-relaxed">
                Paste your WhatsApp Cloud API credentials, upload your welcome photos, and configure your Gemini AI persona instructions.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#F0F2F5] border border-[#E9EDEF] rounded-2xl p-6 relative">
              <div className="w-10 h-10 rounded-xl bg-[#008069] text-white flex items-center justify-center font-bold text-sm mb-4">
                3
              </div>
              <h3 className="text-base font-bold text-[#111B21]">Activate 5,000 LKR Pro Tier</h3>
              <p className="text-xs text-[#54656F] mt-2 leading-relaxed">
                Pay the monthly subscription safely through Stripe. Your AI autopilot engages leads and drives conversions around the clock.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PRICING SECTION (5,000 LKR VIA STRIPE) */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-[#008069] bg-[#E8F5E9] px-3 py-1 rounded-md">
            TRANSPARENT PRICING
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#111B21] mt-3">
            One Simple Plan. Full Enterprise Power.
          </h2>
          <p className="text-xs sm:text-sm text-[#54656F] mt-2">
            No surprise add-ons. No per-message extra charges. Everything included in one flat subscription.
          </p>
        </div>

        <div className="max-w-lg mx-auto bg-white border-2 border-[#008069] rounded-3xl p-8 shadow-lg relative overflow-hidden">
          {/* Top Pill */}
          <div className="absolute top-0 right-0 bg-[#008069] text-white text-[11px] font-bold px-4 py-1 rounded-bl-xl uppercase tracking-wider">
            MOST POPULAR
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#008069]">
              ZEVARONE PRO PLAN
            </span>
            <h3 className="text-2xl font-black text-[#111B21]">WhatsApp CRM & Gemini AI Pro</h3>
            <p className="text-xs text-[#54656F]">
              For growing businesses, retailers, e-commerce, and service companies.
            </p>
          </div>

          <div className="my-6 pt-6 border-t border-[#E9EDEF] flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-black text-[#111B21]">5,000</span>
            <span className="text-base font-bold text-[#54656F]">LKR</span>
            <span className="text-xs text-[#8696A0]">/ business / month</span>
          </div>

          {/* Features Checklist */}
          <div className="space-y-3 pt-2 pb-6 border-b border-[#E9EDEF] text-xs text-[#111B21]">
            {[
              'Unlimited Incoming WhatsApp Chats',
              'Google Gemini 2.5 Flash Autonomous AI',
              'Multi-Photo Welcome Media Sequences with Captions',
              'Shared Real-Time Team Inbox & Audio Chimes',
              'Product Catalog & Order Card Inquiries',
              'Bulk Outbound Broadcast Campaign Messenger',
              'Meta WhatsApp Cloud API Compliance',
              'Private Multi-Tenant Data Isolation',
              'Stripe Secure Monthly Card Billing',
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#00A884] shrink-0" />
                <span>{f}</span>
              </div>
            ))}
          </div>

          {/* Action CTAs */}
          <div className="mt-6 space-y-3">
            <Link
              href="/login"
              className="w-full py-3.5 bg-[#008069] hover:bg-[#075E54] text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-md"
            >
              Get Started for 5,000 LKR
              <ArrowRight className="w-4 h-4" />
            </Link>
            <div className="text-center">
              <Link
                href="/login"
                className="text-xs text-[#54656F] hover:text-[#008069] font-semibold"
              >
                Already have an account? Sign In →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ SECTION */}
      <section id="faq" className="bg-white border-t border-[#E9EDEF] py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#008069] bg-[#E8F5E9] px-3 py-1 rounded-md">
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111B21] mt-3">
              Everything You Need to Know
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'What phone number can I use with this CRM?',
                a: 'You can connect any official WhatsApp Business phone number registered with Meta Cloud API. Each business account has its own isolated Phone Number ID and access token in Settings.',
              },
              {
                q: 'How does the Gemini AI know about my products?',
                a: 'In Settings, you can configure your custom Gemini System Prompt detailing your company rules, business hours, and policies. Gemini automatically accesses your live Product Catalogue to answer customer queries with accurate pricing and stock.',
              },
              {
                q: 'What is the Welcome Media sequence feature?',
                a: 'When a customer contacts your business for the first time, you can have the system automatically dispatch multiple product photos with custom captions before Gemini AI responds, creating an instant high-converting showcase.',
              },
              {
                q: 'How does the 5,000 LKR Stripe subscription work?',
                a: 'Billing is handled seamlessly through Stripe. After registering your account, you activate the 5,000 LKR monthly subscription using any credit/debit card. You can cancel or update your payment details anytime.',
              },
            ].map((faq, i) => (
              <div key={i} className="p-5 rounded-2xl bg-[#F0F2F5] border border-[#E9EDEF]">
                <h4 className="text-sm font-bold text-[#111B21]">{faq.q}</h4>
                <p className="text-xs text-[#54656F] mt-2 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. BOTTOM CALL TO ACTION BANNER */}
      <section className="bg-[#111B21] text-white py-14 px-4 sm:px-6 lg:px-8 text-center border-t border-[#202C33]">
        <div className="max-w-3xl mx-auto space-y-5">
          <h2 className="text-2xl sm:text-3xl font-bold">
            Ready to Automate Your WhatsApp Sales?
          </h2>
          <p className="text-xs sm:text-sm text-[#AEBAC1]">
            Join businesses that respond instantly, delight customers, and drive orders 24 hours a day.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-3.5 bg-[#00A884] hover:bg-[#008069] text-white text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
            >
              Get Started Now
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-3.5 bg-[#202C33] hover:bg-[#2A3942] border border-[#2A3942] text-[#E9EDEF] text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4 text-[#8696A0]" />
              Login to Workspace
            </Link>
          </div>
        </div>
      </section>

      {/* 8. FOOTER WITH POWERED BY ZEVARONE */}
      <footer className="border-t border-[#E9EDEF] bg-white py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#54656F]">
          <div className="flex items-center gap-4">
            <span>© 2026 WhatsApp Business CRM & Gemini AI Hub. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-5">
            <Link href="/privacy" className="hover:text-[#008069] transition">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-[#008069] transition">
              Terms of Service
            </Link>
            <Link href="/login" className="hover:text-[#008069] transition">
              Login
            </Link>
          </div>

          {/* POWERED BY ZEVARONE BRAND BADGE */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-widest text-[#54656F] uppercase">
              POWERED BY
            </span>
            <div className="bg-[#111B21] px-3 py-1.5 rounded-lg shadow-xs flex items-center">
              <Image
                src="/newlogos/Asset 13.svg"
                alt="ZEVARONE"
                width={80}
                height={16}
                className="h-3.5 w-auto object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
