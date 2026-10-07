"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { rememberFirstLandingPath } from "@/lib/intake/landing-page";
import { Analytics } from "./marketing/Analytics";
import { MobileActions } from "./marketing/MobileActions";
import { rememberAttribution } from "@/lib/marketing/attribution";
import { Footer } from "./Footer";
import { Header } from "./Header";
import styles from "./SiteShell.module.css";

/** Public marketing chrome. Admin routes render without header/footer. */
export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const capturedEntry = useRef(false);

  useEffect(() => {
    if (pathname) { rememberFirstLandingPath(pathname); rememberAttribution(window.location.href, capturedEntry.current ? "" : document.referrer); capturedEntry.current = true; }
  }, [pathname]);

  if (pathname?.startsWith("/admin")) {
    return <>{children}</>;
  }

  return (
    <div className={`${styles.shell} ${/^\/(request-service|opportunity)(\/|$)/.test(pathname ?? "") ? "" : styles.withMobileActions}`}>
      <a className={styles.skipLink} href="#main-content">Skip to content</a>
      <Header />
      <div id="main-content" className={styles.content}>{children}</div>
      <Footer />
      <Analytics />
      <MobileActions />
    </div>
  );
}
