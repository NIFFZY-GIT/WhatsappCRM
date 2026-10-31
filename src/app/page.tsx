'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Bot,
  Send,
  Settings,
  Sparkles,
  Phone,
  User,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  ExternalLink,
  ShieldCheck,
  Zap,
  Clock,
  Check,
  Search,
  MessageCircle,
  HelpCircle,
  Terminal,
  Building2,
  Plus,
  Trash2,
  Briefcase,
  Users,
  ShoppingBag,
  Package,
  Tag,
  AlertTriangle,
  Pencil,
} from 'lucide-react';
import { Contact, ChatMessage, AppSettings, BotMode, Tenant, ProductItem } from '@/lib/types';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<
    'sender' | 'inbox' | 'catalogue' | 'automation' | 'tenants' | 'simulator' | 'setup'
  >('sender');

  // Multi-tenant businesses state
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [showAddTenantModal, setShowAddTenantModal] = useState(false);
  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantNumber, setNewTenantNumber] = useState('');
  const [newTenantPhoneId, setNewTenantPhoneId] = useState('');
  const [newTenantToken, setNewTenantToken] = useState('');
  const [newTenantPrompt, setNewTenantPrompt] = useState('');
  const [newTenantTemplate, setNewTenantTemplate] = useState('');
  const [newTenantMode, setNewTenantMode] = useState<BotMode>('ai_chatbot');

  // Products catalogue state
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdCat, setNewProdCat] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdStock, setNewProdStock] = useState(true);

  // Edit product state
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [editProdName, setEditProdName] = useState('');
  const [editProdPrice, setEditProdPrice] = useState('');
  const [editProdCat, setEditProdCat] = useState('');
  const [editProdDesc, setEditProdDesc] = useState('');
  const [editProdStock, setEditProdStock] = useState(true);
  const [isUpdatingProduct, setIsUpdatingProduct] = useState(false);

  // Contacts and active conversation
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatSearch, setChatSearch] = useState('');
  const [agentReplyText, setAgentReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  // Settings & Env
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [envStatus, setEnvStatus] = useState<{
    hasWhatsAppToken: boolean;
    hasPhoneNumberId: boolean;
    hasWabaId: boolean;
    hasGeminiKey: boolean;
    verifyToken: string;
    phoneNumberId: string | null;
    appUrl: string;
  } | null>(null);

  // Lead / Sender form state
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  const [sendMode, setSendMode] = useState<BotMode>('ai_chatbot');
  const [customMsgOverride, setCustomMsgOverride] = useState('');
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [leadSendResult, setLeadSendResult] = useState<{
    type: 'success' | 'error' | 'warning';
    message: string;
    waStatus?: any;
  } | null>(null);

  // Automation settings editing state
  const [editDefaultMode, setEditDefaultMode] = useState<BotMode>('ai_chatbot');
  const [editTemplate, setEditTemplate] = useState('');
  const [editGeminiPrompt, setEditGeminiPrompt] = useState('');
  const [editBusinessName, setEditBusinessName] = useState('');
  const [editWhatsappNumber, setEditWhatsappNumber] = useState('');
  const [editPhoneId, setEditPhoneId] = useState('');
  const [editToken, setEditToken] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSavedNotice, setSettingsSavedNotice] = useState(false);

  // Simulator state
  const [simPhone, setSimPhone] = useState('919876543210');
  const [simName, setSimName] = useState('Priya Sharma');
  const [simMessage, setSimMessage] = useState('Hi! Can you tell me your prices and services?');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResult, setSimResult] = useState<{
    customerMsg?: string;
    botReply?: string;
    mode?: string;
  } | null>(null);

  // Connection testing state
  const [isTestingConn, setIsTestingConn] = useState(false);
  const [testResults, setTestResults] = useState<{
    whatsapp?: { connected: boolean; message: string };
    gemini?: { connected: boolean; message: string };
  } | null>(null);

  // Copied feedback
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Fetch initial data
  const loadData = async (tenantIdOverride?: string) => {
    try {
      // 1. Fetch tenants
      const tenantsRes = await fetch('/api/tenants');
      const tenantsData = await tenantsRes.json();
      let activeT = selectedTenant;
      if (tenantsData.tenants && tenantsData.tenants.length > 0) {
        setTenants(tenantsData.tenants);
        const targetId = tenantIdOverride || selectedTenant?.id || tenantsData.tenants[0].id;
        activeT = tenantsData.tenants.find((t: Tenant) => t.id === targetId) || tenantsData.tenants[0];
        setSelectedTenant(activeT);
        if (activeT) {
          setEditBusinessName(activeT.name);
          setEditWhatsappNumber(activeT.whatsappNumber || '');
          setEditDefaultMode(activeT.defaultMode);
          setEditTemplate(activeT.automatedTemplate);
          setEditGeminiPrompt(activeT.geminiSystemPrompt);
          setEditPhoneId(activeT.phoneNumberId || '');
          setEditToken(activeT.whatsappToken || '');
          setSendMode(activeT.defaultMode);
        }
      }

      // 2. Fetch settings & env
      const settingsRes = await fetch('/api/settings');
      const settingsData = await settingsRes.json();
      if (settingsData.settings) {
        setSettings(settingsData.settings);
      }
      if (settingsData.envStatus) {
        setEnvStatus(settingsData.envStatus);
      }

      // 3. Fetch conversations for active tenant
      const activeTenantId = activeT?.id || tenantIdOverride;
      const convRes = await fetch(
        `/api/conversations${activeTenantId ? `?tenantId=${activeTenantId}` : ''}`
      );
      const convData = await convRes.json();
      if (convData.contacts) {
        setContacts(convData.contacts);
        if (!selectedContact && convData.contacts.length > 0) {
          selectContact(convData.contacts[0], activeTenantId);
        } else if (selectedContact) {
          const stillExists = convData.contacts.find((c: Contact) => c.phone === selectedContact.phone);
          if (!stillExists) {
            setSelectedContact(convData.contacts[0] || null);
            setMessages([]);
          }
        }
      }

      // 4. Fetch product catalogue for active tenant
      const prodRes = await fetch(
        `/api/products${activeTenantId ? `?tenantId=${activeTenantId}` : ''}`
      );
      const prodData = await prodRes.json();
      if (prodData.products) {
        setProducts(prodData.products);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSwitchTenant = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setEditBusinessName(tenant.name);
    setEditWhatsappNumber(tenant.whatsappNumber || '');
    setEditDefaultMode(tenant.defaultMode);
    setEditTemplate(tenant.automatedTemplate);
    setEditGeminiPrompt(tenant.geminiSystemPrompt);
    setEditPhoneId(tenant.phoneNumberId || '');
    setEditToken(tenant.whatsappToken || '');
    setSendMode(tenant.defaultMode);
    setSelectedContact(null);
    setMessages([]);
    loadData(tenant.id);
  };

  // Poll active conversation when viewing inbox
  useEffect(() => {
    if (!selectedContact || !selectedTenant) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/conversations?phone=${selectedContact.phone}&tenantId=${selectedTenant.id}`
        );
        const data = await res.json();
        if (data.activeMessages) {
          setMessages(data.activeMessages);
        }
        if (data.contacts) {
          setContacts(data.contacts);
        }
      } catch (e) {
        // quiet error
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [selectedContact, selectedTenant]);

  const selectContact = async (contact: Contact, tenantIdOverride?: string) => {
    setSelectedContact(contact);
    const tId = tenantIdOverride || selectedTenant?.id;
    try {
      const res = await fetch(
        `/api/conversations?phone=${contact.phone}${tId ? `&tenantId=${tId}` : ''}`
      );
      const data = await res.json();
      if (data.activeMessages) {
        setMessages(data.activeMessages);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendLeadMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientPhone || !selectedTenant) return;

    setIsSubmittingLead(true);
    setLeadSendResult(null);

    try {
      const res = await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: selectedTenant.id,
          name: clientName || undefined,
          phone: clientPhone,
          notes: clientNotes,
          mode: sendMode,
          customMessage: customMsgOverride || undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setLeadSendResult({
          type: data.whatsappApiStatus?.success ? 'success' : 'warning',
          message: data.notice,
          waStatus: data.whatsappApiStatus,
        });

        // Refresh contacts
        await loadData(selectedTenant.id);
        if (data.contact) {
          selectContact(data.contact, selectedTenant.id);
        }
      } else {
        setLeadSendResult({
          type: 'error',
          message: data.error || 'Failed to trigger message',
        });
      }
    } catch (err: any) {
      setLeadSendResult({
        type: 'error',
        message: err.message || 'Network error sending message',
      });
    } finally {
      setIsSubmittingLead(false);
    }
  };

  const handleSendAgentReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentReplyText.trim() || !selectedContact || !selectedTenant) return;

    setIsSendingReply(true);
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: selectedTenant.id,
          phone: selectedContact.phone,
          text: agentReplyText,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setAgentReplyText('');
        // Refresh messages
        const refreshRes = await fetch(
          `/api/conversations?phone=${selectedContact.phone}&tenantId=${selectedTenant.id}`
        );
        const refreshData = await refreshRes.json();
        if (refreshData.activeMessages) {
          setMessages(refreshData.activeMessages);
        }
      }
    } catch (err) {
      console.error('Failed to send agent reply:', err);
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleToggleContactMode = async (newMode: BotMode) => {
    if (!selectedContact || !selectedTenant) return;
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: selectedTenant.id,
          phone: selectedContact.phone,
          mode: newMode,
          action: 'update_mode',
        }),
      });
      const data = await res.json();
      if (data.success && data.contact) {
        setSelectedContact(data.contact);
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
    if (!confirm(`Are you sure you want to delete the chat history with ${label}? This will remove all messages and lead data.`)) {
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
          await loadData(selectedTenant.id);
        }
      } else {
        alert(data.error || 'Failed to delete chat');
      }
    } catch (err) {
      console.error('Failed to delete chat:', err);
      alert('Error deleting chat');
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
        await loadData(selectedTenant.id);
      }
    } catch (err) {
      console.error('Failed to clear contacts:', err);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim() || !newProdPrice.trim() || !selectedTenant) return;
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: selectedTenant.id,
          name: newProdName.trim(),
          price: newProdPrice.trim(),
          category: newProdCat.trim() || 'General',
          description: newProdDesc.trim(),
          inStock: newProdStock,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddProductModal(false);
        setNewProdName('');
        setNewProdPrice('');
        setNewProdCat('');
        setNewProdDesc('');
        setNewProdStock(true);
        await loadData(selectedTenant.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to remove this product from the catalogue?')) return;
    try {
      const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success && selectedTenant) {
        await loadData(selectedTenant.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenEditProduct = (p: ProductItem) => {
    setEditingProduct(p);
    setEditProdName(p.name);
    setEditProdPrice(p.price);
    setEditProdCat(p.category || 'General');
    setEditProdDesc(p.description || '');
    setEditProdStock(p.inStock);
    setShowEditProductModal(true);
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editProdName.trim() || !editProdPrice.trim() || !selectedTenant) return;

    setIsUpdatingProduct(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingProduct.id,
          tenantId: selectedTenant.id,
          name: editProdName.trim(),
          price: editProdPrice.trim(),
          category: editProdCat.trim() || 'General',
          description: editProdDesc.trim(),
          inStock: editProdStock,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowEditProductModal(false);
        setEditingProduct(null);
        await loadData(selectedTenant.id);
      } else {
        alert(data.error || 'Failed to update product');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating product');
    } finally {
      setIsUpdatingProduct(false);
    }
  };

  const handleSaveTenantSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) return;

    setIsSavingSettings(true);
    setSettingsSavedNotice(false);

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
      if (data.success) {
        setSelectedTenant(data.tenant);
        setTenants((prev) =>
          prev.map((t) => (t.id === data.tenant.id ? data.tenant : t))
        );
        setSettingsSavedNotice(true);
        setTimeout(() => setSettingsSavedNotice(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleCreateNewTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantName.trim()) return;

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
      if (data.success) {
        setShowAddTenantModal(false);
        setNewTenantName('');
        setNewTenantNumber('');
        setNewTenantPhoneId('');
        setNewTenantToken('');
        setNewTenantPrompt('');
        setNewTenantTemplate('');
        await loadData(data.tenant.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTenant = async (tenantId: string) => {
    if (!confirm('Are you sure you want to remove this client business?')) return;
    try {
      const res = await fetch(`/api/tenants?id=${tenantId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        await loadData();
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunDiagnostics = async () => {
    setIsTestingConn(true);
    setTestResults(null);
    try {
      const res = await fetch('/api/test-connection');
      const data = await res.json();
      setTestResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTestingConn(false);
    }
  };

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
        await loadData(selectedTenant.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(chatSearch.toLowerCase()) ||
      c.phone.includes(chatSearch)
  );

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 font-sans">
      {/* Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight">WhatsApp CRM Hub</span>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-medium border border-emerald-500/30">
                  Multi-Business SaaS
                </span>
                <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-medium border border-indigo-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Gemini AI
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Automated Messages & AI Chatbots for Multiple Clients & Phone Numbers
              </p>
            </div>
          </div>

          {/* Business Tenant Selector & Diagnostic buttons */}
          <div className="flex items-center space-x-3 text-xs">
            {/* Active Business Dropdown */}
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200">
              <Building2 className="w-4 h-4 text-emerald-400 mr-2 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-semibold uppercase leading-tight">
                  Active Client Business:
                </span>
                <select
                  value={selectedTenant?.id || ''}
                  onChange={(e) => {
                    const match = tenants.find((t) => t.id === e.target.value);
                    if (match) handleSwitchTenant(match);
                  }}
                  className="bg-transparent text-white font-bold focus:outline-none cursor-pointer text-xs"
                >
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                      {t.name} ({t.whatsappNumber || 'Default No.'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={() => setShowAddTenantModal(true)}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center gap-1 transition"
              title="Add another business client account"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Client</span>
            </button>

            <button
              onClick={handleRunDiagnostics}
              disabled={isTestingConn}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title="Test API Keys health"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingConn ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">{isTestingConn ? 'Testing...' : 'Check APIs'}</span>
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 flex space-x-1 overflow-x-auto text-sm">
          <button
            onClick={() => setActiveTab('sender')}
            className={`py-3 px-4 font-medium border-b-2 flex items-center space-x-2 transition whitespace-nowrap ${
              activeTab === 'sender'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Send & Trigger Client</span>
          </button>

          <button
            onClick={() => setActiveTab('inbox')}
            className={`py-3 px-4 font-medium border-b-2 flex items-center space-x-2 transition whitespace-nowrap ${
              activeTab === 'inbox'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>Shared Inbox ({selectedTenant?.name?.split(' ')[0]})</span>
            {contacts.filter((c) => c.needsHumanAssistance).length > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold animate-pulse">
                🚨 {contacts.filter((c) => c.needsHumanAssistance).length} Action
              </span>
            )}
            {contacts.reduce((acc, c) => acc + (c.unreadCount || 0), 0) > 0 && (
              <span className="bg-emerald-500 text-slate-950 text-xs px-1.5 py-0.2 rounded-full font-bold">
                {contacts.reduce((acc, c) => acc + (c.unreadCount || 0), 0)}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('catalogue')}
            className={`py-3 px-4 font-medium border-b-2 flex items-center space-x-2 transition whitespace-nowrap ${
              activeTab === 'catalogue'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Product Catalogue ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('automation')}
            className={`py-3 px-4 font-medium border-b-2 flex items-center space-x-2 transition whitespace-nowrap ${
              activeTab === 'automation'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Custom Bot & Template Rules</span>
          </button>

          <button
            onClick={() => setActiveTab('tenants')}
            className={`py-3 px-4 font-medium border-b-2 flex items-center space-x-2 transition whitespace-nowrap ${
              activeTab === 'tenants'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Business Accounts ({tenants.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`py-3 px-4 font-medium border-b-2 flex items-center space-x-2 transition whitespace-nowrap ${
              activeTab === 'simulator'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Message Simulator</span>
          </button>

          <button
            onClick={() => setActiveTab('setup')}
            className={`py-3 px-4 font-medium border-b-2 flex items-center space-x-2 transition whitespace-nowrap ${
              activeTab === 'setup'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Meta Webhook & API Keys</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Active Client Business Context Bar */}
        {selectedTenant && (
          <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-center justify-between text-xs text-emerald-900 shadow-sm">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
              <span>
                Managing: <strong>{selectedTenant.name}</strong> &bull; WhatsApp Number:{' '}
                <code>{selectedTenant.whatsappNumber || 'Uses Master Account'}</code> &bull; Mode:{' '}
                <span className="font-semibold uppercase">{selectedTenant.defaultMode}</span>
              </span>
            </div>
            <button
              onClick={() => setActiveTab('automation')}
              className="text-emerald-700 underline font-semibold hover:text-emerald-800"
            >
              Edit Bot Persona / Template
            </button>
          </div>
        )}

        {/* Diagnostic Results Banner */}
        {testResults && (
          <div className="mb-6 p-4 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                API Connection Diagnostics
              </h3>
              <button
                onClick={() => setTestResults(null)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Dismiss
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div
                className={`p-3 rounded-lg border ${
                  testResults.whatsapp?.connected
                    ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-800/80 text-rose-300'
                }`}
              >
                <div className="font-semibold mb-1 flex items-center gap-1.5">
                  {testResults.whatsapp?.connected ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                  )}
                  WhatsApp Cloud API
                </div>
                <p className="text-slate-300">{testResults.whatsapp?.message}</p>
              </div>

              <div
                className={`p-3 rounded-lg border ${
                  testResults.gemini?.connected
                    ? 'bg-indigo-950/40 border-indigo-800/80 text-indigo-300'
                    : 'bg-rose-950/40 border-rose-800/80 text-rose-300'
                }`}
              >
                <div className="font-semibold mb-1 flex items-center gap-1.5">
                  {testResults.gemini?.connected ? (
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                  )}
                  Google Gemini AI API
                </div>
                <p className="text-slate-300">{testResults.gemini?.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: SENDER & TRIGGER */}
        {activeTab === 'sender' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-8">
              <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <Send className="w-5 h-5 text-emerald-600" />
                    Send Automated Message / AI Greeting
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Sending on behalf of: <strong className="text-slate-800">{selectedTenant?.name}</strong>
                  </p>
                </div>
              </div>

              {leadSendResult && (
                <div
                  className={`mb-6 p-4 rounded-xl text-sm border flex items-start gap-3 ${
                    leadSendResult.type === 'success'
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                      : leadSendResult.type === 'warning'
                      ? 'bg-amber-50 text-amber-900 border-amber-200'
                      : 'bg-rose-50 text-rose-900 border-rose-200'
                  }`}
                >
                  {leadSendResult.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  ) : leadSendResult.type === 'warning' ? (
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{leadSendResult.message}</p>
                    {leadSendResult.type === 'warning' && (
                      <p className="text-xs text-amber-800 mt-1">
                        Tip: In Meta Developer test sandbox, ensure this recipient number is added in your Meta Dashboard under WhatsApp &gt; API Setup &gt; "To" numbers.
                      </p>
                    )}
                  </div>
                </div>
              )}

              <form onSubmit={handleSendLeadMessage} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Client Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. 919876543210 or 9876543210 (include country code)"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Country code + mobile number (e.g. 91 for India, 1 for US/Canada).
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Client Name
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

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                    Select Response Engine:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div
                      onClick={() => setSendMode('automated')}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                        sendMode === 'automated'
                          ? 'border-emerald-500 bg-emerald-50/50 shadow-sm'
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
                          Option 1: Automated Message
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
                          ? 'border-indigo-500 bg-indigo-50/50 shadow-sm'
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
                          Option 2: Gemini AI Bot
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 pl-6">
                        Uses {selectedTenant?.name}'s unique AI persona to chat intelligently on WhatsApp.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Custom Message Override (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Leave empty to use the selected engine..."
                    value={customMsgOverride}
                    onChange={(e) => setCustomMsgOverride(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Internal CRM Notes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. High priority client from referral"
                    value={clientNotes}
                    onChange={(e) => setClientNotes(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingLead}
                  className={`w-full py-3.5 px-6 rounded-xl text-white font-semibold flex items-center justify-center space-x-2 shadow-lg transition ${
                    sendMode === 'ai_chatbot'
                      ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30'
                      : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                  } ${isSubmittingLead ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {isSubmittingLead
                      ? 'Connecting & Sending...'
                      : sendMode === 'ai_chatbot'
                      ? `Send & Activate AI Bot for ${selectedTenant?.name}`
                      : `Send Automated Message for ${selectedTenant?.name}`}
                  </span>
                </button>
              </form>
            </div>

            {/* Right Panel: Preview & Business Info */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-900 rounded-2xl shadow-sm border border-slate-800 p-6 text-white">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                  <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                    Preview: {selectedTenant?.name}
                  </span>
                  <span className="text-xs text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Ready
                  </span>
                </div>

                <div className="bg-[#0b141a] rounded-xl p-4 border border-slate-800 relative overflow-hidden">
                  <div className="text-[11px] text-slate-400 mb-3 text-center bg-slate-800/60 py-1 rounded-md">
                    Today &bull; Verified WhatsApp Business
                  </div>

                  <div className="max-w-[85%] ml-auto bg-[#005c4b] text-slate-100 rounded-lg p-3 text-xs leading-relaxed shadow relative">
                    <div className="whitespace-pre-line">
                      {customMsgOverride ? (
                        customMsgOverride
                      ) : sendMode === 'automated' ? (
                        (selectedTenant?.automatedTemplate || '')
                          .replace(/\{\{name\}\}/gi, clientName || 'Client')
                          .replace(/\{\{phone\}\}/gi, clientPhone || '+91...')
                          .replace(/\{\{businessName\}\}/gi, selectedTenant?.name || 'Business')
                      ) : (
                        `Hello ${clientName || 'Valued Client'}! ✨ Welcome to ${selectedTenant?.name}. I am your AI assistant. How can I help you today?`
                      )}
                    </div>
                    <div className="text-[10px] text-emerald-200/70 text-right mt-1 flex items-center justify-end gap-1">
                      <span>Just now</span>
                      <Check className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </div>

              {/* B2B Multi-Tenant Business Architecture Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6">
                <h3 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-indigo-600" />
                  How Multi-Client Automation Works
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  You can provide this WhatsApp automation system as a service to multiple businesses:
                </p>
                <ul className="text-xs text-slate-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                      1
                    </span>
                    <span>
                      <strong>Unique Phone Numbers:</strong> Each business has their own registered WhatsApp Number and Meta Phone Number ID.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                      2
                    </span>
                    <span>
                      <strong>Smart Webhook Routing:</strong> When a customer messages any number, Meta includes <code>phone_number_id</code>. The webhook instantly identifies which business was contacted and replies with their specific AI knowledge base!
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                      3
                    </span>
                    <span>
                      <strong>Isolated Inboxes:</strong> Leads and customer messages for Business A never mix with Business B.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LIVE WHATSAPP INBOX */}
        {activeTab === 'inbox' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden h-[750px] flex flex-col md:flex-row">
            {/* Left Column: Contacts list */}
            <div className="w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col bg-slate-50/50">
              <div className="p-4 border-b border-slate-200 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Inquiries</h3>
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
                    placeholder="Search client or phone..."
                    value={chatSearch}
                    onChange={(e) => setChatSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500 transition"
                  />
                </div>
              </div>

              {/* Contacts */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {filteredContacts.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No contacts for {selectedTenant?.name} yet. Trigger a message or use the Simulator!
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
                          <p className="text-[11px] text-slate-500 truncate">
                            +{c.phone}
                          </p>
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
              <div className="flex-1 flex flex-col bg-slate-50">
                <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">
                      {selectedContact.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {selectedContact.name}
                      </h4>
                      <p className="text-xs text-slate-500">
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
                      className="text-xs px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition flex items-center gap-1.5 font-medium shadow-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Delete Chat</span>
                    </button>
                  </div>
                </div>

                {/* Human Assistance Alert Banner */}
                {selectedContact.needsHumanAssistance && (
                  <div className="bg-rose-50 border-b border-rose-200 px-4 py-2.5 flex items-center justify-between text-xs text-rose-900 shadow-sm animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 animate-bounce" />
                      <span>
                        <strong>Action Needed:</strong> Customer requested human sales assistance. You can reply directly below.
                      </span>
                    </div>
                    <button
                      onClick={() => handleResolveAssistance(selectedContact.phone)}
                      className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-[11px] transition shadow-sm flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" /> Mark Handled
                    </button>
                  </div>
                )}

                {/* Messages */}
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
                            className={`max-w-[75%] rounded-2xl p-3.5 text-xs shadow-sm ${
                              isCustomer
                                ? 'bg-white text-slate-800 rounded-tl-sm'
                                : m.sender === 'bot'
                                ? 'bg-emerald-600 text-white rounded-tr-sm'
                                : 'bg-slate-900 text-white rounded-tr-sm'
                            }`}
                          >
                            <div className="text-[10px] font-semibold opacity-80 mb-1 flex items-center gap-1">
                              {isCustomer ? (
                                <span>{selectedContact.name}</span>
                              ) : m.sender === 'bot' ? (
                                <span className="flex items-center gap-1">
                                  <Bot className="w-3 h-3" />
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
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
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
                  <p className="text-sm font-medium">Select a conversation to inspect chat</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: PRODUCT CATALOGUE & DATABASE */}
        {activeTab === 'catalogue' && selectedTenant && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 mb-6 gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-emerald-600" />
                    Product & Service Catalogue ({selectedTenant.name})
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Your AI chatbot references this live database to provide immediate, exact pricing and inventory status to customers.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddProductModal(true)}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow transition self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product / Service</span>
                </button>
              </div>

              {/* Explanatory banner */}
              <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/70 text-xs text-emerald-950 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>How the AI Catalogue Integration Works:</strong> When a WhatsApp customer asks{' '}
                  <em>"How much is your iPhone 15?"</em> or <em>"Do you have diamond solitaire rings in stock?"</em>,{' '}
                  the Gemini AI bot instantly looks up this database and answers with exact pricing, colors, specs, and stock availability without any human intervention!
                </div>
              </div>

              {products.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
                  <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h4 className="font-bold text-slate-700 text-sm">No products in catalogue yet</h4>
                  <p className="text-xs text-slate-400 mt-1 mb-4">
                    Add products or services so your AI assistant can answer pricing inquiries.
                  </p>
                  <button
                    onClick={() => setShowAddProductModal(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold"
                  >
                    Add First Product
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((p) => (
                    <div
                      key={p.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 hover:shadow-sm transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-medium">
                            {p.category || 'General'}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                p.inStock
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {p.inStock ? 'In Stock' : 'Out of Stock'}
                            </span>
                            <button
                              onClick={() => handleOpenEditProduct(p)}
                              className="text-slate-400 hover:text-emerald-600 p-1 rounded hover:bg-slate-200/60 transition"
                              title="Edit product details"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition"
                              title="Delete product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <h4 className="font-bold text-slate-900 text-sm mb-1">{p.name}</h4>
                        <p className="text-emerald-700 font-bold text-xs mb-2">{p.price}</p>
                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                          {p.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400">
                        <span>AI Referenceable</span>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: CUSTOM BOT & TEMPLATE RULES */}
        {activeTab === 'automation' && selectedTenant && (
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-8">
            <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Settings className="w-5 h-5 text-indigo-600" />
                  Configure: {selectedTenant.name}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Customize the automated sequence and Gemini AI bot instructions specifically for this client.
                </p>
              </div>
              {settingsSavedNotice && (
                <span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Saved!
                </span>
              )}
            </div>

            <form onSubmit={handleSaveTenantSettings} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Business / Client Name
                  </label>
                  <input
                    type="text"
                    value={editBusinessName}
                    onChange={(e) => setEditBusinessName(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Client's WhatsApp Display Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98765 43210"
                    value={editWhatsappNumber}
                    onChange={(e) => setEditWhatsappNumber(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Client's Meta Phone Number ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1029384756 (from client's Meta WhatsApp App)"
                    value={editPhoneId}
                    onChange={(e) => setEditPhoneId(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Client's Meta WhatsApp Token (Optional)
                  </label>
                  <input
                    type="password"
                    placeholder="Leave empty to use shared platform token in .env"
                    value={editToken}
                    onChange={(e) => setEditToken(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                  Default Mode for this Business
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setEditDefaultMode('automated')}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                      editDefaultMode === 'automated'
                        ? 'border-emerald-500 bg-emerald-50/40 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <span className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                      <Zap className="w-4 h-4 text-emerald-600" />
                      Option 1: Automated Template Mode
                    </span>
                    <p className="text-xs text-slate-500 mt-1">
                      Always sends canned welcome message with dynamic variables.
                    </p>
                  </div>

                  <div
                    onClick={() => setEditDefaultMode('ai_chatbot')}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                      editDefaultMode === 'ai_chatbot'
                        ? 'border-indigo-500 bg-indigo-50/40 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <span className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      Option 2: Gemini AI Chatbot Mode
                    </span>
                    <p className="text-xs text-slate-500 mt-1">
                      Gemini acts as an AI employee answering customer questions.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Automated Message Template
                </label>
                <textarea
                  rows={4}
                  value={editTemplate}
                  onChange={(e) => setEditTemplate(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs font-mono leading-relaxed focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Gemini AI Persona & System Instructions
                </label>
                <textarea
                  rows={5}
                  value={editGeminiPrompt}
                  onChange={(e) => setEditGeminiPrompt(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs leading-relaxed focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSavingSettings}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition shadow-md shadow-indigo-600/20"
              >
                {isSavingSettings ? 'Saving...' : `Save Rules for ${selectedTenant.name}`}
              </button>
            </form>
          </div>
        )}

        {/* TAB 4: BUSINESS ACCOUNTS (TENANTS) */}
        {activeTab === 'tenants' && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-8">
              <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-emerald-600" />
                    Client Business Accounts (Multi-Tenant Hub)
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Manage all businesses using your WhatsApp automation platform.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddTenantModal(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Business</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {tenants.map((t) => {
                  const isCurrent = selectedTenant?.id === t.id;
                  return (
                    <div
                      key={t.id}
                      className={`p-5 rounded-2xl border-2 transition flex flex-col justify-between ${
                        isCurrent
                          ? 'border-emerald-500 bg-emerald-50/40 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
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
                                handleSwitchTenant(t);
                                setActiveTab('automation');
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

                        <h3 className="font-bold text-slate-900 text-base mb-1">{t.name}</h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mb-3">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {t.whatsappNumber || 'Master Phone Number'}
                        </p>

                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-600 mb-4 line-clamp-3">
                          <strong>AI Persona:</strong> {t.geminiSystemPrompt}
                        </div>
                      </div>

                      <button
                        onClick={() => handleSwitchTenant(t)}
                        className={`w-full py-2 rounded-xl text-xs font-semibold transition ${
                          isCurrent
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        }`}
                      >
                        {isCurrent ? 'Active Business (Selected)' : 'Switch to this Business'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SIMULATOR */}
        {activeTab === 'simulator' && (
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-8">
            <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-emerald-600" />
                  Offline Customer Simulator
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Testing as customer messaging: <strong className="text-slate-800">{selectedTenant?.name}</strong>
                </p>
              </div>
            </div>

            <form onSubmit={handleRunSimulator} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Simulated Customer Phone
                  </label>
                  <input
                    type="text"
                    value={simPhone}
                    onChange={(e) => setSimPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={simName}
                    onChange={(e) => setSimName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Customer Message
                  </label>
                  <span className="text-[11px] text-slate-400">Try quick test queries:</span>
                </div>

                <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setSimMessage('How much is your iPhone 15?')}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] border border-emerald-200 font-medium transition"
                  >
                    📱 "How much is your iPhone 15?"
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimMessage('Can I talk to a human sales rep?')}
                    className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 text-[11px] border border-rose-200 font-medium transition"
                  >
                    🚨 "Can I talk to a human sales rep?"
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimMessage('What is the price of the Solitaire Diamond Ring?')}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-[11px] border border-indigo-200 font-medium transition"
                  >
                    💎 "Price of Solitaire Ring?"
                  </button>
                </div>

                <textarea
                  rows={3}
                  value={simMessage}
                  onChange={(e) => setSimMessage(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSimulating}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>{isSimulating ? 'Simulating...' : `Simulate Message to ${selectedTenant?.name}`}</span>
              </button>
            </form>

            {simResult && (
              <div className="mt-6 p-4 rounded-xl bg-slate-900 text-white border border-slate-800 space-y-3">
                <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Simulation Success &bull; Active Mode: {simResult.mode}
                </div>
                <div className="p-3 rounded-lg bg-slate-800 text-xs">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold mb-1">
                    Incoming Customer Input:
                  </span>
                  <p>{simResult.customerMsg}</p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-xs">
                  <span className="text-emerald-300 block text-[10px] uppercase font-semibold mb-1">
                    {selectedTenant?.name} Response:
                  </span>
                  <p className="whitespace-pre-line text-slate-200">{simResult.botReply}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: SETUP */}
        {activeTab === 'setup' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-8">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2 mb-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                Meta Webhook & Multi-Tenant Routing
              </h2>
              <p className="text-sm text-slate-500 mb-6">
                All client numbers share a single webhook endpoint. Meta passes the <code>phone_number_id</code> in each incoming payload, and the system automatically routes to that business's AI bot!
              </p>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4 mb-6">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-700 uppercase">
                      Webhook Callback URL
                    </span>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `${envStatus?.appUrl || 'http://localhost:3000'}/api/webhook`,
                          'webhook_url'
                        )
                      }
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                    >
                      {copiedKey === 'webhook_url' ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy URL
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-2.5 bg-white border border-slate-200 rounded-lg font-mono text-xs text-slate-800 break-all select-all">
                    {envStatus?.appUrl || 'http://localhost:3000'}/api/webhook
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-700 uppercase">
                      Verify Token
                    </span>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          envStatus?.verifyToken || 'zevarone_whatsapp_crm_secret_2026',
                          'verify_token'
                        )
                      }
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                    >
                      {copiedKey === 'verify_token' ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy Token
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-2.5 bg-white border border-slate-200 rounded-lg font-mono text-xs text-slate-800 select-all">
                    {envStatus?.verifyToken || 'zevarone_whatsapp_crm_secret_2026'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: ADD CLIENT BUSINESS */}
      {showAddTenantModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                Add New Client Business
              </h3>
              <button
                onClick={() => setShowAddTenantModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateNewTenant} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Business Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bella Salon & Spa, Apex Law Firm..."
                  value={newTenantName}
                  onChange={(e) => setNewTenantName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    WhatsApp Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98765 12345"
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
                    placeholder="Optional (falls back to .env)"
                    value={newTenantPhoneId}
                    onChange={(e) => setNewTenantPhoneId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Client's Meta WhatsApp Token (Optional)
                </label>
                <input
                  type="password"
                  placeholder="Paste client's token or leave empty to use default"
                  value={newTenantToken}
                  onChange={(e) => setNewTenantToken(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
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
                  placeholder="e.g. You are the AI assistant for Bella Salon. Answer booking questions..."
                  value={newTenantPrompt}
                  onChange={(e) => setNewTenantPrompt(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTenantModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow"
                >
                  Create Business Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD PRODUCT / SERVICE */}
      {showAddProductModal && selectedTenant && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-600" />
                Add Product to {selectedTenant.name}
              </h3>
              <button
                onClick={() => setShowAddProductModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Product / Service Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apple iPhone 15 (128GB)"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Price <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. $799 or ₹74,900"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Smartphones, Laptops..."
                    value={newProdCat}
                    onChange={(e) => setNewProdCat(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Description, Specs & Options
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Available in Black, Blue, Green. 48MP camera, 128GB storage, 1 year Apple warranty."
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="stockCheckbox"
                  checked={newProdStock}
                  onChange={(e) => setNewProdStock(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="stockCheckbox" className="text-xs text-slate-700 font-medium cursor-pointer">
                  Item is currently in stock and available for order
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow"
                >
                  Add to Catalogue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT PRODUCT / SERVICE */}
      {showEditProductModal && selectedTenant && editingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <Pencil className="w-5 h-5 text-emerald-600" />
                Edit Product Details
              </h3>
              <button
                onClick={() => setShowEditProductModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdateProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Product / Service Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apple iPhone 15 (128GB)"
                  value={editProdName}
                  onChange={(e) => setEditProdName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Price <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. $799 or ₹74,900"
                    value={editProdPrice}
                    onChange={(e) => setEditProdPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Smartphones, Laptops..."
                    value={editProdCat}
                    onChange={(e) => setEditProdCat(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Description, Specs & Options
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Colors, specs, storage capacity, warranty..."
                  value={editProdDesc}
                  onChange={(e) => setEditProdDesc(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="editStockCheckbox"
                  checked={editProdStock}
                  onChange={(e) => setEditProdStock(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="editStockCheckbox" className="text-xs text-slate-700 font-medium cursor-pointer">
                  Item is currently in stock and available for order
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditProductModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingProduct}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow"
                >
                  {isUpdatingProduct ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
