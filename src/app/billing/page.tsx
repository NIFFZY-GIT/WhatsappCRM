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
} from 'lucide-react';

function BillingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, selectedTenant, notify, refreshData, isProUser } = useApp();

  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [successBanner, setSuccessBanner] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Handle return from Stripe checkout
  useEffect(() => {
    const isSuccess = searchParams.get('success') === 'true';
    const isDemo = searchParams.get('demo') === 'true';
    const sessionId = searchParams.get('session_id');

    if (isSuccess) {
      setVerifying(true);
      fetch('/api/stripe/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          isDemo,
          email: currentUser?.email,
          userId: currentUser?.id,
        }),
      })
        .then((res) => res.json())
        .then(async (data) => {
          if (data.success) {
            setSuccessBanner(true);
            setStatusMessage('Payment confirmed! Your 5,000 LKR Pro Subscription is now Active.');
            notify({
              type: 'success',
              title: 'Pro Subscription Activated! 🎉',
              message: 'Full access to your WhatsApp CRM and Gemini AI concierge has been unlocked.',
            });
            await refreshData();
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

  const handlePayWithStripe = async (forceDemo: boolean = false) => {
    setLoading(true);
    try {
      const email = currentUser?.email || 'admin@zevarone.com';
      const tenantId = selectedTenant?.id || currentUser?.tenantId || 'tenant_zevarone';
      const name = currentUser?.name || 'Business Owner';

      if (forceDemo) {
        // Direct test activation
        const res = await fetch('/api/stripe/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            isDemo: true,
            email,
            userId: currentUser?.id,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setSuccessBanner(true);
          setStatusMessage('Test activation successful! 5,000 LKR Pro tier unlocked.');
          notify({
            type: 'success',
            title: 'Pro Unlocked (Test Mode)',
            message: 'Your account now has full access to all WhatsApp CRM features.',
          });
          await refreshData();
        }
        return;
      }

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: email,
          userId: currentUser?.id,
          tenantId: tenantId,
          customerName: name,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to start Stripe checkout');
      }

      if (data.url) {
        // Redirect to real Stripe Checkout hosted page
        window.location.href = data.url;
      } else if (data.isDemo && data.demoSuccessUrl) {
        // Redirect to demo confirmation URL
        window.location.href = data.demoSuccessUrl;
      }
    } catch (err: any) {
      notify({
        type: 'error',
        title: 'Checkout Error',
        message: err.message || 'Could not initiate Stripe payment.',
      });
    } finally {
      setLoading(false);
    }
  };

  const isActive = currentUser ? currentUser.subscriptionStatus === 'active' : true;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Banner / Verification status */}
      {verifying && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin shrink-0 text-blue-600" />
          <div className="text-sm">
            <span className="font-semibold">Verifying your Stripe transaction...</span>
            <p className="text-xs text-blue-700 mt-0.5">Please wait while we confirm your 5,000 LKR subscription.</p>
          </div>
        </div>
      )}

      {successBanner && (
        <div className="p-4 bg-[#E8F5E9] border border-[#C8E6C9] rounded-xl text-[#008069] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 shrink-0 text-[#00A884]" />
            <div>
              <h4 className="text-sm font-bold text-[#111B21]">Subscription Active & Verified!</h4>
              <p className="text-xs text-[#54656F]">{statusMessage}</p>
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E9EDEF] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-[#111B21]">Billing & Subscription</h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide ${
                isActive
                  ? 'bg-[#E8F5E9] text-[#008069] border border-[#C8E6C9]'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
            >
              {isActive ? '● PRO ACTIVE' : '○ PAYMENT REQUIRED'}
            </span>
          </div>
          <p className="text-xs text-[#54656F]">
            Manage your WhatsApp Business SaaS license and recurring Stripe billing.
          </p>
        </div>

        {currentUser ? (
          <div className="bg-white border border-[#E9EDEF] px-3.5 py-2 rounded-xl flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-[#111B21] text-white flex items-center justify-center font-bold text-xs">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="text-left text-xs">
              <div className="font-semibold text-[#111B21]">{currentUser.name}</div>
              <div className="text-[#54656F] text-[11px]">{currentUser.businessName}</div>
            </div>
          </div>
        ) : (
          <Link
            href="/login"
            className="px-3.5 py-2 rounded-lg border border-[#008069] text-[#008069] text-xs font-semibold hover:bg-[#E8F5E9] transition flex items-center gap-1.5"
          >
            Sign in to Your Business Account
          </Link>
        )}
      </div>

      {/* Pricing & Plan Card Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Plan Details & Action */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-[#E9EDEF] rounded-2xl p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#008069] bg-[#E8F5E9] px-2.5 py-1 rounded-md">
                  ZEVARONE ENTERPRISE TIER
                </span>
                <h2 className="text-xl font-bold text-[#111B21] mt-2">
                  WhatsApp CRM & Gemini AI Pro
                </h2>
                <p className="text-xs text-[#54656F] mt-1">
                  Complete omnichannel customer engagement platform for businesses in Sri Lanka & worldwide.
                </p>
              </div>

              <div className="text-right">
                <div className="text-3xl font-extrabold text-[#111B21]">
                  5,000 <span className="text-sm font-semibold text-[#54656F]">LKR</span>
                </div>
                <div className="text-[11px] text-[#8696A0]">per business / month</div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-[#E9EDEF]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#54656F] mb-4">
                What's Included in Your 5,000 LKR Plan:
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
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[#F0F2F5] border border-[#E9EDEF]">
                    <div className="p-2 rounded-lg bg-white text-[#008069] shrink-0 shadow-xs">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#111B21]">{item.title}</div>
                      <div className="text-[11px] text-[#54656F] mt-0.5 leading-snug">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 pt-6 border-t border-[#E9EDEF] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-[#54656F]">
                {isActive ? (
                  <span className="flex items-center gap-1.5 text-[#008069] font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    Your subscription is currently active.
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
                  onClick={() => handlePayWithStripe(false)}
                  disabled={loading}
                  className="flex-1 sm:flex-none px-5 py-2.5 bg-[#008069] hover:bg-[#075E54] text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      {isActive ? 'Renew / Update Card (Stripe)' : 'Pay 5,000 LKR with Stripe'}
                    </>
                  )}
                </button>

                {/* Instant Test Mode Activation */}
                <button
                  type="button"
                  onClick={() => handlePayWithStripe(true)}
                  disabled={loading}
                  title="Simulate instant payment for test/demo environments"
                  className="px-3.5 py-2.5 bg-white border border-[#E9EDEF] text-[#54656F] hover:text-[#111B21] hover:bg-[#F0F2F5] text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#008069]" />
                  Simulate Payment
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Account & Payment Info */}
        <div className="space-y-6">
          {/* Card: Payment Security */}
          <div className="bg-white border border-[#E9EDEF] rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#111B21] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#008069]" />
              Stripe Verified Security
            </h3>
            <p className="text-xs text-[#54656F] leading-relaxed">
              Payments are securely encrypted and processed directly by Stripe. Zevarone never stores your credit card details.
            </p>
            <div className="p-3 bg-[#F0F2F5] rounded-xl border border-[#E9EDEF] space-y-2 text-xs">
              <div className="flex justify-between text-[#54656F]">
                <span>Currency:</span>
                <span className="font-semibold text-[#111B21]">LKR (Sri Lankan Rupee)</span>
              </div>
              <div className="flex justify-between text-[#54656F]">
                <span>Billing Interval:</span>
                <span className="font-semibold text-[#111B21]">Monthly (Recurring)</span>
              </div>
              <div className="flex justify-between text-[#54656F]">
                <span>Payment Gate:</span>
                <span className="font-semibold text-[#111B21]">Stripe Hosted Checkout</span>
              </div>
            </div>
          </div>

          {/* Current Workspace Info */}
          <div className="bg-white border border-[#E9EDEF] rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#111B21]">
              Active Business Workspace
            </h3>
            <div className="p-3 bg-[#F0F2F5] rounded-xl border border-[#E9EDEF]">
              <div className="font-bold text-xs text-[#111B21]">
                {selectedTenant?.name || 'Zevarone Demo Business'}
              </div>
              <div className="text-[11px] text-[#54656F] mt-0.5">
                ID: {selectedTenant?.id || 'tenant_zevarone'}
              </div>
              <div className="text-[11px] text-[#54656F]">
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
