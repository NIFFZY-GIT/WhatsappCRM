import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | ZEVARONE',
  description: 'Privacy Policy for ZEVARONE WhatsApp CRM and Customer Communications',
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-2xl shadow-sm border border-slate-200">
        <div className="border-b border-slate-100 pb-6 mb-8">
          <Link href="/" className="text-emerald-600 hover:text-emerald-700 font-bold text-sm mb-4 inline-block">
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-slate-500 mt-2">Last updated: October 31, 2026</p>
        </div>

        <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">1. Overview</h2>
            <p>
              ZEVARONE (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates digital customer communication platforms, 
              including our WhatsApp Business automated concierge and customer relationship management (CRM) systems. 
              This Privacy Policy explains how we collect, store, and process personal data when you interact with us via 
              WhatsApp and our online services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">2. Information We Collect</h2>
            <p>When you contact us or interact with our WhatsApp Business accounts, we may collect:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Contact Information:</strong> Your WhatsApp phone number and profile display name.</li>
              <li><strong>Communication Records:</strong> Text messages, inquiries, and customer service requests sent to our business number.</li>
              <li><strong>Inquiry Context:</strong> Information regarding products, services, appointments, or pricing requests.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">3. How We Use Your Information</h2>
            <p>Your information is used strictly for the following purposes:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Answering inquiries, providing product quotations, and processing service requests.</li>
              <li>Powering our automated AI concierge and routing your requests to human agents when required.</li>
              <li>Maintaining service history to deliver consistent customer support.</li>
              <li>Complying with Meta WhatsApp Business Platform policies and applicable legal requirements.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">4. Data Sharing & Third-Party Processors</h2>
            <p>
              We do not sell, rent, or trade your personal data. To deliver our WhatsApp services, we partner with trusted infrastructure providers:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Meta Platforms, Inc.:</strong> Facilitates the transmission of WhatsApp messages via the Meta Graph API.</li>
              <li><strong>Google Cloud (Gemini API):</strong> Assists in generating contextual answers to customer inquiries.</li>
              <li><strong>Supabase:</strong> Provides secure encrypted database storage for customer interaction logs.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">5. Data Retention & Deletion Rights</h2>
            <p>
              We retain customer messages only as long as necessary to fulfill customer support needs. 
              You may request immediate deletion of your contact information and chat history at any time by contacting us 
              or asking our agent via WhatsApp.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">6. Contact Information</h2>
            <p>
              If you have any questions or data privacy requests regarding this policy, please reach out to:
            </p>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-2 text-xs">
              <p><strong>ZEVARONE Digital Services</strong></p>
              <p>WhatsApp: +94 77 228 4950</p>
              <p>Website: https://whatsapp-crm-orpin.vercel.app</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
