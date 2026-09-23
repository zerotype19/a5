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
        <p className={styles.sub}>A5 Operations</p>
        <h1>Sign in</h1>
        <AdminLoginForm />
      </div>
    </div>
  );
}
