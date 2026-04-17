import type { Metadata } from "next";
import HomeContent from "./home-content";

export const metadata: Metadata = {
  title: "Nomad Vouchers — Gift Card Platform",
};

export default function Home() {
  return <HomeContent />;
}
