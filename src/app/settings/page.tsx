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
  Image as ImageIcon,
  Plus,
  Trash2,
  UploadCloud,
  Loader2,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { BotMode, WelcomeMediaItem } from '@/lib/types';
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
  const [editWelcomeMedia, setEditWelcomeMedia] = useState<WelcomeMediaItem[]>([]);
  const [editSendWelcomeMedia, setEditSendWelcomeMedia] = useState(true);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
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
      setEditWelcomeMedia(selectedTenant.welcomeMedia || []);
      setEditSendWelcomeMedia(selectedTenant.sendWelcomeMedia ?? true);
    }
  }, [selectedTenant]);

  const handleAddWelcomeMedia = () => {
    setEditWelcomeMedia((prev) => [
      ...prev,
      {
        id: 'wm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        url: '',
        caption: '',
      },
    ]);
  };

  const handleUpdateWelcomeMedia = (index: number, field: 'url' | 'caption', val: string) => {
    setEditWelcomeMedia((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: val } : item))
    );
  };

  const handleRemoveWelcomeMedia = (index: number) => {
    setEditWelcomeMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadFileForWelcome = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedTenant) return;

    if (!file.type.startsWith('image/')) {
      notify({
        type: 'error',
        title: 'Invalid File',
        message: 'Please choose an image file (PNG, JPG, WEBP).',
      });
      return;
    }

    setUploadingIndex(index);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tenantId', selectedTenant.id);

      const res = await fetch('/api/upload-media', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && (data.previewUrl || data.mediaId)) {
        // Use the base64 or public data URL as the persistent link
        handleUpdateWelcomeMedia(index, 'url', data.previewUrl || '');
        notify({
          type: 'success',
          title: 'Photo Uploaded',
          message: 'Image ready for welcome message sequence.',
        });
      } else {
        notify({
          type: 'error',
          title: 'Upload Failed',
          message: data.error || 'Failed to process image upload.',
        });
      }
    } catch (err: any) {
      notify({
        type: 'error',
        title: 'Upload Error',
        message: err.message || 'Network error uploading photo.',
      });
    } finally {
      setUploadingIndex(null);
    }
  };

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
          welcomeMedia: editWelcomeMedia,
          sendWelcomeMedia: editSendWelcomeMedia,
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
          title: 'Settings Saved Successfully',
          message: `Updated Zevarone AI instructions and rules for ${data.tenant.name}.`,
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
          Customize automated greeting sequences and Zevarone AI bot instructions specifically for this business.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E9EDEF] p-6 sm:p-8">
        <form onSubmit={handleSaveSettings} className="space-y-6">
          {savedNotice && (
            <div className="p-4 rounded-xl bg-[#D9FDD3] border border-[#25D366]/60 text-xs text-[#075E54] flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-[#075E54] flex-shrink-0" />
              <span className="font-semibold">
                Settings successfully saved to Cloud! Zevarone AI will use these instructions for future messages.
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
                  <span className="font-bold text-[#111B21] text-sm">Option 2: Zevarone AI Autonomous Concierge Mode</span>
                </div>
                <p className="text-xs text-[#667781]">Zevarone AI acts as a dedicated 24/7 sales agent answering customer questions.</p>
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

          {/* Welcome Media Section (First Message Multiple Photos & Captions) */}
          <div className="p-5 rounded-2xl border border-[#E9EDEF] bg-[#F0F2F5]/50 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#075E54]" />
                  <h3 className="font-bold text-[#111B21] text-sm">
                    First Message Welcome Photos &amp; Captions
                  </h3>
                  <span className="text-[10px] font-bold bg-[#D9FDD3] text-[#075E54] px-2 py-0.5 rounded-full border border-[#25D366]/30">
                    Multiple Media Supported
                  </span>
                </div>
                <p className="text-[11px] text-[#667781] mt-0.5">
                  When a customer contacts your business for the first time, these photos will automatically be delivered in sequence with their captions.
                </p>
              </div>

              {/* Toggle switch */}
              <label className="flex items-center gap-2 cursor-pointer select-none self-start sm:self-auto">
                <input
                  type="checkbox"
                  checked={editSendWelcomeMedia}
                  onChange={(e) => setEditSendWelcomeMedia(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-[#8696A0]/40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#8696A0] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00A884]"></div>
                <span className="text-xs font-semibold text-[#111B21]">
                  {editSendWelcomeMedia ? 'Enabled' : 'Disabled'}
                </span>
              </label>
            </div>

            {/* List of welcome media cards */}
            {editWelcomeMedia.length === 0 ? (
              <div className="text-center py-6 border-2 border-dashed border-[#8696A0]/30 rounded-xl bg-white/70">
                <ImageIcon className="w-8 h-8 text-[#8696A0] mx-auto mb-2 opacity-50" />
                <p className="text-xs font-medium text-[#111B21]">No welcome photos configured yet.</p>
                <p className="text-[11px] text-[#667781] mt-0.5">
                  Click below to add a welcome brochure, product flyer, or showroom photo!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {editWelcomeMedia.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-4 bg-white border border-[#E9EDEF] rounded-xl shadow-2xs space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-[#E9EDEF]">
                      <span className="text-xs font-bold text-[#075E54] flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-[#D9FDD3] text-[#075E54] flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        Welcome Photo #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveWelcomeMedia(idx)}
                        className="text-[#667781] hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition cursor-pointer"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* Image Preview & Upload */}
                      <div className="space-y-2">
                        <label className="block text-[11px] font-semibold text-[#111B21]">
                          Photo Image
                        </label>
                        <div className="h-28 rounded-lg overflow-hidden border border-[#E9EDEF] bg-[#F0F2F5] relative flex items-center justify-center group">
                          {item.url ? (
                            <img
                              src={item.url}
                              alt="Welcome Photo"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="text-center p-2 text-[#8696A0]">
                              <ImageIcon className="w-6 h-6 mx-auto mb-1 opacity-50" />
                              <span className="text-[10px]">No image set</span>
                            </div>
                          )}

                          {uploadingIndex === idx && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[10px] gap-1.5">
                              <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
                            </div>
                          )}
                        </div>

                        {/* File Upload Button */}
                        <label className="w-full py-1.5 px-3 bg-[#E9EDEF] hover:bg-[#8696A0]/20 rounded-lg text-[11px] font-semibold text-[#111B21] flex items-center justify-center gap-1.5 cursor-pointer transition">
                          <UploadCloud className="w-3.5 h-3.5 text-[#075E54]" />
                          <span>Upload from Device</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleUploadFileForWelcome(idx, e)}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* Image URL & Caption Inputs */}
                      <div className="md:col-span-2 space-y-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-[#111B21] mb-1">
                            Direct Image URL (or uploaded link)
                          </label>
                          <input
                            type="text"
                            placeholder="https://example.com/welcome-banner.jpg"
                            value={item.url}
                            onChange={(e) => handleUpdateWelcomeMedia(idx, 'url', e.target.value)}
                            className="w-full px-3 py-2 bg-[#F0F2F5] border border-[#E9EDEF] rounded-xl text-xs text-[#111B21] font-mono focus:bg-white focus:border-[#00A884] focus:outline-none transition"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-[#111B21] mb-1">
                            Caption for this Photo (Optional)
                          </label>
                          <textarea
                            rows={2}
                            placeholder="e.g. Welcome {{name}} to {{businessName}}! 💎 Here is our exclusive new collection."
                            value={item.caption || ''}
                            onChange={(e) => handleUpdateWelcomeMedia(idx, 'caption', e.target.value)}
                            className="w-full p-2.5 bg-[#F0F2F5] border border-[#E9EDEF] rounded-xl text-xs text-[#111B21] focus:bg-white focus:border-[#00A884] focus:outline-none transition"
                          />
                          <span className="text-[10px] text-[#667781] mt-0.5 block">
                            Variables: <code className="text-[#075E54] bg-[#D9FDD3] px-1 rounded">{'{{name}}'}</code>, <code className="text-[#075E54] bg-[#D9FDD3] px-1 rounded">{'{{businessName}}'}</code>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Photo Button */}
            <button
              type="button"
              onClick={handleAddWelcomeMedia}
              className="w-full py-2.5 px-4 border-2 border-dashed border-[#00A884]/40 hover:border-[#00A884] bg-white hover:bg-[#D9FDD3]/20 text-[#075E54] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Another Welcome Photo</span>
            </button>
          </div>

          {/* Gemini AI System Prompt Textarea */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#111B21] mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-[#00A884]" />
                Zevarone AI Persona &amp; System Instructions
              </span>
              <span className="text-[10px] text-[#075E54] font-bold bg-[#EFEAE2] border border-[#E9EDEF] px-2 py-0.5 rounded">
                Engine: Zevarone Neural v2.5
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
