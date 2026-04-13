import { useCallback } from "react";
import useFetch from "../use-fetch";
import { API_URL } from "../config";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";
import { Tenant } from "../types/tenant";
import { RequestConfigType } from "./types/request-config";

export function useGetTenantsService() {
  const fetch = useFetch();
  return useCallback(
    (requestConfig?: RequestConfigType) =>
      fetch(`${API_URL}/v1/tenants`, { method: "GET", ...requestConfig }).then(
        wrapperFetchJsonResponse<Tenant[]>
      ),
    [fetch]
  );
}

export function useGetTenantService() {
  const fetch = useFetch();
  return useCallback(
    (id: string, requestConfig?: RequestConfigType) =>
      fetch(`${API_URL}/v1/tenants/${id}`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<Tenant>),
    [fetch]
  );
}

export type CreateTenantRequest = { name: string; slug: string };

export function useCreateTenantService() {
  const fetch = useFetch();
  return useCallback(
    (data: CreateTenantRequest, requestConfig?: RequestConfigType) =>
      fetch(`${API_URL}/v1/tenants`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<Tenant>),
    [fetch]
  );
}

export type UpdateTenantRequest = {
  name?: string;
  slug?: string;
  isActive?: boolean;
};

export function useUpdateTenantService() {
  const fetch = useFetch();
  return useCallback(
    (
      id: string,
      data: UpdateTenantRequest,
      requestConfig?: RequestConfigType
    ) =>
      fetch(`${API_URL}/v1/tenants/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<Tenant>),
    [fetch]
  );
}

export function useDeleteTenantService() {
  const fetch = useFetch();
  return useCallback(
    (id: string, requestConfig?: RequestConfigType) =>
      fetch(`${API_URL}/v1/tenants/${id}`, {
        method: "DELETE",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<void>),
    [fetch]
  );
}
