'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Plus,
  Pencil,
  Trash2,
  Phone,
  Sparkles,
  Zap,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { BotMode, isZevaroneAdmin } from '@/lib/types';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';

export default function TenantsPage() {
  const router = useRouter();
  const {
    tenants,
    selectedTenant,
    switchTenant,
    refreshData,
    notify,
    currentUser,
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

  // Edit Company State
  const [editingTenant, setEditingTenant] = useState<any | null>(null);
  const [editName, setEditName] = useState('');
  const [editNumber, setEditNumber] = useState('');
  const [editPhoneId, setEditPhoneId] = useState('');
  const [editToken, setEditToken] = useState('');
  const [editPrompt, setEditPrompt] = useState('');
  const [editTemplate, setEditTemplate] = useState('');
  const [editMode, setEditMode] = useState<BotMode>('ai_chatbot');
  const [editIsActive, setEditIsActive] = useState(true);

  // Delete Business Modal State
  const [tenantToDelete, setTenantToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenEditModal = (t: any) => {
    setEditingTenant(t);
    setEditName(t.name || '');
    setEditNumber(t.whatsappNumber || '');
    setEditPhoneId(t.phoneNumberId || '');
    setEditToken(t.whatsappToken || '');
    setEditPrompt(t.geminiSystemPrompt || '');
    setEditTemplate(t.automatedTemplate || '');
    setEditMode(t.defaultMode || 'ai_chatbot');
    setEditIsActive(t.isActive ?? true);
  };

  const handleSaveEditTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTenant || !editName.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/edit-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: editingTenant.id,
          name: editName.trim(),
          whatsappNumber: editNumber.trim(),
          phoneNumberId: editPhoneId.trim(),
          whatsappToken: editToken.trim() || undefined,
          defaultMode: editMode,
          geminiSystemPrompt: editPrompt.trim() || undefined,
          automatedTemplate: editTemplate.trim() || undefined,
          isActive: editIsActive,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setEditingTenant(null);
        await refreshData();
        notify({
          type: 'success',
          title: 'Company Details Updated',
          message: `${editName} details have been updated successfully!`,
        });
      } else {
        notify({
          type: 'error',
          title: 'Update Failed',
          message: data.error || 'Failed to update company.',
        });
      }
    } catch (err: any) {
      notify({
        type: 'error',
        title: 'Network Error',
        message: err.message || 'Error saving company details.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
        const nameAdded = newTenantName;
        setNewTenantName('');
        setNewTenantNumber('');
        setNewTenantPhoneId('');
        setNewTenantToken('');
        setNewTenantPrompt('');
        setNewTenantTemplate('');
        await refreshData();
        switchTenant(data.tenant.id);
        notify({
          type: 'success',
          title: 'Client Business Created',
          message: `${nameAdded} is now active and ready for WhatsApp messaging.`,
        });
      } else {
        notify({
          type: 'error',
          title: 'Failed to Create Business',
          message: data.error || 'Server rejected business creation.',
        });
      }
    } catch (err: any) {
      notify({
        type: 'error',
        title: 'Error Creating Business',
        message: err.message || 'Network error.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTenant = (tenant: any) => {
    setTenantToDelete(tenant);
  };

  const confirmDeleteTenant = async () => {
    if (!tenantToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/tenants?id=${tenantToDelete.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setTenantToDelete(null);
        await refreshData();
        notify({
          type: 'success',
          title: 'Business Deleted',
          message: `${tenantToDelete.name} has been permanently deleted.`,
        });
      } else {
        notify({
          type: 'error',
          title: 'Delete Failed',
          message: data.error || 'Failed to delete business.',
        });
      }
    } catch (err: any) {
      notify({
        type: 'error',
        title: 'Error Deleting Business',
        message: err.message || 'Network error.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (currentUser && !isZevaroneAdmin(currentUser)) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[#111B21] mb-2">Zevarone Admin Access Required</h2>
        <p className="text-sm text-[#667781] mb-6 leading-relaxed">
          The Multi-Client Business Directory is restricted to authorized Zevarone administrators. Your account (<span className="text-[#111B21] font-semibold">{currentUser.email}</span>) does not have master administrative permissions.
        </p>
        <Link
          href="/inbox"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#008069] hover:bg-[#075E54] text-white font-semibold text-xs rounded-xl transition shadow-xs"
        >
          Return to Your Inbox
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#111B21] tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#075E54]" />
            Client Business Accounts (Multi-Tenant Hub)
          </h2>
          <p className="text-xs text-[#667781] mt-1">
            Host and manage multiple client companies, each with their own WhatsApp numbers, AI personas, and inboxes.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-[#00A884] hover:bg-[#075E54] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Business</span>
        </button>
      </div>

      {/* Explanatory Banner */}
      <div className="p-4 rounded-xl bg-[#111B21] text-[#E9EDEF] text-xs flex items-start gap-3 border border-[#2A3942]">
        <Sparkles className="w-5 h-5 text-[#25D366] flex-shrink-0 mt-0.5" />
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
              className={`p-6 rounded-2xl border-2 transition flex flex-col justify-between bg-white ${
                isCurrent
                  ? 'border-[#00A884] ring-2 ring-[#00A884]/20'
                  : 'border-[#E9EDEF] hover:border-[#8696A0]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      t.defaultMode === 'ai_chatbot'
                        ? 'bg-[#D9FDD3] text-[#075E54]'
                        : 'bg-[#EFEAE2] text-[#075E54]'
                    }`}
                  >
                    {t.defaultMode === 'ai_chatbot' ? '🤖 Zevarone AI' : '⚡ Auto-Reply'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(t)}
                      className="text-[#008069] bg-[#E8F5E9] hover:bg-[#D9FDD3] px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition"
                      title="Edit business settings & parameters"
                    >
                      <Pencil className="w-3 h-3" />
                      Edit Details
                    </button>
                    <button
                      onClick={() => handleDeleteTenant(t)}
                      className="text-[#667781] hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                      title="Delete business account permanently"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-[#111B21] text-lg mb-1">{t.name}</h3>
                <p className="text-xs text-[#667781] flex items-center gap-1.5 mb-4">
                  <Phone className="w-3.5 h-3.5 text-[#667781]" />
                  {t.whatsappNumber || 'No WhatsApp phone set'}
                </p>

                <div className="bg-[#F0F2F5] p-3 rounded-xl border border-[#E9EDEF] text-xs text-[#111B21] mb-5 line-clamp-3">
                  <strong className="text-[#075E54]">AI Persona:</strong> {t.geminiSystemPrompt}
                </div>
              </div>

              <button
                onClick={() => switchTenant(t.id)}
                className={`w-full py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  isCurrent
                    ? 'bg-[#00A884] text-white'
                    : 'bg-[#F0F2F5] hover:bg-[#E9EDEF] text-[#111B21]'
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
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E9EDEF] max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-[#E9EDEF] mb-4">
              <h3 className="font-bold text-[#111B21] text-lg flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#075E54]" />
                Add New Client Business
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#667781] hover:text-[#111B21] text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#111B21] mb-1">
                  Business Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Zevarone Luxury Fine Jewelry"
                  value={newTenantName}
                  onChange={(e) => setNewTenantName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F0F2F5] border border-[#E9EDEF] rounded-xl text-xs text-[#111B21] focus:bg-white focus:border-[#00A884] focus:ring-1 focus:ring-[#00A884] focus:outline-none transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#111B21] mb-1">
                    WhatsApp Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +94 77 228 4950"
                    value={newTenantNumber}
                    onChange={(e) => setNewTenantNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F0F2F5] border border-[#E9EDEF] rounded-xl text-xs text-[#111B21] focus:bg-white focus:border-[#00A884] focus:ring-1 focus:ring-[#00A884] focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#111B21] mb-1">
                    Meta Phone Number ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1409984342191428"
                    value={newTenantPhoneId}
                    onChange={(e) => setNewTenantPhoneId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F0F2F5] border border-[#E9EDEF] rounded-xl text-xs font-mono text-[#111B21] focus:bg-white focus:border-[#00A884] focus:ring-1 focus:ring-[#00A884] focus:outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#111B21] mb-1">
                  Default Automation Mode
                </label>
                <select
                  value={newTenantMode}
                  onChange={(e) => setNewTenantMode(e.target.value as BotMode)}
                  className="w-full px-3 py-2 bg-[#F0F2F5] border border-[#E9EDEF] rounded-xl text-xs text-[#111B21] focus:bg-white focus:border-[#00A884] focus:ring-1 focus:ring-[#00A884] focus:outline-none transition"
                >
                  <option value="ai_chatbot">Option 2: Zevarone AI Sales Concierge</option>
                  <option value="automated">Option 1: Automated Template</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#111B21] mb-1">
                  AI Persona Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. You are the AI concierge for Zevarone. Answer jewelry inquiries politely..."
                  value={newTenantPrompt}
                  onChange={(e) => setNewTenantPrompt(e.target.value)}
                  className="w-full p-2.5 bg-[#F0F2F5] border border-[#E9EDEF] rounded-xl text-xs text-[#111B21] focus:bg-white focus:border-[#00A884] focus:ring-1 focus:ring-[#00A884] focus:outline-none transition"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#667781] hover:bg-[#F0F2F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#00A884] hover:bg-[#075E54] disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  {isSubmitting ? 'Creating...' : 'Create Business Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Business Confirmation Modal */}
      {tenantToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Business Account?</h3>
                <p className="text-xs text-slate-500">Permanent workspace deletion</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete <strong>{tenantToDelete.name}</strong>? All catalogue items, contacts, and message history for this workspace will be deleted.
            </p>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setTenantToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDeleteTenant}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT CLIENT BUSINESS DETAILS */}
      {editingTenant && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-[#E9EDEF] max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-[#E9EDEF] mb-4">
              <div>
                <h3 className="font-bold text-[#111B21] text-lg flex items-center gap-2">
                  <Pencil className="w-5 h-5 text-[#00A884]" />
                  Edit Company Details
                </h3>
                <p className="text-xs text-[#667781] mt-0.5">
                  ID: <span className="font-mono text-[#111B21] font-semibold">{editingTenant.id}</span>
                </p>
              </div>
              <button
                onClick={() => setEditingTenant(null)}
                className="text-[#667781] hover:text-[#111B21] text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveEditTenant} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#111B21] mb-1">
                  Company / Business Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F0F2F5] border border-[#E9EDEF] rounded-xl text-xs text-[#111B21] focus:bg-white focus:border-[#00A884] focus:ring-1 focus:ring-[#00A884] focus:outline-none transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#111B21] mb-1">
                    WhatsApp Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 94772284950"
                    value={editNumber}
                    onChange={(e) => setEditNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F0F2F5] border border-[#E9EDEF] rounded-xl text-xs text-[#111B21] focus:bg-white focus:border-[#00A884] focus:ring-1 focus:ring-[#00A884] focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#111B21] mb-1">
                    Meta Phone Number ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1409984342191428"
                    value={editPhoneId}
                    onChange={(e) => setEditPhoneId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F0F2F5] border border-[#E9EDEF] rounded-xl text-xs font-mono text-[#111B21] focus:bg-white focus:border-[#00A884] focus:ring-1 focus:ring-[#00A884] focus:outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#111B21] mb-1">
                  Meta WhatsApp Access Token (Optional)
                </label>
                <input
                  type="password"
                  placeholder="Leave blank to use default system token"
                  value={editToken}
                  onChange={(e) => setEditToken(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F0F2F5] border border-[#E9EDEF] rounded-xl text-xs font-mono text-[#111B21] focus:bg-white focus:border-[#00A884] focus:ring-1 focus:ring-[#00A884] focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#111B21] mb-1">
                  Default Automation Engine
                </label>
                <select
                  value={editMode}
                  onChange={(e) => setEditMode(e.target.value as BotMode)}
                  className="w-full px-3 py-2 bg-[#F0F2F5] border border-[#E9EDEF] rounded-xl text-xs text-[#111B21] focus:bg-white focus:border-[#00A884] focus:ring-1 focus:ring-[#00A884] focus:outline-none transition"
                >
                  <option value="ai_chatbot">Option 2: Zevarone AI Sales Concierge</option>
                  <option value="automated">Option 1: Automated Template</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#111B21] mb-1">
                  Zevarone AI Persona &amp; Sales Instructions
                </label>
                <textarea
                  rows={3}
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  placeholder="You are the AI concierge for this company..."
                  className="w-full p-2.5 bg-[#F0F2F5] border border-[#E9EDEF] rounded-xl text-xs text-[#111B21] focus:bg-white focus:border-[#00A884] focus:ring-1 focus:ring-[#00A884] focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#111B21] mb-1">
                  Default Automated Welcome Template
                </label>
                <textarea
                  rows={2}
                  value={editTemplate}
                  onChange={(e) => setEditTemplate(e.target.value)}
                  placeholder="Hello {{name}}! Welcome to our store..."
                  className="w-full p-2.5 bg-[#F0F2F5] border border-[#E9EDEF] rounded-xl text-xs text-[#111B21] focus:bg-white focus:border-[#00A884] focus:ring-1 focus:ring-[#00A884] focus:outline-none transition"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="edit-is-active"
                  checked={editIsActive}
                  onChange={(e) => setEditIsActive(e.target.checked)}
                  className="rounded text-[#00A884] focus:ring-[#00A884]"
                />
                <label htmlFor="edit-is-active" className="text-xs font-semibold text-[#111B21]">
                  Company Workspace is Active
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E9EDEF]">
                <button
                  type="button"
                  onClick={() => setEditingTenant(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#667781] hover:bg-[#F0F2F5] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#00A884] hover:bg-[#075E54] disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-xs"
                >
                  {isSubmitting ? 'Saving Changes...' : 'Save Company Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
