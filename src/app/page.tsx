'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useApp } from '@/context/AppContext';
import {
  Sparkles,
  MessageSquare,
  Bot,
  Image as ImageIcon,
  ShoppingBag,
  Send,
  Building2,
  CheckCircle2,
  ArrowRight,
  LogIn,
  Check,
  CheckCheck,
  Menu,
  X,
  Plus,
  Users,
  Zap,
  Clock,
  ShieldCheck,
} from 'lucide-react';

/* ================================================================== */
/*  Small animation helpers                                            */
/* ================================================================== */

/** Adds the "in" class once the element scrolls into view. */
function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${shown ? 'in' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/** Counts up to `to` the first time it becomes visible. */
function CountUp({
  to,
  decimals = 0,
  prefix = '',
  suffix = '',
}: {
  to: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setVal(to);
      return;
    }
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const dur = 1400;
        const tick = (now: number) => {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          setVal(to * eased);
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to]);

  return (
    <span ref={ref}>
      {prefix}
      {val.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}

/* ================================================================== */
/*  Hero chat demo (the one big moment on the page)                    */
/* ================================================================== */

function HeroPhone() {
  const [step, setStep] = useState(0); // 0..4
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const wait = (ms: number) => new Promise<void>((r) => timers.push(setTimeout(r, ms)));

    (async () => {
      while (!cancelled) {
        setStep(0);
        setTyping(false);
        await wait(1200);
        setStep(1); // customer asks
        await wait(900);
        setTyping(true);
        await wait(1400);
        setTyping(false);
        setStep(2); // AI replies with product card
        await wait(1500);
        setStep(3); // customer
        await wait(1000);
        setTyping(true);
        await wait(1100);
        setTyping(false);
        setStep(4); // AI closes
        await wait(4200);
      }
    })();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-[340px]">
      {/* floating badges */}
      <div className="float-a absolute -left-6 sm:-left-14 top-16 z-10 rounded-xl bg-white px-3 py-2 shadow-xl shadow-slate-900/10 border border-slate-100 flex items-center gap-2">
        <span className="h-7 w-7 rounded-lg bg-emerald-50 text-[#008069] flex items-center justify-center">
          <Zap className="w-4 h-4" />
        </span>
        <div className="leading-tight">
          <p className="text-[11px] font-bold text-slate-900">Replied in 0.8s</p>
          <p className="text-[10px] text-slate-500">AI Agent</p>
        </div>
      </div>
      <div className="float-b absolute -right-4 sm:-right-12 bottom-24 z-10 rounded-xl bg-white px-3 py-2 shadow-xl shadow-slate-900/10 border border-slate-100 flex items-center gap-2">
        <span className="h-7 w-7 rounded-lg bg-emerald-50 text-[#008069] flex items-center justify-center">
          <Users className="w-4 h-4" />
        </span>
        <div className="leading-tight">
          <p className="text-[11px] font-bold text-slate-900">New lead</p>
          <p className="text-[10px] text-slate-500">Welcome photos sent</p>
        </div>
      </div>

      <div className="rounded-[2.2rem] bg-[#0B141A] p-2.5 shadow-2xl shadow-slate-900/30 ring-1 ring-black/10">
        <div className="rounded-[1.7rem] overflow-hidden bg-[#0B141A]">
          <div className="flex items-center gap-3 px-4 py-3 bg-[#202C33]">
            <div className="h-9 w-9 rounded-full bg-[#00A884] text-white text-sm font-bold flex items-center justify-center">
              R
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-white">Royal Gems &amp; Jewelry</p>
              <p className="text-[11px] text-[#00A884]">{typing ? 'typing…' : 'online'}</p>
            </div>
          </div>

          <div className="h-[390px] px-3 py-4 flex flex-col justify-end gap-2.5 chat-bg">
            {step >= 1 && (
              <div className="flex justify-start">
                <div className="bubble-in max-w-[82%] bg-[#202C33] text-[#E9EDEF] text-[13px] rounded-2xl rounded-tl-sm px-3 py-2">
                  Hi! Do you have the Royal Sapphire Pendant? Price in LKR?
                </div>
              </div>
            )}
            {step >= 2 && (
              <div className="flex justify-end">
                <div className="bubble-in max-w-[86%] bg-[#005C4B] text-[#E9EDEF] text-[13px] rounded-2xl rounded-tr-sm px-3 py-2 space-y-2">
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-[#7FE3C8]">
                    <Sparkles className="w-3 h-3" /> Zevarone AI
                  </span>
                  <p>Yes, it’s in stock! Here are the details:</p>
                  <div className="flex items-center gap-2.5 rounded-lg bg-black/25 p-2">
                    <div className="h-11 w-11 rounded-md bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-white" />
                    </div>
                    <div className="leading-tight">
                      <p className="text-[12px] font-semibold">Royal Sapphire 18K Pendant</p>
                      <p className="text-[11px] text-[#7FE3C8] font-bold">Rs. 185,000</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {step >= 3 && (
              <div className="flex justify-start">
                <div className="bubble-in bg-[#202C33] text-[#E9EDEF] text-[13px] rounded-2xl rounded-tl-sm px-3 py-2">
                  Lovely. Can I get it in Colombo tomorrow?
                </div>
              </div>
            )}
            {step >= 4 && (
              <div className="flex justify-end">
                <div className="bubble-in max-w-[82%] bg-[#005C4B] text-[#E9EDEF] text-[13px] rounded-2xl rounded-tr-sm px-3 py-2">
                  Express delivery to Colombo is available. Shall I send the payment link?
                  <CheckCheck className="inline w-3.5 h-3.5 ml-1.5 -mb-0.5 text-[#53BDEB]" />
                </div>
              </div>
            )}
            {typing && (
              <div className="flex justify-end">
                <div className="bubble-in bg-[#005C4B] rounded-2xl rounded-tr-sm px-3.5 py-2.5 flex gap-1">
                  <span className="dot" />
                  <span className="dot" style={{ animationDelay: '.15s' }} />
                  <span className="dot" style={{ animationDelay: '.3s' }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Product tour mock panels                                           */
/* ================================================================== */

function AiMock() {
  return (
    <div className="space-y-3 text-[13px]">
      <div className="pop max-w-[80%] rounded-2xl rounded-tl-sm bg-white border border-slate-200 px-3.5 py-2.5 text-slate-800 shadow-sm">
        Do you have the Sapphire necklace in stock?
      </div>
      <div className="pop ml-auto max-w-[88%] rounded-2xl rounded-tr-sm bg-[#D9FDD3] border border-emerald-200 px-3.5 py-2.5 text-slate-900 shadow-sm space-y-1.5" style={{ animationDelay: '.25s' }}>
        <p className="flex items-center gap-1 text-[11px] font-bold text-[#008069]">
          <Bot className="w-3.5 h-3.5" /> Zevarone AI · 0.8s
        </p>
        <p>Yes! 2 left at Rs. 185,000. It comes with a certificate of authenticity.</p>
      </div>
      <div className="pop rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-[12px] text-amber-900" style={{ animationDelay: '.5s' }}>
        Customer asked for a discount. Chat handed to a human agent.
      </div>
    </div>
  );
}

function MediaMock() {
  const items = [
    ['from-sky-400 to-indigo-600', 'Sapphire pendant'],
    ['from-rose-400 to-pink-600', 'Ruby studs'],
    ['from-amber-300 to-orange-500', 'Gold bangle'],
  ];
  return (
    <div>
      <p className="text-[12px] font-semibold text-slate-500 mb-3">First message received. Sending welcome photos:</p>
      <div className="grid grid-cols-3 gap-3">
        {items.map(([g, label], i) => (
          <div key={label} className="pop rounded-xl bg-white border border-slate-200 p-2 shadow-sm" style={{ animationDelay: `${i * 0.25}s` }}>
            <div className={`aspect-square rounded-lg bg-gradient-to-br ${g} flex items-center justify-center`}>
              <ImageIcon className="w-6 h-6 text-white/90" />
            </div>
            <p className="mt-2 text-[11px] font-semibold text-slate-800 truncate">{label}</p>
            <p className="text-[10px] text-[#008069] font-medium flex items-center gap-1">
              <CheckCheck className="w-3 h-3" /> Delivered
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function InboxMock() {
  const rows = [
    ['PS', 'Priya Sharma', 'Do you have the Sapphire necklace…', 'AI replied', 'bg-emerald-100 text-[#008069]'],
    ['RP', 'Rohan Perera', 'Payment sent via bank transfer.', 'Human takeover', 'bg-amber-100 text-amber-800'],
    ['KS', 'Kavinda Silva', 'Can you send your bridal catalog?', 'Photos sent', 'bg-blue-100 text-blue-800'],
  ];
  return (
    <div className="rounded-xl bg-white border border-slate-200 divide-y divide-slate-100 shadow-sm overflow-hidden">
      {rows.map(([ini, name, msg, tag, cls], i) => (
        <div key={name} className="pop flex items-center gap-3 p-3" style={{ animationDelay: `${i * 0.18}s` }}>
          <div className="h-10 w-10 shrink-0 rounded-full bg-[#008069] text-white text-xs font-bold flex items-center justify-center">
            {ini}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-bold text-slate-900">{name}</p>
            <p className="text-[12px] text-slate-500 truncate">{msg}</p>
          </div>
          <span className={`text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap ${cls}`}>{tag}</span>
        </div>
      ))}
    </div>
  );
}

function BroadcastMock() {
  const rows = [
    ['0771234567', '94771234567'],
    ['0712345678', '94712345678'],
    ['+94 76 555 0101', '94765550101'],
  ];
  return (
    <div className="space-y-2.5">
      <p className="text-[12px] font-semibold text-slate-500">Numbers are cleaned automatically before sending:</p>
      {rows.map(([from, to], i) => (
        <div key={from} className="pop flex items-center gap-3 rounded-xl bg-white border border-slate-200 px-3.5 py-2.5 shadow-sm text-[13px]" style={{ animationDelay: `${i * 0.2}s` }}>
          <span className="text-slate-400 line-through">{from}</span>
          <ArrowRight className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-slate-900">{to}</span>
          <span className="ml-auto flex items-center gap-1 text-[11px] font-bold text-[#008069]">
            <Check className="w-3.5 h-3.5" /> Sent
          </span>
        </div>
      ))}
    </div>
  );
}

const TOUR = [
  {
    id: 'ai',
    label: 'AI replies',
    icon: Bot,
    title: 'Zevarone AI answers while you sleep',
    desc: 'It knows your catalog, your prices and your policies, so customers get a real answer in seconds instead of a “we’ll get back to you”.',
    points: ['Written in your brand voice', 'Quotes live prices in LKR', 'Hands the chat to a person when needed'],
    Mock: AiMock,
  },
  {
    id: 'media',
    label: 'Welcome photos',
    icon: ImageIcon,
    title: 'Make a first impression automatically',
    desc: 'When someone messages you for the first time, your best product photos go out straight away, each with its own caption.',
    points: ['Several photos in one sequence', 'A custom caption for each photo', 'Set up from your settings page'],
    Mock: MediaMock,
  },
  {
    id: 'inbox',
    label: 'Team inbox',
    icon: MessageSquare,
    title: 'One number, your whole team',
    desc: 'Everyone sees the same chats in real time. No refreshing, no fighting over who has the phone.',
    points: ['Live updates with sound alerts', 'See which chats the AI handled', 'Take over any chat in one click'],
    Mock: InboxMock,
  },
  {
    id: 'broadcast',
    label: 'Broadcasts',
    icon: Send,
    title: 'Reach every customer in one send',
    desc: 'Announce a sale, a restock or an order update to your whole list, and check delivery for every number afterwards.',
    points: ['Local numbers fixed automatically', 'Delivery checked through Meta', 'A full log of every broadcast'],
    Mock: BroadcastMock,
  },
] as const;

/* ================================================================== */
/*  Static data                                                        */
/* ================================================================== */

const FEATURES = [
  { icon: Bot, title: 'Zevarone Neural AI Concierge', desc: 'Answers customers 24/7 in your brand voice, using your catalog and policies.' },
  { icon: ImageIcon, title: 'Welcome photo sequences', desc: 'Greets first-time customers with curated photos and captions before the chat starts.' },
  { icon: MessageSquare, title: 'Shared team inbox', desc: 'Real-time chats for the whole team on a single business number, with sound alerts.' },
  { icon: ShoppingBag, title: 'Product catalog and quotes', desc: 'Send product cards with photos, stock and prices in LKR right inside the chat.' },
  { icon: Send, title: 'Broadcast campaigns', desc: 'Send promotions and order updates to your list, with Sri Lankan numbers cleaned for you.' },
  { icon: Building2, title: 'Private workspace per business', desc: 'Your own WhatsApp credentials, customers, AI instructions and catalog, kept separate.' },
];

const PLAN_FEATURES = [
  'Zevarone Proprietary AI Sales Concierge',
  'Multi-photo welcome sequences with captions',
  'Shared team inbox with sound alerts',
  'Product catalog and WhatsApp quotes',
  'Bulk broadcast campaigns',
  'Official Meta Cloud API integration',
  'Export customers and leads to Excel or CSV',
  'Private workspace and database',
  'Secure recurring billing with Stripe',
  '99.9% uptime guarantee',
];

const FAQS = [
  {
    q: 'Can I use my existing WhatsApp number?',
    a: 'Yes. Any number registered under your Meta Cloud API account works. In Settings, add your Phone Number ID and Meta token.',
  },
  {
    q: 'How does Zevarone AI give accurate answers?',
    a: 'You write instructions in Settings covering your business, pricing rules and refund policy. Zevarone AI also reads your live product catalog, so it quotes real prices in LKR.',
  },
  {
    q: 'What is the welcome photo sequence?',
    a: 'When a new customer sends their first message, your chosen photos and captions go out automatically, before the AI starts chatting.',
  },
  {
    q: 'How does payment work?',
    a: 'You pay 5,000 LKR per month through Stripe with any Visa or Mastercard. Cancel any time from your Billing page.',
  },
];

/* ================================================================== */
/*  Page                                                               */
/* ================================================================== */

export default function LandingPage() {
  const { currentUser } = useApp();
  const [tab, setTab] = useState(0);
  const [interval, setInterval] = useState<'monthly' | 'annual'>('annual');
  const [open, setOpen] = useState<number | null>(0);
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const Tour = TOUR[tab];
  const Mock = Tour.Mock;

  const navLinks = [
    ['#features', 'Features'],
    ['#tour', 'Product tour'],
    ['#why', 'Why us'],
    ['#pricing', 'Pricing'],
    ['#faq', 'FAQ'],
  ];

  return (
    <div className="min-h-screen bg-[#FAFBFB] text-slate-900 flex flex-col selection:bg-[#008069] selection:text-white overflow-x-hidden">
      <style>{`
        html { scroll-behavior: smooth; }
        section[id] { scroll-margin-top: 80px; }

        @keyframes bubbleIn { from { opacity:0; transform: translateY(10px) scale(.96);} to { opacity:1; transform:none;} }
        @keyframes dot { 0%,60%,100% { transform: translateY(0); opacity:.4;} 30% { transform: translateY(-4px); opacity:1;} }
        @keyframes floatA { 0%,100% { transform: translateY(0);} 50% { transform: translateY(-10px);} }
        @keyframes floatB { 0%,100% { transform: translateY(0);} 50% { transform: translateY(10px);} }
        @keyframes orb { 0%,100% { transform: translate(0,0);} 50% { transform: translate(30px,-26px);} }
        @keyframes heroIn { from { opacity:0; transform: translateY(22px);} to { opacity:1; transform:none;} }
        @keyframes pop { from { opacity:0; transform: translateY(12px) scale(.97);} to { opacity:1; transform:none;} }
        @keyframes pulseRing { 0% { box-shadow: 0 0 0 0 rgba(0,168,132,.45);} 100% { box-shadow: 0 0 0 10px rgba(0,168,132,0);} }
        @keyframes shine { from { transform: translateX(-120%) skewX(-20deg);} to { transform: translateX(260%) skewX(-20deg);} }
        @keyframes gradientShift { 0% { background-position: 0% 50%;} 50% { background-position: 100% 50%;} 100% { background-position: 0% 50%;} }
        @keyframes priceIn { from { opacity:0; transform: translateY(8px);} to { opacity:1; transform:none;} }
        @keyframes menuIn { from { opacity:0; transform: translateY(-8px);} to { opacity:1; transform:none;} }

        .bubble-in { animation: bubbleIn .35s cubic-bezier(.2,.8,.2,1) both; }
        .dot { width:6px; height:6px; border-radius:9999px; background:#B7E4D8; animation: dot 1s infinite ease-in-out; }
        .float-a { animation: floatA 5s ease-in-out infinite; }
        .float-b { animation: floatB 6s ease-in-out infinite; }
        .orb { animation: orb 16s ease-in-out infinite; }
        .hero-1 { animation: heroIn .7s .05s cubic-bezier(.2,.8,.2,1) both; }
        .hero-2 { animation: heroIn .7s .18s cubic-bezier(.2,.8,.2,1) both; }
        .hero-3 { animation: heroIn .7s .3s cubic-bezier(.2,.8,.2,1) both; }
        .hero-4 { animation: heroIn .7s .42s cubic-bezier(.2,.8,.2,1) both; }
        .hero-5 { animation: heroIn .9s .3s cubic-bezier(.2,.8,.2,1) both; }
        .pop { animation: pop .45s cubic-bezier(.2,.8,.2,1) both; }
        .live-dot { animation: pulseRing 1.8s infinite; }
        .price-in { animation: priceIn .35s cubic-bezier(.2,.8,.2,1) both; }
        .menu-in { animation: menuIn .25s ease both; }
        .shine { position:absolute; inset:0; width:40%; background:linear-gradient(90deg,transparent,rgba(255,255,255,.3),transparent); transform: translateX(-120%) skewX(-20deg); }
        a:hover > .shine, button:hover > .shine { animation: shine .9s ease; }
        .cta-bg { background: linear-gradient(120deg,#0B141A,#0F2A2A,#0B3B33,#0B141A); background-size: 300% 300%; animation: gradientShift 14s ease infinite; }
        .chat-bg { background-color:#0B141A; background-image: radial-gradient(rgba(255,255,255,.035) 1px, transparent 1px); background-size:18px 18px; }
        .reveal { opacity:0; transform: translateY(18px); transition: opacity .7s cubic-bezier(.2,.8,.2,1), transform .7s cubic-bezier(.2,.8,.2,1); }
        .reveal.in { opacity:1; transform:none; }
        .marquee { display:flex; width:max-content; animation: marquee 32s linear infinite; }
        @keyframes marquee { from { transform: translateX(0);} to { transform: translateX(-50%);} }
        @media (prefers-reduced-motion: reduce) {
          html { scroll-behavior:auto; }
          *,*::before,*::after { animation: none !important; transition-duration: .01ms !important; }
          .reveal { opacity:1; transform:none; }
        }
      `}</style>

      {/* ============================ NAV ============================ */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/85 backdrop-blur-md border-b border-slate-200/80 shadow-sm'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-[#008069] flex items-center justify-center text-white font-bold text-lg shadow-sm transition group-hover:bg-[#075E54] group-hover:rotate-[-6deg]">
              W
            </div>
            <div className="leading-tight">
              <span className="font-extrabold text-base tracking-tight">ZEVARONE</span>
              <p className="text-[11px] text-slate-500 font-medium">WhatsApp AI CRM</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600">
            {navLinks.map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="relative px-3 py-2 rounded-lg hover:text-[#008069] transition after:absolute after:left-3 after:right-3 after:bottom-1 after:h-[2px] after:origin-left after:scale-x-0 after:bg-[#008069] after:transition-transform hover:after:scale-x-100"
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {currentUser ? (
              <Link
                href="/inbox"
                className="px-4 py-2.5 bg-[#008069] hover:bg-[#075E54] text-white text-sm font-semibold rounded-xl transition flex items-center gap-2 shadow-sm"
              >
                Go to workspace
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden sm:flex px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition items-center gap-1.5"
                >
                  <LogIn className="w-4 h-4 text-slate-500" />
                  Log in
                </Link>
                <Link
                  href="/login"
                  className="group relative overflow-hidden px-5 py-2.5 bg-[#008069] hover:bg-[#075E54] text-white text-sm font-semibold rounded-xl transition shadow-sm"
                >
                  <span className="shine" aria-hidden />
                  <span className="relative">Get started</span>
                </Link>
              </>
            )}
            <button
              type="button"
              onClick={() => setMenu((v) => !v)}
              aria-label="Toggle menu"
              className="md:hidden h-10 w-10 rounded-xl flex items-center justify-center text-slate-700 hover:bg-slate-100"
            >
              {menu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {menu && (
          <div className="menu-in md:hidden bg-white border-t border-slate-200 px-4 py-3 shadow-lg">
            {navLinks.map(([href, label]) => (
              <a
                key={href}
                href={href}
                onClick={() => setMenu(false)}
                className="block px-3 py-3 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {label}
              </a>
            ))}
            {!currentUser && (
              <Link href="/login" className="block px-3 py-3 rounded-lg text-sm font-semibold text-[#008069]">
                Log in
              </Link>
            )}
          </div>
        )}
      </header>

      {/* ============================ HERO ============================ */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-10 pb-24">
        <div className="orb pointer-events-none absolute -top-20 left-[-8rem] h-[26rem] w-[26rem] rounded-full bg-[#00A884]/15 blur-3xl" />
        <div className="orb pointer-events-none absolute top-40 right-[-8rem] h-[24rem] w-[24rem] rounded-full bg-[#25D366]/15 blur-3xl" style={{ animationDelay: '-8s' }} />

        <div className="relative max-w-7xl mx-auto grid lg:grid-cols-[1.1fr_1fr] gap-16 items-center">
          <div className="text-center lg:text-left">
            <div className="hero-1 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-emerald-200 text-xs font-semibold text-[#008069] shadow-sm">
              <span className="live-dot h-2 w-2 rounded-full bg-[#00A884]" />
              Built on the Meta WhatsApp Cloud API and Zevarone Neural AI
            </div>

            <h1 className="hero-2 mt-6 text-4xl sm:text-5xl lg:text-[3.6rem] font-extrabold tracking-tight leading-[1.08]">
              Your WhatsApp replies itself, day and night.
            </h1>

            <p className="hero-3 mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Answer questions, share your catalog, send welcome photos and run broadcasts from one shared inbox. Zevarone AI handles the routine chats, and your team steps in when it matters.
            </p>

            <div className="hero-4 mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
              <Link
                href="/login"
                className="group relative overflow-hidden w-full sm:w-auto px-8 py-4 bg-[#008069] hover:bg-[#075E54] text-white text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-[#008069]/25 active:scale-[0.99]"
              >
                <span className="shine" aria-hidden />
                <span className="relative flex items-center gap-2">
                  Start for 5,000 LKR / month
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
              <a
                href="#tour"
                className="w-full sm:w-auto px-7 py-4 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-sm font-bold rounded-xl transition flex items-center justify-center"
              >
                See how it works
              </a>
            </div>

            <ul className="hero-4 mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-[13px] text-slate-500 font-medium">
              {['Official Meta Cloud API', 'Pay through Stripe', 'Private workspace', 'No developer needed'].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00A884]" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="hero-5">
            <HeroPhone />
          </div>
        </div>
      </section>

      {/* ============================ STATS ============================ */}
      <section className="bg-[#0B141A] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {[
            { icon: Zap, node: <CountUp to={0.8} decimals={1} suffix="s" />, label: 'typical AI reply time' },
            { icon: Clock, node: <>24/7</>, label: 'always answering' },
            { icon: ShieldCheck, node: <CountUp to={100} suffix="%" />, label: 'private data per business' },
            { icon: Users, node: <CountUp to={5000} suffix=" LKR" />, label: 'flat price per month' },
          ].map((s, i) => (
            <Reveal key={i} delay={i * 90}>
              <s.icon className="w-5 h-5 mx-auto text-[#00A884] mb-3" />
              <p className="text-3xl sm:text-4xl font-extrabold tracking-tight tabular-nums">{s.node}</p>
              <p className="mt-1 text-sm text-[#8696A0]">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============================ FEATURES ============================ */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Everything you need to sell on WhatsApp
            </h2>
            <p className="mt-3 text-slate-600">
              One workspace for answering, showing products and following up.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 90}>
                <div className="group h-full rounded-2xl border border-slate-200 bg-[#FAFBFB] p-7 transition-all duration-300 hover:-translate-y-1 hover:border-[#008069]/60 hover:bg-white hover:shadow-xl hover:shadow-[#008069]/10">
                  <div className="h-12 w-12 rounded-xl bg-emerald-50 text-[#008069] flex items-center justify-center transition-all duration-300 group-hover:bg-[#008069] group-hover:text-white group-hover:scale-110 group-hover:rotate-[-4deg]">
                    <f.icon className="w-6 h-6" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold">{f.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ PRODUCT TOUR ============================ */}
      <section id="tour" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">See it in action</h2>
            <p className="mt-3 text-slate-600">Pick a feature to see what your customers and team will see.</p>
          </Reveal>

          <Reveal>
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {TOUR.map((t, i) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(i)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                    tab === i
                      ? 'bg-[#008069] border-[#008069] text-white shadow-lg shadow-[#008069]/25 scale-[1.03]'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-[#008069]/50 hover:text-[#008069]'
                  }`}
                >
                  <t.icon className="w-4 h-4" />
                  {t.label}
                </button>
              ))}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 overflow-hidden">
              <div className="grid md:grid-cols-2">
                <div key={`text-${Tour.id}`} className="pop p-8 sm:p-10 flex flex-col justify-center">
                  <h3 className="text-2xl font-bold tracking-tight">{Tour.title}</h3>
                  <p className="mt-3 text-slate-600 leading-relaxed">{Tour.desc}</p>
                  <ul className="mt-6 space-y-3">
                    {Tour.points.map((p) => (
                      <li key={p} className="flex items-center gap-2.5 text-sm text-slate-700">
                        <span className="h-5 w-5 rounded-full bg-emerald-50 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-[#008069]" />
                        </span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-[#EFEAE2] p-6 sm:p-8 flex items-center min-h-[320px]">
                  <div key={`mock-${Tour.id}`} className="w-full">
                    <Mock />
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============================ COMPARISON ============================ */}
      <section id="why" className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-y border-slate-200">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Slow replies cost you sales
            </h2>
            <p className="mt-3 text-slate-600">Here is how the ordinary WhatsApp Business app compares.</p>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-6">
            <Reveal>
              <div className="h-full rounded-2xl border border-slate-200 bg-slate-50 p-7">
                <p className="text-sm font-bold text-slate-500">WhatsApp Business app</p>
                <h3 className="mt-1 text-xl font-bold text-slate-800">Slow, manual and scattered</h3>
                <ul className="mt-5 space-y-3.5 text-sm text-slate-600">
                  {[
                    'Customers wait 15 to 45 minutes for a reply at busy times.',
                    'Tied to one or two phones, so staff compete over who answers.',
                    'Photos, prices and bank details are copied and pasted by hand.',
                    'No automatic follow-up on new leads.',
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-2.5">
                      <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="h-full rounded-2xl border-2 border-[#008069] bg-emerald-50/50 p-7 shadow-lg shadow-[#008069]/10">
                <p className="text-sm font-bold text-[#008069]">ZEVARONE AI CRM</p>
                <h3 className="mt-1 text-xl font-bold text-slate-900">Instant, automated and shared</h3>
                <ul className="mt-5 space-y-3.5 text-sm text-slate-700">
                  {[
                    ['Replies in seconds:', 'Zevarone AI answers day and night.'],
                    ['Shared inbox:', 'several agents work chats at once.'],
                    ['Welcome photos:', 'sent automatically on first contact.'],
                    ['Flat price:', '5,000 LKR a month, billed by Stripe.'],
                  ].map(([b, t]) => (
                    <li key={b} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#00A884] shrink-0 mt-0.5" />
                      <span>
                        <strong>{b}</strong> {t}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============================ PRICING ============================ */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">One plan, everything included</h2>
            <p className="mt-3 text-slate-600">Pay monthly, or save 10% by paying for the year.</p>

            <div className="relative mt-7 inline-grid grid-cols-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200">
              <span
                aria-hidden
                className="absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-6px)] rounded-xl bg-white shadow-sm transition-transform duration-300 ease-[cubic-bezier(.2,.8,.2,1)]"
                style={{ transform: interval === 'monthly' ? 'translateX(0)' : 'translateX(100%)' }}
              />
              <button
                type="button"
                onClick={() => setInterval('monthly')}
                className={`relative z-10 px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  interval === 'monthly' ? 'text-slate-900' : 'text-slate-500'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setInterval('annual')}
                className={`relative z-10 px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                  interval === 'annual' ? 'text-[#008069]' : 'text-slate-500'
                }`}
              >
                Annual
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-900 font-bold">
                  Save 10%
                </span>
              </button>
            </div>
          </Reveal>

          <Reveal>
            <div className="relative max-w-lg mx-auto rounded-3xl border-2 border-[#008069] bg-white p-8 shadow-2xl shadow-[#008069]/15 overflow-hidden">
              <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-[#00A884]/10 blur-2xl" />
              <h3 className="text-2xl font-extrabold">WhatsApp CRM &amp; Zevarone AI Pro</h3>
              <p className="mt-1 text-sm text-slate-500">For shops, brands and service businesses of any size.</p>

              <div className="mt-6 flex items-baseline gap-2">
                <span key={interval} className="price-in text-5xl font-black tabular-nums">
                  {interval === 'annual' ? '4,500' : '5,000'}
                </span>
                <span className="text-base font-bold text-slate-500">LKR / month</span>
              </div>
              <p className="mt-1 h-5 text-xs text-slate-500">
                {interval === 'annual'
                  ? 'Billed 54,000 LKR a year. You save 6,000 LKR.'
                  : 'Billed monthly. Cancel any time.'}
              </p>

              <ul className="mt-6 pt-6 border-t border-slate-200 space-y-3 text-sm text-slate-800">
                {PLAN_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#00A884] shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/login"
                className="group relative overflow-hidden mt-8 w-full py-4 bg-[#008069] hover:bg-[#075E54] text-white font-bold text-sm rounded-xl transition flex items-center justify-center shadow-lg shadow-[#008069]/25 active:scale-[0.99]"
              >
                <span className="shine" aria-hidden />
                <span className="relative flex items-center gap-2">
                  Get started
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
              <p className="mt-4 text-center text-sm text-slate-500">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-[#008069] hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============================ FAQ ============================ */}
      <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-200">
        <div className="max-w-3xl mx-auto">
          <Reveal className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Common questions</h2>
          </Reveal>

          <div className="space-y-3">
            {FAQS.map((f, i) => {
              const isOpen = open === i;
              return (
                <Reveal key={f.q} delay={i * 70}>
                  <div
                    className={`rounded-2xl border bg-white transition-colors ${
                      isOpen ? 'border-[#008069]/50 shadow-md shadow-[#008069]/5' : 'border-slate-200'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      className="w-full flex items-center justify-between gap-4 text-left px-5 py-4"
                    >
                      <span className="text-[15px] font-bold text-slate-900">{f.q}</span>
                      <span
                        className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isOpen ? 'bg-[#008069] text-white rotate-45' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                      </span>
                    </button>
                    <div
                      className="grid transition-[grid-template-rows] duration-300 ease-out"
                      style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                    >
                      <div className="overflow-hidden">
                        <p className="px-5 pb-5 text-sm text-slate-600 leading-relaxed">{f.a}</p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================ FINAL CTA ============================ */}
      <section className="cta-bg relative overflow-hidden text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="orb pointer-events-none absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-[#00A884]/20 blur-3xl" />
        <Reveal className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Let WhatsApp work while you do
          </h2>
          <p className="mt-3 text-slate-300 max-w-xl mx-auto">
            Set up in minutes. Your first customer can get an instant reply today.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              className="group relative overflow-hidden w-full sm:w-auto px-8 py-4 bg-[#00A884] hover:bg-[#008069] text-white text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-black/30"
            >
              <span className="shine" aria-hidden />
              <span className="relative flex items-center gap-2">
                Get started
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-7 py-4 bg-white/10 hover:bg-white/15 border border-white/15 text-white text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4 text-slate-300" />
              Log in
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ============================ FOOTER ============================ */}
      <footer className="bg-white border-t border-slate-200 py-10 px-4 sm:px-6 lg:px-8 text-sm text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-[#008069] flex items-center justify-center text-white font-bold text-sm">
              W
            </div>
            <div>
              <span className="font-bold text-slate-900">ZEVARONE WhatsApp AI CRM</span>
              <p className="text-xs text-slate-400">© 2026 Zevarone Group. All rights reserved.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 font-medium">
            <a href="#features" className="hover:text-[#008069] transition">Features</a>
            <a href="#pricing" className="hover:text-[#008069] transition">Pricing</a>
            <Link href="/privacy" className="hover:text-[#008069] transition">Privacy policy</Link>
            <Link href="/terms" className="hover:text-[#008069] transition">Terms</Link>
            <Link href="/login" className="hover:text-[#008069] transition">Log in</Link>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Powered by</span>
            <div className="bg-[#111B21] px-3 py-1.5 rounded-lg flex items-center">
              <Image
                src="/newlogos/Asset 13.svg"
                alt="ZEVARONE"
                width={80}
                height={16}
                className="h-3.5 w-auto object-contain"
              />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}