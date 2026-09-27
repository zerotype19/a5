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
};

export function AuthorityPage({ page, children }: Props) {
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
    <main className={styles.main}>
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
        <header className={styles.header}>
          <h1 className={styles.h1}>{page.h1}</h1>
        </header>
        <AuthoritySections page={page} />
        {children}
      </div>
    </main>
  );
}
