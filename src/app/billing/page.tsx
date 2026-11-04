'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { loadStripe, Stripe, StripeCardElement } from '@stripe/stripe-js';
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
  Clock,
  RotateCcw,
  XCircle,
  FileText,
  Download,
  Lock,
  Receipt,
} from 'lucide-react';

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

  const [billingDetails, setBillingDetails] = useState<{
    card?: { brand?: string; last4?: string; expMonth?: number; expYear?: number } | null;
    subscription?: { id?: string; status?: string; cancelAtPeriodEnd?: boolean; currentPeriodEnd?: string } | null;
    subscriptionExpiresAt?: string;
    cancelAtPeriodEnd?: boolean;
    billingInterval?: 'monthly' | 'annual';
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
                fontSize: '15px',
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

  const handleToggleCancel = async (action: 'cancel' | 'resume') => {
    const confirmMsg =
      action === 'cancel'
        ? 'Are you sure you want to stop automatic card renewal? You will retain Pro CRM access until the end of your paid billing cycle.'
        : 'Reactivate auto-renewal on your saved card?';

    if (!confirm(confirmMsg)) return;

    setCancelLoading(true);
    try {
      const res = await fetch('/api/stripe/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
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
    }
  };

  const isActive = currentUser ? currentUser.subscriptionStatus === 'active' : true;
  const isAnnual = billingInterval === 'annual';
  const hasCard = Boolean(billingDetails?.card);
  const cancelAtPeriodEnd = Boolean(billingDetails?.cancelAtPeriodEnd);
  const renewalDate = billingDetails?.subscription?.currentPeriodEnd || billingDetails?.subscriptionExpiresAt || currentUser?.subscriptionExpiresAt;

  const formattedRenewalDate = renewalDate
    ? new Date(renewalDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 font-sans text-slate-900">
      {/* Top Banner / Verification status */}
      {verifying && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin shrink-0 text-blue-600" />
          <div className="text-sm">
            <span className="font-semibold">Verifying your Stripe card setup...</span>
            <p className="text-xs text-blue-700 mt-0.5">
              Saving your payment card and activating your 30-day recurring subscription.
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
            <h1 className="text-2xl font-bold text-slate-900">Billing & Payment Card</h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide ${
                isActive
                  ? cancelAtPeriodEnd
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : 'bg-emerald-50 text-[#008069] border border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
            >
              {isActive
                ? cancelAtPeriodEnd
                  ? '● CANCELLING AT PERIOD END'
                  : '● RECURRING AUTO-RENEWAL ACTIVE'
                : '○ PAYMENT REQUIRED'}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Manage your saved payment card, 30-day recurring charges, and subscription renewals.
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

      {/* ==================== SECTION: SAVED PAYMENT CARD & RECURRING BILLING ==================== */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#008069]" />
              Saved Payment Card &amp; Recurring Renewal
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Your card is automatically billed every 30 days so your WhatsApp AI CRM operates continuously without interruption.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchBillingStatus}
            disabled={loadingStatus}
            className="self-start sm:self-auto px-3 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs text-slate-600 flex items-center gap-1.5 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingStatus ? 'animate-spin' : ''}`} />
            Refresh Card Status
          </button>
        </div>

        {/* Card on file state */}
        {hasCard && billingDetails?.card ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Visual Credit Card Preview */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#111B21] via-[#1a2831] to-[#075E54] text-white space-y-4 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <CreditCard className="w-32 h-32" />
              </div>
              <div className="flex items-center justify-between relative z-10">
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Card on File
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-white/90">
                  {billingDetails.card.brand || 'CARD'}
                </span>
              </div>

              <div className="py-2 relative z-10">
                <div className="text-sm text-slate-400 tracking-widest font-mono">
                  •••• •••• ••••{' '}
                  <span className="text-lg font-bold text-white tracking-normal">
                    {billingDetails.card.last4 || '••••'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-300 relative z-10 pt-2 border-t border-white/10">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 block leading-tight">
                    Expires
                  </span>
                  <span className="font-semibold text-white">
                    {billingDetails.card.expMonth}/{billingDetails.card.expYear}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 block leading-tight">
                    Cardholder
                  </span>
                  <span className="font-semibold text-white truncate max-w-[150px] block">
                    {currentUser?.name || 'Authorized Client'}
                  </span>
                </div>
              </div>
            </div>

            {/* Auto-renewal and Card Management Details */}
            <div className="flex flex-col justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    Next Auto-Charge Date:
                  </span>
                  <span className="font-bold text-slate-900">
                    {formattedRenewalDate || 'In 30 Days'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-slate-400" />
                    Auto-Renewal Amount:
                  </span>
                  <span className="font-bold text-emerald-700">
                    {billingDetails.billingInterval === 'annual' ? '54,000 LKR (Annual)' : '5,000 LKR (Monthly)'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500">Auto-Renewal Status:</span>
                  {cancelAtPeriodEnd ? (
                    <span className="text-amber-700 font-bold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      Will not renew (Expires {formattedRenewalDate})
                    </span>
                  ) : (
                    <span className="text-[#008069] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00A884]" />
                      Active (Card automatically charged)
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons for Card & Subscription */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleOpenCustomerPortal}
                  disabled={portalLoading}
                  className="w-full sm:w-auto px-4 py-2.5 bg-[#111B21] hover:bg-[#1f2d36] text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-xs"
                >
                  {portalLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                      Change / Update Payment Card
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </>
                  )}
                </button>

                {cancelAtPeriodEnd ? (
                  <button
                    type="button"
                    onClick={() => handleToggleCancel('resume')}
                    disabled={cancelLoading}
                    className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    {cancelLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reactivate Auto-Renewal
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleToggleCancel('cancel')}
                    disabled={cancelLoading}
                    className="w-full sm:w-auto px-3.5 py-2.5 border border-rose-300 hover:bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5"
                  >
                    {cancelLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5" />
                        Cancel Subscription
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* No Card on File Yet */
          <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                <CreditCard className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">No Payment Card Saved Yet</h3>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  Subscribe below using your debit or credit card. Stripe will securely save your card on file and automatically charge 5,000 LKR every 30 days to keep your WhatsApp CRM active. You can change your card or cancel at any time.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenOnSitePayment}
              disabled={loading || modalLoading}
              className="px-5 py-2.5 bg-[#008069] hover:bg-[#075E54] text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shrink-0 shadow-sm"
            >
              <CreditCard className="w-4 h-4" />
              Add Card &amp; Pay {isAnnual ? '54,000' : '5,000'} LKR On-Site
            </button>
          </div>
        )}
      </div>

      {/* ==================== SECTION: BILLING CYCLE SELECTOR & PRICING TIER ==================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
        <div>
          <span className="text-xs font-bold text-slate-900 block">Choose Billing Frequency</span>
          <span className="text-[11px] text-slate-500">
            Pay monthly (5,000 LKR every 30 days) or choose annual to save 6,000 LKR (4,500 LKR/month).
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
            Monthly (5,000 LKR / 30 days)
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
                  WhatsApp CRM &amp; Zevarone AI Pro
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Complete omnichannel customer engagement platform for businesses in Sri Lanka &amp; worldwide.
                </p>
              </div>

              <div className="text-right">
                <div className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                  {isAnnual ? '4,500' : '5,000'}{' '}
                  <span className="text-sm font-semibold text-slate-500">LKR</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {isAnnual
                    ? 'per month (billed 54,000 LKR / year)'
                    : 'billed every 30 days automatically'}
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
                    title: 'Zevarone Neural AI Sales Agent',
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
                    Subscription active ({billingDetails?.billingInterval === 'annual' ? 'Annual Tier' : 'Monthly Tier'}).
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-amber-700 font-medium">
                    <AlertCircle className="w-4 h-4" />
                    Enter card details on Stripe to activate CRM features.
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleOpenOnSitePayment}
                  disabled={loading || modalLoading}
                  className="w-full sm:w-auto px-6 py-3 bg-[#008069] hover:bg-[#075E54] text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {modalLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      {isActive && hasCard
                        ? 'Update Card / Switch Plan'
                        : isAnnual
                        ? 'Pay 54,000 LKR On-Site'
                        : 'Pay 5,000 LKR On-Site'}
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handlePayWithStripe}
                  disabled={loading}
                  title="Pay using Stripe hosted checkout"
                  className="w-full sm:w-auto px-4 py-3 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  Stripe Checkout Page
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
              Stripe 30-Day Recurring Logic
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              When you subscribe, your card is securely tokenized via Stripe and automatically charged every 30 days. You can update your payment method or cancel anytime directly from this page.
            </p>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>First Payment:</span>
                <span className="font-semibold text-slate-900">Charged Immediately</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Subsequent Charges:</span>
                <span className="font-semibold text-slate-900">Every 30 Days (Auto)</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>On-Site Card Entry:</span>
                <span className="font-semibold text-emerald-700">100% On-Page (No Redirect)</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Cancellation:</span>
                <span className="font-semibold text-slate-900">1-Click (Keeps 30 Days)</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Currency:</span>
                <span className="font-semibold text-slate-900">LKR (Sri Lankan Rupee)</span>
              </div>
            </div>

            {hasCard && (
              <button
                type="button"
                onClick={handleOpenCustomerPortal}
                className="w-full text-center text-xs text-[#008069] hover:underline font-semibold flex items-center justify-center gap-1 pt-1"
              >
                <FileText className="w-3.5 h-3.5" />
                Manage Card on Stripe Customer Portal
              </button>
            )}
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

      {/* ==================== SECTION: PAYMENT HISTORY & TAX INVOICES ==================== */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#008069] flex items-center justify-center shrink-0 border border-emerald-100">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Payment History &amp; Official Invoices</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Download tax invoice receipts and view real-time payment audit trails processed via Stripe.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchInvoices}
            disabled={loadingInvoices}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingInvoices ? 'animate-spin text-[#008069]' : ''}`} />
            Refresh History
          </button>
        </div>

        {loadingInvoices ? (
          <div className="p-8 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-[#008069]" />
            Loading invoices from Stripe ledger...
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">No Invoices Found Yet</p>
            <p className="text-[11px] text-slate-500 mt-1 max-w-md mx-auto">
              Once your first monthly or annual subscription fee is processed, your official PDF invoices and payment receipts will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50/70">
                  <th className="py-3 px-4 rounded-l-lg">Invoice #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right rounded-r-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                      {inv.number || inv.id.slice(0, 16)}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {inv.date ? new Date(inv.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-800 font-medium">
                      {inv.planName}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {inv.amountLkr.toLocaleString()} LKR
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          inv.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : inv.status === 'open'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      {inv.invoicePdf && (
                        <a
                          href={inv.invoicePdf}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-semibold transition shadow-2xs"
                          title="Download official PDF receipt"
                        >
                          <Download className="w-3 h-3 text-[#008069]" />
                          PDF
                        </a>
                      )}
                      {inv.hostedInvoiceUrl && (
                        <a
                          href={inv.hostedInvoiceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#008069] hover:bg-[#075E54] text-white rounded-lg text-[11px] font-semibold transition shadow-2xs"
                          title="View receipt on Stripe"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View Receipt
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ==================== ON-SITE EMBEDDED PAYMENT MODAL ==================== */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-[#111B21] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#00A884] flex items-center justify-center font-bold">
                  <CreditCard className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Secure On-Site Card Payment</h3>
                  <p className="text-[11px] text-[#8696A0]">256-bit SSL encrypted &bull; Powered by Stripe</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!processingPayment) setShowPaymentModal(false);
                }}
                disabled={processingPayment}
                className="text-[#8696A0] hover:text-white text-lg font-bold p-1 transition"
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleConfirmOnSitePayment} className="p-6 space-y-4">
              {/* Order Summary Box */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Selected Subscription:</span>
                  <span className="font-bold text-slate-900">
                    {billingInterval === 'annual' ? 'WhatsApp CRM Pro (Annual Tier)' : 'WhatsApp CRM Pro (Monthly Tier)'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Recurring Billing Cycle:</span>
                  <span className="font-semibold text-emerald-700">
                    {billingInterval === 'annual' ? 'Charged 54,000 LKR every 365 days' : 'Charged 5,000 LKR every 30 days'}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                  <span className="font-bold text-slate-900">Amount Due Today:</span>
                  <span className="text-lg font-extrabold text-[#008069]">
                    {billingInterval === 'annual' ? '54,000 LKR' : '5,000 LKR'}
                  </span>
                </div>
              </div>

              {/* Cardholder Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cardholder Full Name
                </label>
                <input
                  type="text"
                  required
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  placeholder="e.g. Nipuna Dasun"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#008069] focus:bg-white transition"
                />
              </div>

              {/* Stripe Card Element Container */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Debit or Credit Card
                  </label>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold">
                    <span>Visa</span> &bull; <span>Mastercard</span> &bull; <span>Amex</span>
                  </div>
                </div>

                <div
                  id="card-element"
                  className="p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 min-h-[44px] transition focus-within:ring-2 focus-within:ring-[#008069] focus-within:bg-white"
                />
              </div>

              {/* Card Error Display */}
              {cardError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-snug">{cardError}</span>
                </div>
              )}

              {/* Security Footnote */}
              <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
                <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  Your raw card details never touch our servers. Tokenized directly by Stripe with PCI-DSS Level 1 compliance.
                </span>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  disabled={processingPayment}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processingPayment}
                  className="px-6 py-2.5 bg-[#008069] hover:bg-[#075E54] text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {processingPayment ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Authorizing with Stripe...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-3.5 h-3.5" />
                      Confirm &amp; Pay {billingInterval === 'annual' ? '54,000 LKR' : '5,000 LKR'}
                    </>
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
