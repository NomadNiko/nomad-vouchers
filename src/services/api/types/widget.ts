export interface WidgetCustomization {
  primaryColor: string;
  secondaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  fieldLabelColor?: string;
  fieldTextColor?: string;
  buttonText: string;
  logoUrl?: string;
  headerText?: string;
  footerText?: string;
  titleDisplay?: string;
  disclaimerRedemptionWebsite?: string;
  disclaimerRedemptionEmail?: string;
  disclaimerRedemptionPhone?: string;
  disclaimerNoCashValue?: boolean;
}

export interface Widget {
  id: string;
  tenantId: string;
  name: string;
  templateId: string;
  apiKey: string;
  allowedDomains: string[];
  customization: WidgetCustomization;
  isActive: boolean;
  createdBy: string;
  redirectUrl?: string;
  createdAt: string;
  updatedAt: string;
}
