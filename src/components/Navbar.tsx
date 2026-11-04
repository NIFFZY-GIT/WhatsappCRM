'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  Sparkles,
  ArrowRight,
  LogIn,
  Menu,
  X,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';

interface NavbarProps {
  showLinks?: boolean;
}

export default function Navbar({ showLinks = true }: NavbarProps) {
  const pathname = usePathname();
  const { currentUser } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLoginPage = pathname === '/login';

  const navLinks = [
    { href: '/#features', label: 'Features' },
    { href: '/#demo', label: 'Live Demo' },
    { href: '/#pricing', label: 'Pricing (5,000 LKR)' },
    { href: '/#security', label: 'Security' },
    { href: '/#faq', label: 'FAQ' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E9EDEF] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[70px] flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <img
            src="/zevaroneassets/Asset 22.png"
            alt="ZEVARONE. CRM"
            className="h-8 sm:h-9 w-auto object-contain transition group-hover:opacity-90"
          />
        </Link>

        {/* Desktop Nav Links */}
        {showLinks && (
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-[#54656F]">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3.5 py-2 rounded-lg hover:text-[#008069] hover:bg-[#F0F2F5] transition"
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}

        {/* Right CTA / Auth Buttons */}
        <div className="flex items-center gap-2.5">
          {currentUser ? (
            <Link
              href="/inbox"
              className="px-4 py-2 bg-[#008069] hover:bg-[#075E54] text-white text-xs sm:text-sm font-semibold rounded-xl transition flex items-center gap-2 shadow-xs"
            >
              Open Workspace
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : isLoginPage ? (
            <Link
              href="/"
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-[#54656F] hover:text-[#008069] hover:bg-[#F0F2F5] rounded-xl transition flex items-center gap-1.5"
            >
              ← Back to Overview
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:flex px-4 py-2 text-sm font-semibold text-[#54656F] hover:text-[#111B21] hover:bg-[#F0F2F5] rounded-xl transition items-center gap-1.5"
              >
                <LogIn className="w-4 h-4 text-[#8696A0]" />
                Log in
              </Link>
              <Link
                href="/login"
                className="px-4 sm:px-5 py-2 bg-[#008069] hover:bg-[#075E54] text-white text-xs sm:text-sm font-semibold rounded-xl transition shadow-xs flex items-center gap-1.5"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}

          {/* Mobile menu toggle */}
          {showLinks && (
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
              className="md:hidden h-9 w-9 rounded-lg flex items-center justify-center text-[#54656F] hover:bg-[#F0F2F5] transition"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {showLinks && mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-[#E9EDEF] px-4 py-3 space-y-1 shadow-lg">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-[#54656F] hover:bg-[#F0F2F5] hover:text-[#008069]"
            >
              {link.label}
            </a>
          ))}
          {!currentUser && !isLoginPage && (
            <div className="pt-2 border-t border-[#E9EDEF] mt-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full py-2.5 text-center text-sm font-bold text-[#008069] bg-[#EFEAE2] hover:bg-[#D9FDD3] rounded-xl transition"
              >
                Sign In to Workspace
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
