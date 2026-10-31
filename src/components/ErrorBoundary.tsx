'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="bg-white border border-[#E9EDEF] rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-sm text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200">
              <AlertCircle className="w-6 h-6" />
            </div>

            <h3 className="font-bold text-[#111B21] text-base mb-1">
              Something went wrong loading this view
            </h3>

            <p className="text-xs text-[#667781] leading-relaxed mb-4">
              An unexpected error occurred while rendering this interface. Your data in Supabase is safe.
            </p>

            {this.state.error?.message && (
              <div className="p-3 bg-[#F0F2F5] rounded-xl text-left font-mono text-[11px] text-[#111B21] border border-[#E9EDEF] mb-5 overflow-x-auto">
                {this.state.error.message}
              </div>
            )}

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-[#00A884] hover:bg-[#075E54] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>

              <Link
                href="/inbox"
                onClick={this.handleReset}
                className="px-4 py-2 bg-[#F0F2F5] hover:bg-[#E9EDEF] text-[#111B21] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Back to Inbox</span>
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
