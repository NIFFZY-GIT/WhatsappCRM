'use client';

import React from 'react';
import Sidebar from './Sidebar';
import { useApp } from '@/context/AppContext';
import { Sparkles, Building2, Phone } from 'lucide-react';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { selectedTenant, databaseStatus } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        {/* Top Header Bar for Desktop */}
        <header className="hidden lg:flex items-center justify-between px-8 py-3.5 bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs border border-emerald-200">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">
                  {selectedTenant?.name || 'Zevarone Group'}
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
                  {selectedTenant?.defaultMode === 'ai_chatbot' ? '🤖 Gemini AI Active' : '⚡ Auto-Reply Active'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                WhatsApp: <strong className="text-slate-700">{selectedTenant?.whatsappNumber || '+94 77 228 4950'}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">
                <span
                  className={`w-2 h-2 rounded-full ${
                    databaseStatus?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}
                />
                {databaseStatus?.connected ? 'Supabase PostgreSQL' : 'Local Store'}
              </span>

              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200/60">
                <Sparkles className="w-3 h-3 text-indigo-600" />
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
