"use client";

import { createContext, useContext } from "react";
import { TenantAccess } from "@/services/api/types/tenant";

export type TenantContextType = {
  currentTenantId: string | null;
  currentTenant: TenantAccess | null;
  tenants: TenantAccess[];
  switchTenant: (tenantId: string) => void;
  isSuperAdmin: boolean;
  hasNoAccess: boolean;
};

export const TenantContext = createContext<TenantContextType>({
  currentTenantId: null,
  currentTenant: null,
  tenants: [],
  switchTenant: () => {},
  isSuperAdmin: false,
  hasNoAccess: false,
});

export function useTenant() {
  return useContext(TenantContext);
}
