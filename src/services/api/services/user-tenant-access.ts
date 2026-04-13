import { useCallback } from "react";
import useFetch from "../use-fetch";
import { API_URL } from "../config";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";
import { RequestConfigType } from "./types/request-config";

export type UserTenantAccessResponse = {
  id: string;
  userId: string;
  tenantId: string;
  role: string;
  createdAt: string;
};

export function useGetTenantUsersService() {
  const fetch = useFetch();
  return useCallback(
    (tenantId: string, requestConfig?: RequestConfigType) =>
      fetch(`${API_URL}/v1/user-tenant-access/tenant/${tenantId}`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<UserTenantAccessResponse[]>),
    [fetch]
  );
}

export type CreateUserTenantAccessRequest = {
  userId: string;
  tenantId: string;
  role: "admin" | "staff" | "user";
};

export function useCreateUserTenantAccessService() {
  const fetch = useFetch();
  return useCallback(
    (data: CreateUserTenantAccessRequest, requestConfig?: RequestConfigType) =>
      fetch(`${API_URL}/v1/user-tenant-access`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<UserTenantAccessResponse>),
    [fetch]
  );
}

export function useUpdateUserTenantAccessService() {
  const fetch = useFetch();
  return useCallback(
    (id: string, data: { role: string }, requestConfig?: RequestConfigType) =>
      fetch(`${API_URL}/v1/user-tenant-access/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<UserTenantAccessResponse>),
    [fetch]
  );
}

export function useDeleteUserTenantAccessService() {
  const fetch = useFetch();
  return useCallback(
    (id: string, requestConfig?: RequestConfigType) =>
      fetch(`${API_URL}/v1/user-tenant-access/${id}`, {
        method: "DELETE",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<void>),
    [fetch]
  );
}
