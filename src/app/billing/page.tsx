'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { loadStripe, Stripe, StripeCardElement } from '@stripe/stripe-js';
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
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
  Check,
  Tag,
  Clock,
  RotateCcw,
  XCircle,
  FileText,
  Download,
  Lock,
  Receipt,
  AlertTriangle,
  X,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Small helpers                                                      */
/* ------------------------------------------------------------------ */

const fmtDate = (d?: string, month: 'long' | 'short' = 'long') =>
  d
    ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month, day: 'numeric' })
    : null;

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton rounded-lg ${className}`} />;
}

const PLAN_FEATURES = [
  { icon: MessageSquare, label: 'Real-time shared inbox with sound alerts' },
  { icon: Bot, label: 'Zevarone AI sales agent with custom prompts' },
  { icon: ImageIcon, label: 'Welcome photo sequences for new customers' },
  { icon: Building, label: 'Private workspace, contacts and catalog' },
  { icon: Zap, label: 'Broadcast campaigns with delivery checks' },
  { icon: ShieldCheck, label: 'Meta Cloud API compliance and uptime SLA' },
];

const CANCELLATION_REASONS = [
  'Pricing / Too expensive for my current business stage',
  'Missing key features or integrations I need',
  'Setup difficulties or technical complications',
  'Temporary pause / Low business messaging volume this month',
  'Switching to another CRM / platform',
  'Other reason',
];

/* ------------------------------------------------------------------ */
/*  Page content                                                       */
/* ------------------------------------------------------------------ */

function BillingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, selectedTenant, notify, refreshData } = useApp();

  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [successBanner, setSuccessBanner] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [portalLoading, setPortalLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'cancel' | 'resume' | null>(null);
  const [cancelReason, setCancelReason] = useState(CANCELLATION_REASONS[0]);
  const [cancelFeedback, setCancelFeedback] = useState('');

  const [billingDetails, setBillingDetails] = useState<{
    card?: { brand?: string; last4?: string; expMonth?: number; expYear?: number } | null;
    subscription?: { id?: string; status?: string; cancelAtPeriodEnd?: boolean; currentPeriodEnd?: string } | null;
    subscriptionExpiresAt?: string;
    cancelAtPeriodEnd?: boolean;
    billingInterval?: 'monthly' | 'annual';
    cancellationReason?: string;
    cancellationFeedback?: string;
    cancelledAt?: string;
  } | null>(null);

  // Invoices & Billing History
  interface InvoiceItem {
    id: string;
    number: string;
    date: string;
    amountLkr: number;
    status: string;
    planName: string;
    hostedInvoiceUrl?: string;
    invoicePdf?: string;
    periodEnd?: string;
  }
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  // On-Site Embedded Payment State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [stripeInstance, setStripeInstance] = useState<Stripe | null>(null);
  const [cardElement, setCardElement] = useState<StripeCardElement | null>(null);
  const [cardholderName, setCardholderName] = useState('');
  const [cardError, setCardError] = useState('');
  const [setupClientSecret, setSetupClientSecret] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  const stripePromise = useMemo(() => {
    const pk =
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
      'pk_test_51TLPA15NlWVfmR9p6Dwy1zYZ4SfcYzrbQoViPjQjIfMmgn03pf2SXsYPINJvPkPymv5BOnZxs65Kxxw6Vy4OuZG500QRtDULKg';
    return loadStripe(pk);
  }, []);

  /* ------------------------- data loading ------------------------- */

  const fetchBillingStatus = async () => {
    if (!currentUser) return;
    setLoadingStatus(true);
    try {
      const res = await fetch('/api/stripe/status');
      const data = await res.json();
      if (data.success) {
        setBillingDetails(data);
        if (data.billingInterval) {
          setBillingInterval(data.billingInterval);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch billing status:', e);
    } finally {
      setLoadingStatus(false);
    }
  };

  const fetchInvoices = async () => {
    if (!currentUser) return;
    setLoadingInvoices(true);
    try {
      const res = await fetch(`/api/stripe/history?email=${encodeURIComponent(currentUser.email)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.invoices)) {
        setInvoices(data.invoices);
      }
    } catch (e) {
      console.warn('Failed to load invoice history:', e);
    } finally {
      setLoadingInvoices(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchBillingStatus();
      fetchInvoices();
    }
  }, [currentUser]);

  // Clean up the Stripe card element whenever the modal closes
  useEffect(() => {
    if (!showPaymentModal && cardElement) {
      try {
        cardElement.destroy();
      } catch {
        /* element already gone */
      }
      setCardElement(null);
      setSetupClientSecret('');
    }
  }, [showPaymentModal]); // eslint-disable-line react-hooks/exhaustive-deps

  // Escape closes whichever dialog is open
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (confirmAction && !cancelLoading) setConfirmAction(null);
      else if (showPaymentModal && !processingPayment) setShowPaymentModal(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [confirmAction, cancelLoading, showPaymentModal, processingPayment]);

  /* ------------------------- payment flow ------------------------- */

  const handleOpenOnSitePayment = async () => {
    if (!currentUser) {
      notify({
        type: 'warning',
        title: 'Sign In Required',
        message: 'Please sign in or register your business account before adding a payment card.',
      });
      router.push('/login');
      return;
    }
    setShowPaymentModal(true);
    setCardError('');
    setModalLoading(true);

    try {
      // 1. Get SetupIntent clientSecret from server
      const res = await fetch('/api/stripe/create-setup-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentUser.email }),
      });
      const data = await res.json();
      if (!data.success || !data.clientSecret) {
        throw new Error(data.error || 'Failed to initiate secure card gateway.');
      }
      setSetupClientSecret(data.clientSecret);

      // 2. Load Stripe & mount card element
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe.js failed to load.');
      setStripeInstance(stripe);

      // Ensure DOM is ready for #card-element
      setTimeout(() => {
        const mountPoint = document.getElementById('card-element');
        if (mountPoint && !mountPoint.hasChildNodes()) {
          const elements = stripe.elements();
          const card = elements.create('card', {
            style: {
              base: {
                fontSize: '16px',
                color: '#111B21',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                '::placeholder': { color: '#8696A0' },
              },
              invalid: {
                color: '#EF4444',
                iconColor: '#EF4444',
              },
            },
          });
          card.mount('#card-element');
          card.on('change', (event) => {
            if (event.error) {
              setCardError(event.error.message);
            } else {
              setCardError('');
            }
          });
          setCardElement(card);
        }
      }, 150);
    } catch (err: any) {
      setCardError(err.message || 'Error initializing card form.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleConfirmOnSitePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripeInstance || !cardElement || !setupClientSecret) {
      setCardError('Card gateway is still initializing. Please wait a moment.');
      return;
    }

    setProcessingPayment(true);
    setCardError('');

    try {
      // 1. Confirm Card Setup with Stripe directly (Card details stay strictly with Stripe)
      const { setupIntent, error: setupError } = await stripeInstance.confirmCardSetup(
        setupClientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: cardholderName.trim() || currentUser?.name || 'Valued Client',
              email: currentUser?.email,
            },
          },
        }
      );

      if (setupError) {
        throw new Error(setupError.message || 'Card verification failed.');
      }

      if (!setupIntent?.payment_method) {
        throw new Error('Payment method could not be saved.');
      }

      const pmId =
        typeof setupIntent.payment_method === 'string'
          ? setupIntent.payment_method
          : setupIntent.payment_method.id;

      // 2. Charge card and activate subscription on server
      const chargeRes = await fetch('/api/stripe/subscribe-embedded', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethodId: pmId,
          billingInterval,
          email: currentUser?.email,
        }),
      });

      const chargeData = await chargeRes.json();
      if (!chargeRes.ok || !chargeData.success) {
        throw new Error(chargeData.error || 'Card charge failed.');
      }

      // 3. Handle 3D Secure / SCA authentication if required by bank
      if (chargeData.requiresAction && chargeData.clientSecret) {
        const { error: actionError } = await stripeInstance.confirmCardPayment(chargeData.clientSecret);
        if (actionError) {
          throw new Error(actionError.message || '3D Secure bank authorization failed.');
        }
      }

      // Success!
      setShowPaymentModal(false);
      setSuccessBanner(true);
      setStatusMessage(
        `Payment successful! Your card has been saved and your ${
          billingInterval === 'annual' ? 'Annual Pro (54,000 LKR)' : 'Monthly Pro (5,000 LKR)'
        } subscription is now active with auto-renewal.`
      );
      notify({
        type: 'success',
        title: 'Payment Successful! 🎉',
        message: 'Your Pro subscription is now active. Card saved for auto-renewal.',
      });

      await fetchBillingStatus();
      await fetchInvoices();
      await refreshData();
    } catch (err: any) {
      setCardError(err.message || 'Payment processing failed.');
    } finally {
      setProcessingPayment(false);
    }
  };

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
                `Payment confirmed! Your card has been saved and your ${
                  intervalParam === 'annual' ? 'Annual (4,500 LKR/mo)' : 'Monthly (5,000 LKR/mo)'
                } Pro Subscription is now Active with 30-day recurring auto-renewal.`
            );
            notify({
              type: 'success',
              title: 'Card Saved & Pro Subscription Activated! 🎉',
              message: 'Your payment card is on file and auto-renewal is active.',
            });
            await fetchBillingStatus();
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

  const handleOpenCustomerPortal = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        notify({
          type: 'error',
          title: 'Portal Error',
          message:
            data.error ||
            'Could not open billing management portal. Make sure your first payment has been completed.',
        });
      }
    } catch (err: any) {
      notify({
        type: 'error',
        title: 'Error',
        message: err.message || 'Failed to reach portal service.',
      });
    } finally {
      setPortalLoading(false);
    }
  };

  // Same API call as before; the browser confirm() is replaced by the in-page dialog
  const handleToggleCancel = async (action: 'cancel' | 'resume') => {
    setCancelLoading(true);
    try {
      const res = await fetch('/api/stripe/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          reason: cancelReason,
          feedback: cancelFeedback,
        }),
      });
      const data = await res.json();
      if (data.success) {
        notify({
          type: action === 'cancel' ? 'info' : 'success',
          title: action === 'cancel' ? 'Auto-Renewal Cancelled' : 'Auto-Renewal Reactivated',
          message: data.message,
        });
        await fetchBillingStatus();
        await refreshData();
      } else {
        notify({
          type: 'error',
          title: 'Action Failed',
          message: data.error || 'Could not update subscription.',
        });
      }
    } catch (err: any) {
      notify({
        type: 'error',
        title: 'Error',
        message: err.message || 'Network error.',
      });
    } finally {
      setCancelLoading(false);
      setConfirmAction(null);
    }
  };

  /* ------------------------- derived values ------------------------- */

  const isActive = currentUser ? currentUser.subscriptionStatus === 'active' : true;
  const isAnnual = billingInterval === 'annual';
  const hasCard = Boolean(billingDetails?.card);
  const cancelAtPeriodEnd = Boolean(billingDetails?.cancelAtPeriodEnd);
  const renewalDate =
    billingDetails?.subscription?.currentPeriodEnd ||
    billingDetails?.subscriptionExpiresAt ||
    currentUser?.subscriptionExpiresAt;
  const formattedRenewalDate = fmtDate(renewalDate);
  const amountLabel = isAnnual ? '54,000 LKR' : '5,000 LKR';
  const firstLoad = loadingStatus && !billingDetails;

  const status = isActive
    ? cancelAtPeriodEnd
      ? { label: 'Ends at period end', cls: 'bg-amber-50 text-amber-800 border-amber-200', dot: 'bg-amber-500' }
      : { label: 'Active, auto-renewing', cls: 'bg-emerald-50 text-[#008069] border-emerald-200', dot: 'bg-[#00A884] live-dot' }
    : { label: 'Payment required', cls: 'bg-amber-50 text-amber-800 border-amber-200', dot: 'bg-amber-500' };

  /* ------------------------- render ------------------------- */

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-14 text-slate-900">
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform: translateY(14px);} to { opacity:1; transform:none;} }
        @keyframes fadeIn { from { opacity:0;} to { opacity:1;} }
        @keyframes modalIn { from { opacity:0; transform: translateY(16px) scale(.97);} to { opacity:1; transform:none;} }
        @keyframes shimmer { from { background-position: -200% 0;} to { background-position: 200% 0;} }
        @keyframes pulseRing { 0% { box-shadow: 0 0 0 0 rgba(0,168,132,.5);} 100% { box-shadow: 0 0 0 8px rgba(0,168,132,0);} }
        @keyframes drawCheck { from { stroke-dashoffset: 30;} to { stroke-dashoffset: 0;} }
        @keyframes ringPop { 0% { transform: scale(.6); opacity:0;} 60% { transform: scale(1.08); opacity:1;} 100% { transform: scale(1);} }
        @keyframes sheen { from { transform: translateX(-130%) skewX(-20deg);} to { transform: translateX(300%) skewX(-20deg);} }
        @keyframes priceIn { from { opacity:0; transform: translateY(8px);} to { opacity:1; transform:none;} }

        .fade-up { animation: fadeUp .55s cubic-bezier(.2,.8,.2,1) both; }
        .fade-in { animation: fadeIn .2s ease both; }
        .modal-in { animation: modalIn .28s cubic-bezier(.2,.8,.2,1) both; }
        .price-in { animation: priceIn .3s cubic-bezier(.2,.8,.2,1) both; }
        .live-dot { animation: pulseRing 1.8s infinite; }
        .skeleton { background: linear-gradient(90deg,#EEF1F3 25%,#F7F9FA 50%,#EEF1F3 75%); background-size: 200% 100%; animation: shimmer 1.4s linear infinite; }
        .check-ring { animation: ringPop .5s cubic-bezier(.2,.8,.2,1) both; }
        .check-path { stroke-dasharray: 30; stroke-dashoffset: 30; animation: drawCheck .45s .25s ease forwards; }
        .card-sheen { position:absolute; inset:0; width:35%; background: linear-gradient(90deg,transparent,rgba(255,255,255,.14),transparent); transform: translateX(-130%) skewX(-20deg); }
        .pay-card:hover .card-sheen { animation: sheen 1.1s ease; }
        .btn-shine { position:absolute; inset:0; width:40%; background: linear-gradient(90deg,transparent,rgba(255,255,255,.3),transparent); transform: translateX(-130%) skewX(-20deg); }
        button:hover > .btn-shine { animation: sheen .9s ease; }
        @media (prefers-reduced-motion: reduce) {
          *,*::before,*::after { animation: none !important; transition-duration: .01ms !important; }
          .check-path { stroke-dashoffset: 0; }
        }
      `}</style>

      {/* ---------------- Banners ---------------- */}
      {verifying && (
        <div className="fade-up p-4 bg-blue-50 border border-blue-200 rounded-2xl text-blue-800 flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin shrink-0 text-blue-600" />
          <div className="text-sm">
            <span className="font-semibold">Confirming your payment with Stripe…</span>
            <p className="text-xs text-blue-700 mt-0.5">
              We’re saving your card and activating your subscription. This takes a few seconds.
            </p>
          </div>
        </div>
      )}

      {successBanner && (
        <div className="fade-up p-4 sm:p-5 bg-gradient-to-r from-emerald-50 to-white border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="check-ring h-12 w-12 shrink-0 rounded-full bg-[#008069] flex items-center justify-center shadow-lg shadow-[#008069]/25">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path className="check-path" d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Your subscription is active</h4>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{statusMessage}</p>
            </div>
          </div>
          <Link
            href="/inbox"
            className="group px-5 py-2.5 bg-[#008069] hover:bg-[#075E54] text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition shadow-sm"
          >
            Open my inbox
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      )}

      {/* ---------------- Header ---------------- */}
      <div className="fade-up flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Billing</h1>
            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${status.cls}`}>
              <span className={`h-2 w-2 rounded-full ${status.dot}`} />
              {status.label}
            </span>
          </div>
          <p className="mt-1.5 text-sm text-slate-500">
            Manage your plan, payment card and invoices in one place.
          </p>
        </div>

        {currentUser ? (
          <div className="bg-white border border-slate-200 px-3.5 py-2 rounded-2xl flex items-center gap-3 shadow-sm self-start sm:self-auto">
            <div className="h-9 w-9 rounded-full bg-[#111B21] text-white flex items-center justify-center font-bold text-sm">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="text-left leading-tight">
              <div className="text-sm font-semibold text-slate-900">{currentUser.name}</div>
              <div className="text-xs text-slate-500">{currentUser.businessName}</div>
            </div>
          </div>
        ) : (
          <Link
            href="/login"
            className="px-4 py-2.5 rounded-xl border border-[#008069] text-[#008069] text-sm font-semibold hover:bg-emerald-50 transition self-start"
          >
            Sign in to your business account
          </Link>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* ============ LEFT: card + plan ============ */}
        <div className="lg:col-span-2 space-y-6">
          {/* ---- Payment card & renewal ---- */}
          <section className="fade-up bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm" style={{ animationDelay: '.06s' }}>
            <div className="flex items-start justify-between gap-3 mb-5">
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#008069]" />
                  Payment card and renewal
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Your card is charged automatically so your CRM never stops working.
                </p>
              </div>
              <button
                type="button"
                onClick={fetchBillingStatus}
                disabled={loadingStatus}
                aria-label="Refresh card status"
                className="h-9 w-9 shrink-0 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 flex items-center justify-center transition"
              >
                <RefreshCw className={`w-4 h-4 ${loadingStatus ? 'animate-spin text-[#008069]' : ''}`} />
              </button>
            </div>

            {firstLoad ? (
              <div className="grid md:grid-cols-2 gap-5">
                <Skeleton className="h-48 !rounded-2xl" />
                <div className="space-y-3">
                  <Skeleton className="h-10" />
                  <Skeleton className="h-10" />
                  <Skeleton className="h-10" />
                </div>
              </div>
            ) : hasCard && billingDetails?.card ? (
              <div className="grid md:grid-cols-2 gap-5">
                {/* Card visual */}
                <div className="pay-card relative overflow-hidden rounded-2xl p-5 text-white bg-gradient-to-br from-[#111B21] via-[#17313A] to-[#075E54] shadow-xl shadow-[#111B21]/25 transition-transform duration-300 hover:-translate-y-1 min-h-[12rem] flex flex-col justify-between">
                  <span className="card-sheen" aria-hidden />
                  <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5" />
                  <div className="relative flex items-center justify-between">
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-400/15 text-emerald-300 border border-emerald-400/25">
                      Default card
                    </span>
                    <span className="text-sm font-black uppercase tracking-wider text-white/90">
                      {billingDetails.card.brand || 'Card'}
                    </span>
                  </div>
                  <div className="relative font-mono text-lg tracking-[0.22em] text-white/90">
                    •••• •••• •••• <span className="font-bold text-white tracking-widest">{billingDetails.card.last4 || '••••'}</span>
                  </div>
                  <div className="relative flex items-end justify-between text-xs">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Expires</span>
                      <span className="font-semibold">
                        {billingDetails.card.expMonth}/{billingDetails.card.expYear}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Cardholder</span>
                      <span className="font-semibold truncate max-w-[9rem] block">
                        {currentUser?.name || 'Authorized client'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Renewal details + actions */}
                <div className="flex flex-col justify-between gap-4">
                  <dl className="text-sm divide-y divide-slate-100">
                    <div className="flex items-center justify-between py-3">
                      <dt className="text-slate-500 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" /> Next charge
                      </dt>
                      <dd className="font-semibold">{formattedRenewalDate || 'In 30 days'}</dd>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <dt className="text-slate-500 flex items-center gap-2">
                        <Tag className="w-4 h-4 text-slate-400" /> Renewal amount
                      </dt>
                      <dd className="font-semibold text-emerald-700">
                        {billingDetails.billingInterval === 'annual' ? '54,000 LKR / year' : '5,000 LKR / 30 days'}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between py-3 gap-3">
                      <dt className="text-slate-500">Auto-renewal</dt>
                      <dd>
                        {cancelAtPeriodEnd ? (
                          <span className="inline-flex items-center gap-1.5 text-amber-700 font-semibold text-right">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            Off. Access ends {formattedRenewalDate}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[#008069] font-semibold">
                            <CheckCircle2 className="w-4 h-4" /> On
                          </span>
                        )}
                      </dd>
                    </div>
                    {cancelAtPeriodEnd && billingDetails?.cancellationReason && (
                      <div className="py-2.5 px-3 bg-amber-50/90 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 space-y-0.5">
                        <div className="font-bold flex items-center gap-1 text-amber-800">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          Cancellation reason noted:
                        </div>
                        <p className="italic text-amber-800">"{billingDetails.cancellationReason}"</p>
                      </div>
                    )}
                  </dl>

                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <button
                      type="button"
                      onClick={handleOpenCustomerPortal}
                      disabled={portalLoading}
                      className="flex-1 px-4 py-2.5 bg-[#111B21] hover:bg-[#1f2d36] text-white text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {portalLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 text-emerald-400" />
                          Update card
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                        </>
                      )}
                    </button>

                    {cancelAtPeriodEnd ? (
                      <button
                        type="button"
                        onClick={() => setConfirmAction('resume')}
                        className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Turn renewal back on
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmAction('cancel')}
                        className="px-4 py-2.5 border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-600 hover:text-rose-700 text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Cancel plan
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50/60 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">No card saved yet</h3>
                    <p className="text-sm text-slate-600 mt-0.5 leading-relaxed">
                      Add a debit or credit card below. Stripe stores it securely and charges it automatically. You can change the card or cancel any time.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleOpenOnSitePayment}
                  disabled={loading || modalLoading}
                  className="relative overflow-hidden group px-5 py-2.5 bg-[#008069] hover:bg-[#075E54] text-white text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2 shrink-0 shadow-sm"
                >
                  <span className="btn-shine" aria-hidden />
                  <CreditCard className="w-4 h-4 relative" />
                  <span className="relative">Add card</span>
                </button>
              </div>
            )}
          </section>

          {/* ---- Plan picker ---- */}
          <section className="fade-up bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm" style={{ animationDelay: '.12s' }}>
            <h2 className="text-base font-bold">Choose how you pay</h2>
            <p className="text-sm text-slate-500 mt-0.5">One plan with everything included. Pick the billing that suits you.</p>

            <div role="radiogroup" aria-label="Billing frequency" className="mt-5 grid sm:grid-cols-2 gap-3">
              {(
                [
                  { id: 'monthly', title: 'Monthly', price: '5,000', sub: 'Billed every 30 days', badge: null },
                  { id: 'annual', title: 'Annual', price: '4,500', sub: 'Billed 54,000 LKR a year', badge: 'Save 6,000 LKR' },
                ] as const
              ).map((p) => {
                const selected = billingInterval === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setBillingInterval(p.id)}
                    className={`relative text-left rounded-2xl border-2 p-4 transition-all duration-200 ${
                      selected
                        ? 'border-[#008069] bg-emerald-50/50 shadow-lg shadow-[#008069]/10 scale-[1.01]'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold">{p.title}</span>
                      <span
                        className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          selected ? 'bg-[#008069] border-[#008069]' : 'border-slate-300'
                        }`}
                      >
                        <Check className={`w-3 h-3 text-white transition-transform ${selected ? 'scale-100' : 'scale-0'}`} />
                      </span>
                    </div>
                    <div className="mt-2 flex items-baseline gap-1.5">
                      <span className="text-3xl font-extrabold tabular-nums">{p.price}</span>
                      <span className="text-sm font-semibold text-slate-500">LKR / month</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{p.sub}</p>
                    {p.badge && (
                      <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-[#008069] text-white text-[10px] font-bold">
                        {p.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <ul className="mt-6 grid sm:grid-cols-2 gap-x-6 gap-y-3 pt-5 border-t border-slate-100">
              {PLAN_FEATURES.map((f) => (
                <li key={f.label} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <span className="h-6 w-6 shrink-0 rounded-lg bg-emerald-50 text-[#008069] flex items-center justify-center">
                    <f.icon className="w-3.5 h-3.5" />
                  </span>
                  <span className="pt-0.5">{f.label}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-sm">
                {isActive ? (
                  <span className="flex items-center gap-1.5 text-[#008069] font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    Subscription active ({billingDetails?.billingInterval === 'annual' ? 'annual' : 'monthly'})
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-amber-700 font-medium">
                    <AlertCircle className="w-4 h-4" />
                    Add a card to switch on your CRM.
                  </span>
                )}
              </p>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={handleOpenOnSitePayment}
                  disabled={loading || modalLoading}
                  className="relative overflow-hidden group px-6 py-3 bg-[#008069] hover:bg-[#075E54] text-white text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-[#008069]/25 active:scale-[0.99] disabled:opacity-60"
                >
                  <span className="btn-shine" aria-hidden />
                  {modalLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin relative" />
                  ) : (
                    <span className="relative flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      {isActive && hasCard ? 'Update card or switch plan' : `Pay ${amountLabel}`}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handlePayWithStripe}
                  disabled={loading}
                  title="Pay on Stripe’s hosted checkout page"
                  className="px-4 py-3 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl border border-slate-300 transition flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ExternalLink className="w-4 h-4 text-slate-500" />
                  )}
                  Stripe checkout
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* ============ RIGHT: summary + workspace ============ */}
        <aside className="space-y-6 lg:sticky lg:top-6">
          <div className="fade-up rounded-3xl bg-[#111B21] text-white p-6 shadow-xl shadow-[#111B21]/20 relative overflow-hidden" style={{ animationDelay: '.1s' }}>
            <div className="absolute -top-16 -right-12 h-44 w-44 rounded-full bg-[#00A884]/20 blur-3xl" />
            <p className="relative text-xs font-semibold text-[#00A884]">Your selection</p>
            <p className="relative mt-1 text-sm text-[#8696A0]">
              WhatsApp CRM &amp; Zevarone AI Pro, {isAnnual ? 'annual' : 'monthly'}
            </p>
            <div key={billingInterval} className="price-in relative mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold tabular-nums">{isAnnual ? '4,500' : '5,000'}</span>
              <span className="text-sm font-semibold text-[#8696A0]">LKR / month</span>
            </div>
            <p className="relative mt-1 text-xs text-[#8696A0]">
              {isAnnual ? 'Charged 54,000 LKR once a year' : 'Charged 5,000 LKR every 30 days'}
            </p>
            <div className="relative mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-sm">
              <span className="text-[#8696A0]">Due today</span>
              <span className="font-bold">{amountLabel}</span>
            </div>
          </div>

          <div className="fade-up bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3" style={{ animationDelay: '.16s' }}>
            <h3 className="text-sm font-bold">Active business workspace</h3>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-0.5">
              <div className="font-semibold text-sm">{selectedTenant?.name || 'Your business workspace'}</div>
              <div className="text-xs text-slate-500">ID: {selectedTenant?.id || 'tenant_zevarone'}</div>
              <div className="text-xs text-slate-500">
                WhatsApp: +{selectedTenant?.whatsappNumber || '94771234567'}
              </div>
            </div>
            <Link
              href="/settings"
              className="group text-sm font-semibold text-[#008069] hover:underline inline-flex items-center gap-1"
            >
              Set up WhatsApp API credentials
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="fade-up flex items-start gap-3 px-1 text-xs text-slate-500" style={{ animationDelay: '.22s' }}>
            <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Payments are handled by Stripe. Your card details never reach our servers.
            </p>
          </div>
        </aside>
      </div>

      {/* ---------------- Invoices ---------------- */}
      <section className="fade-up bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm" style={{ animationDelay: '.18s' }}>
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-[#008069] flex items-center justify-center shrink-0 border border-emerald-100">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Payment history and invoices</h2>
              <p className="text-sm text-slate-500 mt-0.5">Download receipts for every payment processed by Stripe.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={fetchInvoices}
            disabled={loadingInvoices}
            aria-label="Refresh invoices"
            className="h-9 w-9 shrink-0 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 flex items-center justify-center transition"
          >
            <RefreshCw className={`w-4 h-4 ${loadingInvoices ? 'animate-spin text-[#008069]' : ''}`} />
          </button>
        </div>

        {loadingInvoices && invoices.length === 0 ? (
          <div className="space-y-3">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <FileText className="w-9 h-9 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No invoices yet</p>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              After your first payment, your PDF invoices and receipts will show up here automatically.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 overflow-hidden">
            <div className="hidden md:grid grid-cols-[1.3fr_1fr_1.5fr_1fr_.8fr_1.2fr] gap-3 px-4 py-3 bg-slate-50 text-xs font-semibold text-slate-500 border-b border-slate-200">
              <span>Invoice</span>
              <span>Date</span>
              <span>Description</span>
              <span>Amount</span>
              <span>Status</span>
              <span className="text-right">Actions</span>
            </div>
            <ul className="divide-y divide-slate-100">
              {invoices.map((inv, i) => (
                <li
                  key={inv.id}
                  className="fade-up grid md:grid-cols-[1.3fr_1fr_1.5fr_1fr_.8fr_1.2fr] gap-x-3 gap-y-1.5 px-4 py-3.5 items-center text-sm hover:bg-slate-50/80 transition"
                  style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
                >
                  <span className="font-mono font-semibold truncate">{inv.number || inv.id.slice(0, 16)}</span>
                  <span className="text-slate-600">{fmtDate(inv.date, 'short') || '—'}</span>
                  <span className="text-slate-800 font-medium">{inv.planName}</span>
                  <span className="font-bold">{inv.amountLkr.toLocaleString()} LKR</span>
                  <span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${
                        inv.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : inv.status === 'open'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </span>
                  <span className="flex md:justify-end gap-2 pt-1 md:pt-0">
                    {inv.invoicePdf && (
                      <a
                        href={inv.invoicePdf}
                        target="_blank"
                        rel="noreferrer"
                        title="Download PDF invoice"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition"
                      >
                        <Download className="w-3.5 h-3.5 text-[#008069]" />
                        PDF
                      </a>
                    )}
                    {inv.hostedInvoiceUrl && (
                      <a
                        href={inv.hostedInvoiceUrl}
                        target="_blank"
                        rel="noreferrer"
                        title="View receipt on Stripe"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#008069] hover:bg-[#075E54] text-white rounded-lg text-xs font-semibold transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Receipt
                      </a>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* ---------------- Payment modal ---------------- */}
      {showPaymentModal && (
        <div
          className="fade-in fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !processingPayment) setShowPaymentModal(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Secure card payment"
            className="modal-in bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden max-h-[95vh] overflow-y-auto"
          >
            <div className="bg-[#111B21] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-[#00A884] flex items-center justify-center">
                  <Lock className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Secure card payment</h3>
                  <p className="text-xs text-[#8696A0]">Encrypted and processed by Stripe</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !processingPayment && setShowPaymentModal(false)}
                disabled={processingPayment}
                aria-label="Close"
                className="h-8 w-8 rounded-lg flex items-center justify-center text-[#8696A0] hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmOnSitePayment} className="p-6 space-y-5">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-sm">
                <div className="flex justify-between gap-3 text-slate-600">
                  <span>Plan</span>
                  <span className="font-semibold text-slate-900">
                    WhatsApp CRM Pro ({isAnnual ? 'annual' : 'monthly'})
                  </span>
                </div>
                <div className="flex justify-between gap-3 text-slate-600">
                  <span>Renews</span>
                  <span className="font-medium text-emerald-700 text-right">
                    {isAnnual ? '54,000 LKR every 365 days' : '5,000 LKR every 30 days'}
                  </span>
                </div>
                <div className="pt-2.5 mt-1 border-t border-slate-200 flex justify-between items-center">
                  <span className="font-bold">Due today</span>
                  <span className="text-xl font-extrabold text-[#008069]">{amountLabel}</span>
                </div>
              </div>

              <div>
                <label htmlFor="cardholder" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Name on card
                </label>
                <input
                  id="cardholder"
                  type="text"
                  required
                  autoComplete="cc-name"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  placeholder="e.g. Nipuna Dasun"
                  className="w-full h-12 px-4 text-[15px] bg-[#F7F8FA] border border-[#E1E6EA] rounded-xl text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:bg-white focus:border-[#008069] focus:ring-4 focus:ring-[#008069]/10"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-slate-700">Card details</label>
                  <span className="text-xs text-slate-400 font-medium">Visa · Mastercard · Amex</span>
                </div>
                <div className="relative">
                  <div
                    id="card-element"
                    className="px-4 py-3.5 bg-[#F7F8FA] border border-[#E1E6EA] rounded-xl min-h-[48px] transition-all focus-within:bg-white focus-within:border-[#008069] focus-within:ring-4 focus-within:ring-[#008069]/10"
                  />
                  {modalLoading && (
                    <div className="absolute inset-0 rounded-xl skeleton flex items-center justify-center text-xs text-slate-500 gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Preparing secure form…
                    </div>
                  )}
                </div>
              </div>

              {cardError && (
                <div role="alert" className="fade-in p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-snug">{cardError}</span>
                </div>
              )}

              <div className="flex items-start gap-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Your card number goes straight to Stripe and never touches our servers.</span>
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  disabled={processingPayment}
                  className="px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processingPayment || modalLoading}
                  className="relative overflow-hidden group px-6 py-3 bg-[#008069] hover:bg-[#075E54] text-white text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-[#008069]/25 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span className="btn-shine" aria-hidden />
                  <span className="relative flex items-center gap-2">
                    {processingPayment ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Authorizing with Stripe…
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        Pay {amountLabel}
                      </>
                    )}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- Confirm cancel / resume ---------------- */}
      {confirmAction && (
        <div
          className="fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !cancelLoading) setConfirmAction(null);
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            className={`modal-in bg-white rounded-3xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto ${
              confirmAction === 'cancel' ? 'max-w-lg' : 'max-w-md'
            }`}
          >
            <div className="flex items-center justify-between">
              <div
                className={`h-12 w-12 rounded-2xl flex items-center justify-center ${
                  confirmAction === 'cancel' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-[#008069]'
                }`}
              >
                {confirmAction === 'cancel' ? <XCircle className="w-6 h-6" /> : <RotateCcw className="w-6 h-6" />}
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!cancelLoading) setConfirmAction(null);
                }}
                disabled={cancelLoading}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold p-1 cursor-pointer transition"
              >
                &times;
              </button>
            </div>

            <h3 className="mt-4 text-lg font-bold text-slate-900">
              {confirmAction === 'cancel' ? 'Stop automatic renewal?' : 'Turn renewal back on?'}
            </h3>

            <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
              {confirmAction === 'cancel'
                ? `You’ll retain full Pro access until the end of your current cycle${
                    formattedRenewalDate ? ` (${formattedRenewalDate})` : ''
                  }. Your card will not be charged again.`
                : 'Your saved card will resume automatic renewal so your WhatsApp AI Concierge stays online.'}
            </p>

            {/* Cancellation Reason Survey */}
            {confirmAction === 'cancel' && (
              <div className="mt-4 space-y-3.5 text-left border-t border-slate-100 pt-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">
                    Why are you cancelling? <span className="text-rose-500">*</span>
                  </label>
                  <div className="space-y-1.5">
                    {CANCELLATION_REASONS.map((r) => (
                      <label
                        key={r}
                        className={`flex items-start gap-2.5 p-2 rounded-xl border text-xs cursor-pointer transition ${
                          cancelReason === r
                            ? 'bg-emerald-50/70 border-[#008069] text-slate-900 font-semibold shadow-2xs'
                            : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="radio"
                          name="cancellationReason"
                          value={r}
                          checked={cancelReason === r}
                          onChange={() => setCancelReason(r)}
                          className="mt-0.5 text-[#008069] focus:ring-[#008069]"
                        />
                        <span className="leading-snug">{r}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    How could we have made your experience better? (Optional feedback)
                  </label>
                  <textarea
                    rows={2}
                    value={cancelFeedback}
                    onChange={(e) => setCancelFeedback(e.target.value)}
                    placeholder="Tell us what was missing, or how we can improve..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#008069] focus:bg-white transition"
                  />
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                disabled={cancelLoading}
                className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                {confirmAction === 'cancel' ? 'Never mind, keep plan' : 'Not now'}
              </button>
              <button
                type="button"
                onClick={() => handleToggleCancel(confirmAction)}
                disabled={cancelLoading}
                className={`px-5 py-2.5 text-xs font-bold text-white rounded-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 ${
                  confirmAction === 'cancel' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-[#008069] hover:bg-[#075E54]'
                }`}
              >
                {cancelLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {confirmAction === 'cancel' ? 'Confirm & Stop Renewal' : 'Yes, turn on'}
              </button>
            </div>
          </div>
        </div>
      )}
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