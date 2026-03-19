export interface SquarespacePayLink {
  id: string;
  name: string;
  productName: string;
  templateId: string;
}

export interface Settings {
  id: string;
  currency: "GBP" | "EUR" | "USD";
  defaultRedemptionType: "partial" | "full";
  notificationEmails: string[];
  paymentMode: "sandbox" | "production";
  paymentGateway: "stripe" | "square" | "squarespace";
  stripeSecretKey?: string;
  stripeWebhookSecret?: string;
  squarespaceApiKey?: string;
  squarespacePollingInterval?: number;
  squarespacePayLinks?: SquarespacePayLink[];
  updatedAt: string;
}

export const CURRENCY_SYMBOLS: Record<string, string> = {
  GBP: "£",
  EUR: "€",
  USD: "$",
};
