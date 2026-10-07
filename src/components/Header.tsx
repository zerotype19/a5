"use client";

import { Brand } from "./Brand";
import { useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { SITE } from "@config/site";
import { phoneTelHref } from "@/lib/phone";
import { Button } from "./Button";
import styles from "./Header.module.css";

const NAV = [
  { href: "/#services", label: "Services" },
  { href: "/#areas", label: "Areas" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/about", label: "About A5" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const toggle = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const tel = phoneTelHref(SITE.phone);

  function close() {
    setOpen(false);
  }

  return (
    <header className={styles.header} onKeyDown={event => { if (event.key === "Escape" && open) { close(); toggle.current?.focus(); } }}>
      <div className={styles.inner}>
        <Brand onClick={close} />

        <nav className={styles.desktopNav} aria-label="Primary">
          {NAV.map((item) => (
            <a key={item.href} className={styles.navLink} aria-current={pathname === item.href ? "page" : undefined} href={item.href}>
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
            Request service
          </Button>
        </div>

        <button
          type="button"
          ref={toggle}
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
        <nav className={styles.mobileNav} aria-label="Mobile" onClick={event => { if (event.target instanceof Element && event.target.closest("a")) close(); }}>
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
            Request service
          </Button>
        </nav>
      </div>
    </header>
  );
}
