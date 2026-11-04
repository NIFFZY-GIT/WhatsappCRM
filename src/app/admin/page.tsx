'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { isZevaroneAdmin } from '@/lib/types';
import {
  ShieldAlert,
  ShieldCheck,
  Building2,
  Users,
  MessageSquare,
  Bot,
  CreditCard,
  Download,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  Sliders,
  Sparkles,
  Phone,
  Mail,
  Calendar,
  Lock,
  ArrowRight,
  Loader2,
  Pencil,
  Trash2,
} from 'lucide-react';

interface WorkspaceData {
  tenant: {
    id: string;
    name: string;
    slug: string;
    whatsappNumber: string;
    defaultMode: string;
    createdAt: string;
    isActive: boolean;
  };
  owner?: {
    id: string;
    email: string;
    name: string;
    businessName: string;
    role: string;
    subscriptionStatus: 'active' | 'inactive' | 'trial';
    subscriptionPlan?: string;
    billingInterval?: 'monthly' | 'annual';
    cancelAtPeriodEnd?: boolean;
    cancellationReason?: string;
    cancellationFeedback?: string;
    cancelledAt?: string;
    subscriptionExpiresAt?: string;
    createdAt: string;
  };
  totalContacts: number;
  totalMessages: number;
  aiHandledMessages: number;
  humanHandledMessages: number;
  lastActivityAt?: string;
}

interface AdminKPIs {
  totalClients: number;
  activeSubscriptions: number;
  inactiveSubscriptions: number;
  cancelledSubscriptions?: number;
  totalContacts: number;
  totalMessages: number;
  totalAiMessages: number;
  estimatedMrrLkr: number;
}

export default function AdminMonitorPage() {
  const router = useRouter();
  const { currentUser, switchTenant, notify, refreshData } = useApp();

  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<AdminKPIs | null>(null);
  const [workspaces, setWorkspaces] = useState<WorkspaceData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'cancelled' | 'inactive'>('all');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Edit Company Modal State
  const [editingWorkspace, setEditingWorkspace] = useState<WorkspaceData | null>(null);
  const [workspaceToDelete, setWorkspaceToDelete] = useState<WorkspaceData | null>(null);
  const [isDeletingWorkspace, setIsDeletingWorkspace] = useState(false);
  const [editCompanyName, setEditCompanyName] = useState('');
  const [editCompanyPhone, setEditCompanyPhone] = useState('');
  const [editCompanyPhoneId, setEditCompanyPhoneId] = useState('');
  const [editOwnerName, setEditOwnerName] = useState('');
  const [editOwnerEmail, setEditOwnerEmail] = useState('');
  const [editSubStatus, setEditSubStatus] = useState<'active' | 'inactive' | 'trial'>('active');
  const [editSubPlan, setEditSubPlan] = useState('');
  const [editBotMode, setEditBotMode] = useState<string>('ai_chatbot');
  const [editAiPrompt, setEditAiPrompt] = useState('');
  const [isSavingCompany, setIsSavingCompany] = useState(false);

  const handleOpenEditModal = (w: WorkspaceData) => {
    setEditingWorkspace(w);
    setEditCompanyName(w.tenant.name || '');
    setEditCompanyPhone(w.tenant.whatsappNumber || '');
    setEditCompanyPhoneId((w.tenant as any).phoneNumberId || '');
    setEditOwnerName(w.owner?.name || '');
    setEditOwnerEmail(w.owner?.email || '');
    setEditSubStatus(w.owner?.subscriptionStatus || 'inactive');
    setEditSubPlan(w.owner?.subscriptionPlan || 'WhatsApp CRM & Zevarone AI Pro (5,000 LKR/mo)');
    setEditBotMode(w.tenant.defaultMode || 'ai_chatbot');
    setEditAiPrompt((w.tenant as any).geminiSystemPrompt || '');
  };

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorkspace || !editCompanyName.trim()) return;

    setIsSavingCompany(true);
    try {
      const res = await fetch('/api/admin/edit-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: editingWorkspace.tenant.id,
          name: editCompanyName.trim(),
          whatsappNumber: editCompanyPhone.trim(),
          phoneNumberId: editCompanyPhoneId.trim(),
          defaultMode: editBotMode,
          geminiSystemPrompt: editAiPrompt.trim() || undefined,
          ownerName: editOwnerName.trim() || undefined,
          ownerEmail: editOwnerEmail.trim() || undefined,
          subscriptionStatus: editSubStatus,
          subscriptionPlan: editSubPlan.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setEditingWorkspace(null);
        await fetchAdminData();
        await refreshData();
        notify({
          type: 'success',
          title: 'Company Updated',
          message: `${editCompanyName} details have been saved successfully!`,
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
        title: 'Error Saving Company',
        message: err.message || 'Network error.',
      });
    } finally {
      setIsSavingCompany(false);
    }
  };

  const confirmDeleteWorkspace = async () => {
    if (!workspaceToDelete) return;
    setIsDeletingWorkspace(true);
    try {
      const res = await fetch(`/api/tenants?id=${workspaceToDelete.tenant.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setWorkspaceToDelete(null);
        notify({
          type: 'success',
          title: 'Workspace Deleted',
          message: `${workspaceToDelete.tenant.name} has been permanently deleted.`,
        });
        await fetchAdminData();
        await refreshData();
      } else {
        notify({
          type: 'error',
          title: 'Delete Failed',
          message: data.error || 'Failed to delete workspace.',
        });
      }
    } catch (err: any) {
      notify({
        type: 'error',
        title: 'Error',
        message: err.message || 'Network error deleting workspace.',
      });
    } finally {
      setIsDeletingWorkspace(false);
    }
  };

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/clients');
      const data = await res.json();
      if (data.success) {
        setKpis(data.kpis);
        setWorkspaces(data.workspaces || []);
      }
    } catch (err) {
      console.error('Failed to load admin monitoring data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const isAdmin = isZevaroneAdmin(currentUser);

  // Toggle or override client's subscription
  const handleToggleSubscription = async (tenantId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    setActionLoadingId(tenantId);
    try {
      const res = await fetch('/api/admin/override-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          status: newStatus,
          plan: newStatus === 'active' ? 'Zevarone Admin Override Pro' : 'Inactive',
        }),
      });
      const data = await res.json();
      if (data.success) {
        notify({
          type: 'success',
          title: 'Subscription Updated',
          message: `Workspace subscription updated to ${newStatus.toUpperCase()}.`,
        });
        await fetchAdminData();
        await refreshData();
      }
    } catch (err: any) {
      notify({
        type: 'error',
        title: 'Action Failed',
        message: err.message || 'Could not update client status.',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Switch workspace and inspect client's live inbox
  const handleInspectWorkspace = (workspace: WorkspaceData) => {
    switchTenant(workspace.tenant.id);
    notify({
      type: 'info',
      title: 'Workspace Inspected',
      message: `Now viewing live conversations and CRM for ${workspace.tenant.name}.`,
    });
    router.push('/inbox');
  };

  // Filter workspaces
  const filteredWorkspaces = workspaces.filter((w) => {
    const matchesSearch =
      w.tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w.owner?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w.owner?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.tenant.whatsappNumber.includes(searchTerm);

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'active'
        ? w.owner?.subscriptionStatus === 'active' && !w.owner?.cancelAtPeriodEnd
        : statusFilter === 'cancelled'
        ? Boolean(w.owner?.cancelAtPeriodEnd || w.owner?.cancellationReason)
        : w.owner?.subscriptionStatus !== 'active';

    return matchesSearch && matchesStatus;
  });

  if (currentUser && !isZevaroneAdmin(currentUser)) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[#111B21] mb-2">Zevarone Super Admin Access Required</h2>
        <p className="text-sm text-[#667781] mb-6 leading-relaxed">
          The Super Admin Monitor is reserved for authorized Zevarone personnel (@zevarone.com). Your account (<span className="text-[#111B21] font-semibold">{currentUser.email}</span>) does not have master monitoring permissions.
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
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans text-slate-900">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#111B21] text-emerald-400 rounded-xl shadow-xs">
              <ShieldCheck className="w-5 h-5 text-[#25D366]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  ZEVARONE. CRM Master Monitor
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#111B21] text-emerald-400 border border-[#2A3942]">
                  MASTER ACCESS
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Centralized monitoring dashboard for all client businesses, customer chats, and Stripe subscriptions.
              </p>
            </div>
          </div>
        </div>

        {/* Global Export & Refresh Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Export All Customers to Excel */}
          <a
            href="/api/contacts/export"
            download
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-xs"
          >
            <Download className="w-4 h-4" />
            Export All Customers (Excel)
          </a>

          <button
            type="button"
            onClick={fetchAdminData}
            disabled={loading}
            className="p-2 border border-slate-300 bg-white hover:bg-slate-50 rounded-xl text-slate-600 transition"
            title="Refresh monitor data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Client Workspaces</span>
            <Building2 className="w-4 h-4 text-[#008069]" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {kpis ? kpis.totalClients : '...'}
          </div>
          <div className="text-[11px] text-slate-500">
            {kpis ? `${kpis.activeSubscriptions} Paid Pro Accounts` : 'Calculating...'}
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Estimated MRR</span>
            <CreditCard className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {kpis ? `${kpis.estimatedMrrLkr.toLocaleString()} LKR` : '...'}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold">
            Based on active subscriptions
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Customer Leads</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {kpis ? kpis.totalContacts.toLocaleString() : '...'}
          </div>
          <div className="text-[11px] text-slate-500">
            Across all client WhatsApp numbers
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Zevarone AI Volume</span>
            <Bot className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {kpis ? kpis.totalAiMessages.toLocaleString() : '...'}
          </div>
          <div className="text-[11px] text-purple-700 font-semibold">
            Autonomous messages dispatched
          </div>
        </div>

        {/* KPI 5: Churn / Cancelled */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-1 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Churn Alerts</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600">
            {kpis ? kpis.cancelledSubscriptions || 0 : '...'}
          </div>
          <div className="text-[11px] text-rose-700 font-semibold">
            Auto-renewals cancelled
          </div>
        </div>
      </div>

      {/* Main Monitoring Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {/* Table Filter Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by company, owner, or phone..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#008069]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-500">Filter Status:</span>
            <div className="flex bg-white border border-slate-200 rounded-xl p-0.5 text-xs flex-wrap">
              {(['all', 'active', 'cancelled', 'inactive'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-3 py-1 rounded-lg font-semibold transition capitalize ${
                    statusFilter === filter
                      ? filter === 'cancelled'
                        ? 'bg-rose-600 text-white'
                        : 'bg-[#008069] text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {filter === 'cancelled' ? `Cancelled (${kpis?.cancelledSubscriptions || 0})` : filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100/70 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Client Business</th>
                <th className="py-3 px-4">Owner / Account</th>
                <th className="py-3 px-4">Subscription Status</th>
                <th className="py-3 px-4">Plan &amp; Rate</th>
                <th className="py-3 px-4">Customers / Leads</th>
                <th className="py-3 px-4">Messages (AI vs Human)</th>
                <th className="py-3 px-4">Last Activity</th>
                <th className="py-3 px-4 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredWorkspaces.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No client workspaces match the search query.
                  </td>
                </tr>
              ) : (
                filteredWorkspaces.map((item) => {
                  const isActive = item.owner?.subscriptionStatus === 'active';
                  const isAnnual = item.owner?.billingInterval === 'annual';
                  const isTargetLoading = actionLoadingId === item.tenant.id;

                  return (
                    <tr key={item.tenant.id} className="hover:bg-slate-50/80 transition">
                      {/* Business Name & WhatsApp */}
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#008069] flex items-center justify-center font-bold text-xs shrink-0">
                            {item.tenant.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{item.tenant.name}</div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              +{item.tenant.whatsappNumber || 'Not connected'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Owner Details */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-900">{item.owner?.name || 'Unassigned'}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {item.owner?.email || 'N/A'}
                        </div>
                      </td>

                      {/* Subscription Status Badge & Cancellation Reason */}
                      <td className="py-3.5 px-4 min-w-[210px]">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              item.owner?.cancelAtPeriodEnd
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : isActive
                                ? 'bg-emerald-100 text-[#008069] border border-emerald-300'
                                : 'bg-slate-100 text-slate-700 border border-slate-300'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                item.owner?.cancelAtPeriodEnd
                                  ? 'bg-amber-600'
                                  : isActive
                                  ? 'bg-[#008069]'
                                  : 'bg-slate-400'
                              }`}
                            />
                            {item.owner?.cancelAtPeriodEnd
                              ? 'CANCELLATION PENDING'
                              : isActive
                              ? 'ACTIVE PRO'
                              : 'INACTIVE'}
                          </span>
                        </div>

                        {/* Reason & Feedback Display */}
                        {item.owner?.cancellationReason && (
                          <div className="mt-1.5 p-2 rounded-lg bg-rose-50 border border-rose-200 text-left">
                            <div className="text-[10px] font-bold text-rose-800 flex items-start gap-1">
                              <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0 mt-0.5" />
                              <span>Reason: {item.owner.cancellationReason}</span>
                            </div>
                            {item.owner.cancellationFeedback && (
                              <p className="text-[10px] text-rose-700 italic mt-0.5 leading-snug break-words">
                                "{item.owner.cancellationFeedback}"
                              </p>
                            )}
                            {item.owner.cancelledAt && (
                              <div className="text-[9px] text-slate-400 mt-1">
                                Cancelled on {new Date(item.owner.cancelledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Plan & Pricing */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">
                          {isAnnual ? '4,500 LKR/mo' : '5,000 LKR/mo'}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {isAnnual ? 'Annual Billing' : 'Monthly Recurring'}
                        </div>
                      </td>

                      {/* Contacts Count */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{item.totalContacts}</div>
                        <a
                          href={`/api/contacts/export?tenantId=${item.tenant.id}`}
                          download
                          className="text-[10px] text-[#008069] hover:underline flex items-center gap-0.5 mt-0.5"
                        >
                          <Download className="w-3 h-3" /> Export Excel
                        </a>
                      </td>

                      {/* Messages breakdown */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">
                          {item.totalMessages} total
                        </div>
                        <div className="text-[10px] text-slate-500">
                          🤖 {item.aiHandledMessages} AI • 👤 {item.humanHandledMessages} Human
                        </div>
                      </td>

                      {/* Last Activity */}
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {item.lastActivityAt
                          ? new Date(item.lastActivityAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'No activity'}
                      </td>

                      {/* Admin Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Edit Company Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(item)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#008069] border border-emerald-200 font-semibold text-[11px] flex items-center gap-1 transition cursor-pointer"
                            title="Edit Company Details & Settings"
                          >
                            <Pencil className="w-3 h-3 text-[#008069]" />
                            Edit
                          </button>

                          {/* Inspect Client Inbox */}
                          <button
                            type="button"
                            onClick={() => handleInspectWorkspace(item)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] flex items-center gap-1 transition cursor-pointer"
                            title="Open client's live inbox to monitor conversations"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#008069]" />
                            Inspect Inbox
                          </button>

                          {/* Quick Subscription Override */}
                          <button
                            type="button"
                            disabled={isTargetLoading}
                            onClick={() =>
                              handleToggleSubscription(
                                item.tenant.id,
                                item.owner?.subscriptionStatus || 'inactive'
                              )
                            }
                            className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition cursor-pointer ${
                              isActive
                                ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                : 'bg-[#008069] text-white hover:bg-[#075E54]'
                            }`}
                            title={isActive ? 'Deactivate subscription' : 'Activate Pro tier'}
                          >
                            {isTargetLoading ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : isActive ? (
                              'Deactivate'
                            ) : (
                              'Grant Pro'
                            )}
                          </button>

                          {/* Delete Workspace Button */}
                          <button
                            type="button"
                            onClick={() => setWorkspaceToDelete(item)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Delete workspace permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Workspace Modal */}
      {workspaceToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Client Workspace?</h3>
                <p className="text-xs text-slate-500">Permanent administrator action</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete <strong>{workspaceToDelete.tenant.name}</strong>?
              This will remove the business account, all associated catalogue items, contacts, and message history.
            </p>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isDeletingWorkspace}
                onClick={() => setWorkspaceToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingWorkspace}
                onClick={confirmDeleteWorkspace}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isDeletingWorkspace ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MASTER ADMIN: EDIT COMPANY DETAILS MODAL */}
      {editingWorkspace && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-xl w-full p-6 animate-in fade-in zoom-in-95 my-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  <Pencil className="w-5 h-5 text-[#008069]" />
                  Edit Client Company &amp; Account
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tenant ID: <span className="font-mono text-slate-700 font-semibold">{editingWorkspace.tenant.id}</span>
                </p>
              </div>
              <button
                onClick={() => setEditingWorkspace(null)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveCompany} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Company / Business Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editCompanyName}
                    onChange={(e) => setEditCompanyName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#008069] focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    WhatsApp Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 94772284950"
                    value={editCompanyPhone}
                    onChange={(e) => setEditCompanyPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#008069] focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Owner Name
                  </label>
                  <input
                    type="text"
                    value={editOwnerName}
                    onChange={(e) => setEditOwnerName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#008069] focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Owner Login Email
                  </label>
                  <input
                    type="email"
                    value={editOwnerEmail}
                    onChange={(e) => setEditOwnerEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#008069] focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Subscription Status
                  </label>
                  <select
                    value={editSubStatus}
                    onChange={(e) => setEditSubStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#008069] focus:outline-none transition"
                  >
                    <option value="active">Active Pro (Access Granted)</option>
                    <option value="inactive">Inactive (Subscription Required)</option>
                    <option value="trial">Free Trial</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Response Engine
                  </label>
                  <select
                    value={editBotMode}
                    onChange={(e) => setEditBotMode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#008069] focus:outline-none transition"
                  >
                    <option value="ai_chatbot">Option 2: Zevarone AI Sales Concierge</option>
                    <option value="automated">Option 1: Automated Template</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Meta Phone Number ID (Cloud API)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1409984342191428"
                  value={editCompanyPhoneId}
                  onChange={(e) => setEditCompanyPhoneId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:border-[#008069] focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Zevarone AI Persona &amp; Operating Instructions
                </label>
                <textarea
                  rows={3}
                  value={editAiPrompt}
                  onChange={(e) => setEditAiPrompt(e.target.value)}
                  placeholder="Instructions for Zevarone AI when responding to this client's WhatsApp customers..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#008069] focus:outline-none transition"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingWorkspace(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingCompany}
                  className="px-5 py-2 bg-[#00A884] hover:bg-[#075E54] disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  {isSavingCompany ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    'Save Company Details'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
