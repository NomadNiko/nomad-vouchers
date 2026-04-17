import { useCallback } from "react";
import useFetch from "../use-fetch";
import { API_URL } from "../config";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";
import { RequestConfigType } from "./types/request-config";

export type AuditLogEntry = {
  id: string;
  timestamp: string;
  tenantId?: string;
  tenantName?: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  details?: Record<string, unknown>;
};

export type AuditLogResponse = {
  data: AuditLogEntry[];
  total: number;
};

export function useGetAuditLogsService() {
  const fetch = useFetch();
  return useCallback(
    (
      params: {
        page: number;
        limit: number;
        action?: string;
        tenantId?: string;
        resourceType?: string;
      },
      requestConfig?: RequestConfigType
    ) => {
      const url = new URL(`${API_URL}/v1/audit-logs`);
      url.searchParams.append("page", String(params.page));
      url.searchParams.append("limit", String(params.limit));
      if (params.action) url.searchParams.append("action", params.action);
      if (params.tenantId) url.searchParams.append("tenantId", params.tenantId);
      if (params.resourceType)
        url.searchParams.append("resourceType", params.resourceType);
      return fetch(url, { method: "GET", ...requestConfig }).then(
        wrapperFetchJsonResponse<AuditLogResponse>
      );
    },
    [fetch]
  );
}

export type TransactionEntry = {
  id: string;
  tenantId: string;
  tenantName?: string;
  code: string;
  templateId: string;
  widgetId?: string;
  originalAmount: number;
  currentBalance: number;
  purchaseDate: string;
  purchaserEmail: string;
  purchaserName: string;
  recipientEmail?: string;
  recipientName?: string;
  status: string;
  stripeSessionId?: string;
  stripePaymentIntent?: string;
  stripeAmountTotal?: number;
  adminFeeCharged?: number;
  adminFeeType?: string;
  adminFeeValue?: number;
  squarespaceOrderId?: string;
  createdAt: string;
};

export type TransactionsResponse = {
  data: TransactionEntry[];
  total: number;
};

export function useGetTransactionsService() {
  const fetch = useFetch();
  return useCallback(
    (
      params: { page: number; limit: number },
      requestConfig?: RequestConfigType
    ) => {
      const url = new URL(`${API_URL}/v1/gift-cards/transactions`);
      url.searchParams.append("page", String(params.page));
      url.searchParams.append("limit", String(params.limit));
      return fetch(url, { method: "GET", ...requestConfig }).then(
        wrapperFetchJsonResponse<TransactionsResponse>
      );
    },
    [fetch]
  );
}
