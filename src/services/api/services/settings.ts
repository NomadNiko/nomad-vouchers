import { useCallback } from "react";
import useFetch from "../use-fetch";
import { API_URL } from "../config";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";
import { Settings, SquarespacePayLink } from "../types/settings";
import { RequestConfigType } from "./types/request-config";

export function useGetSettingsService() {
  const fetch = useFetch();
  return useCallback(
    (requestConfig?: RequestConfigType) =>
      fetch(`${API_URL}/v1/settings`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<Settings>),
    [fetch]
  );
}

export type UpdateSettingsRequest = {
  currency?: "GBP" | "EUR" | "USD";
  defaultRedemptionType?: "partial" | "full";
  notificationEmails?: string[];
  paymentMode?: "sandbox" | "production";
  paymentGateway?: "stripe" | "square" | "squarespace";
  stripeSecretKey?: string;
  stripeWebhookSecret?: string;
  squarespaceApiKey?: string;
  squarespacePollingInterval?: number;
  squarespacePayLinks?: SquarespacePayLink[];
};

export function useUpdateSettingsService() {
  const fetch = useFetch();
  return useCallback(
    (data: UpdateSettingsRequest, requestConfig?: RequestConfigType) =>
      fetch(`${API_URL}/v1/settings`, {
        method: "PATCH",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<Settings>),
    [fetch]
  );
}

export function useGetPublicPaymentConfigService() {
  const fetch = useFetch();
  return useCallback(
    (tenantId?: string, requestConfig?: RequestConfigType) => {
      let url = `${API_URL}/v1/settings/public/payment-config`;
      if (tenantId) url += `?tenantId=${tenantId}`;
      return fetch(url, {
        method: "GET",
        ...requestConfig,
      }).then(
        wrapperFetchJsonResponse<{
          paymentMode: string;
          paymentGateway: string;
        }>
      );
    },
    [fetch]
  );
}
