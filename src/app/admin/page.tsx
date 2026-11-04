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
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

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
        ? w.owner?.subscriptionStatus === 'active'
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
                  Zevarone Super Admin Monitor
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
            <span className="text-xs font-semibold uppercase tracking-wider">Gemini AI Volume</span>
            <Bot className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {kpis ? kpis.totalAiMessages.toLocaleString() : '...'}
          </div>
          <div className="text-[11px] text-purple-700 font-semibold">
            Autonomous messages dispatched
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
            <div className="flex bg-white border border-slate-200 rounded-xl p-0.5 text-xs">
              {(['all', 'active', 'inactive'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-3 py-1 rounded-lg font-semibold transition capitalize ${
                    statusFilter === filter
                      ? 'bg-[#008069] text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {filter}
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

                      {/* Subscription Status Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isActive
                              ? 'bg-emerald-100 text-[#008069] border border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? 'bg-[#008069]' : 'bg-amber-500'
                            }`}
                          />
                          {isActive ? 'ACTIVE PRO' : 'INACTIVE'}
                        </span>
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
                          {/* Inspect Client Inbox */}
                          <button
                            type="button"
                            onClick={() => handleInspectWorkspace(item)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] flex items-center gap-1 transition"
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
                            className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition ${
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
    </div>
  );
}
