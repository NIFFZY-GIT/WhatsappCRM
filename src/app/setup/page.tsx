'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Copy,
  Check,
  ExternalLink,
  Terminal,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function SetupPage() {
  const { envStatus } = useApp();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRunDiagnostics = async () => {
    setIsTesting(true);
    setTestResults(null);
    try {
      const res = await fetch('/api/test-connection');
      const data = await res.json();
      setTestResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTesting(false);
    }
  };

  const callbackUrl = `${envStatus?.appUrl || 'https://whatsapp-crm-orpin.vercel.app'}/api/webhook`;
  const verifyToken = envStatus?.verifyToken || 'v2Bfr7BVfZAkIiYP5G5rZBFukMKYvejXTV9XmcbNL28y2yT';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          Meta WhatsApp Webhook &amp; Production Setup
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Configure Meta Cloud API to route incoming customer chats directly to your CRM webhook.
        </p>
      </div>

      {/* Webhook Credentials Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-8 space-y-5">
        <h3 className="font-bold text-slate-900 text-sm">Webhook Connection Parameters</h3>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-700 uppercase">
                Callback URL
              </span>
              <button
                onClick={() => copyToClipboard(callbackUrl, 'webhook_url')}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
              >
                {copiedKey === 'webhook_url' ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy URL
                  </>
                )}
              </button>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-xl font-mono text-xs text-slate-800 break-all select-all">
              {callbackUrl}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-700 uppercase">
                Verify Token
              </span>
              <button
                onClick={() => copyToClipboard(verifyToken, 'verify_token')}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
              >
                {copiedKey === 'verify_token' ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy Token
                  </>
                )}
              </button>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-xl font-mono text-xs text-slate-800 select-all">
              {verifyToken}
            </div>
          </div>
        </div>

        {/* Step by step checklist */}
        <div className="pt-2">
          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">
            Meta App Dashboard Checklist:
          </h4>
          <ol className="text-xs text-slate-600 space-y-3 list-decimal pl-4 leading-relaxed">
            <li>
              Open your{' '}
              <a
                href="https://developers.facebook.com/apps/1273989728252949/"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-600 font-bold hover:underline inline-flex items-center gap-0.5"
              >
                Meta App Dashboard <ExternalLink className="w-3 h-3" />
              </a>{' '}
              → <strong>WhatsApp</strong> → <strong>Configuration</strong>.
            </li>
            <li>
              Under <strong>Webhook</strong>, click <strong>Edit</strong>, paste the Callback URL and Verify Token above, and click <strong>Verify and save</strong>.
            </li>
            <li>
              Under <strong>Webhook fields</strong>, click <strong>Manage</strong> and make sure <strong>messages</strong> has the <strong>Subscribe</strong> box checked!
            </li>
            <li>
              In <a href="https://developers.facebook.com/apps/1273989728252949/settings/basic/" target="_blank" rel="noreferrer" className="text-emerald-600 font-bold hover:underline inline-flex items-center gap-0.5">App Settings → Basic <ExternalLink className="w-3 h-3" /></a>, paste your Privacy Policy URL:
              <div className="mt-1 font-mono text-[11px] bg-slate-100 p-2 rounded-lg text-slate-700">
                https://whatsapp-crm-orpin.vercel.app/privacy
              </div>
            </li>
            <li>
              Toggle <strong>App Mode</strong> at the top from <strong>Development</strong> to <strong>Live</strong> so Meta delivers live customer messages!
            </li>
          </ol>
        </div>

        {/* Diagnostic Tool */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">System Connection Diagnostics</h4>
              <p className="text-xs text-slate-500">Test live connectivity to Meta Graph API, Supabase, and Gemini AI.</p>
            </div>

            <button
              onClick={handleRunDiagnostics}
              disabled={isTesting}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Testing...' : 'Run Diagnostics'}</span>
            </button>
          </div>

          {testResults && (
            <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs space-y-2 animate-in fade-in">
              <div className="text-emerald-400 font-bold">--- DIAGNOSTIC RESULTS ---</div>
              <div>WhatsApp API Status: {testResults.whatsapp?.status || 'OK'}</div>
              <div>Database: {testResults.database?.type || 'Supabase'} (Connected: {String(testResults.database?.connected)})</div>
              <div>Gemini AI Status: {testResults.gemini?.status || 'Active'}</div>
              <div>Time: {new Date().toISOString()}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
