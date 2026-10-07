"use client";

import { useState } from "react";
import { Brand } from "../Brand";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import styles from "./admin.module.css";

const NAV = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/leads", label: "Leads", exact: false },
  { href: "/admin/vendors", label: "Vendors", exact: false },
  { href: "/admin/acquisition", label: "Acquisition", exact: false },
] as const;

export function AdminShell({
  children,
  email,
}: {
  children: React.ReactNode;
  email: string | null;
}) {
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    setSigningOut(true);
    setSignOutError("");
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace("/admin/login");
      router.refresh();
    } catch {
      setSignOutError("Could not sign out. Please try again.");
      setSigningOut(false);
    }
  }

  return (
    <div className={styles.shell}>
      <a className={styles.skipLink} href="#operations-content">Skip to workspace</a>
      <header className={styles.topbar}>
        <Brand href="/admin" context="Operations" />
        <div className={styles.account}><span>{email ?? "Internal workspace"}</span><Link href="/">View website ↗</Link><button type="button" className={styles.signOut} onClick={signOut} disabled={signingOut}>{signingOut ? "Signing out…" : "Sign out"}</button></div>
      </header>
      {signOutError && <p role="alert" className={styles.flashError}>{signOutError}</p>}
      <div className={styles.workspace}>
        <nav className={styles.nav} aria-label="Operations">
          {NAV.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`${styles.navLink} ${active ? styles.navLinkActive : ""}`}
              >
                {item.label}
              </Link>
            );
          })}

        </nav>
        <main id="operations-content" tabIndex={-1} className={styles.main}>{children}</main>
      </div>
    </div>
  );
}
