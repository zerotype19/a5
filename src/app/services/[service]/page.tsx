import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AuthorityPage } from "@/components/authority/AuthorityPage";
import { loadServicePage } from "@/lib/authority/engine";
import { buildContentMetadata } from "@/lib/authority/metadata";
import { buildContentPathFromRecord } from "@/lib/authority/urls";

type Props = { params: Promise<{ service: string }> };

export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { service } = await params;
  const result = await loadServicePage(service);
  if (result.status !== "ok") {
    return { title: "Not found", robots: { index: false, follow: false } };
  }
  const path = buildContentPathFromRecord(result.page) ?? `/services/${service}`;
  return buildContentMetadata({ page: result.page, path });
}

export default async function ServiceAuthorityPage({ params }: Props) {
  const { service } = await params;
  const result = await loadServicePage(service);
  if (result.status !== "ok") notFound();
  return <AuthorityPage page={result.page} />;
}
