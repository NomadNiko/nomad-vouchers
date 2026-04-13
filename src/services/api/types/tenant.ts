export type TenantAccess = {
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  role: string;
};

export type Tenant = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
