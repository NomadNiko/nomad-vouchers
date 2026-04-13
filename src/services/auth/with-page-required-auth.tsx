"use client";
import { useRouter } from "next/navigation";
import useAuth from "./use-auth";
import React, { FunctionComponent, useEffect } from "react";
import useLanguage from "../i18n/use-language";
import { RoleEnum } from "../api/types/role";
import { useTenant } from "../tenant/tenant-context";

type PropsType = {
  params?: { [key: string]: string | string[] | undefined };
  searchParams?: { [key: string]: string | string[] | undefined };
};

type OptionsType = {
  roles: RoleEnum[];
};

const roles = Object.values(RoleEnum).filter(
  (value) => !Number.isNaN(Number(value))
) as RoleEnum[];

function withPageRequiredAuth(
  Component: FunctionComponent<PropsType>,
  options?: OptionsType
) {
  const optionRoles = options?.roles || roles;

  return function WithPageRequiredAuth(props: PropsType) {
    const { user, isLoaded } = useAuth();
    const { hasNoAccess, isSuperAdmin, currentTenant } = useTenant();
    const router = useRouter();
    const language = useLanguage();

    useEffect(() => {
      const check = () => {
        if (!isLoaded) return;

        // Not logged in
        if (!user) {
          const currentLocation = window.location.toString();
          const returnToPath =
            currentLocation.replace(new URL(currentLocation).origin, "") ||
            `/${language}`;
          const params = new URLSearchParams({
            returnTo: returnToPath,
          });
          router.replace(`/${language}/sign-in?${params.toString()}`);
          return;
        }

        // Logged in but no tenant access (and not superAdmin)
        if (hasNoAccess) {
          router.replace(`/${language}/no-access`);
          return;
        }

        // SuperAdmins bypass role checks
        if (isSuperAdmin) return;

        // Check tenant-scoped role
        const tenantRole = currentTenant?.role;
        const tenantRoleMap: Record<string, number> = {
          admin: RoleEnum.ADMIN,
          staff: RoleEnum.STAFF,
          user: RoleEnum.USER,
        };
        const effectiveRoleId = tenantRole
          ? tenantRoleMap[tenantRole]
          : Number(user?.role?.id);

        if (effectiveRoleId && optionRoles.includes(effectiveRoleId)) return;

        // No matching role — redirect home
        router.replace(`/${language}`);
      };

      check();
    }, [
      user,
      isLoaded,
      router,
      language,
      hasNoAccess,
      isSuperAdmin,
      currentTenant,
    ]);

    if (!isLoaded) return null;

    if (!user) return null;

    if (hasNoAccess && !isSuperAdmin) return null;

    // SuperAdmins always pass
    if (isSuperAdmin) return <Component {...props} />;

    // Check tenant role
    const tenantRole = currentTenant?.role;
    const tenantRoleMap: Record<string, number> = {
      admin: RoleEnum.ADMIN,
      staff: RoleEnum.STAFF,
      user: RoleEnum.USER,
    };
    const effectiveRoleId = tenantRole
      ? tenantRoleMap[tenantRole]
      : Number(user?.role?.id);

    if (effectiveRoleId && optionRoles.includes(effectiveRoleId)) {
      return <Component {...props} />;
    }

    return null;
  };
}

export default withPageRequiredAuth;
