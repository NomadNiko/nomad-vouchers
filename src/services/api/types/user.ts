import { FileEntity } from "./file-entity";
import { Role } from "./role";
import { TenantAccess } from "./tenant";

export enum UserProviderEnum {
  EMAIL = "email",
  GOOGLE = "google",
}

export type User = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  photo?: FileEntity;
  provider?: UserProviderEnum;
  socialId?: string;
  role?: Role;
  tenants?: TenantAccess[];
  tenantAccess?: { tenantId: string; tenantName: string; role: string }[];
};
