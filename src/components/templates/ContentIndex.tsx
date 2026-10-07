import Link from "next/link";
import { Button } from "@/components/Button";
import { PageIntro } from "./PageIntro";
import { fetchPublishedPages } from "@/lib/authority/query";
import { buildContentPathFromRecord } from "@/lib/authority/urls";
import type { ContentPageType } from "@/lib/authority/types";
import styles from "./templates.module.css";

export async function ContentIndex({ type, title, description, empty }: {
  type: ContentPageType; title: string; description: string; empty: string;
}) {
  const pages = (await fetchPublishedPages()).filter(page => page.page_type === type && page.indexable);
  return <main className={styles.page}>
    <PageIntro eyebrow="Homeowner resources" title={title} description={description} />
    {pages.length ? <ul className={styles.collection}>{pages.map(page => {
      const path = buildContentPathFromRecord(page);
      return path ? <li key={page.id}><Link href={path} className={styles.card}>
        <h2>{page.h1}</h2>{page.meta_description && <p>{page.meta_description}</p>}
        <span>Read more <span aria-hidden="true">↗</span></span>
      </Link></li> : null;
    })}</ul> : <div className={styles.empty}><p>{empty}</p><Button href="/request-service">Tell us about your project</Button></div>}
  </main>;
}
