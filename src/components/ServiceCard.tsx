import Link from "next/link";
import type { Service } from "@config/services";
import styles from "./ServiceCard.module.css";

type Props = {
  service: Service;
  line?: string;
  action?: string;
};

export function ServiceCard({
  service,
  line,
  action = "See the usual jobs",
}: Props) {
  return (
    <Link
      className={styles.card}
      href={`/services/${service.slug}`}
      data-cta={`service-${service.id}`}
    >
      <span className={styles.name}>{service.name}</span>
      {line ? <span className={styles.line}>{line}</span> : null}
      <span className={styles.action}>{action}</span>
    </Link>
  );
}
