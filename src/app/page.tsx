'use client';

import React, { useState } from 'react';
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
  Check,
  Users,
  Clock,
  ChevronRight,
  TrendingUp,
  Headphones,
  Smartphone,
  ExternalLink,
} from 'lucide-react';

export default function LandingPage() {
  const { currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<'ai' | 'media' | 'inbox' | 'broadcast'>('ai');

  return (
    <div className="min-h-screen bg-[#FAFBFB] text-slate-900 flex flex-col font-sans selection:bg-[#008069] selection:text-white">
      {/* =========================================================================
          1. MODERN TOP NAVIGATION BAR
      ========================================================================= */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Product Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-[#008069] flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:bg-[#075E54] transition">
              W
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-slate-900">
                  ZEVARONE
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-[#008069] border border-emerald-200/60">
                  AI CRM
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">WhatsApp Business Automation Platform</p>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
            <a href="#services" className="hover:text-[#008069] transition">
              Services
            </a>
            <a href="#interactive-preview" className="hover:text-[#008069] transition">
              Product Tour
            </a>
            <a href="#comparison" className="hover:text-[#008069] transition">
              Why Us
            </a>
            <a href="#pricing" className="hover:text-[#008069] transition">
              Pricing (5,000 LKR)
            </a>
            <a href="#faq" className="hover:text-[#008069] transition">
              FAQ
            </a>
          </nav>

          {/* Action CTAs: Login and Get Started */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <Link
                href="/inbox"
                className="px-4 py-2.5 bg-[#008069] hover:bg-[#075E54] text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-sm"
              >
                Go to Workspace
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5 text-slate-500" />
                  Log in
                </Link>
                <Link
                  href="/login"
                  className="px-5 py-2.5 bg-[#008069] hover:bg-[#075E54] text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-sm hover:shadow"
                >
                  Get Started
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. HERO SECTION (High-Impact Advertising & Value Proposition)
      ========================================================================= */}
      <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Top Announcement Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-[#008069]">
            <Sparkles className="w-3.5 h-3.5 text-[#00A884]" />
            <span>Powered by Meta WhatsApp Cloud API &amp; Google Gemini 2.5</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#008069]" />
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
            Supercharge Your WhatsApp Sales with{' '}
            <span className="text-[#008069]">24/7 Gemini AI</span>
          </h1>

          {/* Subheadline / Promotional Pitch */}
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            The modern WhatsApp CRM engineered for growth. Respond to inquiries in seconds, showcase product catalogs, send rich welcome photo sequences, and run broadcast campaigns — all in one unified workspace for <strong>5,000 LKR/month</strong>.
          </p>

          {/* HERO ACTION BUTTONS (Login & Get Started) */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/login"
              className="w-full sm:w-auto px-7 py-3.5 bg-[#008069] hover:bg-[#075E54] text-white text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-[0.99]"
            >
              Get Started Now
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-xs"
            >
              <LogIn className="w-4 h-4 text-slate-500" />
              Login to Workspace
            </Link>

            <Link
              href="/inbox"
              className="w-full sm:w-auto px-4 py-3.5 text-xs font-semibold text-slate-500 hover:text-[#008069] flex items-center justify-center gap-1 transition"
            >
              Preview Live Shared Inbox &rarr;
            </Link>
          </div>

          {/* Trust Highlights */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#00A884]" />
              Official Meta Cloud API
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#00A884]" />
              5,000 LKR / month via Stripe
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#00A884]" />
              Isolated Multi-Tenant CRM
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#00A884]" />
              Zero Developer Setup
            </span>
          </div>
        </div>

        {/* =========================================================================
            DESKTOP APPLICATION MOCKUP (Clean Mac/App Frame)
        ========================================================================= */}
        <div className="mt-14 max-w-6xl mx-auto">
          <div className="rounded-2xl border border-slate-300/80 bg-white shadow-2xl shadow-slate-300/60 overflow-hidden">
            {/* Window Title Bar */}
            <div className="bg-[#111B21] px-4 py-3 flex items-center justify-between border-b border-[#202C33]">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
                <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                <div className="w-3 h-3 rounded-full bg-[#10B981]" />
                <span className="ml-2 text-xs font-mono font-medium text-[#8696A0]">
                  app.zevarone.com/inbox — WhatsApp CRM
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#202C33] text-[#25D366] border border-[#2A3942]">
                  ● GEMINI 2.5 AUTOPILOT ACTIVE
                </span>
              </div>
            </div>

            {/* Simulated Desktop Workspace Interface */}
            <div className="grid grid-cols-1 md:grid-cols-12 min-h-[520px]">
              {/* Left Column: Conversations List (4 cols) */}
              <div className="md:col-span-4 border-r border-slate-200 bg-white flex flex-col">
                <div className="p-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Customer Chats (4 Active)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-[#008069] font-bold">
                    Real-time Sync
                  </span>
                </div>

                <div className="divide-y divide-slate-100 flex-1 overflow-y-auto">
                  {/* Contact 1 - Active */}
                  <div className="p-3 bg-emerald-50/60 border-l-4 border-[#008069] flex items-start gap-3 cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-[#008069] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      PS
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 truncate">Priya Sharma</span>
                        <span className="text-[10px] text-slate-500">10:14 AM</span>
                      </div>
                      <p className="text-[11px] text-slate-600 truncate mt-0.5">
                        Do you have the Sapphire necklace in stock?
                      </p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-[#008069]">
                          AI Responded
                        </span>
                        <span className="text-[9px] text-slate-400">High Intent</span>
                      </div>
                    </div>
                  </div>

                  {/* Contact 2 */}
                  <div className="p-3 hover:bg-slate-50 flex items-start gap-3 cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      RP
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 truncate">Rohan Perera</span>
                        <span className="text-[10px] text-slate-400">09:42 AM</span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        Thanks! Payment sent via bank transfer.
                      </p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                          Human Takeover
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact 3 */}
                  <div className="p-3 hover:bg-slate-50 flex items-start gap-3 cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      KS
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 truncate">Kavinda Silva</span>
                        <span className="text-[10px] text-slate-400">Yesterday</span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        Can you send your 2026 bridal catalog?
                      </p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                          Welcome Media Sent
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Center Column: Live WhatsApp Chat Thread (5 cols) */}
              <div className="md:col-span-5 bg-[#EFEAE2] flex flex-col justify-between border-r border-slate-200">
                {/* Active Chat Header */}
                <div className="p-3 bg-white border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#008069] text-white flex items-center justify-center font-bold text-xs">
                      PS
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Priya Sharma (+94 77 123 4567)</div>
                      <div className="text-[10px] text-emerald-600 font-medium">Online • Gemini 2.5 Handling</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    Sri Lanka
                  </span>
                </div>

                {/* Conversation Body */}
                <div className="p-4 space-y-3 overflow-y-auto flex-1 text-xs">
                  {/* Customer Message */}
                  <div className="flex flex-col items-start max-w-[85%]">
                    <div className="bg-white text-slate-800 rounded-xl rounded-tl-xs p-3 shadow-xs border border-slate-200/60">
                      <p className="text-xs leading-relaxed">
                        Hello! Do you have the Royal Sapphire Pendant in stock? Can you send photos and price in LKR?
                      </p>
                      <span className="text-[10px] text-slate-400 block text-right mt-1">10:14 AM</span>
                    </div>
                  </div>

                  {/* AI Response with Product Photo Sequence */}
                  <div className="flex flex-col items-end max-w-[90%] ml-auto">
                    <div className="bg-[#D9FDD3] text-slate-900 rounded-xl rounded-tr-xs p-3 shadow-xs space-y-2 border border-emerald-200/50">
                      <div className="flex items-center justify-between text-[10px] text-[#008069] font-bold border-b border-emerald-200 pb-1">
                        <span className="flex items-center gap-1">
                          <Bot className="w-3.5 h-3.5" />
                          Gemini 2.5 AI Assistant
                        </span>
                        <span>0.8s</span>
                      </div>
                      <p className="text-xs leading-relaxed">
                        Hello Priya! Yes, our handcrafted <strong>Ceylon Royal Sapphire Pendant</strong> is currently in stock at <strong>Rs. 185,000 LKR</strong>. Here are the catalog photos:
                      </p>

                      {/* Welcome Media Card Preview */}
                      <div className="p-2 bg-white rounded-lg border border-emerald-300/80 flex items-center gap-2.5 shadow-xs">
                        <div className="w-12 h-12 rounded-md bg-slate-100 flex items-center justify-center text-[#008069] shrink-0">
                          <ShoppingBag className="w-5 h-5 text-[#008069]" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-[11px] text-slate-900">Royal Sapphire 18K Pendant</div>
                          <div className="text-[10px] font-bold text-[#008069]">Rs. 185,000 LKR</div>
                          <div className="text-[9px] text-slate-500">Includes Certificate of Authenticity</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                        <span>Would you like express delivery to Colombo?</span>
                        <span>10:14 AM ✓✓</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reply Bar */}
                <div className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2">
                  <input
                    type="text"
                    disabled
                    placeholder="AI is monitoring. Type message to override as human..."
                    className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-500"
                  />
                  <div className="p-2 bg-[#008069] text-white rounded-lg">
                    <Send className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* Right Column: AI Co-Pilot & Customer Profile (3 cols) */}
              <div className="md:col-span-3 bg-white p-4 space-y-4 text-xs flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      CUSTOMER INTELLIGENCE
                    </span>
                    <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                      <div className="font-bold text-slate-900">Priya Sharma</div>
                      <div className="text-[11px] text-slate-500">+94 77 123 4567</div>
                      <div className="text-[11px] text-emerald-700 font-semibold">Lead Score: 95/100 (High)</div>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      AI SALES ACTION
                    </span>
                    <div className="mt-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1.5">
                      <div className="text-[11px] font-semibold text-[#008069]">Automated Catalog Sequence Sent</div>
                      <p className="text-[10px] text-slate-600 leading-snug">
                        AI recommended Sapphire lookbook based on customer inquiry. Ready for payment link.
                      </p>
                    </div>
                  </div>
                </div>

                <Link
                  href="/login"
                  className="w-full py-2.5 bg-[#008069] hover:bg-[#075E54] text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  Launch Your CRM Workspace &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. CORE SERVICES ADVERTISEMENT SECTION ("What We Do")
      ========================================================================= */}
      <section id="services" className="py-20 bg-white border-y border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#008069] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              OUR COMPLETE SERVICE SUITE
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-4 tracking-tight">
              Engineered to Turn WhatsApp into Your Primary Revenue Channel
            </h2>
            <p className="text-sm text-slate-600 mt-2.5">
              Everything required to run an enterprise-grade WhatsApp customer engagement and sales operation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Service 1: Gemini AI */}
            <div className="bg-[#FAFBFB] border border-slate-200 rounded-2xl p-7 hover:border-[#008069] transition shadow-xs group">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#008069] flex items-center justify-center font-bold mb-5 group-hover:bg-[#008069] group-hover:text-white transition">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Google Gemini 2.5 AI Concierge
              </h3>
              <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                Autonomous AI answering customer inquiries 24/7 with zero lag. Customized with your exact brand voice, business policies, and catalog knowledge.
              </p>
              <div className="mt-5 pt-4 border-t border-slate-200/80 space-y-2 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#008069] shrink-0" />
                  <span>Customizable system prompt instructions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#008069] shrink-0" />
                  <span>Real-time catalog pricing &amp; stock lookup</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#008069] shrink-0" />
                  <span>Automatic human agent handoff notification</span>
                </div>
              </div>
            </div>

            {/* Service 2: Welcome Media Sequences */}
            <div className="bg-[#FAFBFB] border border-slate-200 rounded-2xl p-7 hover:border-[#008069] transition shadow-xs group">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#008069] flex items-center justify-center font-bold mb-5 group-hover:bg-[#008069] group-hover:text-white transition">
                <ImageIcon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Automated Welcome Media Sequences
              </h3>
              <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                Greet first-time inbound prospects with multiple curated product photos, showcase brochures, and tailored captions before the conversation begins.
              </p>
              <div className="mt-5 pt-4 border-t border-slate-200/80 space-y-2 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#008069] shrink-0" />
                  <span>Multiple photos dispatched automatically</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#008069] shrink-0" />
                  <span>Custom promotional captions per photo</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#008069] shrink-0" />
                  <span>Configured directly from Admin Settings</span>
                </div>
              </div>
            </div>

            {/* Service 3: Shared Team Inbox */}
            <div className="bg-[#FAFBFB] border border-slate-200 rounded-2xl p-7 hover:border-[#008069] transition shadow-xs group">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#008069] flex items-center justify-center font-bold mb-5 group-hover:bg-[#008069] group-hover:text-white transition">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Real-Time Shared Team Inbox
              </h3>
              <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                Connect your entire team to a single business number. Enjoy seamless live messaging without manual page reloads, accompanied by desktop audio chimes.
              </p>
              <div className="mt-5 pt-4 border-t border-slate-200/80 space-y-2 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#008069] shrink-0" />
                  <span>Instant synchronization without refreshing</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#008069] shrink-0" />
                  <span>Audio chimes &amp; browser desktop push alerts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#008069] shrink-0" />
                  <span>One-click human takeover override switch</span>
                </div>
              </div>
            </div>

            {/* Service 4: Product Catalog */}
            <div className="bg-[#FAFBFB] border border-slate-200 rounded-2xl p-7 hover:border-[#008069] transition shadow-xs group">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#008069] flex items-center justify-center font-bold mb-5 group-hover:bg-[#008069] group-hover:text-white transition">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                WhatsApp Product Catalog &amp; Quotes
              </h3>
              <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                Showcase your inventory with photos, descriptions, stock availability, and prices in LKR. Share interactive product cards directly in customer chats.
              </p>
              <div className="mt-5 pt-4 border-t border-slate-200/80 space-y-2 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#008069] shrink-0" />
                  <span>Interactive product cards sent via WhatsApp</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#008069] shrink-0" />
                  <span>Prices in Sri Lankan Rupees (LKR)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#008069] shrink-0" />
                  <span>Synced with Gemini AI sales knowledge</span>
                </div>
              </div>
            </div>

            {/* Service 5: Outbound Broadcast Campaigns */}
            <div className="bg-[#FAFBFB] border border-slate-200 rounded-2xl p-7 hover:border-[#008069] transition shadow-xs group">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#008069] flex items-center justify-center font-bold mb-5 group-hover:bg-[#008069] group-hover:text-white transition">
                <Send className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Outbound Broadcast Campaigns
              </h3>
              <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                Broadcast festival promotions, restock alerts, and order updates to customer lists with automated Sri Lankan phone number sanitization (`94...`).
              </p>
              <div className="mt-5 pt-4 border-t border-slate-200/80 space-y-2 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#008069] shrink-0" />
                  <span>Smart number cleaner (077... &rarr; 9477...)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#008069] shrink-0" />
                  <span>Meta Cloud API delivery verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#008069] shrink-0" />
                  <span>Detailed broadcast delivery logs</span>
                </div>
              </div>
            </div>

            {/* Service 6: Multi-Tenant Business Isolation */}
            <div className="bg-[#FAFBFB] border border-slate-200 rounded-2xl p-7 hover:border-[#008069] transition shadow-xs group">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#008069] flex items-center justify-center font-bold mb-5 group-hover:bg-[#008069] group-hover:text-white transition">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Isolated Multi-Tenant SaaS Workspaces
              </h3>
              <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                Each company gets its own isolated tenant with dedicated WhatsApp phone credentials, customer database, custom AI instructions, and catalog.
              </p>
              <div className="mt-5 pt-4 border-t border-slate-200/80 space-y-2 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#008069] shrink-0" />
                  <span>100% private data isolation per business</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#008069] shrink-0" />
                  <span>Custom Meta Phone Number ID binding</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#008069] shrink-0" />
                  <span>Automated Stripe 5,000 LKR billing gate</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. COMPARISON: TRADITIONAL WHATSAPP VS. ZEVARONE CRM
      ========================================================================= */}
      <section id="comparison" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-[#008069] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            THE ZEVARONE ADVANTAGE
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">
            Stop Losing 60% of Leads to Slow Replies
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            See how upgrading to ZEVARONE AI Hub transforms your sales pipeline.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Traditional Way */}
          <div className="bg-white border border-rose-200 rounded-2xl p-7 shadow-xs">
            <div className="text-rose-600 font-bold text-xs uppercase tracking-wider mb-2">
              Traditional WhatsApp Business App
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-4">Slow, Manual &amp; Fragmented</h3>
            <ul className="space-y-3 text-xs text-slate-600">
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold">✕</span>
                <span>Customers wait 15–45 minutes for a reply during peak hours.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold">✕</span>
                <span>Locked to 1 or 2 phones; staff constantly fight over who answers.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold">✕</span>
                <span>Manual copy-pasting of photos, prices, and bank details.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold">✕</span>
                <span>No automated lead qualification or intelligent follow-up.</span>
              </li>
            </ul>
          </div>

          {/* The Zevarone Way */}
          <div className="bg-emerald-50/50 border-2 border-[#008069] rounded-2xl p-7 shadow-sm">
            <div className="text-[#008069] font-bold text-xs uppercase tracking-wider mb-2">
              ZEVARONE WhatsApp AI CRM
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">Instant, Automated &amp; Scalable</h3>
            <ul className="space-y-3 text-xs text-slate-700">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#00A884] shrink-0 mt-0.5" />
                <span><strong>Instant 2-second AI reply:</strong> Gemini answers day and night.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#00A884] shrink-0 mt-0.5" />
                <span><strong>Shared Team Inbox:</strong> Multiple agents handle chats simultaneously.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#00A884] shrink-0 mt-0.5" />
                <span><strong>Welcome Media Sequences:</strong> Automatic photo catalogs sent on first touch.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#00A884] shrink-0 mt-0.5" />
                <span><strong>Stripe 5,000 LKR Subscription:</strong> Flat, predictable monthly pricing.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. PRICING SECTION (5,000 LKR / MONTH)
      ========================================================================= */}
      <section id="pricing" className="py-20 bg-white border-t border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#008069] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              SIMPLE &amp; TRANSPARENT
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-4 tracking-tight">
              One Plan. All Enterprise Features Included.
            </h2>
            <p className="text-sm text-slate-600 mt-2.5">
              No hidden platform fees. No per-user penalties. Just 5,000 LKR/month.
            </p>
          </div>

          <div className="max-w-lg mx-auto bg-white border-2 border-[#008069] rounded-3xl p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#008069] text-white text-[11px] font-bold px-4 py-1.5 rounded-bl-xl uppercase tracking-wider">
              ENTERPRISE PRO
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#008069]">
                MONTHLY SUBSCRIPTION
              </span>
              <h3 className="text-2xl font-black text-slate-900">WhatsApp CRM &amp; Gemini Pro</h3>
              <p className="text-xs text-slate-500">
                Complete platform access for retail, e-commerce, services, and brands.
              </p>
            </div>

            <div className="my-6 pt-6 border-t border-slate-200 flex items-baseline gap-2">
              <span className="text-5xl font-black text-slate-900">5,000</span>
              <span className="text-base font-bold text-slate-500">LKR</span>
              <span className="text-xs text-slate-400">/ business / month</span>
            </div>

            {/* Checklist */}
            <div className="space-y-3 pt-2 pb-6 border-b border-slate-200 text-xs text-slate-800">
              {[
                'Google Gemini 2.5 AI Sales Concierge',
                'Multi-Photo Welcome Sequences with Captions',
                'Shared Multi-Agent Team Inbox with Audio Alerts',
                'Interactive Product Catalog & WhatsApp Orders',
                'Bulk Outbound Broadcast Campaign Messenger',
                'Meta Official Cloud API Integration',
                'Dedicated Multi-Tenant Workspace & Database',
                'Stripe Secure Automated Recurring Billing',
                'Zevarone 99.9% Uptime Guarantee & SLA',
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00A884] shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3">
              <Link
                href="/login"
                className="w-full py-3.5 bg-[#008069] hover:bg-[#075E54] text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
              >
                Get Started for 5,000 LKR
                <ArrowRight className="w-4 h-4" />
              </Link>
              <div className="text-center">
                <Link
                  href="/login"
                  className="text-xs text-slate-500 hover:text-[#008069] font-medium"
                >
                  Already have an account? Sign in &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. FREQUENTLY ASKED QUESTIONS
      ========================================================================= */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-[#008069] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            COMMON QUESTIONS
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {[
            {
              q: 'Can I connect my existing Sri Lankan or international WhatsApp number?',
              a: 'Yes! You can bind any phone number registered under your Meta Cloud API account. In the Settings tab, you simply add your Phone Number ID and Meta Token.',
            },
            {
              q: 'How does Gemini 2.5 AI respond accurately to customer questions?',
              a: 'You provide customized prompt instructions in Settings specifying your company background, pricing rules, and refund policy. Gemini also references your live Product Catalog to quote real-time prices in LKR.',
            },
            {
              q: 'What is the Welcome Media sequence feature?',
              a: 'When an unfamiliar customer sends their first message, our sequence engine automatically delivers your chosen showcase photos and sales captions before Gemini AI responds, giving your brand an immediate visual impact.',
            },
            {
              q: 'How does payment work?',
              a: 'Subscription is billed at 5,000 LKR per month via Stripe. You can pay with any Visa, Mastercard, or corporate card. You can cancel anytime directly from your Billing dashboard.',
            },
          ].map((faq, i) => (
            <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <h4 className="text-sm font-bold text-slate-900">{faq.q}</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          7. BOTTOM CALL TO ACTION BANNER
      ========================================================================= */}
      <section className="bg-[#111B21] text-white py-16 px-4 sm:px-6 lg:px-8 border-t border-[#202C33]">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Automate Your WhatsApp Sales?
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto">
            Join businesses that respond instantly, delight customers, and drive orders 24 hours a day.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/login"
              className="w-full sm:w-auto px-7 py-3.5 bg-[#00A884] hover:bg-[#008069] text-white text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
            >
              Get Started Now
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-7 py-3.5 bg-[#202C33] hover:bg-[#2A3942] border border-[#2A3942] text-white text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4 text-slate-400" />
              Login to Workspace
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. MODERN EXECUTIVE FOOTER (Powered by ZEVARONE)
      ========================================================================= */}
      <footer className="bg-white border-t border-slate-200 py-10 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-[#008069] flex items-center justify-center text-white font-bold text-sm">
              W
            </div>
            <div>
              <span className="font-bold text-slate-900">ZEVARONE WhatsApp AI CRM</span>
              <p className="text-[11px] text-slate-400">© 2026 Zevarone Group. All rights reserved.</p>
            </div>
          </div>

          <div className="flex items-center gap-6 font-medium">
            <a href="#services" className="hover:text-[#008069] transition">Services</a>
            <a href="#pricing" className="hover:text-[#008069] transition">Pricing</a>
            <Link href="/privacy" className="hover:text-[#008069] transition">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[#008069] transition">Terms</Link>
            <Link href="/login" className="hover:text-[#008069] transition">Log in</Link>
          </div>

          {/* POWERED BY ZEVARONE PILL */}
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
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
