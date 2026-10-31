'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Tenant, AppSettings, AppNotification } from '@/lib/types';
import { soundEffects } from '@/lib/sound';
import NotificationToast from '@/components/NotificationToast';

interface EnvStatus {
  hasWhatsAppToken: boolean;
  hasPhoneNumberId: boolean;
  hasWabaId: boolean;
  hasGeminiKey: boolean;
  hasSupabase: boolean;
  verifyToken: string;
  phoneNumberId: string | null;
  appUrl: string;
}

interface AppContextType {
  tenants: Tenant[];
  selectedTenant: Tenant | null;
  setSelectedTenant: (t: Tenant) => void;
  switchTenant: (tenantId: string) => void;
  settings: AppSettings | null;
  envStatus: EnvStatus | null;
  databaseStatus: { type: string; connected: boolean } | null;
  isLoading: boolean;
  refreshData: () => Promise<void>;
  unreadTotal: number;
  setUnreadTotal: React.Dispatch<React.SetStateAction<number>>;
  // Notification System
  notifications: AppNotification[];
  notify: (notification: Omit<AppNotification, 'id' | 'timestamp'>) => void;
  dismissNotification: (id: string) => void;
  clearAllNotifications: () => void;
  // Browser Desktop Notifications
  requestNotificationPermission: () => Promise<boolean>;
  hasNotificationPermission: boolean;
  // Sound controls
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [envStatus, setEnvStatus] = useState<EnvStatus | null>(null);
  const [databaseStatus, setDatabaseStatus] = useState<{ type: string; connected: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadTotal, setUnreadTotal] = useState(0);

  // Notification State
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hasNotificationPermission, setHasNotificationPermission] = useState(false);

  // Tracking last seen messages count to trigger alerts
  const lastKnownUnreadRef = useRef<number>(0);
  const isFirstLoadRef = useRef(true);

  // Check browser notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setHasNotificationPermission(Notification.permission === 'granted');
    }
  }, []);

  const requestNotificationPermission = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      setHasNotificationPermission(granted);
      if (granted) {
        notify({
          type: 'success',
          title: 'Notifications Enabled',
          message: 'You will now receive desktop alerts for incoming customer WhatsApp messages.',
        });
      }
      return granted;
    } catch {
      return false;
    }
  };

  const notify = (item: Omit<AppNotification, 'id' | 'timestamp'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newNotification: AppNotification = {
      ...item,
      id,
      timestamp: new Date().toISOString(),
    };

    setNotifications((prev) => [newNotification, ...prev].slice(0, 8));

    // Play corresponding audio sound
    if (soundEnabled) {
      if (item.type === 'error') {
        soundEffects.playError();
      } else if (item.type === 'warning') {
        soundEffects.playUrgentAlert();
      } else if (item.type === 'success') {
        soundEffects.playOutgoingMessage();
      } else {
        soundEffects.playIncomingMessage();
      }
    }

    // Trigger Browser Notification if permitted and window is not focused or general alert
    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      try {
        new Notification(item.title, {
          body: item.message,
          icon: '/favicon.ico',
        });
      } catch {
        // Fallback for browsers that require service worker
      }
    }

    // Auto dismiss after 6 seconds
    setTimeout(() => {
      dismissNotification(id);
    }, 6000);
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const refreshData = async () => {
    try {
      const [tRes, sRes] = await Promise.all([
        fetch('/api/tenants'),
        fetch('/api/settings'),
      ]);

      const tData = await tRes.json();
      const sData = await sRes.json();

      if (tData.success && tData.tenants) {
        setTenants(tData.tenants);

        // Restore selected tenant from localStorage or fallback
        const savedId = typeof window !== 'undefined' ? localStorage.getItem('selected_tenant_id') : null;
        const matched = savedId ? tData.tenants.find((t: Tenant) => t.id === savedId) : null;
        const current = matched || tData.tenants[0] || null;
        setSelectedTenant(current);
      }

      if (sData.settings) setSettings(sData.settings);
      if (sData.envStatus) setEnvStatus(sData.envStatus);
      if (sData.database) setDatabaseStatus(sData.database);
    } catch (err) {
      console.error('Failed to load initial app context:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Background polling for real-time WhatsApp incoming message alerts
  useEffect(() => {
    if (!selectedTenant) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/conversations?tenantId=${selectedTenant.id}`);
        const data = await res.json();

        if (data.success && data.contacts) {
          const currentUnread = data.contacts.reduce(
            (acc: number, c: any) => acc + (c.unreadCount || 0),
            0
          );
          setUnreadTotal(currentUnread);

          // If new unread messages arrived since last check
          if (!isFirstLoadRef.current && currentUnread > lastKnownUnreadRef.current) {
            const diff = currentUnread - lastKnownUnreadRef.current;
            notify({
              type: 'info',
              title: `🔔 ${diff} New WhatsApp Message${diff > 1 ? 's' : ''}!`,
              message: `New message received for ${selectedTenant.name}. Click to view in Shared Inbox.`,
              actionUrl: '/inbox',
              actionLabel: 'Open Inbox',
            });
          }

          // Check for any contact newly requesting human assistance
          const assistanceNeeded = data.contacts.filter((c: any) => c.needsHumanAssistance);
          if (!isFirstLoadRef.current && assistanceNeeded.length > 0) {
            const latest = assistanceNeeded[0];
            // Only fire if unread
            if (latest.unreadCount && latest.unreadCount > 0) {
              notify({
                type: 'warning',
                title: `⚠️ Human Assistance Requested!`,
                message: `${latest.name} (+${latest.phone}) requested human sales support.`,
                actionUrl: '/inbox',
                actionLabel: 'Take Over Chat',
              });
            }
          }

          lastKnownUnreadRef.current = currentUnread;
          isFirstLoadRef.current = false;
        }
      } catch {
        // Silent background poll error handling
      }
    }, 7000);

    return () => clearInterval(interval);
  }, [selectedTenant, soundEnabled]);

  const switchTenant = (tenantId: string) => {
    const t = tenants.find((item) => item.id === tenantId);
    if (t) {
      setSelectedTenant(t);
      if (typeof window !== 'undefined') {
        localStorage.setItem('selected_tenant_id', t.id);
      }
      notify({
        type: 'info',
        title: 'Business Switched',
        message: `Now managing WhatsApp messages for ${t.name}.`,
      });
    }
  };

  return (
    <AppContext.Provider
      value={{
        tenants,
        selectedTenant,
        setSelectedTenant,
        switchTenant,
        settings,
        envStatus,
        databaseStatus,
        isLoading,
        refreshData,
        unreadTotal,
        setUnreadTotal,
        notifications,
        notify,
        dismissNotification,
        clearAllNotifications,
        requestNotificationPermission,
        hasNotificationPermission,
        soundEnabled,
        setSoundEnabled,
      }}
    >
      {children}
      <NotificationToast
        notifications={notifications}
        onDismiss={dismissNotification}
      />
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
