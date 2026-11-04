'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageSquare,
  Search,
  Sparkles,
  Zap,
  Trash2,
  AlertTriangle,
  Check,
  Send,
  RefreshCw,
  Paperclip,
  Image as ImageIcon,
  X,
  UploadCloud,
  ZoomIn,
  Link as LinkIcon,
  Loader2,
} from 'lucide-react';
import { Contact, ChatMessage, BotMode } from '@/lib/types';
import { useApp } from '@/context/AppContext';
import { soundEffects } from '@/lib/sound';

export default function InboxPage() {
  const { selectedTenant, setUnreadTotal, notify, soundEnabled } = useApp();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatSearch, setChatSearch] = useState('');
  const [agentReplyText, setAgentReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Image attachment states
  const [selectedImage, setSelectedImage] = useState<{
    previewUrl: string;
    mediaId?: string;
    fileName?: string;
    isUploading?: boolean;
  } | null>(null);
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [imageTab, setImageTab] = useState<'upload' | 'url'>('upload');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // References for live auto-scroll and tracking
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const selectedContactRef = useRef<Contact | null>(null);
  const lastMessagesCountRef = useRef<number>(0);

  // Keep ref synchronized with state
  useEffect(() => {
    selectedContactRef.current = selectedContact;
  }, [selectedContact]);

  // Smooth auto-scroll to the bottom of the conversation
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior });
    }
  };

  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages.length]);

  /**
   * Load or silently update contacts list
   */
  const loadContacts = useCallback(async (tenantId?: string, silent: boolean = false) => {
    if (!silent) setIsLoading(true);
    try {
      const param = tenantId ? `?tenantId=${tenantId}` : '';
      const res = await fetch(`/api/conversations${param}`);
      const data = await res.json();
      if (data.success && data.contacts) {
        setContacts(data.contacts);
        const unreadSum = data.contacts.reduce((acc: number, c: Contact) => acc + (c.unreadCount || 0), 0);
        setUnreadTotal(unreadSum);

        // Keep currently selected contact synced
        const currentSelected = selectedContactRef.current;
        if (currentSelected) {
          const matched = data.contacts.find((c: Contact) => c.phone === currentSelected.phone);
          if (matched) {
            setSelectedContact(matched);
          }
        } else if (!silent && data.contacts.length > 0) {
          selectContact(data.contacts[0]);
        }
      }
    } catch (err) {
      if (!silent) console.error('Failed to load contacts:', err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [setUnreadTotal]);

  // Initial load when tenant changes
  useEffect(() => {
    if (selectedTenant) {
      loadContacts(selectedTenant.id, false);
    }
  }, [selectedTenant, loadContacts]);

  /**
   * Select a contact and load their messages
   */
  const selectContact = async (c: Contact) => {
    setSelectedContact(c);
    lastMessagesCountRef.current = 0;
    try {
      const tenantParam = selectedTenant ? `&tenantId=${selectedTenant.id}` : '';
      const res = await fetch(`/api/conversations?phone=${c.phone}${tenantParam}`);
      const data = await res.json();
      if (data.success) {
        const msgs = data.activeMessages || [];
        setMessages(msgs);
        lastMessagesCountRef.current = msgs.length;
        // Mark contact as read locally
        setContacts((prev) =>
          prev.map((item) => (item.phone === c.phone ? { ...item, unreadCount: 0 } : item))
        );
        setTimeout(() => scrollToBottom('auto'), 50);
      }
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * REAL-TIME AUTO-SYNC: Poll open chat messages every 2 seconds without full reload!
   */
  useEffect(() => {
    if (!selectedTenant || !selectedContact) return;

    const phoneToWatch = selectedContact.phone;
    const tenantIdToWatch = selectedTenant.id;

    const messagePollInterval = setInterval(async () => {
      // Only poll if this contact is still selected
      if (selectedContactRef.current?.phone !== phoneToWatch) return;

      try {
        const res = await fetch(`/api/conversations?phone=${phoneToWatch}&tenantId=${tenantIdToWatch}`);
        const data = await res.json();

        if (data.success && data.activeMessages) {
          const newMsgs: ChatMessage[] = data.activeMessages;

          // Check if new messages arrived
          if (newMsgs.length > lastMessagesCountRef.current) {
            const latestMsg = newMsgs[newMsgs.length - 1];

            // If the latest message was incoming from customer or generated by bot, play sound chime
            if (latestMsg && (latestMsg.sender === 'customer' || latestMsg.sender === 'bot')) {
              if (soundEnabled) {
                soundEffects.playIncomingMessage();
              }
            }

            setMessages(newMsgs);
            lastMessagesCountRef.current = newMsgs.length;
            setTimeout(() => scrollToBottom('smooth'), 50);
          } else if (newMsgs.length === lastMessagesCountRef.current) {
            // Check if status updated (e.g. sent -> delivered)
            const hasStatusChange = newMsgs.some((m, idx) => m.status !== messages[idx]?.status);
            if (hasStatusChange) {
              setMessages(newMsgs);
            }
          }
        }
      } catch {
        // Silent poll error handling
      }
    }, 2000);

    return () => clearInterval(messagePollInterval);
  }, [selectedTenant, selectedContact, soundEnabled, messages]);

  /**
   * REAL-TIME AUTO-SYNC: Poll contacts list every 3.5 seconds to catch new incoming leads
   */
  useEffect(() => {
    if (!selectedTenant) return;

    const contactPollInterval = setInterval(() => {
      loadContacts(selectedTenant.id, true);
    }, 3500);

    return () => clearInterval(contactPollInterval);
  }, [selectedTenant, loadContacts]);

  /**
   * Toggle Bot Mode
   */
  const handleToggleContactMode = async (mode: BotMode) => {
    if (!selectedContact || !selectedTenant) return;
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: selectedTenant.id,
          phone: selectedContact.phone,
          action: 'update_mode',
          mode,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedContact({ ...selectedContact, mode });
        setContacts((prev) =>
          prev.map((c) => (c.phone === data.contact.phone ? data.contact : c))
        );
        notify({
          type: 'info',
          title: 'Bot Engine Switched',
          message: `${selectedContact.name} is now using ${mode === 'ai_chatbot' ? 'Gemini AI Chatbot' : 'Automated Template'}.`,
        });
      } else {
        notify({
          type: 'error',
          title: 'Engine Switch Failed',
          message: data.error || 'Could not update contact response mode.',
        });
      }
    } catch (err: any) {
      notify({
        type: 'error',
        title: 'Network Error',
        message: err.message || 'Error updating response engine.',
      });
    }
  };

  /**
   * Resolve Human Assistance Alert
   */
  const handleResolveAssistance = async (phone: string) => {
    if (!selectedTenant) return;
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: selectedTenant.id,
          phone,
          action: 'toggle_human',
          needsHumanAssistance: false,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setContacts((prev) =>
          prev.map((c) => (c.phone === phone ? { ...c, needsHumanAssistance: false } : c))
        );
        if (selectedContact && selectedContact.phone === phone) {
          setSelectedContact({ ...selectedContact, needsHumanAssistance: false });
        }
        notify({
          type: 'success',
          title: 'Assistance Handled',
          message: `Inquiry marked as completed and resolved.`,
        });
      } else {
        notify({
          type: 'error',
          title: 'Update Failed',
          message: data.error || 'Could not mark assistance handled.',
        });
      }
    } catch (err: any) {
      notify({
        type: 'error',
        title: 'Error',
        message: err.message || 'Network error updating status.',
      });
    }
  };

  /**
   * Delete single conversation
   */
  const handleDeleteConversation = async (phone: string, contactName?: string) => {
    const label = contactName || `+${phone}`;
    if (!confirm(`Are you sure you want to delete the chat history with ${label}? This removes all messages permanently.`)) {
      return;
    }

    try {
      const tenantParam = selectedTenant ? `&tenantId=${selectedTenant.id}` : '';
      const res = await fetch(`/api/conversations?phone=${phone}${tenantParam}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        if (selectedContact?.phone === phone) {
          setSelectedContact(null);
          setMessages([]);
        }
        setContacts((prev) => prev.filter((c) => c.phone !== phone));
        if (selectedTenant) {
          await loadContacts(selectedTenant.id, true);
        }
        notify({
          type: 'info',
          title: 'Chat Deleted',
          message: `Chat history with ${label} has been deleted.`,
        });
      } else {
        notify({
          type: 'error',
          title: 'Delete Failed',
          message: data.error || 'Failed to delete chat.',
        });
      }
    } catch (err: any) {
      notify({
        type: 'error',
        title: 'Error Deleting Chat',
        message: err.message || 'Network error deleting chat record.',
      });
    }
  };

  /**
   * Clear all conversations
   */
  const handleClearAllConversations = async () => {
    if (!selectedTenant) return;
    if (!confirm(`Are you sure you want to clean and delete ALL contacts and chat records for ${selectedTenant.name}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/conversations?clearAll=true&tenantId=${selectedTenant.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setSelectedContact(null);
        setMessages([]);
        setContacts([]);
        notify({
          type: 'info',
          title: 'Conversations Cleared',
          message: `Cleaned all contacts and message records for ${selectedTenant.name}.`,
        });
      } else {
        notify({
          type: 'error',
          title: 'Clear Failed',
          message: data.error || 'Failed to clear conversations.',
        });
      }
    } catch (err: any) {
      notify({
        type: 'error',
        title: 'Error',
        message: err.message || 'Network error clearing conversations.',
      });
    }
  };

  /**
   * Handle image file upload to WhatsApp Cloud
   */
  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedTenant) return;

    if (!file.type.startsWith('image/')) {
      notify({
        type: 'error',
        title: 'Invalid File',
        message: 'Please choose an image file (PNG, JPG, WEBP, GIF).',
      });
      return;
    }

    // Local instant preview
    const localUrl = URL.createObjectURL(file);
    setSelectedImage({
      previewUrl: localUrl,
      fileName: file.name,
      isUploading: true,
    });
    setShowAttachModal(false);
    setIsUploadingFile(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tenantId', selectedTenant.id);

      const res = await fetch('/api/upload-media', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.mediaId) {
        setSelectedImage({
          previewUrl: data.previewUrl || localUrl,
          mediaId: data.mediaId,
          fileName: file.name,
          isUploading: false,
        });
        notify({
          type: 'success',
          title: 'Image Ready',
          message: 'Uploaded to WhatsApp Cloud. Add a caption and click Send.',
        });
      } else {
        setSelectedImage(null);
        notify({
          type: 'error',
          title: 'Upload Failed',
          message: data.error || 'Failed to upload image to Meta.',
        });
      }
    } catch (err: any) {
      setSelectedImage(null);
      notify({
        type: 'error',
        title: 'Upload Error',
        message: err.message || 'Network error uploading image.',
      });
    } finally {
      setIsUploadingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  /**
   * Handle attaching an image URL
   */
  const handleApplyImageUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrlInput.trim()) return;

    setSelectedImage({
      previewUrl: imageUrlInput.trim(),
      fileName: 'Image Link',
      isUploading: false,
    });
    setImageUrlInput('');
    setShowAttachModal(false);
    notify({
      type: 'info',
      title: 'Image Attached',
      message: 'Add an optional caption and click Send to dispatch to WhatsApp.',
    });
  };

  /**
   * Send Manual Agent Reply with instant optimistic update
   */
  const handleSendAgentReply = async (e: React.FormEvent) => {
    e.preventDefault();
    const hasImage = Boolean(selectedImage);
    const hasText = Boolean(agentReplyText.trim());

    if (!selectedContact || (!hasText && !hasImage) || !selectedTenant) return;
    if (selectedImage?.isUploading) {
      notify({
        type: 'warning',
        title: 'Please Wait',
        message: 'Image is still uploading to WhatsApp Cloud...',
      });
      return;
    }

    const textToSend = agentReplyText.trim();
    const imageToSend = selectedImage ? { ...selectedImage } : null;

    setAgentReplyText('');
    setSelectedImage(null);

    // Instant optimistic message in the UI so the user sees it immediately
    const tempId = `optimistic-${Date.now()}`;
    const optimisticMessage: ChatMessage = {
      id: tempId,
      tenantId: selectedTenant.id,
      contactPhone: selectedContact.phone,
      sender: 'agent',
      text: textToSend,
      mediaUrl: imageToSend?.previewUrl,
      mediaType: imageToSend ? 'image' : undefined,
      timestamp: new Date().toISOString(),
      status: 'sent',
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    lastMessagesCountRef.current += 1;
    setTimeout(() => scrollToBottom('smooth'), 20);

    if (soundEnabled) {
      soundEffects.playOutgoingMessage();
    }

    setIsSendingReply(true);

    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: selectedTenant.id,
          phone: selectedContact.phone,
          text: textToSend,
          imageUrl: imageToSend?.previewUrl?.startsWith('http') ? imageToSend.previewUrl : undefined,
          mediaId: imageToSend?.mediaId,
          mediaPreviewUrl: imageToSend?.previewUrl,
        }),
      });
      const data = await res.json();
      if (data.success && data.message) {
        // Replace optimistic message with saved message from server
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? data.message : m))
        );
        notify({
          type: 'success',
          title: 'Dispatched to WhatsApp',
          message: imageToSend ? 'Photo and message delivered!' : `Message dispatched to ${selectedContact.name} (+${selectedContact.phone})`,
        });
      } else {
        // Remove optimistic message if dispatch failed
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        lastMessagesCountRef.current = Math.max(0, lastMessagesCountRef.current - 1);
        notify({
          type: 'error',
          title: 'Delivery Failed',
          message: data.error || 'Meta WhatsApp Cloud API could not deliver the message. Check WhatsApp phone token or customer 24-hr window.',
        });
      }
    } catch (err: any) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      lastMessagesCountRef.current = Math.max(0, lastMessagesCountRef.current - 1);
      notify({
        type: 'error',
        title: 'Send Error',
        message: err.message || 'Network error sending agent reply.',
      });
    } finally {
      setIsSendingReply(false);
    }
  };

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(chatSearch.toLowerCase()) ||
      c.phone.includes(chatSearch)
  );

  return (
    <div className="space-y-4">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#111B21] tracking-tight flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#075E54]" />
              Live WhatsApp Shared Inbox
            </h2>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#D9FDD3] border border-[#25D366]/40 text-[#075E54] text-[10px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
              Realtime Auto-Syncing
            </span>
          </div>
          <p className="text-xs text-[#667781] mt-0.5">
            Real-time customer conversations, automated Gemini AI responses, and instant human takeover without page reload.
          </p>
        </div>

        <button
          onClick={() => selectedTenant && loadContacts(selectedTenant.id, false)}
          className="px-3 py-1.5 rounded-xl border border-[#E9EDEF] bg-white hover:bg-[#F0F2F5] text-[#111B21] text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#667781]" />
          Manual Sync
        </button>
      </div>

      {/* Main Inbox Card Container */}
      <div className="bg-white rounded-2xl border border-[#E9EDEF] overflow-hidden h-[calc(100vh-210px)] min-h-[580px] flex flex-col md:flex-row">
        {/* Left Column: Contacts list */}
        <div className="w-full md:w-80 lg:w-96 border-r border-[#E9EDEF] flex flex-col bg-white">
          <div className="p-4 border-b border-[#E9EDEF] bg-[#F0F2F5]">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-[#111B21] text-sm">Customer Leads</h3>
                <p className="text-[11px] text-[#667781]">{selectedTenant?.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-white text-[#111B21] px-2 py-0.5 rounded-full font-medium border border-[#E9EDEF]">
                  {contacts.length} leads
                </span>
                {contacts.length > 0 && (
                  <button
                    onClick={handleClearAllConversations}
                    title="Clean and delete all leads"
                    className="text-[11px] text-[#667781] hover:text-rose-600 font-medium transition cursor-pointer"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-[#667781] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search name or phone..."
                value={chatSearch}
                onChange={(e) => setChatSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#E9EDEF] rounded-xl text-xs text-[#111B21] focus:outline-none focus:border-[#00A884] focus:ring-1 focus:ring-[#00A884] transition"
              />
            </div>
          </div>

          {/* Contact Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#E9EDEF]">
            {isLoading ? (
              <div className="p-8 text-center text-[#667781] text-xs">
                Loading conversations...
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="p-8 text-center text-[#667781] text-xs">
                No active conversations for {selectedTenant?.name}.
                <p className="mt-2 text-[#667781]">
                  Send a test message or try the <strong>Offline Simulator</strong>!
                </p>
              </div>
            ) : (
              filteredContacts.map((c) => {
                const isSelected = selectedContact?.phone === c.phone;
                return (
                  <div
                    key={c.id}
                    onClick={() => selectContact(c)}
                    className={`group p-3.5 cursor-pointer transition flex items-start gap-3 ${
                      isSelected
                        ? 'bg-[#F0F2F5] border-l-4 border-[#00A884]'
                        : 'hover:bg-[#F5F6F6]'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-[#EFEAE2] text-[#075E54] font-bold flex items-center justify-center flex-shrink-0 text-xs border border-[#E9EDEF]">
                      {c.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-semibold text-[#111B21] text-xs truncate">
                          {c.name}
                        </span>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className="text-[10px] text-[#667781]">
                            {new Date(c.lastMessageAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteConversation(c.phone, c.name);
                            }}
                            title="Delete this chat"
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-[#667781] hover:text-rose-600 rounded transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-[11px] text-[#667781] truncate">+{c.phone}</p>
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                            c.mode === 'ai_chatbot'
                              ? 'bg-[#D9FDD3] text-[#075E54]'
                              : 'bg-[#EFEAE2] text-[#075E54]'
                          }`}
                        >
                          {c.mode === 'ai_chatbot' ? '🤖 Gemini AI' : '⚡ Auto-Reply'}
                        </span>
                        {c.needsHumanAssistance && (
                          <span className="bg-rose-600 text-white text-[9px] px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5 animate-pulse">
                            <AlertTriangle className="w-2.5 h-2.5" /> Needs Agent
                          </span>
                        )}
                        {c.unreadCount && c.unreadCount > 0 ? (
                          <span className="bg-[#25D366] text-[#111B21] text-[9px] px-1.5 rounded-full font-bold ml-auto">
                            {c.unreadCount} new
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat messages */}
        {selectedContact ? (
          <div className="flex-1 flex flex-col bg-[#EFEAE2] min-w-0">
            {/* Active Contact Header */}
            <div className="p-4 bg-[#F0F2F5] border-b border-[#E9EDEF] flex items-center justify-between">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-[#00A884] text-white font-bold flex items-center justify-center text-sm flex-shrink-0">
                  {selectedContact.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-[#111B21] text-sm truncate">
                      {selectedContact.name}
                    </h4>
                    <span className="flex items-center gap-1 text-[10px] text-[#00A884] font-medium bg-[#D9FDD3] px-1.5 py-0.2 rounded border border-[#25D366]/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
                      Live
                    </span>
                  </div>
                  <p className="text-xs text-[#667781] truncate">
                    +{selectedContact.phone} {selectedContact.notes ? `• ${selectedContact.notes}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    handleToggleContactMode(
                      selectedContact.mode === 'ai_chatbot' ? 'automated' : 'ai_chatbot'
                    )
                  }
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 transition cursor-pointer ${
                    selectedContact.mode === 'ai_chatbot'
                      ? 'bg-[#D9FDD3] border-[#25D366]/50 text-[#075E54] hover:bg-[#D9FDD3]/80'
                      : 'bg-white border-[#E9EDEF] text-[#111B21] hover:bg-[#F0F2F5]'
                  }`}
                >
                  {selectedContact.mode === 'ai_chatbot' ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-[#00A884]" />
                      <span>Gemini AI</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 text-[#075E54]" />
                      <span>Auto-Template</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleDeleteConversation(selectedContact.phone, selectedContact.name)}
                  title="Delete this chat"
                  className="text-xs px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition flex items-center gap-1.5 font-medium cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Delete Chat</span>
                </button>
              </div>
            </div>

            {/* Human Assistance Alert Banner */}
            {selectedContact.needsHumanAssistance && (
              <div className="bg-rose-50 border-b border-rose-200 px-4 py-2.5 flex items-center justify-between text-xs text-rose-900 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 animate-bounce" />
                  <span>
                    <strong>Action Needed:</strong> Customer requested human sales assistance. You can reply directly below.
                  </span>
                </div>
                <button
                  onClick={() => handleResolveAssistance(selectedContact.phone)}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-[11px] transition flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-3 h-3" /> Mark Handled
                </button>
              </div>
            )}

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#EFEAE2]">
              {messages.length === 0 ? (
                <div className="text-center text-[#667781] text-xs py-12">
                  No messages yet with this client. Send an opening message below.
                </div>
              ) : (
                messages.map((m) => {
                  const isCustomer = m.sender === 'customer';
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${
                        isCustomer ? 'items-start' : 'items-end'
                      }`}
                    >
                      <div
                        className={`max-w-[75%] rounded-lg p-3 text-xs shadow-xs border ${
                          isCustomer
                            ? 'bg-white text-[#111B21] border-[#E9EDEF] rounded-tl-none'
                            : 'bg-[#D9FDD3] text-[#111B21] border-[#25D366]/30 rounded-tr-none'
                        }`}
                      >
                        {/* Message Metadata Header */}
                        <div
                          className={`text-[10px] font-semibold mb-1 flex items-center gap-1 ${
                            isCustomer ? 'text-[#075E54]' : 'text-[#075E54]'
                          }`}
                        >
                          {isCustomer ? (
                            <span>{selectedContact.name}</span>
                          ) : m.sender === 'bot' ? (
                            <span className="flex items-center gap-1 font-bold">
                              <Sparkles className="w-3 h-3 text-[#00A884]" />
                              {m.mode === 'ai_chatbot' ? 'Gemini AI Assistant' : 'Automated Sequence'}
                            </span>
                          ) : (
                            <span className="font-bold">Agent Reply</span>
                          )}
                        </div>

                        {/* If image is attached, show preview */}
                        {m.mediaUrl && (
                          <div className="mb-2 rounded-lg overflow-hidden border border-[#E9EDEF]/80 bg-black/5 relative group cursor-pointer max-w-sm">
                            <img
                              src={m.mediaUrl}
                              alt="WhatsApp attachment"
                              className="w-full max-h-72 object-cover rounded-lg hover:opacity-95 transition"
                              onClick={() => setLightboxUrl(m.mediaUrl!)}
                              loading="lazy"
                            />
                            <div
                              onClick={() => setLightboxUrl(m.mediaUrl!)}
                              className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                            >
                              <span className="bg-black/75 text-white text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1 font-medium shadow-sm">
                                <ZoomIn className="w-3 h-3" /> View full photo
                              </span>
                            </div>
                          </div>
                        )}

                        {m.text && <p className="whitespace-pre-line leading-relaxed text-[#111B21]">{m.text}</p>}

                        <div className="text-[9px] mt-1 text-right flex items-center justify-end gap-1 text-[#667781]">
                          <span>
                            {new Date(m.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {m.status && <span>&bull; {m.status}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              {/* Bottom scroll anchor */}
              <div ref={messagesEndRef} />
            </div>

            {/* Human Agent Takeover Box */}
            <div className="bg-[#F0F2F5] border-t border-[#E9EDEF]">
              {/* Attached Image Preview Bar */}
              {selectedImage && (
                <div className="px-3 pt-2.5 pb-2 flex items-center justify-between bg-[#E9EDEF]/70 border-b border-[#E9EDEF]">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-11 h-11 rounded-lg overflow-hidden bg-white border border-[#E9EDEF] flex-shrink-0 relative shadow-2xs">
                      <img
                        src={selectedImage.previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      {selectedImage.isUploading && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <Loader2 className="w-4 h-4 text-white animate-spin" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 text-xs">
                      <span className="font-semibold text-[#111B21] truncate block max-w-xs">
                        {selectedImage.fileName || 'Attached Photo'}
                      </span>
                      <span className="text-[10px] text-[#075E54] font-medium flex items-center gap-1">
                        {selectedImage.isUploading ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            Uploading to WhatsApp Cloud...
                          </>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#25D366]" />
                            Ready to send to client
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedImage(null)}
                    className="p-1.5 text-[#667781] hover:text-rose-600 rounded-lg hover:bg-white transition cursor-pointer"
                    title="Remove attachment"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <form
                onSubmit={handleSendAgentReply}
                className="p-3 flex items-center gap-2"
              >
                {/* Hidden File Input for Image Upload */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleFileSelected}
                  className="hidden"
                />

                {/* Attach Button */}
                <button
                  type="button"
                  onClick={() => setShowAttachModal(true)}
                  className="p-2.5 text-[#54656F] hover:text-[#00A884] hover:bg-white rounded-xl transition cursor-pointer border border-transparent hover:border-[#E9EDEF]"
                  title="Attach Photo (Upload or URL)"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  placeholder={
                    selectedImage
                      ? 'Add an optional caption for this photo...'
                      : `Reply manually on WhatsApp as ${selectedTenant?.name}...`
                  }
                  value={agentReplyText}
                  onChange={(e) => setAgentReplyText(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-white border border-[#E9EDEF] rounded-xl text-xs text-[#111B21] focus:outline-none focus:border-[#00A884] focus:ring-1 focus:ring-[#00A884] transition"
                />

                <button
                  type="submit"
                  disabled={
                    isSendingReply ||
                    (!agentReplyText.trim() && !selectedImage) ||
                    selectedImage?.isUploading
                  }
                  className="px-4 py-2.5 bg-[#00A884] hover:bg-[#075E54] disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                >
                  {isSendingReply ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Send</span>
                </button>
              </form>
            </div>

            {/* MODAL: ATTACH PHOTO */}
            {showAttachModal && (
              <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl border border-[#E9EDEF] max-w-md w-full p-5 animate-in fade-in zoom-in-95 shadow-xl">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E9EDEF] mb-4">
                    <h3 className="font-bold text-[#111B21] text-sm flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-[#075E54]" />
                      Attach Photo for WhatsApp
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowAttachModal(false)}
                      className="text-[#667781] hover:text-[#111B21] text-lg font-bold p-1 cursor-pointer"
                    >
                      &times;
                    </button>
                  </div>

                  {/* Tabs: Upload vs Link */}
                  <div className="flex border-b border-[#E9EDEF] mb-4">
                    <button
                      type="button"
                      onClick={() => setImageTab('upload')}
                      className={`flex-1 py-2 text-xs font-semibold border-b-2 transition cursor-pointer flex items-center justify-center gap-1.5 ${
                        imageTab === 'upload'
                          ? 'border-[#00A884] text-[#075E54]'
                          : 'border-transparent text-[#667781] hover:text-[#111B21]'
                      }`}
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      Upload from Computer
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageTab('url')}
                      className={`flex-1 py-2 text-xs font-semibold border-b-2 transition cursor-pointer flex items-center justify-center gap-1.5 ${
                        imageTab === 'url'
                          ? 'border-[#00A884] text-[#075E54]'
                          : 'border-transparent text-[#667781] hover:text-[#111B21]'
                      }`}
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                      Public Image URL
                    </button>
                  </div>

                  {imageTab === 'upload' ? (
                    <div className="space-y-4">
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-[#8696A0]/40 hover:border-[#00A884] bg-[#F0F2F5]/60 hover:bg-[#D9FDD3]/20 rounded-xl p-8 text-center cursor-pointer transition"
                      >
                        <UploadCloud className="w-10 h-10 text-[#075E54] mx-auto mb-2 opacity-80" />
                        <p className="text-xs font-semibold text-[#111B21]">Click to choose an image file</p>
                        <p className="text-[11px] text-[#667781] mt-1">PNG, JPG, JPEG, WEBP or GIF (Max 16MB)</p>
                      </div>
                      <p className="text-[11px] text-[#667781] leading-relaxed">
                        The image will be securely uploaded directly to Meta&apos;s WhatsApp Cloud and delivered immediately to the customer&apos;s phone.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyImageUrl} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#111B21] mb-1">
                          Direct Image Link (HTTPS)
                        </label>
                        <input
                          type="url"
                          required
                          placeholder="https://example.com/product-image.jpg"
                          value={imageUrlInput}
                          onChange={(e) => setImageUrlInput(e.target.value)}
                          className="w-full px-3 py-2 bg-[#F0F2F5] border border-[#E9EDEF] rounded-xl text-xs text-[#111B21] focus:bg-white focus:border-[#00A884] focus:ring-1 focus:ring-[#00A884] focus:outline-none transition"
                        />
                        <span className="text-[10px] text-[#667781] mt-1 block">
                          Paste a product photo from your website, catalog, or CDN.
                        </span>
                      </div>

                      {imageUrlInput.trim() && (
                        <div className="p-2 border border-[#E9EDEF] rounded-xl bg-[#F0F2F5] text-center">
                          <img
                            src={imageUrlInput.trim()}
                            alt="Preview"
                            className="max-h-36 mx-auto rounded-lg object-contain"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowAttachModal(false)}
                          className="px-3 py-2 text-xs font-semibold text-[#667781] hover:bg-[#F0F2F5] rounded-xl cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={!imageUrlInput.trim()}
                          className="px-4 py-2 bg-[#00A884] hover:bg-[#075E54] text-white text-xs font-semibold rounded-xl cursor-pointer disabled:opacity-50 transition"
                        >
                          Attach Photo
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}

            {/* LIGHTBOX MODAL: FULL RESOLUTION PHOTO VIEW */}
            {lightboxUrl && (
              <div
                onClick={() => setLightboxUrl(null)}
                className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-xs cursor-pointer animate-in fade-in"
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="relative max-w-4xl max-h-[90vh] bg-black rounded-xl overflow-hidden shadow-2xl flex flex-col items-center cursor-default"
                >
                  <button
                    onClick={() => setLightboxUrl(null)}
                    className="absolute top-3 right-3 z-10 p-2 bg-black/70 hover:bg-black text-white rounded-full transition cursor-pointer"
                    title="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <img
                    src={lightboxUrl}
                    alt="WhatsApp full preview"
                    className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-center text-[#667781]">
            <div>
              <MessageSquare className="w-12 h-12 text-[#667781]/40 mx-auto mb-3" />
              <p className="text-sm font-medium">Select a conversation from the left to inspect chat</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
