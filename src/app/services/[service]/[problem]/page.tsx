import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { AuthorityPage } from "@/components/authority/AuthorityPage";
import { loadProblemPage } from "@/lib/authority/engine";
import { buildContentMetadata } from "@/lib/authority/metadata";
import {
  buildContentPathFromRecord,
  problemCanonicalRedirect,
} from "@/lib/authority/urls";

type Props = { params: Promise<{ service: string; problem: string }> };

export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { service, problem } = await params;
  const result = await loadProblemPage(service, problem);
  if (result.status !== "ok") {
    return { title: "Not found", robots: { index: false, follow: false } };
  }
  const path =
    buildContentPathFromRecord(result.page, result.page.problem?.slug) ??
    `/services/${service}/${problem}`;
  return buildContentMetadata({ page: result.page, path });
}

export default async function ProblemAuthorityPage({ params }: Props) {
  const { service, problem } = await params;
  const result = await loadProblemPage(service, problem);
  if (result.status !== "ok") notFound();
  const canonical = buildContentPathFromRecord(
    result.page,
    result.page.problem?.slug,
  );
  const alternate = problemCanonicalRedirect({
    requestedService: service,
    primaryServiceId: result.page.primary_service_id,
    canonicalPath: canonical,
  });
  if (alternate) redirect(alternate);
  return <AuthorityPage page={result.page} />;
}
