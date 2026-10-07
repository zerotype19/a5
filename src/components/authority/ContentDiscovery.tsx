import { ArrowIcon } from "@/components/ArrowIcon";
import Link from "next/link";
import { fetchPublishedPages } from "@/lib/authority/query";
import { buildDiscoveryGroups } from "@/lib/authority/discovery";
import type { ContentPageRecord } from "@/lib/authority/types";
import styles from "./ContentDiscovery.module.css";

export async function ContentDiscovery({page, pages}: {page: ContentPageRecord; pages?: ContentPageRecord[]}) {
  const groups = buildDiscoveryGroups(page, pages ?? await fetchPublishedPages());
  if (!groups.length) return null;
  return <nav className={styles.discovery} aria-label="Related services, places and project advice">
    <div className={styles.intro}><p>Find the right next step</p><h2>Services, local help and practical advice.</h2></div>
    <div className={styles.groups}>{groups.map(group => <section key={group.title}>
      <h3>{group.title}</h3><ul>{group.links.map(link => <li key={link.path}><Link href={link.path}>{link.title}<span aria-hidden="true"> <ArrowIcon /></span></Link></li>)}</ul>
    </section>)}</div>
  </nav>;
}
