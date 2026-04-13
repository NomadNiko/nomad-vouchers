"use client";

import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { TenantContext } from "./tenant-context";
import useAuth from "@/services/auth/use-auth";
import { RoleEnum } from "@/services/api/types/role";
import { TenantAccess } from "@/services/api/types/tenant";

const TENANT_STORAGE_KEY = "currentTenantId";

function getStoredTenantId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TENANT_STORAGE_KEY);
}

function setStoredTenantId(id: string | null) {
  if (typeof window === "undefined") return;
  if (id) {
    localStorage.setItem(TENANT_STORAGE_KEY, id);
  } else {
    localStorage.removeItem(TENANT_STORAGE_KEY);
  }
}

export default function TenantProvider({ children }: PropsWithChildren) {
  const { user, isLoaded } = useAuth();
  const [currentTenantId, setCurrentTenantId] = useState<string | null>(null);

  const isSuperAdmin =
    !!user?.role && Number(user.role.id) === RoleEnum.SUPER_ADMIN;

  const tenants: TenantAccess[] = user?.tenants || [];

  // Initialize tenant from storage or first available
  useEffect(() => {
    if (!isLoaded || !user) return;

    const stored = getStoredTenantId();
    const validStored = stored && tenants.some((t) => t.tenantId === stored);

    if (validStored) {
      setCurrentTenantId(stored);
    } else if (tenants.length > 0) {
      setCurrentTenantId(tenants[0].tenantId);
      setStoredTenantId(tenants[0].tenantId);
    } else {
      setCurrentTenantId(null);
      setStoredTenantId(null);
    }
  }, [isLoaded, user, tenants]);

  const switchTenant = useCallback((tenantId: string) => {
    setCurrentTenantId(tenantId);
    setStoredTenantId(tenantId);
  }, []);

  const currentTenant = useMemo(
    () => tenants.find((t) => t.tenantId === currentTenantId) || null,
    [tenants, currentTenantId]
  );

  const hasNoAccess =
    isLoaded && !!user && !isSuperAdmin && tenants.length === 0;

  const value = useMemo(
    () => ({
      currentTenantId,
      currentTenant,
      tenants,
      switchTenant,
      isSuperAdmin,
      hasNoAccess,
    }),
    [
      currentTenantId,
      currentTenant,
      tenants,
      switchTenant,
      isSuperAdmin,
      hasNoAccess,
    ]
  );

  return (
    <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
  );
}
