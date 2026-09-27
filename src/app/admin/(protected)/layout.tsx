import Link from "next/link";
import { redirect } from "next/navigation";
import { resolveAdminAccess } from "@/lib/admin/authorize";
import { AdminShell } from "@/components/admin/AdminShell";
import styles from "@/components/admin/admin.module.css";

/** Admin ops always need Auth + service-role — never statically prerender. */
export const dynamic = "force-dynamic";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const access = await resolveAdminAccess();

  if (!access.ok) {
    if (access.reason === "unauthenticated" || access.reason === "configuration") {
      redirect("/admin/login");
    }

    return (
      <div className={styles.shell}>
        <div className={styles.denied}>
          <h1>Access denied</h1>
          <p>
            Your account is signed in but is not authorized for A5 Operations.
            Contact the owner if you need access.
          </p>
          <Link className={styles.backLink} href="/admin/login">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return <AdminShell email={access.email}>{children}</AdminShell>;
}
