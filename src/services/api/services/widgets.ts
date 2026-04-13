import { useCallback } from "react";
import useFetch from "../use-fetch";
import { API_URL } from "../config";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";
import { Widget, WidgetCustomization } from "../types/widget";
import { InfinityPaginationType } from "../types/infinity-pagination";
import { RequestConfigType } from "./types/request-config";

// --- Create ---
export type CreateWidgetRequest = {
  name: string;
  templateId: string;
  allowedDomains?: string[];
  customization: WidgetCustomization;
  isActive?: boolean;
  redirectUrl?: string;
};

export function useCreateWidgetService() {
  const fetch = useFetch();
  return useCallback(
    (data: CreateWidgetRequest, requestConfig?: RequestConfigType) =>
      fetch(`${API_URL}/v1/widgets`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<Widget>),
    [fetch]
  );
}

// --- List ---
export type GetWidgetsRequest = {
  page: number;
  limit: number;
};

export function useGetWidgetsService() {
  const fetch = useFetch();
  return useCallback(
    (data: GetWidgetsRequest, requestConfig?: RequestConfigType) => {
      const url = new URL(`${API_URL}/v1/widgets`);
      url.searchParams.append("page", data.page.toString());
      url.searchParams.append("limit", data.limit.toString());
      return fetch(url, { method: "GET", ...requestConfig }).then(
        wrapperFetchJsonResponse<InfinityPaginationType<Widget>>
      );
    },
    [fetch]
  );
}

// --- Get One ---
export function useGetWidgetService() {
  const fetch = useFetch();
  return useCallback(
    (id: string, requestConfig?: RequestConfigType) =>
      fetch(`${API_URL}/v1/widgets/${id}`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<Widget>),
    [fetch]
  );
}

// --- Get by API Key (Public) ---
export function useGetWidgetByApiKeyService() {
  const fetch = useFetch();
  return useCallback(
    (apiKey: string, requestConfig?: RequestConfigType) =>
      fetch(`${API_URL}/v1/widgets/public/${apiKey}`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<Widget>),
    [fetch]
  );
}

// --- Get by ID (Public) ---
export function useGetWidgetByIdPublicService() {
  const fetch = useFetch();
  return useCallback(
    (id: string, requestConfig?: RequestConfigType) =>
      fetch(`${API_URL}/v1/widgets/public/id/${id}`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<Widget>),
    [fetch]
  );
}

// --- Update ---
export type UpdateWidgetRequest = Partial<CreateWidgetRequest>;

export function useUpdateWidgetService() {
  const fetch = useFetch();
  return useCallback(
    (
      id: string,
      data: UpdateWidgetRequest,
      requestConfig?: RequestConfigType
    ) =>
      fetch(`${API_URL}/v1/widgets/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<Widget>),
    [fetch]
  );
}

// --- Delete ---
export function useDeleteWidgetService() {
  const fetch = useFetch();
  return useCallback(
    (id: string, requestConfig?: RequestConfigType) =>
      fetch(`${API_URL}/v1/widgets/${id}`, {
        method: "DELETE",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<void>),
    [fetch]
  );
}
