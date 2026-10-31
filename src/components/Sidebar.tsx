'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MessageSquare,
  Send,
  ShoppingBag,
  Settings,
  Building2,
  Terminal,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  Database,
  Menu,
  X,
  Phone,
  Zap,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function Sidebar() {
  const pathname = usePathname();
  const {
    tenants,
    selectedTenant,
    switchTenant,
    databaseStatus,
    envStatus,
    unreadTotal,
  } = useApp();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showTenantDropdown, setShowTenantDropdown] = useState(false);

  const navItems = [
    {
      label: 'Shared Inbox',
      href: '/inbox',
      icon: MessageSquare,
      badge: unreadTotal > 0 ? `${unreadTotal} new` : null,
      badgeColor: 'bg-emerald-500 text-white',
    },
    {
      label: 'Send WhatsApp',
      href: '/sender',
      icon: Send,
    },
    {
      label: 'Product Catalogue',
      href: '/catalogue',
      icon: ShoppingBag,
    },
    {
      label: 'AI & Automations',
      href: '/settings',
      icon: Settings,
    },
    {
      label: 'Client Businesses',
      href: '/tenants',
      icon: Building2,
      badge: `${tenants.length}`,
      badgeColor: 'bg-slate-200 text-slate-700',
    },
    {
      label: 'Offline Simulator',
      href: '/simulator',
      icon: Terminal,
    },
    {
      label: 'Webhook & API Setup',
      href: '/setup',
      icon: ShieldCheck,
    },
  ];

  return (
    <>
      {/* Mobile Top Header */}
      <div className="lg:hidden bg-slate-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-white shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight leading-none text-white">ZEVARONE</h1>
            <p className="text-[10px] text-emerald-400 font-medium">WhatsApp AI Hub</p>
          </div>
        </div>

        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          aria-label="Toggle navigation menu"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800/80 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-black text-white shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-base tracking-tight text-white">ZEVARONE</h1>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.5 rounded border border-emerald-500/30">
                  AI CRM
                </span>
              </div>
              <p className="text-[11px] text-slate-400">WhatsApp Cloud & Gemini</p>
            </div>
          </div>

          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Business Selector (Tenant Switcher) */}
        <div className="p-4 border-b border-slate-800/60">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-1">
            Active Client Business
          </div>
          <div className="relative">
            <button
              onClick={() => setShowTenantDropdown(!showTenantDropdown)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-left transition"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-xs text-white truncate">
                    {selectedTenant?.name || 'Select Business'}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                    <Phone className="w-2.5 h-2.5" />
                    {selectedTenant?.whatsappNumber || 'No phone set'}
                  </p>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
            </button>

            {/* Dropdown Menu */}
            {showTenantDropdown && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden py-1 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-700/50">
                  Switch Business
                </div>
                {tenants.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      switchTenant(t.id);
                      setShowTenantDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition ${
                      selectedTenant?.id === t.id
                        ? 'bg-emerald-600/20 text-emerald-400 font-semibold'
                        : 'hover:bg-slate-700/50 text-slate-300'
                    }`}
                  >
                    <span className="truncate">{t.name}</span>
                    <span className="text-[10px] text-slate-400">
                      {t.defaultMode === 'ai_chatbot' ? '🤖 AI' : '⚡ Template'}
                    </span>
                  </button>
                ))}
                <div className="border-t border-slate-700/50 p-1">
                  <Link
                    href="/tenants"
                    onClick={() => setShowTenantDropdown(false)}
                    className="block text-center text-[11px] text-emerald-400 hover:text-emerald-300 font-medium py-1"
                  >
                    + Manage All Businesses
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href === '/inbox' && pathname === '/');
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition group ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20 font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom System & Database Status */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-[11px] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-slate-400" />
              Database
            </span>
            <span
              className={`font-semibold px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1 ${
                databaseStatus?.connected
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  databaseStatus?.connected ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              {databaseStatus?.connected ? 'Supabase Cloud' : 'Local File'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-slate-400" />
              Gemini Engine
            </span>
            <span className="font-semibold text-slate-300 text-[10px] bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              3.8-Flash ⚡
            </span>
          </div>

          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
            <Link href="/privacy" className="hover:text-slate-300 transition">
              Privacy Policy
            </Link>
            <span>&bull;</span>
            <Link href="/terms" className="hover:text-slate-300 transition">
              Terms
            </Link>
            <span>&bull;</span>
            <span>v2.0</span>
          </div>
        </div>
      </aside>
    </>
  );
}
