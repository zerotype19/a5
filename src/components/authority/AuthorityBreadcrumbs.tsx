import Link from "next/link";
import type { BreadcrumbItem } from "@/lib/authority/types";
import styles from "./AuthorityBreadcrumbs.module.css";

type Props = {
  items: BreadcrumbItem[];
};

export function AuthorityBreadcrumbs({ items }: Props) {
  return (
    <nav className={styles.nav} aria-label="Breadcrumb">
      <ol className={styles.list}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.path}-${item.name}`} className={styles.item}>
              {isLast ? (
                <span aria-current="page">{item.name}</span>
              ) : (
                <Link href={item.path}>{item.name}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
