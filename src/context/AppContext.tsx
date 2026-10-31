'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Tenant, AppSettings } from '@/lib/types';

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

  const switchTenant = (tenantId: string) => {
    const t = tenants.find((item) => item.id === tenantId);
    if (t) {
      setSelectedTenant(t);
      if (typeof window !== 'undefined') {
        localStorage.setItem('selected_tenant_id', t.id);
      }
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
      }}
    >
      {children}
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
