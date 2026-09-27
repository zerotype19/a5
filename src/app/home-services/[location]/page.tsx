import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AuthorityPage } from "@/components/authority/AuthorityPage";
import { loadLocationPage } from "@/lib/authority/engine";
import { buildContentMetadata } from "@/lib/authority/metadata";
import { buildContentPathFromRecord } from "@/lib/authority/urls";

type Props = { params: Promise<{ location: string }> };

export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { location } = await params;
  const result = await loadLocationPage(location);
  if (result.status !== "ok") {
    return { title: "Not found", robots: { index: false, follow: false } };
  }
  const path =
    buildContentPathFromRecord(result.page) ?? `/home-services/${location}`;
  return buildContentMetadata({ page: result.page, path });
}

export default async function LocationAuthorityPage({ params }: Props) {
  const { location } = await params;
  const result = await loadLocationPage(location);
  if (result.status !== "ok") notFound();
  return <AuthorityPage page={result.page} />;
}
