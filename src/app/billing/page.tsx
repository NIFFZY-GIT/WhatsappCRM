'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Zap,
  Bot,
  MessageSquare,
  Image as ImageIcon,
  Building,
  ArrowRight,
  Loader2,
  ExternalLink,
  RefreshCw,
  Calendar,
  Check,
  Tag,
} from 'lucide-react';

function BillingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, selectedTenant, notify, refreshData, isProUser } = useApp();

  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('annual');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [successBanner, setSuccessBanner] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Handle return from Stripe checkout
  useEffect(() => {
    const isSuccess = searchParams.get('success') === 'true';
    const sessionId = searchParams.get('session_id');
    const intervalParam = (searchParams.get('interval') as 'monthly' | 'annual') || 'monthly';

    if (isSuccess && sessionId) {
      setVerifying(true);
      fetch('/api/stripe/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          interval: intervalParam,
          email: currentUser?.email,
          userId: currentUser?.id,
        }),
      })
        .then((res) => res.json())
        .then(async (data) => {
          if (data.success) {
            setSuccessBanner(true);
            setStatusMessage(
              data.message ||
                `Payment confirmed! Your ${intervalParam === 'annual' ? 'Annual (4,500 LKR/mo)' : 'Monthly (5,000 LKR/mo)'} Pro Subscription is now Active.`
            );
            notify({
              type: 'success',
              title: 'Pro Subscription Activated! 🎉',
              message: `Full access to your WhatsApp CRM and Gemini AI concierge has been unlocked.`,
            });
            await refreshData();
          } else {
            notify({
              type: 'error',
              title: 'Verification Incomplete',
              message: data.message || 'Payment could not be verified by Stripe.',
            });
          }
        })
        .catch((err) => {
          console.error('Verification error:', err);
        })
        .finally(() => {
          setVerifying(false);
        });
    }
  }, [searchParams, currentUser]);

  const handlePayWithStripe = async () => {
    if (!currentUser) {
      notify({
        type: 'warning',
        title: 'Sign In Required',
        message: 'Please sign in or register your business account before subscribing.',
      });
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      const email = currentUser.email;
      const tenantId = selectedTenant?.id || currentUser.tenantId;
      const name = currentUser.name || 'Business Partner';

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: email,
          userId: currentUser.id,
          tenantId: tenantId,
          customerName: name,
          billingInterval,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to start Stripe checkout');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received from Stripe.');
      }
    } catch (err: any) {
      notify({
        type: 'error',
        title: 'Checkout Error',
        message: err.message || 'Could not initiate Stripe payment gateway.',
      });
    } finally {
      setLoading(false);
    }
  };

  const isActive = currentUser ? currentUser.subscriptionStatus === 'active' : true;
  const isAnnual = billingInterval === 'annual';

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 font-sans text-slate-900">
      {/* Top Banner / Verification status */}
      {verifying && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin shrink-0 text-blue-600" />
          <div className="text-sm">
            <span className="font-semibold">Verifying your Stripe transaction...</span>
            <p className="text-xs text-blue-700 mt-0.5">
              Please wait while we confirm your WhatsApp CRM subscription.
            </p>
          </div>
        </div>
      )}

      {successBanner && (
        <div className="p-4 bg-[#E8F5E9] border border-[#C8E6C9] rounded-xl text-[#008069] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 shrink-0 text-[#00A884]" />
            <div>
              <h4 className="text-sm font-bold text-slate-900">Subscription Active & Verified!</h4>
              <p className="text-xs text-slate-600">{statusMessage}</p>
            </div>
          </div>
          <Link
            href="/inbox"
            className="px-4 py-2 bg-[#008069] hover:bg-[#075E54] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
          >
            Open My Inbox
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-900">Billing & Subscription</h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide ${
                isActive
                  ? 'bg-emerald-50 text-[#008069] border border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
            >
              {isActive ? '● PRO ACTIVE' : '○ PAYMENT REQUIRED'}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Manage your WhatsApp Business SaaS license and recurring Stripe billing.
          </p>
        </div>

        {currentUser ? (
          <div className="bg-white border border-slate-200 px-3.5 py-2 rounded-xl flex items-center gap-3 shadow-xs">
            <div className="h-9 w-9 rounded-full bg-[#111B21] text-white flex items-center justify-center font-bold text-xs">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="text-left text-xs">
              <div className="font-semibold text-slate-900">{currentUser.name}</div>
              <div className="text-slate-500 text-[11px]">{currentUser.businessName}</div>
            </div>
          </div>
        ) : (
          <Link
            href="/login"
            className="px-3.5 py-2 rounded-lg border border-[#008069] text-[#008069] text-xs font-semibold hover:bg-emerald-50 transition flex items-center gap-1.5"
          >
            Sign in to Your Business Account
          </Link>
        )}
      </div>

      {/* Billing Interval Toggle (Monthly vs Annual Discount) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
        <div>
          <span className="text-xs font-bold text-slate-900 block">Choose Your Billing Cycle</span>
          <span className="text-[11px] text-slate-500">
            Annual billing saves 6,000 LKR per year (Discounted to 4,500 LKR/month).
          </span>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setBillingInterval('monthly')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              billingInterval === 'monthly'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Monthly (5,000 LKR)
          </button>
          <button
            type="button"
            onClick={() => setBillingInterval('annual')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              billingInterval === 'annual'
                ? 'bg-[#008069] text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>Annual (4,500 LKR/mo)</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-100 text-emerald-900 font-extrabold uppercase">
              Save 10%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing & Plan Card Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Plan Details & Action */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border-2 border-emerald-600/60 rounded-2xl p-6 shadow-sm relative overflow-hidden">
            {isAnnual && (
              <div className="absolute top-0 right-0 bg-[#008069] text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                ANNUAL DISCOUNT ACTIVE (SAVE 6,000 LKR)
              </div>
            )}

            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#008069] bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  ZEVARONE ENTERPRISE TIER
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-2">
                  WhatsApp CRM & Gemini AI Pro
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Complete omnichannel customer engagement platform for businesses in Sri Lanka & worldwide.
                </p>
              </div>

              <div className="text-right">
                <div className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                  {isAnnual ? '4,500' : '5,000'}{' '}
                  <span className="text-sm font-semibold text-slate-500">LKR</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {isAnnual ? 'per month (billed 54,000 LKR / year)' : 'per business / month'}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
                Everything Included in Your Plan:
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {[
                  {
                    icon: MessageSquare,
                    title: 'Real-Time Shared Inbox',
                    desc: 'Instant 2-way WhatsApp chats with desktop alerts and audio chimes.',
                  },
                  {
                    icon: Bot,
                    title: 'Gemini 2.5 AI Sales Agent',
                    desc: 'Autonomous intelligent customer responses with customized system prompts.',
                  },
                  {
                    icon: ImageIcon,
                    title: 'Welcome Media Sequences',
                    desc: 'Send rich product photos & custom captions immediately on the first customer message.',
                  },
                  {
                    icon: Building,
                    title: 'Isolated Multi-Tenant CRM',
                    desc: 'Your own WhatsApp Phone Number ID, contacts, and catalog completely private.',
                  },
                  {
                    icon: Zap,
                    title: 'Broadcast Campaign Sender',
                    desc: 'Outbound bulk messaging with phone sanitization and delivery confirmation.',
                  },
                  {
                    icon: ShieldCheck,
                    title: 'Zevarone SLA & Security',
                    desc: 'Enterprise uptime, Meta Cloud API compliance, and 24/7 reliability.',
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="p-2 rounded-lg bg-white text-[#008069] shrink-0 shadow-2xs">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{item.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                {isActive ? (
                  <span className="flex items-center gap-1.5 text-[#008069] font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    Subscription active ({currentUser?.billingInterval === 'annual' ? 'Annual Tier' : 'Monthly Tier'}).
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-amber-700 font-medium">
                    <AlertCircle className="w-4 h-4" />
                    Activate via Stripe to unlock CRM features.
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handlePayWithStripe}
                  disabled={loading}
                  className="w-full sm:w-auto px-6 py-3 bg-[#008069] hover:bg-[#075E54] text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      {isAnnual ? 'Pay 54,000 LKR (Annual - Save 10%)' : 'Pay 5,000 LKR (Monthly)'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Account & Payment Info */}
        <div className="space-y-6">
          {/* Card: Payment Security */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#008069]" />
              Stripe Verified Security
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Payments are securely encrypted and processed directly by Stripe. Zevarone never stores your credit card details.
            </p>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Currency:</span>
                <span className="font-semibold text-slate-900">LKR (Sri Lankan Rupee)</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Annual Discount:</span>
                <span className="font-semibold text-emerald-700">4,500 LKR/mo (10% OFF)</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Monthly Rate:</span>
                <span className="font-semibold text-slate-900">5,000 LKR/mo</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Gateway:</span>
                <span className="font-semibold text-slate-900">Stripe Hosted Checkout</span>
              </div>
            </div>
          </div>

          {/* Current Workspace Info */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Active Business Workspace
            </h3>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="font-bold text-xs text-slate-900">
                {selectedTenant?.name || 'Your Business Workspace'}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                ID: {selectedTenant?.id || 'tenant_zevarone'}
              </div>
              <div className="text-[11px] text-slate-500">
                WhatsApp: +{selectedTenant?.whatsappNumber || '94771234567'}
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/settings"
                className="text-xs font-semibold text-[#008069] hover:underline flex items-center gap-1"
              >
                Configure WhatsApp API Credentials →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-6 h-6 animate-spin text-[#008069]" />
        </div>
      }
    >
      <BillingContent />
    </Suspense>
  );
}
