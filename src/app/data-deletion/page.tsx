import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Trash2, Mail, MessageSquare, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'User Data Deletion Instructions | ZEVARONE. CRM',
  description: 'Step-by-step instructions for requesting the deletion of your personal data and chat history.',
};

export default function DataDeletionInstructions() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-2xl shadow-sm border border-slate-200">
        {/* Navigation */}
        <div className="border-b border-slate-100 pb-6 mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[#008069] hover:text-[#075E54] font-semibold text-sm mb-4 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#008069] flex items-center justify-center border border-emerald-100">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                User Data Deletion Instructions
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Last updated: November 2026 • Meta Platform Compliance & GDPR
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8 text-sm text-slate-700 leading-relaxed">
          {/* Section 1: Overview */}
          <section>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-2.5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 inline-flex items-center justify-center text-xs font-bold">1</span>
              Overview &amp; Commitment
            </h2>
            <p>
              In accordance with Meta Platform Terms of Service, GDPR, and global data privacy standards, 
              <strong> ZEVARONE. CRM</strong> provides transparent, self-service mechanisms for any individual to request the immediate 
              and permanent removal of their personal data, WhatsApp contact profile, and communication logs.
            </p>
          </section>

          {/* Section 2: Types of Data */}
          <section className="bg-slate-50 rounded-xl p-5 border border-slate-200">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 inline-flex items-center justify-center text-xs font-bold">2</span>
              What Data Is Stored
            </h2>
            <p className="text-slate-600 mb-3">
              When you communicate with businesses using ZEVARONE. CRM over WhatsApp Cloud API, we process:
            </p>
            <ul className="grid sm:grid-cols-2 gap-2 text-xs">
              <li className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-[#008069] shrink-0 mt-0.5" />
                <span><strong>Contact Details:</strong> WhatsApp phone number and profile display name.</span>
              </li>
              <li className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-[#008069] shrink-0 mt-0.5" />
                <span><strong>Message Records:</strong> Incoming/outgoing chat logs and inquiry context.</span>
              </li>
              <li className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-[#008069] shrink-0 mt-0.5" />
                <span><strong>Media Attachments:</strong> Images or catalogs shared during support chats.</span>
              </li>
              <li className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-[#008069] shrink-0 mt-0.5" />
                <span><strong>Metadata:</strong> Timestamps, delivery statuses, and assigned agent notes.</span>
              </li>
            </ul>
          </section>

          {/* Section 3: Step-by-Step Deletion Instructions */}
          <section>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 inline-flex items-center justify-center text-xs font-bold">3</span>
              How to Request Your Data Deletion
            </h2>
            <div className="space-y-4">
              {/* Option A */}
              <div className="border border-slate-200 rounded-xl p-5 hover:border-emerald-300 transition">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#008069] flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900">Option A: Instant Request via WhatsApp (Fastest)</h3>
                </div>
                <ol className="list-decimal pl-5 space-y-1.5 text-slate-600 text-xs sm:text-sm">
                  <li>Open WhatsApp on the device registered with your phone number.</li>
                  <li>Send a direct message to our WhatsApp Business line: <strong>+94 77 228 4950</strong>.</li>
                  <li>Type: <code className="bg-slate-100 text-[#008069] font-mono px-1.5 py-0.5 rounded">DELETE MY DATA</code> or <code className="bg-slate-100 text-[#008069] font-mono px-1.5 py-0.5 rounded">REMOVE MY CHAT HISTORY</code>.</li>
                  <li>Our compliance engine or active agent will acknowledge your request and purge all conversation logs associated with your phone number within 24 hours.</li>
                </ol>
              </div>

              {/* Option B */}
              <div className="border border-slate-200 rounded-xl p-5 hover:border-emerald-300 transition">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Mail className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900">Option B: Written Request via Email</h3>
                </div>
                <p className="text-slate-600 text-xs sm:text-sm mb-2">
                  You can email our Data Protection Officer directly:
                </p>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs font-mono mb-2">
                  To: <strong>privacy@zevarone.com</strong> (or <strong>no-reply@zevarone.com</strong>)<br />
                  Subject: <span className="text-[#008069]">User Data Deletion Request</span><br />
                  Body: Include your full WhatsApp phone number (with country code, e.g., +94...)
                </div>
                <p className="text-xs text-slate-500">
                  Our compliance team will verify ownership and purge all records across our databases and backups within 48 hours.
                </p>
              </div>

              {/* Option C */}
              <div className="border border-slate-200 rounded-xl p-5 hover:border-emerald-300 transition">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Trash2 className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900">Option C: Business Account Owner Self-Service</h3>
                </div>
                <p className="text-slate-600 text-xs sm:text-sm">
                  If you are a registered business account owner on ZEVARONE. CRM, you can permanently delete customer records at any time:
                </p>
                <ol className="list-decimal pl-5 space-y-1 text-slate-600 text-xs sm:text-sm mt-2">
                  <li>Log in to your dashboard at <Link href="/login" className="text-[#008069] underline">crm.zevarone.com</Link>.</li>
                  <li>Navigate to <strong>Inbox</strong> or <strong>Tenants</strong>.</li>
                  <li>Click on the conversation you want removed and select <strong>Delete Chat</strong>.</li>
                  <li>To delete an entire business workspace, visit <strong>Settings</strong> &rarr; <strong>Delete Workspace</strong>.</li>
                </ol>
              </div>
            </div>
          </section>

          {/* Section 4: Deletion Process & SLA */}
          <section>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 inline-flex items-center justify-center text-xs font-bold">4</span>
              Processing Timeline &amp; Confirmation
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 text-xs sm:text-sm">
              <li><strong>Immediate Anonymization:</strong> Once a deletion request is initiated, all active contact records and incoming message webhooks for that phone number are disassociated.</li>
              <li><strong>Database Purge:</strong> Stored chat transcripts, attachments, and profile attributes are permanently deleted from our primary databases within <strong>24 to 48 hours</strong>.</li>
              <li><strong>Confirmation:</strong> Upon completion, a confirmation note is sent back to your email or WhatsApp number confirming total erasure.</li>
            </ul>
          </section>

          {/* Section 5: Contact Info */}
          <section className="bg-[#111B21] text-white rounded-xl p-6">
            <h2 className="text-base font-bold mb-2">Contact Our Privacy &amp; Compliance Team</h2>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              For any questions regarding your data rights or compliance with Meta Developer Platform policies, please reach out to:
            </p>
            <div className="text-xs text-slate-300 space-y-1">
              <p><strong>Company:</strong> ZEVARONE Digital Services (Private) Limited</p>
              <p><strong>Platform:</strong> ZEVARONE. CRM (<a href="https://crm.zevarone.com" className="text-[#25D366] underline">https://crm.zevarone.com</a>)</p>
              <p><strong>Email:</strong> privacy@zevarone.com / no-reply@zevarone.com</p>
              <p><strong>WhatsApp Support:</strong> +94 77 228 4950</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
