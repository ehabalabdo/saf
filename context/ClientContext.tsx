import React, { createContext, useContext } from 'react';
import { Client } from '../types';

interface ClientContextType {
  client: Client | null;
  loading: boolean;
  error: string | null;
  isExpired: boolean;
  isReadOnly: boolean;
  refreshClient: () => Promise<void>;
}

const defaultClient: Client = {
  id: 1,
  name: 'MED LOOP',
  slug: 'medloop',
  logoUrl: '',
  phone: '',
  email: '',
  address: '',
  status: 'active',
  isActive: true,
  enabledFeatures: { dental_lab: false, implant_company: false, academy: false },
} as Client;

const defaultValue: ClientContextType = {
  client: defaultClient,
  loading: false,
  error: null,
  isExpired: false,
  isReadOnly: false,
  refreshClient: async () => {},
};

const ClientContext = createContext<ClientContextType>(defaultValue);

export const ClientProvider: React.FC<{ children: React.ReactNode; slug?: string }> = ({ children }) => {
  return (
    <ClientContext.Provider value={defaultValue}>
      {children}
    </ClientContext.Provider>
  );
};

export const useClient = (): ClientContextType => {
  return useContext(ClientContext);
};

export const useClientSafe = () => {
  return useContext(ClientContext);
};

export function getCurrentClientId(): number {
  return 1;
}
