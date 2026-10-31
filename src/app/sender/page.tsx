'use client';

import React, { useState } from 'react';
import {
  Send,
  Zap,
  Sparkles,
  Phone,
  User,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { BotMode } from '@/lib/types';
import { useApp } from '@/context/AppContext';

export default function SenderPage() {
  const { selectedTenant } = useApp();

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  const [sendMode, setSendMode] = useState<BotMode>('ai_chatbot');
  const [customMsgOverride, setCustomMsgOverride] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    type: 'success' | 'error' | 'warning';
    message: string;
    waStatus?: any;
  } | null>(null);

  const handleSendLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientPhone.trim() || !selectedTenant) return;

    setIsSubmitting(true);
    setResult(null);

    try {
      const res = await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: clientPhone.trim(),
          name: clientName.trim() || undefined,
          notes: clientNotes.trim() || undefined,
          mode: sendMode,
          customMessage: customMsgOverride.trim() || undefined,
          tenantId: selectedTenant.id,
        }),
      });

      const data = await res.json();

      if (data.success) {
        if (data.whatsapp?.success) {
          setResult({
            type: 'success',
            message: `Opening WhatsApp message successfully dispatched to +${clientPhone}! Mode: ${
              sendMode === 'ai_chatbot' ? 'Gemini AI Assistant' : 'Automated Template'
            }.`,
            waStatus: data.whatsapp,
          });
        } else {
          setResult({
            type: 'warning',
            message: `Lead saved to CRM and ready for incoming webhook, but Meta returned: ${
              data.whatsapp?.error || 'Message dispatch pending.'
            }`,
            waStatus: data.whatsapp,
          });
        }
        setClientPhone('');
        setClientName('');
        setClientNotes('');
        setCustomMsgOverride('');
      } else {
        setResult({
          type: 'error',
          message: data.error || 'Failed to process lead intake.',
        });
      }
    } catch (err: any) {
      setResult({
        type: 'error',
        message: err.message || 'Network error processing lead intake.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Send className="w-5 h-5 text-emerald-600" />
          Send WhatsApp &amp; New Lead Intake
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Add a client and dispatch an automated opening sequence or initiate Gemini AI conversation for{' '}
          <strong className="text-slate-800">{selectedTenant?.name}</strong>.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-8">
        <form onSubmit={handleSendLead} className="space-y-6">
          {/* Status Message */}
          {result && (
            <div
              className={`p-4 rounded-xl border text-xs flex items-start gap-3 transition animate-in fade-in ${
                result.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : result.type === 'warning'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              {result.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : result.type === 'warning' ? (
                <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 leading-relaxed">
                <p className="font-semibold">{result.message}</p>
                {result.waStatus?.messageId && (
                  <p className="font-mono text-[10px] text-slate-500 mt-1">
                    Meta Message ID: {result.waStatus.messageId}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Form Inputs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Client Mobile Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. 94772284950 or 919876543210 (with country code)"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Enter numbers only with country code (e.g. 94 for Sri Lanka, 91 for India).
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Client / Lead Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Priya Sharma"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Engine Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
              Select Response Engine:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setSendMode('automated')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                  sendMode === 'automated'
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      sendMode === 'automated'
                        ? 'border-emerald-600 bg-emerald-600'
                        : 'border-slate-300'
                    }`}
                  >
                    {sendMode === 'automated' && (
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    )}
                  </div>
                  <span className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-emerald-600" />
                    Option 1: Automated Template
                  </span>
                </div>
                <p className="text-xs text-slate-500 pl-6">
                  Sends structured welcome template customized for {selectedTenant?.name}.
                </p>
              </div>

              <div
                onClick={() => setSendMode('ai_chatbot')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                  sendMode === 'ai_chatbot'
                    ? 'border-indigo-500 bg-indigo-50/50 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      sendMode === 'ai_chatbot'
                        ? 'border-indigo-600 bg-indigo-600'
                        : 'border-slate-300'
                    }`}
                  >
                    {sendMode === 'ai_chatbot' && (
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    )}
                  </div>
                  <span className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    Option 2: Gemini AI Chatbot
                  </span>
                </div>
                <p className="text-xs text-slate-500 pl-6">
                  Engages using Gemini 3.8 Flash trained on your live product catalogue and pricing.
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Client Tags &amp; Internal Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. VIP Customer, Looking for custom jewelry or enterprise software"
              value={clientNotes}
              onChange={(e) => setClientNotes(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition"
            />
          </div>

          {/* Message Override */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Custom Opening Message (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Leave empty to use your default configured automated template or AI greeting..."
              value={customMsgOverride}
              onChange={(e) => setCustomMsgOverride(e.target.value)}
              className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition font-sans"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !clientPhone.trim()}
              className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Sending via WhatsApp API...' : 'Send WhatsApp Message'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
