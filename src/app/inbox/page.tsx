'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { Contact, ChatMessage, BotMode } from '@/lib/types';
import { useApp } from '@/context/AppContext';

export default function InboxPage() {
  const { selectedTenant, setUnreadTotal } = useApp();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatSearch, setChatSearch] = useState('');
  const [agentReplyText, setAgentReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadContacts = async (tenantId?: string) => {
    setIsLoading(true);
    try {
      const param = tenantId ? `?tenantId=${tenantId}` : '';
      const res = await fetch(`/api/conversations${param}`);
      const data = await res.json();
      if (data.success && data.contacts) {
        setContacts(data.contacts);
        const unreadSum = data.contacts.reduce((acc: number, c: Contact) => acc + (c.unreadCount || 0), 0);
        setUnreadTotal(unreadSum);

        // Keep selected contact or select the first one
        if (selectedContact) {
          const stillThere = data.contacts.find((c: Contact) => c.phone === selectedContact.phone);
          if (stillThere) {
            setSelectedContact(stillThere);
          } else if (data.contacts.length > 0) {
            selectContact(data.contacts[0]);
          } else {
            setSelectedContact(null);
            setMessages([]);
          }
        } else if (data.contacts.length > 0) {
          selectContact(data.contacts[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load contacts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTenant) {
      loadContacts(selectedTenant.id);
    }
  }, [selectedTenant]);

  const selectContact = async (c: Contact) => {
    setSelectedContact(c);
    try {
      const tenantParam = selectedTenant ? `&tenantId=${selectedTenant.id}` : '';
      const res = await fetch(`/api/conversations?phone=${c.phone}${tenantParam}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.activeMessages || []);
        // Mark contact as read locally
        setContacts((prev) =>
          prev.map((item) => (item.phone === c.phone ? { ...item, unreadCount: 0 } : item))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

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
      }
    } catch (err) {
      console.error(err);
    }
  };

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
      }
    } catch (err) {
      console.error(err);
    }
  };

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
          await loadContacts(selectedTenant.id);
        }
      } else {
        alert(data.error || 'Failed to delete chat');
      }
    } catch (err) {
      console.error('Failed to delete chat:', err);
    }
  };

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
      }
    } catch (err) {
      console.error('Failed to clear contacts:', err);
    }
  };

  const handleSendAgentReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContact || !agentReplyText.trim() || !selectedTenant) return;

    const textToSend = agentReplyText.trim();
    setAgentReplyText('');
    setIsSendingReply(true);

    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: selectedTenant.id,
          phone: selectedContact.phone,
          text: textToSend,
        }),
      });
      const data = await res.json();
      if (data.success && data.message) {
        setMessages((prev) => [...prev, data.message]);
      } else {
        alert(data.error || 'Failed to send WhatsApp reply');
      }
    } catch (err) {
      console.error(err);
      alert('Error sending message');
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
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            Live WhatsApp Shared Inbox
          </h2>
          <p className="text-xs text-slate-500">
            Real-time customer conversations, automated Gemini AI responses, and human takeover.
          </p>
        </div>

        <button
          onClick={() => selectedTenant && loadContacts(selectedTenant.id)}
          className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto shadow-2xs transition"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          Refresh Inbox
        </button>
      </div>

      {/* Main Inbox Card Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden h-[calc(100vh-210px)] min-h-[580px] flex flex-col md:flex-row">
        {/* Left Column: Contacts list */}
        <div className="w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col bg-slate-50/50">
          <div className="p-4 border-b border-slate-200 bg-white">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Customer Leads</h3>
                <p className="text-[11px] text-slate-500">{selectedTenant?.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                  {contacts.length} leads
                </span>
                {contacts.length > 0 && (
                  <button
                    onClick={handleClearAllConversations}
                    title="Clean and delete all leads"
                    className="text-[11px] text-slate-400 hover:text-rose-600 font-medium transition"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search name or phone..."
                value={chatSearch}
                onChange={(e) => setChatSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 transition"
              />
            </div>
          </div>

          {/* Contact Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {isLoading ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Loading conversations...
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No active conversations for {selectedTenant?.name}.
                <p className="mt-2 text-slate-400">
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
                        ? 'bg-emerald-50/70 border-l-4 border-emerald-600'
                        : 'hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center flex-shrink-0 text-xs">
                      {c.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-semibold text-slate-900 text-xs truncate">
                          {c.name}
                        </span>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className="text-[10px] text-slate-400">
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
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-rose-600 rounded transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">+{c.phone}</p>
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                            c.mode === 'ai_chatbot'
                              ? 'bg-indigo-100 text-indigo-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {c.mode === 'ai_chatbot' ? '🤖 Gemini AI' : '⚡ Auto-Reply'}
                        </span>
                        {c.needsHumanAssistance && (
                          <span className="bg-rose-600 text-white text-[9px] px-1.5 py-0.5 rounded font-bold animate-pulse flex items-center gap-0.5">
                            <AlertTriangle className="w-2.5 h-2.5" /> Needs Agent
                          </span>
                        )}
                        {c.unreadCount && c.unreadCount > 0 ? (
                          <span className="bg-emerald-500 text-white text-[9px] px-1.5 rounded-full font-bold ml-auto">
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
          <div className="flex-1 flex flex-col bg-slate-50 min-w-0">
            {/* Active Contact Header */}
            <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between shadow-2xs">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm flex-shrink-0">
                  {selectedContact.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-900 text-sm truncate">
                    {selectedContact.name}
                  </h4>
                  <p className="text-xs text-slate-500 truncate">
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
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 transition ${
                    selectedContact.mode === 'ai_chatbot'
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700 hover:bg-indigo-100'
                      : 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  {selectedContact.mode === 'ai_chatbot' ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Gemini AI</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Auto-Template</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleDeleteConversation(selectedContact.phone, selectedContact.name)}
                  title="Delete this chat"
                  className="text-xs px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition flex items-center gap-1.5 font-medium shadow-2xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Delete Chat</span>
                </button>
              </div>
            </div>

            {/* Human Assistance Alert Banner */}
            {selectedContact.needsHumanAssistance && (
              <div className="bg-rose-50 border-b border-rose-200 px-4 py-2.5 flex items-center justify-between text-xs text-rose-900 shadow-2xs animate-in fade-in">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 animate-bounce" />
                  <span>
                    <strong>Action Needed:</strong> Customer requested human sales assistance. You can reply directly below.
                  </span>
                </div>
                <button
                  onClick={() => handleResolveAssistance(selectedContact.phone)}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-[11px] transition shadow-2xs flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> Mark Handled
                </button>
              </div>
            )}

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#e5ddd5]/30">
              {messages.length === 0 ? (
                <div className="text-center text-slate-400 text-xs py-12">
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
                        className={`max-w-[75%] rounded-2xl p-3.5 text-xs shadow-2xs ${
                          isCustomer
                            ? 'bg-white text-slate-800 rounded-tl-sm'
                            : m.sender === 'bot'
                            ? 'bg-emerald-600 text-white rounded-tr-sm'
                            : 'bg-slate-900 text-white rounded-tr-sm'
                        }`}
                      >
                        {/* Message Metadata Header */}
                        <div
                          className={`text-[10px] font-semibold mb-1 flex items-center gap-1 ${
                            isCustomer
                              ? 'text-emerald-700'
                              : m.sender === 'bot'
                              ? 'text-emerald-100'
                              : 'text-slate-300'
                          }`}
                        >
                          {isCustomer ? (
                            <span>{selectedContact.name}</span>
                          ) : m.sender === 'bot' ? (
                            <span className="flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              {m.mode === 'ai_chatbot' ? 'Gemini AI Assistant' : 'Automated Sequence'}
                            </span>
                          ) : (
                            <span>Agent Reply</span>
                          )}
                        </div>

                        <p className="whitespace-pre-line leading-relaxed">{m.text}</p>

                        <div
                          className={`text-[9px] mt-1 text-right flex items-center justify-end gap-1 ${
                            isCustomer ? 'text-slate-400' : 'text-slate-200'
                          }`}
                        >
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
            </div>

            {/* Human Agent Takeover Box */}
            <form
              onSubmit={handleSendAgentReply}
              className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
            >
              <input
                type="text"
                placeholder={`Reply manually on WhatsApp as ${selectedTenant?.name}...`}
                value={agentReplyText}
                onChange={(e) => setAgentReplyText(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 transition"
              />
              <button
                type="submit"
                disabled={isSendingReply || !agentReplyText.trim()}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-400">
            <div>
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium">Select a conversation from the left to inspect chat</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
