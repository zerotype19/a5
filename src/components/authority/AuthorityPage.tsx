import { ArrowIcon } from "@/components/ArrowIcon";
import { ContentDiscovery } from "./ContentDiscovery";
import { Button } from "@/components/Button";
import { PageIntro } from "@/components/templates/PageIntro";
import { buildPageOutline } from "@/lib/authority/outline";
import { requestHref } from "@/lib/intake/context";
import { ServiceLanding } from "./ServiceLanding";
import type { ReactNode } from "react";
import { AuthorityBreadcrumbs } from "@/components/authority/AuthorityBreadcrumbs";
import { AuthoritySections } from "@/components/authority/AuthoritySections";
import { buildBreadcrumbs } from "@/lib/authority/breadcrumbs";
import {
  buildArticleSchema,
  buildBreadcrumbSchema,
  buildOrganizationSchema,
  buildServiceSchema,
  serializeJsonLd,
} from "@/lib/authority/schema";
import { buildContentPathFromRecord } from "@/lib/authority/urls";
import type { PublicContentPage } from "@/lib/authority/types";
import styles from "./AuthorityPage.module.css";

type Props = {
  page: PublicContentPage;
  children?: ReactNode;
  discoveryPages?: import("@/lib/authority/types").ContentPageRecord[];
};

export function AuthorityPage({ page, children, discoveryPages }: Props) {
  const outline = buildPageOutline(page);
  const kinds: Record<string, string> = { LOCATION: "In your neighborhood", PROBLEM: "Start with what you see", GUIDE: "Homeowner guide", COST_GUIDE: "Planning your project", COMPARISON: "Know your options", PROJECT: "Project story", CORE: "About A5" };
  const path =
    buildContentPathFromRecord(page, page.problem?.slug) ?? `/${page.slug}`;
  const crumbs = buildBreadcrumbs(page, {
    problemSlug: page.problem?.slug,
    problemName: page.problem?.name,
  });

  const schemas: Record<string, unknown>[] = [
    buildOrganizationSchema(),
    buildBreadcrumbSchema(crumbs),
  ];

  if (
    page.primary_service_id &&
    (page.page_type === "SERVICE" || page.page_type === "SERVICE_LOCATION")
  ) {
    const serviceSchema = buildServiceSchema({
      serviceId: page.primary_service_id,
      path,
      description: page.meta_description,
      locationId: page.primary_location_id,
    });
    if (serviceSchema) schemas.push(serviceSchema);
  }

  if (
    page.page_type === "GUIDE" ||
    page.page_type === "COST_GUIDE" ||
    page.page_type === "COMPARISON"
  ) {
    schemas.push(
      buildArticleSchema({
        title: page.title,
        description: page.meta_description,
        path,
        datePublished: page.published_at,
        dateModified: page.updated_at,
      }),
    );
  }

  return (
    <main className={styles.main} data-kind={page.page_type}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(schemas) }}
      />
      <div className={styles.inner}>
        <AuthorityBreadcrumbs items={crumbs} />
        {page.status === "PUBLISHED" && !page.indexable ? (
          <p className={styles.fixtureNote}>
            Published for review — not indexed.
          </p>
        ) : null}
        {page.page_type === "SERVICE" || page.page_type === "SERVICE_LOCATION" ? (
          <ServiceLanding page={page}><AuthoritySections page={page} />{children}</ServiceLanding>
        ) : <>
          <PageIntro eyebrow={kinds[page.page_type]} title={page.h1} />
          <div className={styles.articleLayout}>
            <aside className={styles.articleAside}>
              {outline.length > 1 && <nav aria-label="On this page"><h2>On this page</h2><ol>{outline.map(item => <li key={item.id}><a href={`#${item.id}`}>{item.label}</a></li>)}</ol></nav>}
              <div className={styles.helpCard}><h2>Ready to get started?</h2><p>Share your project details. A5 will review your request and coordinate next steps.</p><Button href={requestHref({ service: page.primary_service_id, location: page.primary_location_id, problem: page.problem?.slug })}>Request service <ArrowIcon /></Button></div>
            </aside>
            <div className={styles.articleBody}><AuthoritySections page={page} />{children}</div>
          </div>
        </>}

        <ContentDiscovery page={page} pages={discoveryPages} />
      </div>
    </main>
  );
}
