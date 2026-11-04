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
  CreditCard,
  User,
  LogOut,
  LogIn,
  Download,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { isZevaroneAdmin } from '@/lib/types';

export default function Sidebar() {
  const pathname = usePathname();
  const {
    tenants,
    selectedTenant,
    switchTenant,
    currentUser,
    logout,
    isProUser,
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
      badgeColor: 'bg-[#25D366] text-[#111B21]',
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
      label: 'Billing (5,000 LKR)',
      href: '/billing',
      icon: CreditCard,
      badge: isProUser ? 'Pro' : 'Pay',
      badgeColor: isProUser ? 'bg-[#00A884] text-white' : 'bg-amber-400 text-[#111B21]',
    },
    ...(isZevaroneAdmin(currentUser)
      ? [
          {
            label: 'Admin Client Monitor',
            href: '/admin',
            icon: ShieldCheck,
            badge: 'Master',
            badgeColor: 'bg-emerald-400 text-slate-950 font-bold',
          },
          {
            label: 'Client Businesses',
            href: '/tenants',
            icon: Building2,
            badge: `${tenants.length}`,
            badgeColor: 'bg-[#202C33] text-[#8696A0] border border-[#2A3942]',
          },
          {
            label: 'Webhook & Diagnostics',
            href: '/setup',
            icon: ShieldCheck,
          },
          {
            label: 'Offline Simulator',
            href: '/simulator',
            icon: Terminal,
          },
        ]
      : []),
  ];

  return (
    <>
      {/* Mobile Top Header */}
      <div className="lg:hidden bg-[#111B21] text-[#E9EDEF] px-4 py-3 flex items-center justify-between sticky top-0 z-40 border-b border-[#2A3942]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#25D366] flex items-center justify-center font-bold text-[#111B21]">
            <Sparkles className="w-4 h-4 text-[#111B21]" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight leading-none text-white">ZEVARONE. CRM</h1>
            <p className="text-[10px] text-[#25D366] font-medium">WhatsApp Cloud Platform</p>
          </div>
        </div>

        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-lg bg-[#202C33] text-[#8696A0] hover:text-white"
          aria-label="Toggle navigation menu"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/60"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#111B21] text-[#E9EDEF] flex flex-col border-r border-[#2A3942] transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-[#2A3942] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#25D366] flex items-center justify-center font-black text-[#111B21]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-base tracking-tight text-white">ZEVARONE. CRM</h1>
                <span className="text-[9px] bg-[#00A884]/20 text-[#25D366] font-bold px-1.5 py-0.5 rounded border border-[#00A884]/40">
                  Pro
                </span>
              </div>
              <p className="text-[11px] text-[#8696A0]">WhatsApp Cloud &amp; Sales AI</p>
            </div>
          </div>

          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden text-[#8696A0] hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Business Selector (Tenant Switcher) */}
        <div className="p-4 border-b border-[#2A3942]">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#8696A0] mb-1.5 px-1 flex items-center justify-between">
            <span>{isZevaroneAdmin(currentUser) ? 'Active Business (Master)' : 'My Business'}</span>
            {isZevaroneAdmin(currentUser) && (
              <span className="text-[9px] text-[#25D366] font-semibold bg-[#25D366]/10 px-1.5 py-0.5 rounded">
                Admin
              </span>
            )}
          </div>
          <div className="relative">
            {isZevaroneAdmin(currentUser) ? (
              <button
                onClick={() => setShowTenantDropdown(!showTenantDropdown)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#202C33] hover:bg-[#222E35] border border-[#2A3942] text-left transition"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-[#00A884]/20 text-[#25D366] flex items-center justify-center font-bold text-xs flex-shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-xs text-white truncate">
                      {selectedTenant?.name || 'Select Business'}
                    </p>
                    <p className="text-[10px] text-[#8696A0] truncate flex items-center gap-1">
                      <Phone className="w-2.5 h-2.5" />
                      {selectedTenant?.whatsappNumber || 'No phone set'}
                    </p>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-[#8696A0] flex-shrink-0" />
              </button>
            ) : (
              <div className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#202C33] border border-[#2A3942] text-left">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-[#00A884]/20 text-[#25D366] flex items-center justify-center font-bold text-xs flex-shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-xs text-white truncate">
                      {selectedTenant?.name || currentUser?.businessName || 'My Workspace'}
                    </p>
                    <p className="text-[10px] text-[#8696A0] truncate flex items-center gap-1">
                      <Phone className="w-2.5 h-2.5" />
                      {selectedTenant?.whatsappNumber || 'Setup in Settings'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Dropdown Menu - Admins only */}
            {isZevaroneAdmin(currentUser) && showTenantDropdown && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-[#202C33] border border-[#2A3942] rounded-xl shadow-2xl overflow-hidden py-1">
                <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-[#8696A0] border-b border-[#2A3942]">
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
                        ? 'bg-[#00A884] text-white font-semibold'
                        : 'hover:bg-[#222E35] text-[#E9EDEF]'
                    }`}
                  >
                    <span className="truncate">{t.name}</span>
                    <span className="text-[10px] opacity-80">
                      {t.defaultMode === 'ai_chatbot' ? '🤖 AI' : '⚡ Template'}
                    </span>
                  </button>
                ))}
                <div className="border-t border-[#2A3942] p-1">
                  <Link
                    href="/tenants"
                    onClick={() => setShowTenantDropdown(false)}
                    className="block text-center text-[11px] text-[#25D366] hover:underline font-medium py-1"
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
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                  isActive
                    ? 'bg-[#00A884] text-white font-semibold'
                    : 'text-[#8696A0] hover:text-[#E9EDEF] hover:bg-[#202C33]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition ${
                      isActive ? 'text-white' : 'text-[#8696A0]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white text-[#00A884]' : item.badgeColor
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Account / SaaS Auth Section */}
        <div className="p-3 border-t border-[#2A3942] bg-[#111B21] shrink-0">
          {currentUser ? (
            <div className="flex items-center justify-between p-2 rounded-xl bg-[#202C33] border border-[#2A3942]">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#008069] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white truncate">{currentUser.name}</div>
                  <div className="text-[10px] text-[#8696A0] truncate">{currentUser.businessName}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Link
                  href="/billing"
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    isProUser ? 'bg-[#008069] text-white' : 'bg-amber-400 text-black'
                  }`}
                  title={isProUser ? 'Active Pro Tier' : 'Upgrade to Pro'}
                >
                  {isProUser ? 'PRO' : 'UPGRADE'}
                </Link>
                <button
                  onClick={() => logout()}
                  title="Sign out"
                  className="p-1 rounded text-[#8696A0] hover:text-red-400 hover:bg-[#2A3942] transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="w-full py-2 px-3 rounded-xl bg-[#202C33] hover:bg-[#2A3942] border border-[#2A3942] text-xs font-semibold text-[#25D366] flex items-center justify-center gap-2 transition"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Link>
          )}
        </div>

        {/* Bottom System & Database Status */}
        <div className="px-4 py-3 border-t border-[#2A3942] bg-[#0C1317] text-[11px] space-y-2 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-[#8696A0] flex items-center gap-1.5">
              <Database className="w-3 h-3 text-[#8696A0]" />
              Database
            </span>
            <span
              className={`font-semibold px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1 ${
                databaseStatus?.connected
                  ? 'bg-[#00A884]/20 text-[#25D366] border border-[#00A884]/40'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  databaseStatus?.connected ? 'bg-[#25D366]' : 'bg-amber-400'
                }`}
              />
              {databaseStatus?.connected ? 'Cloud Active' : 'Local'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#8696A0] flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-[#8696A0]" />
              AI Engine
            </span>
            <span className="font-semibold text-[#E9EDEF] text-[10px] bg-[#202C33] px-2 py-0.5 rounded border border-[#2A3942]">
              Zevarone AI Neural ⚡
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
