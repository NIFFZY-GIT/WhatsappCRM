'use client';

import React from 'react';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { AppNotification } from '@/lib/types';

interface NotificationToastProps {
  notifications: AppNotification[];
  onDismiss: (id: string) => void;
}

export default function NotificationToast({ notifications, onDismiss }: NotificationToastProps) {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none p-2 sm:p-0">
      {notifications.map((n) => {
        const isSuccess = n.type === 'success';
        const isError = n.type === 'error';
        const isWarning = n.type === 'warning';

        return (
          <div
            key={n.id}
            className={`pointer-events-auto rounded-xl p-3.5 shadow-lg border transition-all duration-300 animate-in slide-in-from-top-3 flex items-start gap-3 ${
              isSuccess
                ? 'bg-[#111B21] border-[#25D366]/40 text-white'
                : isError
                ? 'bg-[#111B21] border-rose-500/60 text-white'
                : isWarning
                ? 'bg-[#111B21] border-amber-500/60 text-white'
                : 'bg-[#111B21] border-[#00A884]/40 text-white'
            }`}
          >
            {/* Status Icon */}
            <div className="flex-shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-[#25D366]" />}
              {isError && <AlertCircle className="w-5 h-5 text-rose-400" />}
              {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400" />}
              {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-[#00A884]" />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-bold text-xs text-white truncate">{n.title}</h4>
                <span className="text-[10px] text-[#8696A0] flex-shrink-0">
                  {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-[11px] text-[#E9EDEF] mt-0.5 leading-relaxed break-words">
                {n.message}
              </p>

              {n.actionUrl && (
                <div className="mt-2">
                  <Link
                    href={n.actionUrl}
                    onClick={() => onDismiss(n.id)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#25D366] hover:underline"
                  >
                    <span>{n.actionLabel || 'View Details'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>

            {/* Dismiss Button */}
            <button
              onClick={() => onDismiss(n.id)}
              className="text-[#8696A0] hover:text-white p-1 rounded transition flex-shrink-0 -mr-1 -mt-1 cursor-pointer"
              title="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
