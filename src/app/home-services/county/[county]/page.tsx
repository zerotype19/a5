import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AuthorityPage } from "@/components/authority/AuthorityPage";
import { loadCountyPage } from "@/lib/authority/engine";
import { buildContentMetadata } from "@/lib/authority/metadata";
import { buildContentPathFromRecord } from "@/lib/authority/urls";

import {MunicipalityDirectory} from "@/components/authority/MunicipalityDirectory";
import {getCountyBySlug} from "@config/counties";

import {fetchPublishedPages} from "@/lib/authority/query";
type Props = { params: Promise<{ county: string }> };

export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { county } = await params;
  const result = await loadCountyPage(county);
  if (result.status !== "ok") {
    return { title: "Not found", robots: { index: false, follow: false } };
  }
  const path =
    buildContentPathFromRecord(result.page) ?? `/home-services/county/${county}`;
  return buildContentMetadata({ page: result.page, path });
}

export default async function CountyAuthorityPage({ params }: Props) {
  const { county } = await params;
  const result = await loadCountyPage(county);
  if (result.status !== "ok") notFound();
  const pages=await fetchPublishedPages();
  return <AuthorityPage page={result.page} discoveryPages={pages}><MunicipalityDirectory countyId={getCountyBySlug(county)!.id} publishedHubSlugs={pages.filter(p=>p.page_type==="LOCATION").map(p=>p.slug)} /></AuthorityPage>;
}
