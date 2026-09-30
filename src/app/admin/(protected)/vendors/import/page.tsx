import Link from "next/link";
import { VendorImportForm } from "@/components/admin/VendorImportForm";
import styles from "@/components/admin/admin.module.css";

export default function VendorImportPage() {
  return (
    <>
      <p>
        <Link href="/admin/vendors">← Vendors</Link>
      </p>
      <header className={styles.leadHeader}>
        <h1 className={styles.title}>Import vendor candidates</h1>
        <p className={styles.lede}>
          Load public research. Import does not approve or activate anyone.
        </p>
      </header>
      <VendorImportForm />
    </>
  );
}
