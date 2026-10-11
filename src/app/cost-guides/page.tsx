import type { Metadata } from "next";
import {CostLibrary} from "@/components/authority/CostLibrary";
import {fetchPublishedPages} from "@/lib/authority/query";
export const metadata: Metadata = {
  title: "Home Service Costs & Planning Guides",
  description: "Understand home service costs, compare estimates and prepare your project. Sourced pricing references and practical advice for all 16 A5 services.",
  robots: {index: true, follow: true}, alternates: {canonical: "/cost-guides"}
};
export const revalidate = 3600;
export default async function Page() {
  const pages = (await fetchPublishedPages()).filter(page => page.page_type === "COST_GUIDE" && page.indexable);
  return <CostLibrary pages={pages}/>;
}
