"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { SITE } from "@config/site";
import { phoneTelHref } from "@/lib/phone";
import { Button } from "./Button";
import styles from "./Header.module.css";

const NAV = [
  { href: "/#services", label: "Services" },
  { href: "/#areas", label: "Areas We Serve" },
  { href: "/#how-it-works", label: "How It Works" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const tel = phoneTelHref(SITE.phone);

  function close() {
    setOpen(false);
  }

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link className={styles.brand} href="/" onClick={close}>
          <span className={styles.brandMark}>A5</span>
          <span className={styles.brandName}>{SITE.name}</span>
        </Link>

        <nav className={styles.desktopNav} aria-label="Primary">
          {NAV.map((item) => (
            <a key={item.href} className={styles.navLink} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className={styles.desktopActions}>
          <a className={styles.phone} href={tel} data-cta="header-phone">
            {SITE.phone}
          </a>
          <Button
            href="/request-service"
            variant="primary"
            dataCta="header-get-help"
          >
            Get Help With a Project
          </Button>
        </div>

        <button
          type="button"
          className={styles.menuToggle}
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((value) => !value)}
        >
          <span className={styles.srOnly}>
            {open ? "Close menu" : "Open menu"}
          </span>
          <span className={styles.menuIcon} aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>
      </div>

      <div
        id={menuId}
        className={open ? `${styles.mobilePanel} ${styles.mobilePanelOpen}` : styles.mobilePanel}
        hidden={!open}
      >
        <nav className={styles.mobileNav} aria-label="Mobile">
          {NAV.map((item) => (
            <a
              key={item.href}
              className={styles.mobileLink}
              href={item.href}
              onClick={close}
            >
              {item.label}
            </a>
          ))}
          <a
            className={styles.mobileLink}
            href={tel}
            data-cta="header-phone-mobile"
            onClick={close}
          >
            Call {SITE.phone}
          </a>
          <Button
            href="/request-service"
            variant="primary"
            className={styles.mobileCta}
            dataCta="header-get-help-mobile"
          >
            Get Help With a Project
          </Button>
        </nav>
      </div>
    </header>
  );
}
