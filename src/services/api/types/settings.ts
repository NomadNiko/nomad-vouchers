export interface Settings {
  id: string;
  currency: "GBP" | "EUR" | "USD";
  defaultRedemptionType: "partial" | "full";
  notificationEmails: string[];
  paymentMode: "sandbox" | "production";
  paymentGateway: "stripe" | "square";
  stripeSecretKey?: string;
  stripeWebhookSecret?: string;
  updatedAt: string;
}

export const CURRENCY_SYMBOLS: Record<string, string> = {
  GBP: "£",
  EUR: "€",
  USD: "$",
};
