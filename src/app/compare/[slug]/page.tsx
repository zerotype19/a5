import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AuthorityPage } from "@/components/authority/AuthorityPage";
import { loadComparisonPage } from "@/lib/authority/engine";
import { buildContentMetadata } from "@/lib/authority/metadata";
import { buildContentPathFromRecord } from "@/lib/authority/urls";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await loadComparisonPage(slug);
  if (result.status !== "ok") {
    return { title: "Not found", robots: { index: false, follow: false } };
  }
  const path = buildContentPathFromRecord(result.page) ?? `/compare/${slug}`;
  return buildContentMetadata({ page: result.page, path });
}

export default async function ComparisonAuthorityPage({ params }: Props) {
  const { slug } = await params;
  const result = await loadComparisonPage(slug);
  if (result.status !== "ok") notFound();
  return <AuthorityPage page={result.page} />;
}
