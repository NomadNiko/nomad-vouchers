import type { Metadata } from "next";
import VendorAdminContent from "./page-content";

export const metadata: Metadata = { title: "Vendor Admin" };

export default function Page() {
  return <VendorAdminContent />;
}
