import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service | ZEVARONE',
  description: 'Terms of Service for ZEVARONE WhatsApp CRM and Customer Communications',
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-2xl shadow-sm border border-slate-200">
        <div className="border-b border-slate-100 pb-6 mb-8">
          <Link href="/" className="text-emerald-600 hover:text-emerald-700 font-bold text-sm mb-4 inline-block">
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Terms of Service</h1>
          <p className="text-sm text-slate-500 mt-2">Last updated: October 31, 2026</p>
        </div>

        <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">1. Acceptance of Terms</h2>
            <p>
              By communicating with ZEVARONE via our WhatsApp Business number (+94 77 228 4950) or using our web services, 
              you agree to be bound by these Terms of Service and applicable Meta WhatsApp Business messaging policies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">2. Use of Messaging Services</h2>
            <p>
              Our WhatsApp channel provides customer assistance, product specifications, price inquiries, and service consultation. 
              Automated responses are provided with the assistance of artificial intelligence and are intended for general information. 
              Official quotations and orders are confirmed directly by authorized human personnel.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">3. Prohibited Conduct</h2>
            <p>
              Users agree not to send spam, abusive, fraudulent, or unlawful communications through our WhatsApp messaging channels. 
              We reserve the right to block numbers violating these standards.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">4. Contact Information</h2>
            <p>
              For inquiries regarding these terms, contact us at our WhatsApp Business number: +94 77 228 4950.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
