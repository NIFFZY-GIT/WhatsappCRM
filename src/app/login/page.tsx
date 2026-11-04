'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import Navbar from '@/components/Navbar';
import {
  Building2,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Sparkles,
  Check,
  CheckCheck,
  ArrowLeft,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Animated chat demo (left panel) - shows what the product does      */
/* ------------------------------------------------------------------ */

type Bubble = { from: 'customer' | 'ai'; text: string };

const CHAT: Bubble[] = [
  { from: 'customer', text: 'Hi! Do you have the blue sapphire ring in stock?' },
  { from: 'ai', text: 'Yes, 2 left in 18k gold. LKR 185,000. Want photos?' },
  { from: 'customer', text: 'Yes please 🙏' },
  { from: 'ai', text: 'Sent! I can also hold one for you until tomorrow.' },
];

function ChatDemo() {
  // step N = N bubbles visible; odd steps before an AI reply show typing dots
  const [step, setStep] = useState(0);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const wait = (ms: number) =>
      new Promise<void>((res) => timers.push(setTimeout(res, ms)));

    (async () => {
      while (!cancelled) {
        setStep(0);
        setTyping(false);
        await wait(900);
        for (let i = 0; i < CHAT.length; i++) {
          if (cancelled) return;
          if (CHAT[i].from === 'ai') {
            setTyping(true);
            await wait(1300);
            setTyping(false);
          }
          setStep(i + 1);
          await wait(1100);
        }
        await wait(3200);
      }
    })();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* phone frame */}
      <div className="rounded-[2rem] border border-white/10 bg-[#0B141A] shadow-2xl shadow-black/40 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 bg-[#202C33]">
          <div className="h-9 w-9 rounded-full bg-[#00A884] flex items-center justify-center text-white text-sm font-bold">
            R
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-white">Royal Gems &amp; Jewelry</p>
            <p className="text-[11px] text-[#00A884]">
              {typing ? 'AI is typing…' : 'online'}
            </p>
          </div>
        </div>

        <div className="h-[330px] px-3 py-4 space-y-2.5 flex flex-col justify-end chat-bg">
          {CHAT.slice(0, step).map((b, i) => (
            <div
              key={i}
              className={`flex ${b.from === 'ai' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`bubble-in max-w-[82%] px-3 py-2 rounded-2xl text-[13px] leading-snug text-[#E9EDEF] ${
                  b.from === 'ai'
                    ? 'bg-[#005C4B] rounded-tr-sm'
                    : 'bg-[#202C33] rounded-tl-sm'
                }`}
              >
                {b.from === 'ai' && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-[#7FE3C8] mb-0.5">
                    <Sparkles className="w-3 h-3" /> Gemini AI
                  </span>
                )}
                {b.text}
                {b.from === 'ai' && (
                  <CheckCheck className="inline w-3.5 h-3.5 ml-1.5 -mb-0.5 text-[#53BDEB]" />
                )}
              </div>
            </div>
          ))}

          {typing && (
            <div className="flex justify-end">
              <div className="bubble-in bg-[#005C4B] rounded-2xl rounded-tr-sm px-3.5 py-2.5 flex gap-1">
                <span className="dot" />
                <span className="dot" style={{ animationDelay: '0.15s' }} />
                <span className="dot" style={{ animationDelay: '0.3s' }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Reusable field                                                     */
/* ------------------------------------------------------------------ */

function Field({
  label,
  icon: Icon,
  right,
  hint,
  ...props
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  right?: React.ReactNode;
  hint?: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label
        htmlFor={props.id}
        className="block text-[13px] font-medium text-[#3B4A54] mb-1.5"
      >
        {label}
      </label>
      <div className="group relative">
        <Icon className="w-[18px] h-[18px] text-[#8696A0] absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-[#008069]" />
        <input
          {...props}
          className="w-full h-12 pl-11 pr-11 text-[15px] bg-[#F7F8FA] border border-[#E1E6EA] rounded-xl text-[#111B21] placeholder:text-[#A0ACB4] outline-none transition-all focus:bg-white focus:border-[#008069] focus:ring-4 focus:ring-[#008069]/10"
        />
        {right && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">{right}</div>
        )}
      </div>
      {hint}
    </div>
  );
}

function strengthOf(pw: string) {
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function LoginPage() {
  const router = useRouter();
  const { notify, refreshData } = useApp();

  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [errorKey, setErrorKey] = useState(0);
  const [showPw, setShowPw] = useState(false);

  // Sign In Form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form
  const [regName, setRegName] = useState('');
  const [regBusinessName, setRegBusinessName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const strength = useMemo(() => strengthOf(regPassword), [regPassword]);
  const strengthLabel = ['Too short', 'Weak', 'Okay', 'Good', 'Strong'][
    regPassword ? strength : 0
  ];
  const strengthColor = ['#E1E6EA', '#EF4444', '#F59E0B', '#22C55E', '#008069'][
    regPassword ? strength : 0
  ];

  const fail = (msg: string) => {
    setErrorMsg(msg);
    setErrorKey((k) => k + 1); // retrigger shake animation
  };

  const switchMode = (m: 'signin' | 'register') => {
    setMode(m);
    setErrorMsg('');
    setShowPw(false);
  };

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
      fail(err.message || 'Error signing in');
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
        message:
          'Your dedicated WhatsApp CRM tenant has been provisioned. Please complete your subscription.',
      });

      await refreshData();
      router.push('/billing');
    } catch (err: any) {
      fail(err.message || 'Error creating account');
    } finally {
      setLoading(false);
    }
  };

  const eyeToggle = (
    <button
      type="button"
      onClick={() => setShowPw((v) => !v)}
      aria-label={showPw ? 'Hide password' : 'Show password'}
      className="h-9 w-9 rounded-lg flex items-center justify-center text-[#8696A0] hover:text-[#008069] hover:bg-[#008069]/5 transition"
    >
      {showPw ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
    </button>
  );

  const submitBtn = (label: string) => (
    <button
      type="submit"
      disabled={loading}
      className="group relative w-full h-12 mt-1 overflow-hidden rounded-xl bg-[#008069] text-white text-[15px] font-semibold shadow-lg shadow-[#008069]/25 transition-all hover:bg-[#006F5B] hover:shadow-xl hover:shadow-[#008069]/30 active:scale-[0.985] disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <span className="shine" aria-hidden />
      <span className="relative flex items-center justify-center gap-2">
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Please wait…
          </>
        ) : (
          <>
            {label}
            <ArrowRight className="w-[18px] h-[18px] transition-transform group-hover:translate-x-1" />
          </>
        )}
      </span>
    </button>
  );

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-[#111B21]">
      <style>{`
        @keyframes bubbleIn { from { opacity:0; transform: translateY(10px) scale(.96);} to { opacity:1; transform:none;} }
        @keyframes dot { 0%,60%,100% { transform: translateY(0); opacity:.4;} 30% { transform: translateY(-4px); opacity:1;} }
        @keyframes floatA { 0%,100% { transform: translate(0,0);} 50% { transform: translate(24px,-30px);} }
        @keyframes floatB { 0%,100% { transform: translate(0,0);} 50% { transform: translate(-30px,24px);} }
        @keyframes formIn { from { opacity:0; transform: translateY(14px);} to { opacity:1; transform:none;} }
        @keyframes shake { 10%,90% { transform: translateX(-1px);} 20%,80% { transform: translateX(3px);} 30%,50%,70% { transform: translateX(-6px);} 40%,60% { transform: translateX(6px);} }
        @keyframes shine { from { transform: translateX(-120%) skewX(-20deg);} to { transform: translateX(260%) skewX(-20deg);} }
        @keyframes pageIn { from { opacity:0; } to { opacity:1; } }

        .bubble-in { animation: bubbleIn .35s cubic-bezier(.2,.8,.2,1) both; }
        .dot { width:6px; height:6px; border-radius:9999px; background:#B7E4D8; animation: dot 1s infinite ease-in-out; }
        .orb-a { animation: floatA 14s ease-in-out infinite; }
        .orb-b { animation: floatB 18s ease-in-out infinite; }
        .form-in { animation: formIn .45s cubic-bezier(.2,.8,.2,1) both; }
        .shake { animation: shake .5s both; }
        .page-in { animation: pageIn .6s ease both; }
        .shine { position:absolute; inset:0; width:40%; background:linear-gradient(90deg,transparent,rgba(255,255,255,.28),transparent); transform: translateX(-120%) skewX(-20deg); }
        button:hover > .shine { animation: shine .9s ease; }
        .chat-bg {
          background-color:#0B141A;
          background-image: radial-gradient(rgba(255,255,255,.035) 1px, transparent 1px);
          background-size: 18px 18px;
        }
        @media (prefers-reduced-motion: reduce) {
          .bubble-in,.dot,.orb-a,.orb-b,.form-in,.shake,.page-in,.shine { animation: none !important; }
        }
      `}</style>

      {/* Top Navbar: Always shown even on login page */}
      <Navbar showLinks={true} />

      <div className="flex-1 grid lg:grid-cols-[1.05fr_1fr] bg-white">
        {/* ------------------------- Left: brand panel ------------------------- */}
        <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-[#0B141A] px-12 py-12 text-white">
          <div className="orb-a absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[#00A884]/25 blur-3xl" />
          <div className="orb-b absolute -bottom-32 -right-20 h-[28rem] w-[28rem] rounded-full bg-[#25D366]/15 blur-3xl" />

          <div className="relative page-in my-auto">
            <ChatDemo />
            <div className="mt-8 max-w-md mx-auto text-center">
              <h2 className="text-2xl font-bold leading-snug">
                Answer every customer, even while you sleep.
              </h2>
              <p className="mt-2 text-sm text-[#8696A0] leading-relaxed">
                Gemini AI replies from your product catalog, and every chat stays in one shared inbox.
              </p>
            </div>
          </div>

          <div className="relative flex items-center justify-center gap-2 text-[11px] text-[#8696A0]">
            <span>Official Meta Cloud API platform</span>
            <span className="h-1 w-1 rounded-full bg-[#8696A0]/60" />
            <span>Powered by</span>
            <div className="bg-white/10 px-2.5 py-1 rounded-md">
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
        </aside>

        {/* ------------------------- Right: form panel ------------------------- */}
        <main className="relative flex flex-col justify-center bg-white px-6 sm:px-12 py-12">
          <div className="w-full max-w-[420px] mx-auto">
            <div className="mb-7">
              <h1 className="text-[28px] font-bold tracking-tight">
                {mode === 'signin' ? 'Welcome back' : 'Create your workspace'}
              </h1>
              <p className="mt-1.5 text-[15px] text-[#54656F]">
                {mode === 'signin'
                  ? 'Sign in to your inbox, AI replies and product catalog.'
                  : 'Set up your WhatsApp CRM in under a minute.'}
              </p>
            </div>

            {/* Segmented switch with sliding pill */}
            <div
              role="tablist"
              className="relative grid grid-cols-2 p-1 mb-6 rounded-xl bg-[#F0F2F5]"
            >
              <span
                aria-hidden
                className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-lg bg-white shadow-sm transition-transform duration-300 ease-[cubic-bezier(.2,.8,.2,1)]"
                style={{ transform: mode === 'signin' ? 'translateX(0)' : 'translateX(100%)' }}
              />
              {(
                [
                  ['signin', 'Sign in'],
                  ['register', 'Create account'],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  role="tab"
                  type="button"
                  aria-selected={mode === key}
                  onClick={() => switchMode(key)}
                  className={`relative z-10 h-10 text-sm font-semibold rounded-lg transition-colors ${
                    mode === key ? 'text-[#008069]' : 'text-[#54656F] hover:text-[#111B21]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {errorMsg && (
              <div
                key={errorKey}
                role="alert"
                className="shake mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-start gap-2.5"
              >
                <AlertCircle className="w-[18px] h-[18px] shrink-0 mt-px" />
                <span>{errorMsg}</span>
              </div>
            )}

            {mode === 'signin' ? (
              <form key="signin" onSubmit={handleSignIn} className="form-in space-y-4">
                <Field
                  id="login-email"
                  label="Business email"
                  icon={Mail}
                  type="email"
                  required
                  autoComplete="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="you@company.com"
                />
                <Field
                  id="login-password"
                  label="Password"
                  icon={Lock}
                  type={showPw ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                  right={eyeToggle}
                />
                {submitBtn('Sign in')}
                <p className="text-center text-sm text-[#54656F] pt-1">
                  New here?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('register')}
                    className="font-semibold text-[#008069] hover:underline"
                  >
                    Create a business account
                  </button>
                </p>
              </form>
            ) : (
              <form key="register" onSubmit={handleRegister} className="form-in space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field
                    id="reg-name"
                    label="Your name"
                    icon={User}
                    type="text"
                    required
                    autoComplete="name"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Priyantha Silva"
                  />
                  <Field
                    id="reg-business"
                    label="Business name"
                    icon={Building2}
                    type="text"
                    required
                    autoComplete="organization"
                    value={regBusinessName}
                    onChange={(e) => setRegBusinessName(e.target.value)}
                    placeholder="Royal Gems"
                  />
                </div>
                <Field
                  id="reg-email"
                  label="Work email"
                  icon={Mail}
                  type="email"
                  required
                  autoComplete="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="you@company.com"
                />
                <Field
                  id="reg-phone"
                  label="WhatsApp number"
                  icon={Phone}
                  type="tel"
                  autoComplete="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="94771234567"
                  hint={
                    <p className="mt-1.5 text-xs text-[#8696A0]">
                      Include the country code, without + or spaces.
                    </p>
                  }
                />
                <Field
                  id="reg-password"
                  label="Password"
                  icon={Lock}
                  type={showPw ? 'text' : 'password'}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  right={eyeToggle}
                  hint={
                    <div className="mt-2.5">
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4].map((i) => (
                          <span
                            key={i}
                            className="h-1 flex-1 rounded-full transition-all duration-300"
                            style={{
                              background:
                                regPassword && i <= strength ? strengthColor : '#E1E6EA',
                            }}
                          />
                        ))}
                      </div>
                      <p
                        className="mt-1.5 text-xs font-medium transition-colors"
                        style={{ color: regPassword ? strengthColor : '#8696A0' }}
                      >
                        {regPassword ? strengthLabel : 'Use 6+ characters. Mix in numbers and symbols to make it stronger.'}
                      </p>
                    </div>
                  }
                />

                {/* Plan summary */}
                <div className="rounded-xl border border-[#D6EFE7] bg-[#F1FAF7] p-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-semibold text-[#111B21]">Pro plan</span>
                    <span className="text-sm font-bold text-[#008069]">
                      5,000 LKR<span className="font-medium text-[#54656F]"> / month</span>
                    </span>
                  </div>
                  <ul className="mt-2.5 space-y-1.5 text-[13px] text-[#3B4A54]">
                    {[
                      'Private shared inbox for your team',
                      'Gemini AI auto-replies from your catalog',
                      'Secure payment through Stripe next',
                    ].map((t) => (
                      <li key={t} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#008069] shrink-0" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>

                {submitBtn('Create account and continue')}
                <p className="text-center text-sm text-[#54656F] pt-1">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('signin')}
                    className="font-semibold text-[#008069] hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              </form>
            )}
          </div>
        </main>
      </div>

      {/* Global Sleek Footer */}
      <footer className="border-t border-[#E9EDEF] bg-white py-4 px-6 sm:px-10 text-xs text-[#667781] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3 text-[#667781] flex-wrap">
          <span className="font-semibold text-[#111B21]">© {new Date().getFullYear()} ZEVARONE</span>
          <span className="text-slate-300 hidden sm:inline">&bull;</span>
          <span>WhatsApp Business AI CRM Hub</span>
          <span className="text-slate-300 hidden sm:inline">&bull;</span>
          <Link href="/privacy" className="hover:text-[#008069] transition">
            Privacy Policy
          </Link>
          <span className="text-slate-300 hidden sm:inline">&bull;</span>
          <Link href="/terms" className="hover:text-[#008069] transition">
            Terms of Service
          </Link>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-bold tracking-widest text-[#8696A0] uppercase">
            POWERED BY
          </span>
          <div className="h-6 px-3 bg-[#111B21] rounded-md flex items-center justify-center shadow-xs">
            <Image
              src="/newlogos/Asset 13.svg"
              alt="ZEVARONE"
              width={76}
              height={14}
              className="h-3 w-auto object-contain"
            />
          </div>
        </div>
      </footer>
    </div>
  );
}