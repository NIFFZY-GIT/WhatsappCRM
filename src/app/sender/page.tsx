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
        <h2 className="text-xl font-bold text-[#111B21] tracking-tight flex items-center gap-2">
          <Send className="w-5 h-5 text-[#075E54]" />
          Send WhatsApp &amp; New Lead Intake
        </h2>
        <p className="text-xs text-[#667781] mt-1">
          Add a client and dispatch an automated opening sequence or initiate Gemini AI conversation for{' '}
          <strong className="text-[#111B21]">{selectedTenant?.name}</strong>.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E9EDEF] p-6 sm:p-8">
        <form onSubmit={handleSendLead} className="space-y-6">
          {/* Status Message */}
          {result && (
            <div
              className={`p-4 rounded-xl border text-xs flex items-start gap-3 transition animate-in fade-in ${
                result.type === 'success'
                  ? 'bg-[#D9FDD3] border-[#25D366]/60 text-[#075E54]'
                  : result.type === 'warning'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              {result.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-[#075E54] flex-shrink-0 mt-0.5" />
              ) : result.type === 'warning' ? (
                <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 leading-relaxed">
                <p className="font-semibold">{result.message}</p>
                {result.waStatus?.messageId && (
                  <p className="font-mono text-[10px] text-[#667781] mt-1">
                    Meta Message ID: {result.waStatus.messageId}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Form Inputs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#111B21] mb-1.5">
                Client Mobile Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#667781] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. 94772284950 or 919876543210 (with country code)"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F0F2F5] border border-[#E9EDEF] rounded-xl text-[#111B21] text-sm focus:border-[#00A884] focus:ring-1 focus:ring-[#00A884] focus:bg-white focus:outline-none transition"
                />
              </div>
              <p className="text-[11px] text-[#667781] mt-1">
                Enter numbers only with country code (e.g. 94 for Sri Lanka, 91 for India).
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#111B21] mb-1.5">
                Client / Lead Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#667781] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Priya Sharma"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F0F2F5] border border-[#E9EDEF] rounded-xl text-[#111B21] text-sm focus:border-[#00A884] focus:ring-1 focus:ring-[#00A884] focus:bg-white focus:outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Engine Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#111B21] mb-2">
              Select Response Engine:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setSendMode('automated')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                  sendMode === 'automated'
                    ? 'border-[#00A884] bg-[#D9FDD3]/40'
                    : 'border-[#E9EDEF] hover:border-[#8696A0] bg-white'
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      sendMode === 'automated'
                        ? 'border-[#00A884] bg-[#00A884]'
                        : 'border-[#E9EDEF]'
                    }`}
                  >
                    {sendMode === 'automated' && (
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    )}
                  </div>
                  <span className="font-semibold text-[#111B21] text-sm flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-[#00A884]" />
                    Option 1: Automated Template
                  </span>
                </div>
                <p className="text-xs text-[#667781] pl-6">
                  Sends structured welcome template customized for {selectedTenant?.name}.
                </p>
              </div>

              <div
                onClick={() => setSendMode('ai_chatbot')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                  sendMode === 'ai_chatbot'
                    ? 'border-[#00A884] bg-[#D9FDD3]/40'
                    : 'border-[#E9EDEF] hover:border-[#8696A0] bg-white'
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      sendMode === 'ai_chatbot'
                        ? 'border-[#00A884] bg-[#00A884]'
                        : 'border-[#E9EDEF]'
                    }`}
                  >
                    {sendMode === 'ai_chatbot' && (
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    )}
                  </div>
                  <span className="font-semibold text-[#111B21] text-sm flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#00A884]" />
                    Option 2: Gemini AI Chatbot
                  </span>
                </div>
                <p className="text-xs text-[#667781] pl-6">
                  Engages using Gemini 3.8 Flash trained on your live product catalogue and pricing.
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#111B21] mb-1.5">
              Client Tags &amp; Internal Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. VIP Customer, Inquiring about web application or mobile app"
              value={clientNotes}
              onChange={(e) => setClientNotes(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#F0F2F5] border border-[#E9EDEF] rounded-xl text-[#111B21] text-sm focus:border-[#00A884] focus:ring-1 focus:ring-[#00A884] focus:bg-white focus:outline-none transition"
            />
          </div>

          {/* Message Override */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#111B21] mb-1.5">
              Custom Opening Message (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Leave empty to use your default configured automated template or AI greeting..."
              value={customMsgOverride}
              onChange={(e) => setCustomMsgOverride(e.target.value)}
              className="w-full p-3.5 bg-[#F0F2F5] border border-[#E9EDEF] rounded-xl text-[#111B21] text-xs focus:border-[#00A884] focus:ring-1 focus:ring-[#00A884] focus:bg-white focus:outline-none transition font-sans"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !clientPhone.trim()}
              className="w-full py-3.5 px-6 bg-[#00A884] hover:bg-[#075E54] disabled:opacity-50 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
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
