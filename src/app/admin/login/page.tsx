import { Brand } from "@/components/Brand";
import { redirect } from "next/navigation";
import { resolveAdminAccess } from "@/lib/admin/authorize";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import styles from "@/components/admin/admin.module.css";

export default async function AdminLoginPage() {
  const access = await resolveAdminAccess();
  if (access.ok) {
    redirect("/admin");
  }

  return (
    <div className={styles.loginWrap}>
      <div className={styles.loginCard}>
        <Brand context="Operations" />
        <p className={styles.sub}>Operations workspace</p>
        <h1>Sign in</h1>
        <AdminLoginForm />
      </div>
    </div>
  );
}
