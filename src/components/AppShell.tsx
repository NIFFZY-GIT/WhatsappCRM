'use client';

import React from 'react';
import Sidebar from './Sidebar';
import { useApp } from '@/context/AppContext';
import { Sparkles, Building2, Phone } from 'lucide-react';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { selectedTenant, databaseStatus } = useApp();

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

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
