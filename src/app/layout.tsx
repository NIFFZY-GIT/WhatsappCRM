import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import AppShell from '@/components/AppShell';

export const metadata: Metadata = {
  title: 'ZEVARONE. CRM | Intelligent WhatsApp CRM Platform',
  description: 'ZEVARONE. CRM connects your business with WhatsApp Business Cloud API, automated sequences, and intelligent sales AI.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '512x512' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.png" type="image/png" sizes="512x512" />
        <link rel="apple-touch-icon" href="/icon.png" />
      </head>
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
