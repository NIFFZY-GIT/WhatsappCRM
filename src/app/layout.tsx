import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import AppShell from '@/components/AppShell';

export const metadata: Metadata = {
  title: 'ZEVARONE. CRM | Intelligent WhatsApp CRM Platform',
  description: 'ZEVARONE. CRM connects your business with WhatsApp Business Cloud API, automated sequences, and intelligent sales AI.',
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
