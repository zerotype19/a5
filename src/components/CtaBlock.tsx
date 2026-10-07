import { SITE } from "@config/site";
import { phoneTelHref } from "@/lib/phone";
import { Button } from "./Button";
import styles from "./CtaBlock.module.css";

type Props = {
  title: string;
  description: string;
  primaryLabel?: string;
  primaryHref?: string;
  primaryCta?: string;
  secondaryLabel?: string;
};

export function CtaBlock({
  title,
  description,
  primaryLabel = "Request service",
  primaryHref = "/request-service",
  primaryCta = "final-get-help",
  secondaryLabel = `Or call ${SITE.phone}`,
}: Props) {
  return (
    <div className={styles.block}>
      <div className={styles.copy}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.description}>{description}</p>
      </div>
      <div className={styles.actions}>
        <Button href={primaryHref} variant="onHero" dataCta={primaryCta}>
          {primaryLabel}
        </Button>
        <Button
          href={phoneTelHref(SITE.phone)}
          variant="onHeroSecondary"
          dataCta="final-call"
          external
        >
          {secondaryLabel}
        </Button>
      </div>
    </div>
  );
}
