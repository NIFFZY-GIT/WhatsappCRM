'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Sparkles,
  Zap,
  CheckCircle2,
  Phone,
  Building2,
  Check,
} from 'lucide-react';
import { BotMode } from '@/lib/types';
import { useApp } from '@/context/AppContext';

export default function SettingsPage() {
  const { selectedTenant, setSelectedTenant, refreshData, notify } = useApp();

  const [editBusinessName, setEditBusinessName] = useState('');
  const [editWhatsappNumber, setEditWhatsappNumber] = useState('');
  const [editPhoneId, setEditPhoneId] = useState('');
  const [editToken, setEditToken] = useState('');
  const [editDefaultMode, setEditDefaultMode] = useState<BotMode>('ai_chatbot');
  const [editTemplate, setEditTemplate] = useState('');
  const [editGeminiPrompt, setEditGeminiPrompt] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    if (selectedTenant) {
      setEditBusinessName(selectedTenant.name || '');
      setEditWhatsappNumber(selectedTenant.whatsappNumber || '');
      setEditPhoneId(selectedTenant.phoneNumberId || '');
      setEditToken(selectedTenant.whatsappToken || '');
      setEditDefaultMode(selectedTenant.defaultMode || 'ai_chatbot');
      setEditTemplate(selectedTenant.automatedTemplate || '');
      setEditGeminiPrompt(selectedTenant.geminiSystemPrompt || '');
    }
  }, [selectedTenant]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) return;

    setIsSaving(true);
    setSavedNotice(false);

    try {
      const res = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedTenant.id,
          name: editBusinessName,
          whatsappNumber: editWhatsappNumber,
          defaultMode: editDefaultMode,
          automatedTemplate: editTemplate,
          geminiSystemPrompt: editGeminiPrompt,
          phoneNumberId: editPhoneId,
          whatsappToken: editToken,
        }),
      });

      const data = await res.json();
      if (data.success && data.tenant) {
        setSelectedTenant(data.tenant);
        await refreshData();
        setSavedNotice(true);
        setTimeout(() => setSavedNotice(false), 3000);
        notify({
          type: 'success',
          title: 'Settings Saved to Supabase',
          message: `Updated Gemini AI instructions and rules for ${data.tenant.name}.`,
        });
      } else {
        notify({
          type: 'error',
          title: 'Failed to Save Settings',
          message: data.error || 'Database operation was rejected.',
        });
      }
    } catch (err: any) {
      notify({
        type: 'error',
        title: 'Error Saving Settings',
        message: err.message || 'Network error updating settings.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-[#111B21] tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#075E54]" />
          AI &amp; Automation Rules ({selectedTenant?.name})
        </h2>
        <p className="text-xs text-[#667781] mt-1">
          Customize automated greeting sequences and Gemini AI bot instructions specifically for this business.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E9EDEF] p-6 sm:p-8">
        <form onSubmit={handleSaveSettings} className="space-y-6">
          {savedNotice && (
            <div className="p-4 rounded-xl bg-[#D9FDD3] border border-[#25D366]/60 text-xs text-[#075E54] flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-[#075E54] flex-shrink-0" />
              <span className="font-semibold">
                Settings successfully saved to Supabase! Gemini AI will use these instructions for future messages.
              </span>
            </div>
          )}

          {/* Business Meta Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#111B21] mb-1.5">
                Business / Client Name
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-[#667781] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={editBusinessName}
                  onChange={(e) => setEditBusinessName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F0F2F5] border border-[#E9EDEF] rounded-xl text-[#111B21] text-xs font-semibold focus:border-[#00A884] focus:ring-1 focus:ring-[#00A884] focus:bg-white focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#111B21] mb-1.5">
                Client's WhatsApp Display Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#667781] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={editWhatsappNumber}
                  onChange={(e) => setEditWhatsappNumber(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F0F2F5] border border-[#E9EDEF] rounded-xl text-[#111B21] text-xs focus:border-[#00A884] focus:ring-1 focus:ring-[#00A884] focus:bg-white focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#111B21] mb-1.5">
                Client's Meta Phone Number ID
              </label>
              <input
                type="text"
                placeholder="e.g. 1409984342191428"
                value={editPhoneId}
                onChange={(e) => setEditPhoneId(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#F0F2F5] border border-[#E9EDEF] rounded-xl text-[#111B21] text-xs font-mono focus:border-[#00A884] focus:ring-1 focus:ring-[#00A884] focus:bg-white focus:outline-none transition"
              />
              <p className="text-[10px] text-[#667781] mt-1">
                Used to route incoming webhook messages to this specific business.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#111B21] mb-1.5">
                Client's Meta WhatsApp Token (Optional)
              </label>
              <input
                type="password"
                placeholder="Leave empty to use shared platform token in .env / Vercel"
                value={editToken}
                onChange={(e) => setEditToken(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#F0F2F5] border border-[#E9EDEF] rounded-xl text-[#111B21] text-xs font-mono focus:border-[#00A884] focus:ring-1 focus:ring-[#00A884] focus:bg-white focus:outline-none transition"
              />
            </div>
          </div>

          {/* Mode Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#111B21] mb-2">
              Default Mode for this Business
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setEditDefaultMode('automated')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                  editDefaultMode === 'automated'
                    ? 'border-[#00A884] bg-[#D9FDD3]/40'
                    : 'border-[#E9EDEF] bg-white hover:border-[#8696A0]'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-[#00A884]" />
                  <span className="font-bold text-[#111B21] text-sm">Option 1: Automated Template Mode</span>
                </div>
                <p className="text-xs text-[#667781]">Always sends canned welcome message with dynamic variables.</p>
              </div>

              <div
                onClick={() => setEditDefaultMode('ai_chatbot')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                  editDefaultMode === 'ai_chatbot'
                    ? 'border-[#00A884] bg-[#D9FDD3]/40'
                    : 'border-[#E9EDEF] bg-white hover:border-[#8696A0]'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-[#00A884]" />
                  <span className="font-bold text-[#111B21] text-sm">Option 2: Gemini AI Chatbot Mode</span>
                </div>
                <p className="text-xs text-[#667781]">Gemini acts as an AI employee answering customer questions.</p>
              </div>
            </div>
          </div>

          {/* Automated Template Textarea */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#111B21] mb-1.5">
              Automated Message Template
            </label>
            <textarea
              rows={4}
              value={editTemplate}
              onChange={(e) => setEditTemplate(e.target.value)}
              className="w-full p-3.5 bg-[#F0F2F5] border border-[#E9EDEF] rounded-xl text-[#111B21] text-xs font-mono focus:border-[#00A884] focus:ring-1 focus:ring-[#00A884] focus:bg-white focus:outline-none transition leading-relaxed"
            />
            <p className="text-[11px] text-[#667781] mt-1">
              Available variables: <code className="text-[#075E54] bg-[#D9FDD3] px-1 py-0.5 rounded">{'{{name}}'}</code>,{' '}
              <code className="text-[#075E54] bg-[#D9FDD3] px-1 py-0.5 rounded">{'{{businessName}}'}</code>.
            </p>
          </div>

          {/* Gemini AI System Prompt Textarea */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#111B21] mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-[#00A884]" />
                Gemini AI Persona &amp; System Instructions
              </span>
              <span className="text-[10px] text-[#075E54] font-bold bg-[#EFEAE2] border border-[#E9EDEF] px-2 py-0.5 rounded">
                Model: gemini-flash-lite-latest
              </span>
            </label>
            <textarea
              rows={5}
              value={editGeminiPrompt}
              onChange={(e) => setEditGeminiPrompt(e.target.value)}
              className="w-full p-3.5 bg-[#F0F2F5] border border-[#E9EDEF] rounded-xl text-[#111B21] text-xs focus:border-[#00A884] focus:ring-1 focus:ring-[#00A884] focus:bg-white focus:outline-none transition leading-relaxed font-sans"
              placeholder="Give the AI clear instructions on how to speak, what products to recommend, tone of voice, etc."
            />
            <p className="text-[11px] text-[#667781] mt-1">
              The AI automatically reads your <strong>Product Catalogue</strong> table and answers prices, specs, and availability.
            </p>
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3 px-6 bg-[#00A884] hover:bg-[#075E54] disabled:opacity-50 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isSaving ? 'Saving to Database...' : 'Save Automation & Bot Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
