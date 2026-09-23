import Link from "next/link";
import styles from "./Button.module.css";

type Variant = "primary" | "secondary" | "ghost" | "onHero" | "onHeroSecondary";

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
  /** Stable hook for future analytics — not an event name. */
  dataCta?: string;
  external?: boolean;
};

export function Button({
  href,
  children,
  variant = "primary",
  className,
  dataCta,
  external,
}: Props) {
  const classes = [styles.button, styles[variant], className]
    .filter(Boolean)
    .join(" ");

  if (external || href.startsWith("tel:") || href.startsWith("mailto:")) {
    return (
      <a className={classes} href={href} data-cta={dataCta}>
        {children}
      </a>
    );
  }

  return (
    <Link className={classes} href={href} data-cta={dataCta}>
      {children}
    </Link>
  );
}
