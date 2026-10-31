'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { useApp } from '@/context/AppContext';
import {
  Sparkles,
  Building2,
  Phone,
  Bell,
  BellRing,
  Volume2,
  VolumeX,
  X,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Trash2,
} from 'lucide-react';
import ErrorBoundary from './ErrorBoundary';
import Link from 'next/link';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const {
    selectedTenant,
    databaseStatus,
    notifications,
    clearAllNotifications,
    soundEnabled,
    setSoundEnabled,
    hasNotificationPermission,
    requestNotificationPermission,
  } = useApp();

  const [showNotificationMenu, setShowNotificationMenu] = useState(false);

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col font-sans text-[#111B21]">
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        {/* Top Header Bar for Desktop */}
        <header className="hidden lg:flex items-center justify-between px-8 py-3.5 bg-white border-b border-[#E9EDEF] sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#EFEAE2] text-[#075E54] flex items-center justify-center font-bold text-xs border border-[#E9EDEF]">
              <Building2 className="w-4 h-4 text-[#075E54]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#111B21] text-sm">
                  {selectedTenant?.name || 'Zevarone Group'}
                </span>
                <span className="text-[10px] bg-[#EFEAE2] text-[#075E54] font-semibold px-2 py-0.5 rounded-full border border-[#E9EDEF]">
                  {selectedTenant?.defaultMode === 'ai_chatbot' ? '🤖 Gemini AI Active' : '⚡ Auto-Reply Active'}
                </span>
              </div>
              <p className="text-[11px] text-[#667781] flex items-center gap-1">
                <Phone className="w-3 h-3 text-[#667781]" />
                WhatsApp: <strong className="text-[#111B21]">{selectedTenant?.whatsappNumber || '+94 77 228 4950'}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Desktop Notification Enable Pill if not yet granted */}
            {!hasNotificationPermission && (
              <button
                onClick={requestNotificationPermission}
                className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFEAE2] text-[#075E54] hover:bg-[#D9FDD3] text-xs font-semibold border border-[#E9EDEF] transition cursor-pointer"
                title="Enable browser notifications for incoming messages"
              >
                <BellRing className="w-3.5 h-3.5" />
                <span>Enable Alerts</span>
              </button>
            )}

            {/* Sound Toggle Button */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
                soundEnabled
                  ? 'bg-white border-[#E9EDEF] text-[#075E54] hover:bg-[#F0F2F5]'
                  : 'bg-[#F0F2F5] border-[#E9EDEF] text-[#667781] hover:text-[#111B21]'
              }`}
              title={soundEnabled ? 'Mute audio notification chimes' : 'Unmute audio notification chimes'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-[#00A884]" /> : <VolumeX className="w-4 h-4 text-[#667781]" />}
            </button>

            {/* Notification Center Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationMenu(!showNotificationMenu)}
                className="p-2 rounded-xl border border-[#E9EDEF] bg-white hover:bg-[#F0F2F5] text-[#111B21] relative transition cursor-pointer"
                title="Notification Center & Alerts"
              >
                <Bell className="w-4 h-4 text-[#667781]" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#25D366] text-[#111B21] rounded-full text-[9px] font-bold flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Menu */}
              {showNotificationMenu && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-[#E9EDEF] rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
                  <div className="p-3.5 border-b border-[#E9EDEF] bg-[#F0F2F5] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-[#075E54]" />
                      <span className="font-bold text-xs text-[#111B21]">Recent Alerts &amp; Events</span>
                    </div>
                    {notifications.length > 0 && (
                      <button
                        onClick={clearAllNotifications}
                        className="text-[10px] text-[#667781] hover:text-rose-600 font-semibold flex items-center gap-1 transition cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        Clear
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-[#E9EDEF]">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-[#667781] text-xs">
                        <CheckCircle2 className="w-8 h-8 text-[#00A884] mx-auto mb-2 opacity-60" />
                        No active alerts. All systems running normally!
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className="p-3 hover:bg-[#F0F2F5] transition text-xs flex items-start gap-2.5">
                          <div className="flex-shrink-0 mt-0.5">
                            {n.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#25D366]" />}
                            {n.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-500" />}
                            {n.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                            {n.type === 'info' && <Info className="w-4 h-4 text-[#00A884]" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-[#111B21] text-[11px] truncate">{n.title}</p>
                            <p className="text-[11px] text-[#667781] leading-relaxed break-words">{n.message}</p>
                            {n.actionUrl && (
                              <Link
                                href={n.actionUrl}
                                onClick={() => setShowNotificationMenu(false)}
                                className="inline-block mt-1 text-[10px] text-[#00A884] font-bold hover:underline"
                              >
                                {n.actionLabel || 'View →'}
                              </Link>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Status Badges */}
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0F2F5] text-[#111B21] font-medium border border-[#E9EDEF]">
                <span
                  className={`w-2 h-2 rounded-full ${
                    databaseStatus?.connected ? 'bg-[#25D366]' : 'bg-amber-500'
                  }`}
                />
                {databaseStatus?.connected ? 'Supabase Connected' : 'Local Store'}
              </span>

              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#D9FDD3] text-[#075E54] font-semibold border border-[#25D366]/40">
                <Sparkles className="w-3 h-3 text-[#075E54]" />
                Gemini 3.8-Flash
              </span>
            </div>
          </div>
        </header>

        {/* Page Content wrapped in Error Boundary */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
