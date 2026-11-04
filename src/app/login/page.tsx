'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  ShieldCheck,
  Building2,
  Mail,
  Lock,
  User,
  Phone,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { notify, refreshData } = useApp();

  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sign In Form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form
  const [regName, setRegName] = useState('');
  const [regBusinessName, setRegBusinessName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to sign in. Please verify your credentials.');
      }

      notify({
        type: 'success',
        title: 'Welcome Back!',
        message: `Signed in as ${data.user.name} (${data.user.businessName}).`,
      });

      await refreshData();

      if (data.user.subscriptionStatus === 'active') {
        router.push('/inbox');
      } else {
        router.push('/billing');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error signing in');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          businessName: regBusinessName,
          email: regEmail,
          phoneNumber: regPhone,
          password: regPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Registration failed.');
      }

      notify({
        type: 'success',
        title: 'Account Created Successfully!',
        message: 'Your dedicated WhatsApp CRM tenant has been provisioned. Please complete your subscription.',
      });

      await refreshData();
      router.push('/billing');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error creating account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col justify-between text-[#111B21]">
      {/* Top Header */}
      <header className="border-b border-[#E9EDEF] bg-white px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#008069] flex items-center justify-center text-white font-bold text-lg shadow-sm">
            W
          </div>
          <div>
            <h1 className="text-base font-bold text-[#111B21] flex items-center gap-2">
              WhatsApp CRM &amp; Gemini AI Hub
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#E8F5E9] text-[#008069]">
                Enterprise
              </span>
            </h1>
            <p className="text-xs text-[#54656F]">Official Meta Cloud API Platform</p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="text-xs px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition font-medium"
          >
            &larr; Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white border border-[#E9EDEF] rounded-2xl shadow-sm overflow-hidden">
          {/* WhatsApp Brand Banner */}
          <div className="bg-[#111B21] px-6 py-6 text-white border-b border-[#202C33]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#00A884]">
                ZEVARONE CLOUD CRM
              </span>
          
            </div>
            <h2 className="text-xl font-bold">
              {mode === 'signin' ? 'Sign in to your CRM workspace' : 'Launch your WhatsApp Business CRM'}
            </h2>
            <p className="text-xs text-[#8696A0] mt-1">
              Manage your customer chats, Gemini AI auto-replies, product catalog, and automated media.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex border-b border-[#E9EDEF] bg-[#F0F2F5]">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMsg('');
              }}
              className={`flex-1 py-3 text-xs font-semibold transition ${
                mode === 'signin'
                  ? 'bg-white text-[#008069] border-b-2 border-[#008069]'
                  : 'text-[#54656F] hover:text-[#111B21]'
              }`}
            >
              Sign In to Existing CRM
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg('');
              }}
              className={`flex-1 py-3 text-xs font-semibold transition ${
                mode === 'register'
                  ? 'bg-white text-[#008069] border-b-2 border-[#008069]'
                  : 'text-[#54656F] hover:text-[#111B21]'
              }`}
            >
              Create New Business Account
            </button>
          </div>

          <div className="p-6">
            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {mode === 'signin' ? (
              /* Sign In Form */
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#54656F] mb-1">Business Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#8696A0] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#E9EDEF] rounded-lg text-[#111B21] focus:outline-none focus:border-[#008069]"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-[#54656F]">Password</label>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#8696A0] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#E9EDEF] rounded-lg text-[#111B21] focus:outline-none focus:border-[#008069]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-2.5 px-4 bg-[#008069] hover:bg-[#075E54] text-white font-semibold text-sm rounded-lg transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Sign In to Workspace
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Register Form */
              <form onSubmit={handleRegister} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-[#54656F] mb-1">Your Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#8696A0] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Priyantha Silva"
                      className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#E9EDEF] rounded-lg text-[#111B21] focus:outline-none focus:border-[#008069]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#54656F] mb-1">Company / Brand Name</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-[#8696A0] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={regBusinessName}
                      onChange={(e) => setRegBusinessName(e.target.value)}
                      placeholder="e.g. Royal Gems & Jewelry"
                      className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#E9EDEF] rounded-lg text-[#111B21] focus:outline-none focus:border-[#008069]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-[#54656F] mb-1">Work Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#8696A0] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#E9EDEF] rounded-lg text-[#111B21] focus:outline-none focus:border-[#008069]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#54656F] mb-1">WhatsApp Phone</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#8696A0] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="94771234567"
                        className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#E9EDEF] rounded-lg text-[#111B21] focus:outline-none focus:border-[#008069]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#54656F] mb-1">Choose Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#8696A0] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#E9EDEF] rounded-lg text-[#111B21] focus:outline-none focus:border-[#008069]"
                    />
                  </div>
                </div>

                {/* Plan Notice */}
                <div className="p-3 bg-[#F0F2F5] rounded-xl border border-[#E9EDEF] text-xs text-[#54656F] space-y-1.5">
                  <div className="flex items-center justify-between font-semibold text-[#111B21]">
                    <span>Pro Subscription Plan</span>
                    <span className="text-[#008069]">5,000 LKR / month</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    After registration, you will be redirected to the Stripe gateway to activate your isolated inbox and Gemini AI concierge.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-2.5 px-4 bg-[#008069] hover:bg-[#075E54] text-white font-semibold text-sm rounded-lg transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Create Business & Subscribe
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Navigation back to landing page */}
            <div className="mt-6 pt-4 border-t border-[#E9EDEF] text-center">
              <Link
                href="/"
                className="text-xs text-[#54656F] hover:text-[#008069] transition font-medium"
              >
                ← Back to ZEVARONE Home &amp; Pricing
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Powered by ZEVARONE Footer */}
      <footer className="border-t border-[#E9EDEF] bg-white py-4 px-6 text-center text-xs text-[#8696A0] flex flex-col sm:flex-row items-center justify-between gap-3">
        <span>© 2026 WhatsApp Business CRM & Gemini AI Hub. All rights reserved.</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold tracking-widest text-[#54656F] uppercase">POWERED BY</span>
          <div className="bg-[#111B21] px-2.5 py-1 rounded shadow-sm flex items-center">
            <Image
              src="/newlogos/Asset 13.svg"
              alt="ZEVARONE"
              width={76}
              height={14}
              className="h-3.5 w-auto object-contain"
              priority
            />
          </div>
        </div>
      </footer>
    </div>
  );
}
