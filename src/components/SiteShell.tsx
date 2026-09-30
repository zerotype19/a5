"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { rememberFirstLandingPath } from "@/lib/intake/landing-page";
import { Footer } from "./Footer";
import { Header } from "./Header";
import styles from "./SiteShell.module.css";

/** Public marketing chrome. Admin routes render without header/footer. */
export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) rememberFirstLandingPath(pathname);
  }, [pathname]);

  if (pathname?.startsWith("/admin")) {
    return <>{children}</>;
  }

  return (
    <div className={styles.shell}>
      <Header />
      <div className={styles.content}>{children}</div>
      <Footer />
    </div>
  );
}
