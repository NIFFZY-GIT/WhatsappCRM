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
  const { envStatus, notify } = useApp();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    notify({
      type: 'info',
      title: 'Copied to Clipboard',
      message: `${key === 'webhook_url' ? 'Callback URL' : 'Verify Token'} copied.`,
    });
  };

  const handleRunDiagnostics = async () => {
    setIsTesting(true);
    setTestResults(null);
    try {
      const res = await fetch('/api/test-connection');
      const data = await res.json();
      setTestResults(data);
      if (data.database?.connected && data.whatsapp?.status === 'OK') {
        notify({
          type: 'success',
          title: 'Diagnostics Passed',
          message: 'WhatsApp Cloud API, Supabase, and Gemini are fully connected!',
        });
      } else {
        notify({
          type: 'warning',
          title: 'Diagnostics Complete with Notices',
          message: 'Review diagnostic panel below for connection specifics.',
        });
      }
    } catch (err: any) {
      notify({
        type: 'error',
        title: 'Diagnostic Error',
        message: err.message || 'Failed to complete connection test.',
      });
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
        <h2 className="text-xl font-bold text-[#111B21] tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#075E54]" />
          Meta WhatsApp Webhook &amp; Production Setup
        </h2>
        <p className="text-xs text-[#667781] mt-1">
          Configure Meta Cloud API to route incoming customer chats directly to your CRM webhook.
        </p>
      </div>

      {/* Webhook Credentials Card */}
      <div className="bg-white rounded-2xl border border-[#E9EDEF] p-6 sm:p-8 space-y-5">
        <h3 className="font-bold text-[#111B21] text-sm">Webhook Connection Parameters</h3>

        <div className="p-4 rounded-xl bg-[#F0F2F5] border border-[#E9EDEF] space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-[#111B21] uppercase">
                Callback URL
              </span>
              <button
                onClick={() => copyToClipboard(callbackUrl, 'webhook_url')}
                className="text-xs text-[#00A884] hover:text-[#075E54] font-medium flex items-center gap-1 cursor-pointer"
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
            <div className="p-3 bg-white border border-[#E9EDEF] rounded-xl font-mono text-xs text-[#111B21] break-all select-all">
              {callbackUrl}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-[#111B21] uppercase">
                Verify Token
              </span>
              <button
                onClick={() => copyToClipboard(verifyToken, 'verify_token')}
                className="text-xs text-[#00A884] hover:text-[#075E54] font-medium flex items-center gap-1 cursor-pointer"
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
            <div className="p-3 bg-white border border-[#E9EDEF] rounded-xl font-mono text-xs text-[#111B21] select-all">
              {verifyToken}
            </div>
          </div>
        </div>

        {/* Step by step checklist */}
        <div className="pt-2">
          <h4 className="font-bold text-[#111B21] text-xs uppercase tracking-wider mb-3">
            Meta App Dashboard Checklist:
          </h4>
          <ol className="text-xs text-[#667781] space-y-3 list-decimal pl-4 leading-relaxed">
            <li>
              Open your{' '}
              <a
                href="https://developers.facebook.com/apps/1273989728252949/"
                target="_blank"
                rel="noreferrer"
                className="text-[#00A884] font-bold hover:underline inline-flex items-center gap-0.5"
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
              In <a href="https://developers.facebook.com/apps/1273989728252949/settings/basic/" target="_blank" rel="noreferrer" className="text-[#00A884] font-bold hover:underline inline-flex items-center gap-0.5">App Settings → Basic <ExternalLink className="w-3 h-3" /></a>, paste your Privacy Policy URL:
              <div className="mt-1 font-mono text-[11px] bg-[#F0F2F5] border border-[#E9EDEF] p-2 rounded-lg text-[#111B21]">
                https://whatsapp-crm-orpin.vercel.app/privacy
              </div>
            </li>
            <li>
              Toggle <strong>App Mode</strong> at the top from <strong>Development</strong> to <strong>Live</strong> so Meta delivers live customer messages!
            </li>
          </ol>
        </div>

        {/* Diagnostic Tool */}
        <div className="pt-4 border-t border-[#E9EDEF]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-bold text-[#111B21] text-sm">System Connection Diagnostics</h4>
              <p className="text-xs text-[#667781]">Test live connectivity to Meta Graph API, Supabase, and Gemini AI.</p>
            </div>

            <button
              onClick={handleRunDiagnostics}
              disabled={isTesting}
              className="px-4 py-2 bg-[#00A884] hover:bg-[#075E54] disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Testing...' : 'Run Diagnostics'}</span>
            </button>
          </div>

          {testResults && (
            <div className="p-4 rounded-xl bg-[#111B21] border border-[#2A3942] text-[#E9EDEF] font-mono text-xs space-y-2 animate-in fade-in">
              <div className="text-[#25D366] font-bold">--- DIAGNOSTIC RESULTS ---</div>
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
