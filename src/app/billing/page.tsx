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
  RotateCcw,
  XCircle,
  FileText,
  Download,
  Lock,
  X,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Helpers & constants                                                */
/* ------------------------------------------------------------------ */

const fmtDate = (d?: string, month: 'long' | 'short' = 'long') =>
  d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month, day: 'numeric' }) : null;

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton rounded-lg ${className}`} />;
}

const PLAN_FEATURES = [
  { icon: MessageSquare, label: 'Shared inbox with sound alerts' },
  { icon: Bot, label: 'Zevarone AI sales agent' },
  { icon: ImageIcon, label: 'Welcome photo sequences' },
  { icon: Building, label: 'Private workspace and catalog' },
  { icon: Zap, label: 'Broadcast campaigns' },
  { icon: ShieldCheck, label: 'Meta Cloud API and uptime SLA' },
];

const CANCELLATION_REASONS = [
  'Pricing / Too expensive for my current business stage',
  'Missing key features or integrations I need',
  'Setup difficulties or technical complications',
  'Temporary pause / Low business messaging volume this month',
  'Switching to another CRM / platform',
  'Other reason',
];

const PRICES = {
  monthly: { perMonth: '5,000', total: '5,000 LKR', cadence: 'every 30 days' },
  annual: { perMonth: '4,500', total: '54,000 LKR', cadence: 'once a year' },
} as const;

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008069] focus-visible:ring-offset-2';

const primaryBtn = `inline-flex items-center justify-center gap-2 rounded-xl bg-[#008069] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#075E54] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`;

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
  } | null>(null);

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

  // On-site embedded payment state
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
        if (data.billingInterval) setBillingInterval(data.billingInterval);
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
      if (data.success && Array.isArray(data.invoices)) setInvoices(data.invoices);
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
                color: '#0F1A1F',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                '::placeholder': { color: '#8696A0' },
              },
              invalid: { color: '#E11D48', iconColor: '#E11D48' },
            },
          });
          card.mount('#card-element');
          card.on('change', (event) => {
            setCardError(event.error ? event.error.message : '');
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
      // 1. Confirm card setup with Stripe directly (card details stay with Stripe)
      const { setupIntent, error: setupError } = await stripeInstance.confirmCardSetup(setupClientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: cardholderName.trim() || currentUser?.name || 'Valued Client',
            email: currentUser?.email,
          },
        },
      });

      if (setupError) throw new Error(setupError.message || 'Card verification failed.');
      if (!setupIntent?.payment_method) throw new Error('Payment method could not be saved.');

      const pmId =
        typeof setupIntent.payment_method === 'string'
          ? setupIntent.payment_method
          : setupIntent.payment_method.id;

      // 2. Charge card and activate subscription on server
      const chargeRes = await fetch('/api/stripe/subscribe-embedded', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethodId: pmId, billingInterval, email: currentUser?.email }),
      });

      const chargeData = await chargeRes.json();
      if (!chargeRes.ok || !chargeData.success) {
        throw new Error(chargeData.error || 'Card charge failed.');
      }

      // 3. Handle 3D Secure / SCA if the bank requires it
      if (chargeData.requiresAction && chargeData.clientSecret) {
        const { error: actionError } = await stripeInstance.confirmCardPayment(chargeData.clientSecret);
        if (actionError) throw new Error(actionError.message || '3D Secure bank authorization failed.');
      }

      setShowPaymentModal(false);
      setSuccessBanner(true);
      setStatusMessage(
        `Your card is saved and your ${
          billingInterval === 'annual' ? 'Annual Pro (54,000 LKR)' : 'Monthly Pro (5,000 LKR)'
        } plan is active with auto-renewal.`
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
                `Your card is saved and your ${
                  intervalParam === 'annual' ? 'Annual (4,500 LKR/mo)' : 'Monthly (5,000 LKR/mo)'
                } Pro plan is active with auto-renewal.`
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
        .catch((err) => console.error('Verification error:', err))
        .finally(() => setVerifying(false));
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
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: currentUser.email,
          userId: currentUser.id,
          tenantId: selectedTenant?.id || currentUser.tenantId,
          customerName: currentUser.name || 'Business Partner',
          billingInterval,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to start Stripe checkout');

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
      notify({ type: 'error', title: 'Error', message: err.message || 'Failed to reach portal service.' });
    } finally {
      setPortalLoading(false);
    }
  };

  const handleToggleCancel = async (action: 'cancel' | 'resume') => {
    setCancelLoading(true);
    try {
      const res = await fetch('/api/stripe/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          reason: action === 'cancel' ? cancelReason : undefined,
          feedback: action === 'cancel' ? cancelFeedback : undefined,
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
        notify({ type: 'error', title: 'Action Failed', message: data.error || 'Could not update subscription.' });
      }
    } catch (err: any) {
      notify({ type: 'error', title: 'Error', message: err.message || 'Network error.' });
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
  const price = PRICES[billingInterval];
  const amountLabel = price.total;
  const firstLoad = loadingStatus && !billingDetails;

  const status = isActive
    ? cancelAtPeriodEnd
      ? { label: 'Ends ' + (formattedRenewalDate || 'soon'), cls: 'bg-amber-50 text-amber-800 ring-amber-200', dot: 'bg-amber-500' }
      : { label: 'Active', cls: 'bg-emerald-50 text-[#006B58] ring-emerald-200', dot: 'bg-[#00A884] live-dot' }
    : { label: 'Payment needed', cls: 'bg-amber-50 text-amber-800 ring-amber-200', dot: 'bg-amber-500' };

  const panel = 'rounded-2xl bg-white ring-1 ring-slate-200/80 shadow-[0_1px_2px_rgba(15,26,31,.04)]';

  /* ------------------------- render ------------------------- */

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16 text-slate-900">
      <style>{`
        @keyframes fadeIn { from { opacity:0;} to { opacity:1;} }
        @keyframes modalIn { from { opacity:0; transform: translateY(12px) scale(.98);} to { opacity:1; transform:none;} }
        @keyframes shimmer { from { background-position: -200% 0;} to { background-position: 200% 0;} }
        @keyframes pulseRing { 0% { box-shadow: 0 0 0 0 rgba(0,168,132,.5);} 100% { box-shadow: 0 0 0 7px rgba(0,168,132,0);} }
        @keyframes drawCheck { from { stroke-dashoffset: 30;} to { stroke-dashoffset: 0;} }
        @keyframes ringPop { 0% { transform: scale(.6); opacity:0;} 60% { transform: scale(1.08); opacity:1;} 100% { transform: scale(1);} }
        @keyframes priceIn { from { opacity:0; transform: translateY(6px);} to { opacity:1; transform:none;} }
        .fade-in { animation: fadeIn .2s ease both; }
        .modal-in { animation: modalIn .25s cubic-bezier(.2,.8,.2,1) both; }
        .price-in { animation: priceIn .25s cubic-bezier(.2,.8,.2,1) both; }
        .live-dot { animation: pulseRing 1.8s infinite; }
        .skeleton { background: linear-gradient(90deg,#EEF1F3 25%,#F7F9FA 50%,#EEF1F3 75%); background-size: 200% 100%; animation: shimmer 1.4s linear infinite; }
        .check-ring { animation: ringPop .45s cubic-bezier(.2,.8,.2,1) both; }
        .check-path { stroke-dasharray: 30; stroke-dashoffset: 30; animation: drawCheck .4s .2s ease forwards; }
        @media (prefers-reduced-motion: reduce) {
          *,*::before,*::after { animation: none !important; transition-duration: .01ms !important; }
          .check-path { stroke-dashoffset: 0; }
        }
      `}</style>

      {/* ---------------- Header ---------------- */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${status.cls}`}>
              <span className={`h-2 w-2 rounded-full ${status.dot}`} />
              {status.label}
            </span>
          </div>
          <p className="mt-1.5 text-[15px] text-slate-500">Your plan, payment card and invoices.</p>
        </div>
        {!currentUser && (
          <Link
            href="/login"
            className={`self-start rounded-xl border border-[#008069] px-4 py-2.5 text-sm font-semibold text-[#008069] transition hover:bg-emerald-50 ${focusRing}`}
          >
            Sign in to your business account
          </Link>
        )}
      </header>

      {/* ---------------- Banners ---------------- */}
      {verifying && (
        <div role="status" className="fade-in flex items-center gap-3 rounded-2xl bg-blue-50 p-4 text-blue-900 ring-1 ring-blue-200">
          <Loader2 className="h-5 w-5 shrink-0 animate-spin text-blue-600" />
          <p className="text-sm">
            <span className="font-semibold">Confirming your payment…</span>{' '}
            <span className="text-blue-800">This takes a few seconds.</span>
          </p>
        </div>
      )}

      {successBanner && (
        <div
          role="status"
          className="fade-in flex flex-col justify-between gap-4 rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-200 sm:flex-row sm:items-center sm:p-5"
        >
          <div className="flex items-center gap-4">
            <div className="check-ring flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#008069]">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path className="check-path" d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold">You’re all set</h2>
              <p className="mt-0.5 text-sm leading-relaxed text-slate-600">{statusMessage}</p>
            </div>
          </div>
          <Link href="/inbox" className={`${primaryBtn} group shrink-0`}>
            Open inbox
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      )}

      <div className="grid items-start gap-8 lg:grid-cols-[1fr_340px]">
        {/* ============ MAIN COLUMN ============ */}
        <div className="space-y-8">
          {/* ---- Plan ---- */}
          <section className={`${panel} p-5 sm:p-7`} aria-labelledby="plan-h">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 id="plan-h" className="text-lg font-bold">ZEVARONE. CRM Pro</h2>
                <p className="mt-0.5 text-sm text-slate-500">One plan, everything included.</p>
              </div>

              {/* Segmented control */}
              <div
                role="radiogroup"
                aria-label="Billing frequency"
                className="relative inline-grid grid-cols-2 self-start rounded-xl bg-slate-100 p-1 text-sm font-semibold"
              >
                {(['monthly', 'annual'] as const).map((id) => {
                  const selected = billingInterval === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setBillingInterval(id)}
                      className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2 transition ${focusRing} ${
                        selected ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {id === 'monthly' ? 'Monthly' : 'Annual'}
                      {id === 'annual' && (
                        <span className="rounded-full bg-[#008069] px-2 py-0.5 text-[10px] font-bold text-white">
                          Save 10%
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div key={billingInterval} className="price-in mt-6 flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="text-5xl font-extrabold tracking-tight tabular-nums">{price.perMonth}</span>
              <span className="text-base font-semibold text-slate-500">LKR per month</span>
              <span className="w-full text-sm text-slate-500 sm:ml-2 sm:w-auto">
                {isAnnual ? 'Billed 54,000 LKR once a year. You save 6,000 LKR.' : 'Billed every 30 days. Cancel any time.'}
              </span>
            </div>

            <ul className="mt-6 grid gap-x-8 gap-y-3 border-t border-slate-100 pt-6 sm:grid-cols-2">
              {PLAN_FEATURES.map((f) => (
                <li key={f.label} className="flex items-center gap-3 text-sm text-slate-700">
                  <f.icon className="h-4 w-4 shrink-0 text-[#008069]" aria-hidden />
                  {f.label}
                </li>
              ))}
            </ul>
          </section>

          {/* ---- Payment method ---- */}
          <section className={`${panel} p-5 sm:p-7`} aria-labelledby="pm-h">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2 id="pm-h" className="text-lg font-bold">Payment method</h2>
                <p className="mt-0.5 text-sm text-slate-500">Charged automatically so your CRM never stops.</p>
              </div>
              <button
                type="button"
                onClick={fetchBillingStatus}
                disabled={loadingStatus}
                aria-label="Refresh payment details"
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 ${focusRing}`}
              >
                <RefreshCw className={`h-4 w-4 ${loadingStatus ? 'animate-spin text-[#008069]' : ''}`} />
              </button>
            </div>

            {firstLoad ? (
              <div className="grid gap-6 md:grid-cols-2">
                <Skeleton className="h-48 !rounded-2xl" />
                <div className="space-y-3">
                  <Skeleton className="h-10" />
                  <Skeleton className="h-10" />
                  <Skeleton className="h-10" />
                </div>
              </div>
            ) : hasCard && billingDetails?.card ? (
              <div className="grid gap-6 md:grid-cols-2">
                {/* The one bold element on the page */}
                <div className="relative flex min-h-[12rem] flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F1A1F] via-[#14303A] to-[#075E54] p-5 text-white shadow-lg shadow-[#0F1A1F]/20">
                  <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/5" />
                  <div className="relative flex items-center justify-between">
                    <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 ring-1 ring-emerald-400/25">
                      Default
                    </span>
                    <span className="text-sm font-bold capitalize text-white/90">{billingDetails.card.brand || 'Card'}</span>
                  </div>
                  <div className="relative text-lg tracking-[0.2em] text-white/80">
                    •••• •••• ••••{' '}
                    <span className="font-bold tracking-widest text-white">{billingDetails.card.last4 || '••••'}</span>
                  </div>
                  <div className="relative flex items-end justify-between text-xs">
                    <div>
                      <span className="block text-[11px] text-slate-400">Expires</span>
                      <span className="font-semibold tabular-nums">
                        {String(billingDetails.card.expMonth ?? '').padStart(2, '0')}/{billingDetails.card.expYear}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[11px] text-slate-400">Cardholder</span>
                      <span className="block max-w-[9rem] truncate font-semibold">
                        {currentUser?.name || 'Authorized client'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-between gap-5">
                  <dl className="divide-y divide-slate-100 text-sm">
                    <div className="flex items-center justify-between py-3">
                      <dt className="text-slate-500">Next charge</dt>
                      <dd className="font-semibold">{cancelAtPeriodEnd ? 'None' : formattedRenewalDate || 'In 30 days'}</dd>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <dt className="text-slate-500">Amount</dt>
                      <dd className="font-semibold">
                        {billingDetails.billingInterval === 'annual' ? '54,000 LKR / year' : '5,000 LKR / 30 days'}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-3 py-3">
                      <dt className="text-slate-500">Auto-renewal</dt>
                      <dd>
                        {cancelAtPeriodEnd ? (
                          <span className="inline-flex items-center gap-1.5 text-right font-semibold text-amber-700">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            Off, access ends {formattedRenewalDate}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 font-semibold text-[#006B58]">
                            <CheckCircle2 className="h-4 w-4" /> On
                          </span>
                        )}
                      </dd>
                    </div>
                  </dl>

                  <div className="flex flex-col gap-2.5 sm:flex-row">
                    <button
                      type="button"
                      onClick={handleOpenCustomerPortal}
                      disabled={portalLoading}
                      className={`flex-1 rounded-xl bg-[#0F1A1F] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1f2d36] disabled:opacity-60 ${focusRing} inline-flex items-center justify-center gap-2`}
                    >
                      {portalLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          Update card
                          <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                        </>
                      )}
                    </button>

                    {cancelAtPeriodEnd ? (
                      <button
                        type="button"
                        onClick={() => setConfirmAction('resume')}
                        className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 ${focusRing}`}
                      >
                        <RotateCcw className="h-4 w-4" />
                        Turn renewal on
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmAction('cancel')}
                        className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 ring-1 ring-slate-200 transition hover:bg-rose-50 hover:text-rose-700 hover:ring-rose-200 ${focusRing}`}
                      >
                        Cancel plan
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-start gap-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" aria-hidden />
                  <div>
                    <h3 className="text-sm font-bold">No card on file</h3>
                    <p className="mt-0.5 max-w-md text-sm leading-relaxed text-slate-600">
                      Add a debit or credit card. Stripe stores it securely, and you can change it or cancel any time.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleOpenOnSitePayment}
                  disabled={loading || modalLoading}
                  className={`${primaryBtn} shrink-0`}
                >
                  <CreditCard className="h-4 w-4" />
                  Add card
                </button>
              </div>
            )}
          </section>

          {/* ---- Invoices ---- */}
          <section className={`${panel} p-5 sm:p-7`} aria-labelledby="inv-h">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 id="inv-h" className="text-lg font-bold">Invoices</h2>
                <p className="mt-0.5 text-sm text-slate-500">Receipts for every payment.</p>
              </div>
              <button
                type="button"
                onClick={fetchInvoices}
                disabled={loadingInvoices}
                aria-label="Refresh invoices"
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 ${focusRing}`}
              >
                <RefreshCw className={`h-4 w-4 ${loadingInvoices ? 'animate-spin text-[#008069]' : ''}`} />
              </button>
            </div>

            {loadingInvoices && invoices.length === 0 ? (
              <div className="space-y-3">
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
              </div>
            ) : invoices.length === 0 ? (
              <div className="rounded-xl bg-slate-50 px-6 py-10 text-center">
                <FileText className="mx-auto mb-2 h-8 w-8 text-slate-300" aria-hidden />
                <p className="text-sm font-bold text-slate-700">No invoices yet</p>
                <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
                  Your first invoice appears here right after your first payment.
                </p>
              </div>
            ) : (
              <div className="-mx-2">
                <div className="hidden grid-cols-[1.2fr_1fr_1.4fr_1fr_.8fr_auto] gap-3 px-2 pb-2 text-xs font-semibold text-slate-500 md:grid">
                  <span>Invoice</span>
                  <span>Date</span>
                  <span>Plan</span>
                  <span>Amount</span>
                  <span>Status</span>
                  <span className="min-w-[8.5rem] text-right">Download</span>
                </div>
                <ul className="divide-y divide-slate-100 border-t border-slate-100">
                  {invoices.map((inv) => (
                    <li
                      key={inv.id}
                      className="grid grid-cols-2 items-center gap-x-3 gap-y-1 rounded-lg px-2 py-3.5 text-sm transition hover:bg-slate-50 md:grid-cols-[1.2fr_1fr_1.4fr_1fr_.8fr_auto]"
                    >
                      <span className="truncate font-mono font-semibold">{inv.number || inv.id.slice(0, 16)}</span>
                      <span className="text-right text-slate-600 md:text-left">{fmtDate(inv.date, 'short') || '—'}</span>
                      <span className="col-span-2 font-medium text-slate-800 md:col-span-1">{inv.planName}</span>
                      <span className="font-bold tabular-nums">{inv.amountLkr.toLocaleString()} LKR</span>
                      <span className="text-right md:text-left">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize ${
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
                      <span className="col-span-2 flex gap-2 pt-1.5 md:col-span-1 md:min-w-[8.5rem] md:justify-end md:pt-0">
                        {inv.invoicePdf && (
                          <a
                            href={inv.invoicePdf}
                            target="_blank"
                            rel="noreferrer"
                            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-white ${focusRing}`}
                          >
                            <Download className="h-3.5 w-3.5 text-[#008069]" />
                            PDF
                          </a>
                        )}
                        {inv.hostedInvoiceUrl && (
                          <a
                            href={inv.hostedInvoiceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-[#006B58] ring-1 ring-emerald-200 transition hover:bg-emerald-50 ${focusRing}`}
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
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
        </div>

        {/* ============ SIDE: summary ============ */}
        <aside className="space-y-5 lg:sticky lg:top-6">
          <div className={`${panel} p-6`}>
            <h2 className="text-sm font-bold">Order summary</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Plan</dt>
                <dd className="text-right font-medium">Pro, {isAnnual ? 'annual' : 'monthly'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Renews</dt>
                <dd className="text-right font-medium">{price.cadence}</dd>
              </div>
              {isAnnual && (
                <div className="flex justify-between gap-3 text-emerald-700">
                  <dt>You save</dt>
                  <dd className="font-semibold">6,000 LKR</dd>
                </div>
              )}
            </dl>
            <div className="mt-4 flex items-baseline justify-between border-t border-slate-100 pt-4">
              <span className="text-sm font-semibold">Due today</span>
              <span key={billingInterval} className="price-in text-2xl font-extrabold tabular-nums">
                {amountLabel}
              </span>
            </div>

            <button
              type="button"
              onClick={handleOpenOnSitePayment}
              disabled={loading || modalLoading}
              className={`${primaryBtn} mt-5 w-full py-3.5`}
            >
              {modalLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  {isActive && hasCard ? 'Update card or switch plan' : `Pay ${amountLabel}`}
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePayWithStripe}
              disabled={loading}
              className={`mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-800 disabled:opacity-60 ${focusRing}`}
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ExternalLink className="h-3.5 w-3.5" />}
              Use Stripe’s checkout page instead
            </button>

            <p className="mt-4 flex items-start gap-2 border-t border-slate-100 pt-4 text-xs leading-relaxed text-slate-500">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
              Payments are handled by Stripe. Your card details never reach our servers.
            </p>
          </div>

          <div className={`${panel} p-5`}>
            <h3 className="text-sm font-bold">Workspace</h3>
            <div className="mt-3 space-y-0.5">
              <div className="text-sm font-semibold">{selectedTenant?.name || 'Your business workspace'}</div>
              <div className="text-xs text-slate-500">ID: {selectedTenant?.id || 'tenant_zevarone'}</div>
              <div className="text-xs text-slate-500">
                WhatsApp: +{selectedTenant?.whatsappNumber || '94771234567'}
              </div>
            </div>
            <Link
              href="/settings"
              className={`group mt-4 inline-flex items-center gap-1 rounded text-sm font-semibold text-[#006B58] hover:underline ${focusRing}`}
            >
              Set up WhatsApp API credentials
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </aside>
      </div>

      {/* ---------------- Payment modal ---------------- */}
      {showPaymentModal && (
        <div
          className="fade-in fixed inset-0 z-50 flex items-end justify-center bg-slate-950/55 backdrop-blur-sm sm:items-center sm:p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !processingPayment) setShowPaymentModal(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Secure card payment"
            className="modal-in max-h-[95vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
          >
            <div className="flex items-center justify-between px-6 pb-2 pt-5">
              <div>
                <h3 className="text-lg font-bold">Pay securely</h3>
                <p className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Lock className="h-3 w-3" /> Encrypted and processed by Stripe
                </p>
              </div>
              <button
                type="button"
                onClick={() => !processingPayment && setShowPaymentModal(false)}
                disabled={processingPayment}
                aria-label="Close"
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 ${focusRing}`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmOnSitePayment} className="space-y-5 px-6 pb-6 pt-3">
              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
                <div className="text-sm">
                  <div className="font-semibold">Pro, {isAnnual ? 'annual' : 'monthly'}</div>
                  <div className="text-xs text-slate-500">Renews {price.cadence}</div>
                </div>
                <div className="text-xl font-extrabold tabular-nums text-[#006B58]">{amountLabel}</div>
              </div>

              <div>
                <label htmlFor="cardholder" className="mb-1.5 block text-sm font-medium text-slate-700">
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
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#008069] focus:bg-white focus:ring-4 focus:ring-[#008069]/10"
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">Card details</label>
                  <span className="text-xs text-slate-400">Visa, Mastercard, Amex</span>
                </div>
                <div className="relative">
                  <div
                    id="card-element"
                    className="min-h-[48px] rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 transition focus-within:border-[#008069] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#008069]/10"
                  />
                  {modalLoading && (
                    <div className="skeleton absolute inset-0 flex items-center justify-center gap-2 rounded-xl text-xs text-slate-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Preparing secure form…
                    </div>
                  )}
                </div>
              </div>

              {cardError && (
                <div role="alert" className="fade-in flex items-start gap-2.5 rounded-xl bg-rose-50 p-3.5 text-sm text-rose-700 ring-1 ring-rose-200">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span className="leading-snug">{cardError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={processingPayment || modalLoading}
                className={`${primaryBtn} w-full py-3.5`}
              >
                {processingPayment ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing…
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    Pay {amountLabel}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                disabled={processingPayment}
                className={`w-full rounded-lg py-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-800 ${focusRing}`}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- Confirm cancel / resume ---------------- */}
      {confirmAction && (
        <div
          className="fade-in fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !cancelLoading) setConfirmAction(null);
          }}
        >
          <div role="alertdialog" aria-modal="true" className="modal-in w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                confirmAction === 'cancel' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-[#008069]'
              }`}
            >
              {confirmAction === 'cancel' ? <XCircle className="h-6 w-6" /> : <RotateCcw className="h-6 w-6" />}
            </div>
            <h3 className="mt-4 text-lg font-bold">
              {confirmAction === 'cancel' ? 'Stop automatic renewal?' : 'Turn renewal back on?'}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
              {confirmAction === 'cancel'
                ? `You’ll keep full Pro access until the end of your paid period${
                    formattedRenewalDate ? ` (${formattedRenewalDate})` : ''
                  }. After that, your card won’t be charged again.`
                : 'Your saved card will be charged automatically again at the next renewal date.'}
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
                            ? 'bg-emerald-50/70 border-[#008069] text-slate-900 font-semibold shadow-xs'
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
                    How could we have made your experience better? (Optional)
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

            <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                disabled={cancelLoading}
                className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 ${focusRing}`}
              >
                {confirmAction === 'cancel' ? 'Keep my plan' : 'Not now'}
              </button>
              <button
                type="button"
                onClick={() => handleToggleCancel(confirmAction)}
                disabled={cancelLoading}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition disabled:opacity-60 ${focusRing} ${
                  confirmAction === 'cancel' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-[#008069] hover:bg-[#075E54]'
                }`}
              >
                {cancelLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {confirmAction === 'cancel' ? 'Stop renewal' : 'Turn on renewal'}
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
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#008069]" />
        </div>
      }
    >
      <BillingContent />
    </Suspense>
  );
}