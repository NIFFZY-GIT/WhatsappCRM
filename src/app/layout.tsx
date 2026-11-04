import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import AppShell from '@/components/AppShell';

export const metadata: Metadata = {
  title: 'WhatsApp Business CRM & Zevarone AI Hub',
  description: 'Connect WhatsApp Business Cloud API with Automated Sequences and Zevarone Neural AI Concierge',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-slate-50 antialiased selection:bg-emerald-500 selection:text-white"
      >
        <AppProvider>
          <AppShell>{children}</AppShell>
        </AppProvider>
      </body>
    </html>
  );
}
