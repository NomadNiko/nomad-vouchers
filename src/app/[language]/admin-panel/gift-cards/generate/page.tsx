import type { Metadata } from "next";
import GenerateGiftCard from "./page-content";

export const metadata: Metadata = {
  title: "Generate Gift Card",
};

export default function Page() {
  return <GenerateGiftCard />;
}
