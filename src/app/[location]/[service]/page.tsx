import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AuthorityPage } from "@/components/authority/AuthorityPage";
import { loadServiceLocationPage } from "@/lib/authority/engine";
import { buildContentMetadata } from "@/lib/authority/metadata";
import { buildContentPathFromRecord } from "@/lib/authority/urls";
import {
  isReservedRootSegment,
  resolveServiceLocationRoute,
} from "@/lib/authority";

type Props = { params: Promise<{ location: string; service: string }> };

export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { location, service } = await params;
  if (isReservedRootSegment(location)) {
    return { title: "Not found", robots: { index: false, follow: false } };
  }
  const route = resolveServiceLocationRoute(location, service);
  if (!route.ok) {
    return { title: "Not found", robots: { index: false, follow: false } };
  }
  const result = await loadServiceLocationPage(location, service);
  if (result.status !== "ok") {
    return { title: "Not found", robots: { index: false, follow: false } };
  }
  const path =
    buildContentPathFromRecord(result.page) ?? `/${location}/${service}`;
  return buildContentMetadata({ page: result.page, path });
}

export default async function ServiceLocationAuthorityPage({ params }: Props) {
  const { location, service } = await params;
  if (isReservedRootSegment(location)) notFound();
  const route = resolveServiceLocationRoute(location, service);
  if (!route.ok) notFound();
  const result = await loadServiceLocationPage(location, service);
  if (result.status !== "ok") notFound();
  return <AuthorityPage page={result.page} />;
}
