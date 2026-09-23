import Link from "next/link";
import type { Service } from "@config/services";
import styles from "./ServiceCard.module.css";

type Props = {
  service: Service;
};

export function ServiceCard({ service }: Props) {
  return (
    <Link
      className={styles.card}
      href="/request-service"
      data-cta={`service-${service.id}`}
    >
      <span className={styles.name}>{service.name}</span>
      <span className={styles.action}>Start a project</span>
    </Link>
  );
}
