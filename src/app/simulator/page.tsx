'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Terminal,
  Send,
  Sparkles,
  Bot,
  User,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function SimulatorPage() {
  const { selectedTenant, refreshData, notify } = useApp();

  const [simPhone, setSimPhone] = useState('94772284950');
  const [simName, setSimName] = useState('Priya Sharma');
  const [simMessage, setSimMessage] = useState('Hi! What products do you have and what are your prices?');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResult, setSimResult] = useState<{
    customerMsg?: string;
    botReply?: string;
    mode?: string;
  } | null>(null);

  const handleRunSimulator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simMessage || !selectedTenant) return;

    setIsSimulating(true);
    setSimResult(null);

    try {
      const res = await fetch('/api/simulate-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: selectedTenant.id,
          phone: simPhone,
          name: simName,
          message: simMessage,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSimResult({
          customerMsg: data.customerMessage?.text,
          botReply: data.botReply?.text,
          mode: data.mode,
        });
        await refreshData();
        notify({
          type: 'success',
          title: 'Simulation Pipeline Executed',
          message: `Received reply from Gemini AI in ${data.mode === 'ai_chatbot' ? 'AI Chatbot' : 'Template'} mode.`,
          actionUrl: '/inbox',
          actionLabel: 'View in Inbox',
        });
      } else {
        notify({
          type: 'error',
          title: 'Simulation Pipeline Error',
          message: data.error || 'Simulation could not be completed.',
        });
      }
    } catch (err: any) {
      notify({
        type: 'error',
        title: 'Error',
        message: err.message || 'Error running offline simulator.',
      });
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-[#111B21] tracking-tight flex items-center gap-2">
          <Terminal className="w-5 h-5 text-[#075E54]" />
          Offline Customer Webhook Simulator
        </h2>
        <p className="text-xs text-[#667781] mt-1">
          Test conversations as an external customer without touching your phone or spending Meta API credits for{' '}
          <strong className="text-[#111B21]">{selectedTenant?.name}</strong>.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E9EDEF] p-6 sm:p-8">
        <form onSubmit={handleRunSimulator} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#111B21] mb-1">
                Simulated Customer Phone
              </label>
              <input
                type="text"
                required
                value={simPhone}
                onChange={(e) => setSimPhone(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#F0F2F5] border border-[#E9EDEF] rounded-xl text-xs font-mono text-[#111B21] focus:bg-white focus:border-[#00A884] focus:ring-1 focus:ring-[#00A884] focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#111B21] mb-1">
                Simulated Customer Name
              </label>
              <input
                type="text"
                required
                value={simName}
                onChange={(e) => setSimName(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#F0F2F5] border border-[#E9EDEF] rounded-xl text-xs text-[#111B21] focus:bg-white focus:border-[#00A884] focus:ring-1 focus:ring-[#00A884] focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#111B21] mb-1">
              Customer Message
            </label>
            <textarea
              rows={3}
              required
              value={simMessage}
              onChange={(e) => setSimMessage(e.target.value)}
              className="w-full p-3.5 bg-[#F0F2F5] border border-[#E9EDEF] rounded-xl text-xs font-sans text-[#111B21] focus:bg-white focus:border-[#00A884] focus:ring-1 focus:ring-[#00A884] focus:outline-none transition"
              placeholder="e.g. Can you tell me your prices? or Do you have web development in stock?"
            />
          </div>

          <button
            type="submit"
            disabled={isSimulating}
            className="w-full py-3 bg-[#00A884] hover:bg-[#075E54] disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Send className="w-4 h-4 text-white" />
            <span>{isSimulating ? 'Simulating Message Flow...' : 'Simulate Incoming Message'}</span>
          </button>
        </form>

        {/* Live Simulation Result */}
        {simResult && (
          <div className="mt-6 pt-6 border-t border-[#E9EDEF] space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-[#111B21]">
                Simulation Pipeline Output:
              </span>
              <span className="text-[10px] bg-[#D9FDD3] text-[#075E54] border border-[#25D366]/40 px-2 py-0.5 rounded-full font-bold">
                Mode: {simResult.mode}
              </span>
            </div>

            <div className="space-y-3">
              {/* Customer Bubble */}
              <div className="p-4 rounded-xl bg-white border border-[#E9EDEF] text-xs shadow-xs">
                <div className="font-bold text-[#075E54] mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> {simName} (Customer):
                </div>
                <p className="text-[#111B21]">{simResult.customerMsg}</p>
              </div>

              {/* Bot Reply Bubble */}
              <div className="p-4 rounded-xl bg-[#D9FDD3] border border-[#25D366]/30 text-xs shadow-xs">
                <div className="font-bold text-[#075E54] mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#00A884]" /> Gemini AI Bot:
                </div>
                <p className="text-[#111B21] whitespace-pre-line leading-relaxed">
                  {simResult.botReply}
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Link
                href="/inbox"
                className="text-xs text-[#00A884] hover:text-[#075E54] font-bold flex items-center gap-1 transition"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                View in Shared Inbox
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
