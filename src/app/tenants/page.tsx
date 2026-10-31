'use client';

import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Pencil,
  Trash2,
  Phone,
  Sparkles,
  Zap,
} from 'lucide-react';
import { BotMode } from '@/lib/types';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';

export default function TenantsPage() {
  const router = useRouter();
  const {
    tenants,
    selectedTenant,
    switchTenant,
    refreshData,
  } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantNumber, setNewTenantNumber] = useState('');
  const [newTenantPhoneId, setNewTenantPhoneId] = useState('');
  const [newTenantToken, setNewTenantToken] = useState('');
  const [newTenantPrompt, setNewTenantPrompt] = useState('');
  const [newTenantTemplate, setNewTenantTemplate] = useState('');
  const [newTenantMode, setNewTenantMode] = useState<BotMode>('ai_chatbot');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantName.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTenantName.trim(),
          whatsappNumber: newTenantNumber.trim(),
          phoneNumberId: newTenantPhoneId.trim(),
          whatsappToken: newTenantToken.trim() || undefined,
          defaultMode: newTenantMode,
          geminiSystemPrompt: newTenantPrompt.trim() || undefined,
          automatedTemplate: newTenantTemplate.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.success && data.tenant) {
        setShowAddModal(false);
        setNewTenantName('');
        setNewTenantNumber('');
        setNewTenantPhoneId('');
        setNewTenantToken('');
        setNewTenantPrompt('');
        setNewTenantTemplate('');
        await refreshData();
        switchTenant(data.tenant.id);
      } else {
        alert(data.error || 'Failed to create business account');
      }
    } catch (err) {
      console.error(err);
      alert('Error creating business');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTenant = async (tenantId: string) => {
    if (!confirm('Are you sure you want to remove this client business and its associated products?')) return;
    try {
      const res = await fetch(`/api/tenants?id=${tenantId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        await refreshData();
      } else {
        alert(data.error || 'Failed to delete business');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-600" />
            Client Business Accounts (Multi-Tenant Hub)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Host and manage multiple client companies, each with their own WhatsApp numbers, AI personas, and inboxes.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Business</span>
        </button>
      </div>

      {/* Explanatory Banner */}
      <div className="p-4 rounded-xl bg-slate-900 text-slate-200 text-xs flex items-start gap-3 shadow-sm border border-slate-800">
        <Sparkles className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Multi-Tenant Isolation:</strong> When an incoming message reaches the webhook, Meta passes the recipient's <code>phone_number_id</code>. The backend matches this ID to the right business and uses their custom catalogue &amp; AI persona!
        </div>
      </div>

      {/* Business Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {tenants.map((t) => {
          const isCurrent = selectedTenant?.id === t.id;
          return (
            <div
              key={t.id}
              className={`p-6 rounded-2xl border-2 transition flex flex-col justify-between bg-white shadow-xs ${
                isCurrent
                  ? 'border-emerald-500 ring-2 ring-emerald-500/10'
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      t.defaultMode === 'ai_chatbot'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {t.defaultMode === 'ai_chatbot' ? '🤖 Gemini AI' : '⚡ Auto-Reply'}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        switchTenant(t.id);
                        router.push('/settings');
                      }}
                      className="text-slate-400 hover:text-emerald-600 p-1 rounded hover:bg-slate-100 transition"
                      title="Edit business settings & AI persona"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    {tenants.length > 1 && (
                      <button
                        onClick={() => handleDeleteTenant(t.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition"
                        title="Delete business"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 text-lg mb-1">{t.name}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mb-4">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {t.whatsappNumber || 'No WhatsApp phone set'}
                </p>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 mb-5 line-clamp-3">
                  <strong className="text-slate-800">AI Persona:</strong> {t.geminiSystemPrompt}
                </div>
              </div>

              <button
                onClick={() => switchTenant(t.id)}
                className={`w-full py-2.5 rounded-xl text-xs font-semibold transition ${
                  isCurrent
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                }`}
              >
                {isCurrent ? 'Active Business (Selected)' : 'Switch to this Business'}
              </button>
            </div>
          );
        })}
      </div>

      {/* MODAL: ADD CLIENT BUSINESS */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                Add New Client Business
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Business Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Zevarone Luxury Fine Jewelry"
                  value={newTenantName}
                  onChange={(e) => setNewTenantName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    WhatsApp Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +94 77 228 4950"
                    value={newTenantNumber}
                    onChange={(e) => setNewTenantNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Meta Phone Number ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1409984342191428"
                    value={newTenantPhoneId}
                    onChange={(e) => setNewTenantPhoneId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Default Automation Mode
                </label>
                <select
                  value={newTenantMode}
                  onChange={(e) => setNewTenantMode(e.target.value as BotMode)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                >
                  <option value="ai_chatbot">Option 2: Gemini AI Chatbot</option>
                  <option value="automated">Option 1: Automated Template</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  AI Persona Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. You are the AI concierge for Zevarone. Answer jewelry inquiries politely..."
                  value={newTenantPrompt}
                  onChange={(e) => setNewTenantPrompt(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow"
                >
                  {isSubmitting ? 'Creating...' : 'Create Business Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
